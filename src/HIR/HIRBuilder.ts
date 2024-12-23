import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getExpressionName, getFunctionName } from "../Babel/utils";
import { BasicBlock, Block, BlockId } from "./Block";
import { DeclarationId, makeDeclarationId } from "./Declaration";
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
import { Place } from "./Place";

export class HIRBuilder {
  #bindings: Map<DeclarationId, Place> = new Map();
  #blocks: Map<BlockId, Block> = new Map();
  #program: NodePath<t.Program>;

  #currentBlock!: Block;

  // ID generators
  #nextBlockId = 0;
  #nextDeclarationId = 0;
  #nextIdentifierId = 0;
  #nextInstructionId = 0;

  constructor(program: NodePath<t.Program>) {
    this.#program = program;
    this.#buildBindings(program);

    const entryBlock = BasicBlock.empty(this.#nextBlockId++, undefined);
    this.#blocks.set(entryBlock.id, entryBlock);
    this.#currentBlock = entryBlock;
  }

  // Public API
  public build(): Map<BlockId, Block> {
    const body = this.#program.get("body");
    for (const statement of body) {
      this.#buildStatement(statement);
    }

    return this.#blocks;
  }

  #buildBindings(bindingPath: NodePath) {
    bindingPath.traverse({
      Declaration: (path: NodePath<t.Declaration>) => {
        switch (path.node.type) {
          case "FunctionDeclaration":
            path.assertFunctionDeclaration();

            if (path.parentPath !== bindingPath) {
              return;
            }

            const functionName = getFunctionName(path);
            if (!functionName) {
              return;
            }

            // Set the function declaration id in the scope.
            const declarationId = makeDeclarationId(this.#nextDeclarationId++);
            bindingPath.scope.setData(functionName.node.name, declarationId);

            // Create a temporary place for the function and assign it to the declaration id.
            const place = this.#createTemporaryPlace();
            this.#bindings.set(declarationId, place);

            // Rename the function name in the scope to the temporary place.
            bindingPath.scope.rename(
              functionName.node.name,
              place.identifier.name,
            );

            // Also set the declaration id for place.
            bindingPath.scope.setData(place.identifier.name, declarationId);

            break;
          case "VariableDeclaration":
            path.assertVariableDeclaration();

            if (
              path.parentPath !== bindingPath &&
              !(bindingPath.isFunctionDeclaration() && path.node.kind === "var")
            ) {
              return;
            }

            for (const declaration of path.node.declarations) {
              if (!t.isIdentifier(declaration.id)) {
                continue;
              }

              // Set the variable declaration id in the scope.
              const declarationId = makeDeclarationId(
                this.#nextDeclarationId++,
              );
              bindingPath.scope.setData(declaration.id.name, declarationId);

              // Create a temporary place for the variable and assign it to the declaration id.
              const place = this.#createTemporaryPlace();
              this.#bindings.set(declarationId, place);

              // Rename the variable name in the scope to the temporary place.
              bindingPath.scope.rename(
                declaration.id.name,
                place.identifier.name,
              );

              // Also set the declaration id for place.
              bindingPath.scope.setData(place.identifier.name, declarationId);
            }
            break;
        }
      },
    });
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
      case "ForStatement":
      case "DoWhileStatement":
      case "WhileStatement":
        throw new Error("Loops are not supported");
      default:
        this.#buildUnsupportedStatement(statement);
    }
  }

