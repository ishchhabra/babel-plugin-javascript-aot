import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../Babel/utils";
import { BasicBlock, BlockId, makeEmptyBlock } from "./Block";
import { makeDeclarationId } from "./Declaration";
import { makeIdentifierId, makeIdentifierName } from "./Identifier";
import {
  ArrayExpressionInstruction,
  BinaryExpressionInstruction,
  CallExpressionInstruction,
  FunctionDeclarationInstruction,
  makeInstructionId,
  SpreadElement,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
  UpdateExpressionInstruction,
} from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";
import { BlockScope, FunctionScope, GlobalScope, Scope } from "./Scope";

export class HIRBuilder {
  // Core program state
  readonly #program: NodePath<t.Program>;

  // Block-related state
  readonly #blocks: Map<BlockId, BasicBlock>;
  #currentBlockId: BlockId;
  #nextBlockId = 0;

  // Scope-related state
  #currentScope: Scope | null = null;
  readonly #scopes: Array<Scope> = [];
  #nextScopeId = 0;

  // ID generators
  #nextDeclarationId = 0;
  #nextIdentifierId = 0;
  #nextInstructionId = 0;

  constructor(program: NodePath<t.Program>) {
    this.#program = program;
    this.#blocks = new Map();
    this.#blocks.set(0, makeEmptyBlock(this.#nextBlockId++));
    this.#currentBlockId = 0;
    this.#currentScope = new GlobalScope(this.#nextScopeId++);
    this.#scopes.push(this.#currentScope);
  }

  // Public API
  public build() {
    const body = this.#program.get("body");
    for (const statement of body) {
      this.#buildStatement(statement);
    }

    return this;
  }

  public get blocks() {
    return this.#blocks;
  }

  public get phis() {
    return this.#scopes.flatMap((scope) => Array.from(scope.phis.values()));
  }

  // Scope Management
  #enterFunctionScope() {
    const newScope = new FunctionScope(this.#nextScopeId++, this.#currentScope);
    this.#scopes.push(newScope);
    this.#currentScope = newScope;
  }

  #enterBlockScope() {
    const newScope = new BlockScope(this.#nextScopeId++, this.#currentScope);
    this.#scopes.push(newScope);
    this.#currentScope = newScope;
  }

  #exitScope() {
    if (this.#currentScope?.parent) {
      this.#currentScope = this.#currentScope.parent;
    }
  }

  // Block Management
  get #currentBlock() {
    return this.#blocks.get(this.#currentBlockId)!;
  }

  // Statement Building
  #buildStatement(statement: NodePath<t.Statement>) {
    const statementNode = statement.node;
    switch (statementNode.type) {
      case "ReturnStatement":
        statement.assertReturnStatement();
        this.#buildReturnStatement(statement);
        break;
      case "BlockStatement":
        statement.assertBlockStatement();
        this.#buildBlockStatement(statement);
        break;
      case "IfStatement":
        statement.assertIfStatement();
        this.#buildIfStatement(statement);
        break;
      case "FunctionDeclaration":
        statement.assertFunctionDeclaration();
        this.#buildFunctionDeclaration(statement);
        break;
      case "VariableDeclaration":
        statement.assertVariableDeclaration();
        this.#buildVariableDeclaration(statement);
        break;
      case "ExpressionStatement":
        statement.assertExpressionStatement();
        this.#buildExpressionStatement(statement);
        break;
      default:
        this.#buildUnsupportedStatement(statement);
    }
  }

  #buildReturnStatement(statement: NodePath<t.ReturnStatement>) {
    const argument = statement.get("argument");
    if (argument.hasNode()) {
      const returnPlace = this.#buildExpression(argument);
      this.#currentBlock.terminal = {
        kind: "return",
        id: makeInstructionId(this.#nextInstructionId++),
        value: returnPlace,
      };
    }
  }

  #buildBlockStatement(statement: NodePath<t.BlockStatement>) {
    statement.assertBlockStatement();
    this.#enterBlockScope();
    for (const stmt of statement.get("body")) {
      this.#buildStatement(stmt);
    }
    this.#exitScope();
  }

  #buildIfStatement(statement: NodePath<t.IfStatement>) {
    const test = statement.get("test");
    const testPlace = this.#buildExpression(test);

    const consequentBlockId = this.#nextBlockId++;
    const alternateBlockId = this.#nextBlockId++;
    const fallthroughBlockId = this.#nextBlockId++;

    this.#currentBlock.terminal = {
      kind: "branch",
      id: makeInstructionId(this.#nextInstructionId++),
      test: testPlace,
      consequent: consequentBlockId,
      alternate: alternateBlockId,
      fallthrough: fallthroughBlockId,
    };

    // Process consequent
    this.#blocks.set(consequentBlockId, makeEmptyBlock(consequentBlockId));
    this.#currentBlockId = consequentBlockId;
    this.#buildStatement(statement.get("consequent"));

    // Process alternate
    this.#blocks.set(alternateBlockId, makeEmptyBlock(alternateBlockId));
    if (statement.node.alternate) {
      this.#currentBlockId = alternateBlockId;
      const alternate = statement.get("alternate");
      if (alternate.hasNode()) {
        this.#buildStatement(alternate);
      }
    }

    // Update phi nodes
    for (const [declarationId, phi] of this.#currentScope?.phis ?? []) {
      this.#currentScope?.setBinding(declarationId, phi.place);
    }

    // Create fallthrough block
    this.#blocks.set(fallthroughBlockId, makeEmptyBlock(fallthroughBlockId));
    this.#currentBlockId = fallthroughBlockId;
  }

  #buildFunctionDeclaration(statement: NodePath<t.FunctionDeclaration>) {
    statement.assertFunctionDeclaration();
    const bodyBlockId = this.#nextBlockId++;
    this.#blocks.set(bodyBlockId, makeEmptyBlock(bodyBlockId));

    const functionPlace = this.#createTemporaryPlace();
    const functionName = getFunctionName(statement);
    if (!functionName || !this.#currentScope) {
      throw new Error("Invalid function declaration");
    }

    const instruction = new FunctionDeclarationInstruction(
      makeInstructionId(this.#nextInstructionId++),
      functionPlace,
      [], // Parameters filled later
      bodyBlockId,
    );
    this.#currentBlock.instructions.push(instruction);

    // Update scope
    statement.scope.rename(
      functionName.node.name,
      functionPlace.identifier.name,
    );
    const declarationId = makeDeclarationId(this.#nextDeclarationId++);
    this.#currentScope.setDeclarationId(functionName.node.name, declarationId);
    this.#currentScope.setBinding(declarationId, functionPlace);

    this.#enterFunctionScope();
    const params = this.#buildFunctionParameters(statement);
    instruction.params = params;

    const previousBlockId = this.#currentBlockId;
    this.#currentBlockId = bodyBlockId;
    this.#buildStatement(statement.get("body"));
    this.#currentBlockId = previousBlockId;
    this.#exitScope();
  }

  #buildFunctionParameters(statement: NodePath<t.FunctionDeclaration>) {
    const params = statement.get("params");
    const body = statement.get("body");

    return params.map((param) => {
      if (!param.isIdentifier()) {
        throw new Error("Only identifier parameters are supported");
      }

      const paramPlace = this.#createTemporaryPlace();
      const name = param.node.name;

      body.scope.rename(name, paramPlace.identifier.name);

      const declarationId = makeDeclarationId(this.#nextDeclarationId++);
      this.#currentScope?.setDeclarationId(
        paramPlace.identifier.name,
        declarationId,
      );
      this.#currentScope?.setBinding(declarationId, paramPlace);

      return paramPlace;
    });
  }

  #buildVariableDeclaration(statement: NodePath<t.VariableDeclaration>) {
    statement.assertVariableDeclaration();
    for (const declaration of statement.get("declarations")) {
      const init = declaration.get("init");
      if (init.hasNode()) {
        const valuePlace = this.#buildExpression(init);
        const targetPlace = this.#createTemporaryPlace();
        const name = (declaration.node.id as t.Identifier).name;

        this.#currentBlock.instructions.push(
          new StoreLocalInstruction(
            makeInstructionId(this.#nextInstructionId++),
            targetPlace,
            {
              kind: "Load",
              place: valuePlace,
            },
            statement.node.kind === "const" ? "const" : "let",
          ),
        );

        if (!this.#currentScope) {
          throw new Error("No current scope");
        }

        declaration.scope.rename(name, targetPlace.identifier.name);
        const declarationId = makeDeclarationId(this.#nextDeclarationId++);
        this.#currentScope.setDeclarationId(
          targetPlace.identifier.name,
          declarationId,
        );

        this.#currentScope.setBinding(declarationId, targetPlace);

        if (statement.node.kind === "let") {
          const phiPlace = this.#createTemporaryPlace();
          const phi: Phi = {
            source: this.#currentBlockId,
            place: phiPlace,
            operands: new Map([[this.#currentBlockId, targetPlace]]),
          };
          this.#currentScope.setPhi(declarationId, phi);
        }
      }
    }
  }

  #buildExpressionStatement(statement: NodePath<t.ExpressionStatement>) {
    const expression = statement.get("expression");

    if (expression.isAssignmentExpression()) {
      const left = expression.get("left");
      if (left.isIdentifier()) {
        const name = left.node.name;
        const declarationId = this.#currentScope?.getDeclarationId(name);
        if (!declarationId) {
          throw new Error(`Undefined variable: ${name}`);
        }

        const valuePlace = this.#buildExpression(expression.get("right"));
        const targetPlace = this.#createTemporaryPlace();

        this.#currentBlock.instructions.push(
          new StoreLocalInstruction(
            makeInstructionId(this.#nextInstructionId++),
            targetPlace,
            {
              kind: "Load",
              place: valuePlace,
            },
            "const",
          ),
        );

        if (!this.#currentScope) {
          throw new Error("No current scope");
        }

        expression.scope.rename(name, targetPlace.identifier.name);
        this.#currentScope.renameDeclaration(name, targetPlace.identifier.name);
        this.#currentScope.setBinding(declarationId, targetPlace);
        const phi = this.#currentScope.getPhi(declarationId);
        if (phi) {
          phi.operands.set(this.#currentBlockId, targetPlace);
        }
      }
    }
  }

  #buildUnsupportedStatement(statement: NodePath<t.Statement>) {
    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        statement.node,
      ),
    );
  }

  // Expression Building
  #buildExpression(expression: NodePath): Place {
    const expressionNode = expression.node;
    switch (expressionNode.type) {
      case "CallExpression":
        return this.#buildCallExpression(
          expression as NodePath<t.CallExpression>,
        );
      case "Identifier":
        return this.#buildIdentifier(expression as NodePath<t.Identifier>);
      case "ArrayExpression":
        return this.#buildArrayExpression(
          expression as NodePath<t.ArrayExpression>,
        );
      case "BinaryExpression":
        return this.#buildBinaryExpression(
          expression as NodePath<t.BinaryExpression>,
        );
      case "UnaryExpression":
        return this.#buildUnaryExpression(
          expression as NodePath<t.UnaryExpression>,
        );
      case "UpdateExpression":
        return this.#buildUpdateExpression(
          expression as NodePath<t.UpdateExpression>,
        );
      case "NumericLiteral":
      case "StringLiteral":
      case "BooleanLiteral":
        return this.#buildLiteral(
          expression as NodePath<
            t.NumericLiteral | t.StringLiteral | t.BooleanLiteral
          >,
        );
      default:
        return this.#buildUnsupportedExpression(expression);
    }
  }

  #buildCallExpression(expression: NodePath<t.CallExpression>): Place {
    expression.assertCallExpression();
    const callee = this.#buildExpression(expression.get("callee"));
    const args = expression.get("arguments").map((arg) => {
      if (arg.isSpreadElement()) {
        return this.#buildSpreadElement(arg);
      }
      return this.#buildExpression(arg as NodePath<t.Expression>);
    });

    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.instructions.push(
      new CallExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        callee,
        args,
      ),
    );

    return resultPlace;
  }

  #buildIdentifier(expression: NodePath<t.Identifier>): Place {
    const name = expression.node.name;
    if (!this.#currentScope) {
      throw new Error("No current scope");
    }

    const declarationId = this.#currentScope.getDeclarationId(name);
    if (!declarationId) {
      throw new Error(`Undefined variable: ${name}`);
    }

    const place = this.#currentScope.getBinding(declarationId);
    if (!place) {
      throw new Error(`Undefined variable: ${name}`);
    }
    return place;
  }

  #buildArrayExpression(expression: NodePath<t.ArrayExpression>): Place {
    expression.assertArrayExpression();
    const resultPlace = this.#createTemporaryPlace();
    const elements = expression.get("elements");
    const elementsPlaces = elements.map((element) => {
      if (element.isSpreadElement()) {
        return this.#buildSpreadElement(element);
      }
      return this.#buildExpression(element as NodePath<t.Expression>);
    });

    this.#currentBlock.instructions.push(
      new ArrayExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        elementsPlaces,
      ),
    );

    return resultPlace;
  }

  #buildBinaryExpression(expression: NodePath<t.BinaryExpression>): Place {
    const leftPlace = this.#buildExpression(
      expression.get("left") as NodePath<t.Expression>,
    );
    const rightPlace = this.#buildExpression(
      expression.get("right") as NodePath<t.Expression>,
    );
    const resultPlace = this.#createTemporaryPlace();

    this.#currentBlock.instructions.push(
      new BinaryExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator as "+",
        leftPlace,
        rightPlace,
      ),
    );

    return resultPlace;
  }

  #buildUnaryExpression(expression: NodePath<t.UnaryExpression>): Place {
    expression.assertUnaryExpression();
    const operandPlace = this.#buildExpression(
      expression.get("argument") as NodePath<t.Expression>,
    );
    const resultPlace = this.#createTemporaryPlace();

    this.#currentBlock.instructions.push(
      new UnaryExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator as "!" | "~",
        operandPlace,
      ),
    );

    return resultPlace;
  }

  #buildUpdateExpression(expression: NodePath<t.UpdateExpression>): Place {
    expression.assertUpdateExpression();
    const argumentPlace = this.#buildExpression(
      expression.get("argument") as NodePath<t.Expression>,
    );
    const resultPlace = this.#createTemporaryPlace();

    this.#currentBlock.instructions.push(
      new UpdateExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator,
        expression.node.prefix,
        argumentPlace,
      ),
    );

    return resultPlace;
  }

  #buildLiteral(
    expression: NodePath<t.NumericLiteral | t.StringLiteral | t.BooleanLiteral>,
  ): Place {
    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.instructions.push(
      new StoreLocalInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        {
          kind: "Primitive",
          value: expression.node.value,
        },
        "const",
      ),
    );
    return resultPlace;
  }

  #buildUnsupportedExpression(expression: NodePath): Place {
    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node,
      ),
    );
    return resultPlace;
  }

  #buildSpreadElement(expression: NodePath<t.SpreadElement>): SpreadElement {
    const argument = expression.get("argument");
    if (!argument) {
      throw new Error("Spread element has no argument");
    }

    const place = this.#buildExpression(argument);
    return {
      kind: "SpreadElement",
      place,
    };
  }

  // Utility Methods
  #createTemporaryPlace(): Place {
    const identifierId = makeIdentifierId(this.#nextIdentifierId++);
    return new Place({
      id: identifierId,
      declarationId: makeDeclarationId(this.#nextDeclarationId++),
      name: makeIdentifierName(identifierId),
    });
  }
}