  #buildReturnStatement(statement: NodePath<t.ReturnStatement>) {
    const argument = statement.get("argument");
    if (argument.hasNode()) {
      const returnPlace = this.#buildExpression(argument);
      this.#currentBlock.setTerminal({
        kind: "return",
        id: makeInstructionId(this.#nextInstructionId++),
        value: returnPlace,
      });
    }
  }

  #buildBlockStatement(statement: NodePath<t.BlockStatement>) {
    this.#buildBindings(statement);

    const body = statement.get("body");
    for (const stmt of body) {
      this.#buildStatement(stmt);
    }
  }

  #buildIfStatement(statement: NodePath<t.IfStatement>) {
    const test = statement.get("test");
    const testPlace = this.#buildExpression(test);

    const consequentBlockId = this.#nextBlockId++;
    const alternateBlockId = this.#nextBlockId++;
    const fallthroughBlockId = this.#nextBlockId++;

    const currentBlockId = this.#currentBlock.id;

    this.#currentBlock.setTerminal({
      kind: "branch",
      id: makeInstructionId(this.#nextInstructionId++),
      test: testPlace,
      consequent: consequentBlockId,
      alternate: alternateBlockId,
      fallthrough: fallthroughBlockId,
    });

    // Process consequent
    const consequentBlock = BasicBlock.empty(
      consequentBlockId,
      this.#currentBlock.id,
    );
    consequentBlock.addPredecessor(currentBlockId);
    this.#blocks.set(consequentBlockId, consequentBlock);
    this.#currentBlock = consequentBlock;
    this.#buildStatement(statement.get("consequent"));

    // Process alternate
    const alternateBlock = BasicBlock.empty(
      alternateBlockId,
      this.#currentBlock.id,
    );
    alternateBlock.addPredecessor(currentBlockId);
    this.#blocks.set(alternateBlockId, alternateBlock);
    if (statement.node.alternate) {
      this.#currentBlock = alternateBlock;
      const alternate = statement.get("alternate");
      if (alternate.hasNode()) {
        this.#buildStatement(alternate);
      }
    }

    // Create fallthrough block
    const fallthroughBlock = BasicBlock.empty(
      fallthroughBlockId,
      this.#currentBlock.parent,
    );
    fallthroughBlock.addPredecessor(consequentBlockId);
    fallthroughBlock.addPredecessor(alternateBlockId);
    this.#blocks.set(fallthroughBlockId, fallthroughBlock);
    this.#currentBlock = fallthroughBlock;
  }

  #buildFunctionDeclaration(statement: NodePath<t.FunctionDeclaration>) {
    const bodyBlockId = this.#nextBlockId++;
    const bodyBlock = BasicBlock.empty(bodyBlockId, this.#currentBlock.id);
    bodyBlock.addPredecessor(this.#currentBlock.id);
    this.#blocks.set(bodyBlockId, bodyBlock);

    const functionName = getFunctionName(statement);
    if (!functionName) {
      throw new Error("Invalid function declaration");
    }

    // Get the binding for the function.
    const declarationId = statement.scope.getData(functionName.node.name);
    const functionPlace = this.#bindings.get(declarationId);
    if (!functionPlace) {
      throw new Error(
        `Internal error: Missing binding for ${functionName.node.name}`,
      );
    }

    const instruction = new FunctionDeclarationInstruction(
      makeInstructionId(this.#nextInstructionId++),
      functionPlace,
      [], // Parameters filled later
      bodyBlockId,
    );
    this.#currentBlock.addInstruction(instruction);

    this.#buildBindings(statement);
    const params = this.#buildFunctionParameters(statement);
    instruction.params = params;

    const previousBlock = this.#currentBlock;
    this.#currentBlock = bodyBlock;

    this.#buildStatement(statement.get("body"));
    this.#currentBlock = previousBlock;
  }

  #buildFunctionParameters(statement: NodePath<t.FunctionDeclaration>) {
    const params = statement.get("params");

    return params.map((param) => {
      if (!param.isIdentifier()) {
        throw new Error("Only identifier parameters are supported");
      }

      const name = param.node.name;

      // Set the param declaration id in the function scope.
      const declarationId = makeDeclarationId(this.#nextDeclarationId++);
      statement.scope.setData(name, declarationId);

      // Create a temporary place for the param and assign it to the declaration id.
      const paramPlace = this.#createTemporaryPlace();
      this.#bindings.set(declarationId, paramPlace);

      // Rename the param name in the scope to the temporary place.
      statement.scope.rename(name, paramPlace.identifier.name);

      // Also set the declaration id for param place.
      statement.scope.setData(paramPlace.identifier.name, declarationId);

      return paramPlace;
    });
  }

  #buildVariableDeclaration(statement: NodePath<t.VariableDeclaration>) {
    statement.assertVariableDeclaration();
    for (const declaration of statement.get("declarations")) {
      const init = declaration.get("init");
      if (init.hasNode()) {
        const valuePlace = this.#buildExpression(init);
        const name = (declaration.node.id as t.Identifier).name;

        // Get the binding for the variable.
        const declarationId = statement.scope.getData(name);
        const targetPlace = this.#bindings.get(declarationId);
        if (targetPlace === undefined) {
          throw new Error(`Undefined variable: ${name}`);
        }

        this.#currentBlock.addInstruction(
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
      }
    }
  }

  #buildExpressionStatement(statement: NodePath<t.ExpressionStatement>) {
    const expression = statement.get("expression");
    this.#buildExpression(expression);
  }

  #buildUnsupportedStatement(statement: NodePath<t.Statement>) {
    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.addInstruction(
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
      case "AssignmentExpression":
        expression.assertAssignmentExpression();
        return this.#buildAssignmentExpression(expression);
      case "CallExpression":
        expression.assertCallExpression();
        return this.#buildCallExpression(expression);
      case "Identifier":
        expression.assertIdentifier();
        return this.#buildIdentifier(expression);
      case "ArrayExpression":
        expression.assertArrayExpression();
        return this.#buildArrayExpression(expression);
      case "BinaryExpression":
        expression.assertBinaryExpression();
        return this.#buildBinaryExpression(expression);
      case "UnaryExpression":
        expression.assertUnaryExpression();
        return this.#buildUnaryExpression(expression);
      case "UpdateExpression":
        expression.assertUpdateExpression();
        return this.#buildUpdateExpression(expression);
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

  #buildAssignmentExpression(
    expression: NodePath<t.AssignmentExpression>,
  ): Place {
    if (expression.isAssignmentExpression()) {
      const left = expression.get("left");
      if (left.isIdentifier()) {
        const name = left.node.name;

        // Build instruction to store the assignment value.
        const right = expression.get("right");
        const valuePlace = this.#buildExpression(right);
        const targetPlace = this.#createTemporaryPlace();

        const instructionId = makeInstructionId(this.#nextInstructionId++);
        const instruction = new StoreLocalInstruction(
          instructionId,
          targetPlace,
          {
            kind: "Load",
            place: valuePlace,
          },
          "const",
        );
        this.#currentBlock.addInstruction(instruction);

        // Update the binding for the declaration id.
        const declarationId = expression.scope.getData(name);
        this.#bindings.set(declarationId, targetPlace);

        // Rename the variable in the scope to target place.
        expression.scope.rename(name, targetPlace.identifier.name);
        return targetPlace;
      }
    }

    return this.#buildUnsupportedExpression(expression);
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
    this.#currentBlock.addInstruction(
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

    // Get the binding for the identifier.
    const declarationId = expression.scope.getData(name);
    const place = this.#bindings.get(declarationId);
    if (place === undefined) {
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

    this.#currentBlock.addInstruction(
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

    this.#currentBlock.addInstruction(
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

    this.#currentBlock.addInstruction(
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
    const argument = expression.get("argument");
    const argumentPlace = this.#buildExpression(argument);
    const resultPlace = this.#createTemporaryPlace();

    this.#currentBlock.addInstruction(
      new UpdateExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator,
        expression.node.prefix,
        argumentPlace,
      ),
    );

    const name = getExpressionName(argument);
    if (name === null) {
      throw new Error("Unsupported update expression");
    }

    // Update the binding for the variable.
    const declarationId = expression.scope.getData(name);
    this.#bindings.set(declarationId, resultPlace);

    // Rename the variable in the scope.
    expression.scope.rename(name, resultPlace.identifier.name);

    return resultPlace;
  }

  #buildLiteral(
    expression: NodePath<t.NumericLiteral | t.StringLiteral | t.BooleanLiteral>,
  ): Place {
    const resultPlace = this.#createTemporaryPlace();
    this.#currentBlock.addInstruction(
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
    this.#currentBlock.addInstruction(
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
