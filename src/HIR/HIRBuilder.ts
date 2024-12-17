import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../Babel/utils";
import { BasicBlock, BlockId, makeEmptyBlock } from "./Block";
import { makeDeclarationId } from "./Declaration";
import { makeIdentifierId, makeIdentifierName } from "./Identifier";
import { makeInstructionId, SpreadElement } from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";
import { Scope } from "./Scope";

export class HIRBuilder {
  #program: NodePath<t.Program>;
  #blocks: Map<BlockId, BasicBlock>;
  #currentBlockId: BlockId;
  #currentScope: Scope | null = null;
  #scopes: Array<Scope> = [];

  #nextBlockId = 0;
  #nextDeclarationId = 0;
  #nextIdentifierId = 0;
  #nextInstructionId = 0;
  #nextScopeId = 0;

  constructor(program: NodePath<t.Program>) {
    this.#program = program;
    this.#blocks = new Map();
    this.#currentScope = null;
    this.#blocks.set(0, makeEmptyBlock(this.#nextBlockId++));
    this.#currentBlockId = 0;
    this.#enterScope(); // Create initial global scope
  }

  public get blocks() {
    return this.#blocks;
  }

  public get phis() {
    return this.#scopes.flatMap((scope) => Array.from(scope.phis.values()));
  }

  #enterScope() {
    const newScope = new Scope(this.#nextScopeId++, this.#currentScope);
    this.#scopes.push(newScope);
    this.#currentScope = newScope;
  }

  #exitScope() {
    if (this.#currentScope?.parent) {
      this.#currentScope = this.#currentScope.parent;
    }
  }

  get #currentBlock() {
    return this.#blocks.get(this.#currentBlockId)!;
  }

  public build() {
    const body = this.#program.get("body");
    for (const statement of body) {
      this.#buildStatement(statement);
    }
    return this;
  }

  #buildStatement(statement: NodePath<t.Statement>) {
    const statementNode = statement.node;
    switch (statementNode.type) {
      case "BlockStatement": {
        statement.assertBlockStatement();
        this.#enterScope();
        for (const stmt of statement.get("body")) {
          this.#buildStatement(stmt);
        }
        this.#exitScope();
        break;
      }

      case "IfStatement": {
        statement.assertIfStatement();
        const test = statement.get("test");
        const testPlace = this.#buildExpression(test);

        const consequentBlockId = this.#nextBlockId++;
        const alternateBlockId = this.#nextBlockId++;
        const fallthroughBlockId = this.#nextBlockId++;

        const branchId = makeInstructionId(this.#nextInstructionId++);
        this.#currentBlock.terminal = {
          kind: "branch",
          test: testPlace,
          consequent: consequentBlockId,
          alternate: alternateBlockId,
          fallthrough: fallthroughBlockId,
          id: branchId,
        };

        // Process consequent
        this.#blocks.set(consequentBlockId, makeEmptyBlock(consequentBlockId));
        this.#currentBlockId = consequentBlockId;
        this.#buildStatement(
          statement.get("consequent") as NodePath<t.Statement>,
        );

        // Process alternate
        this.#blocks.set(alternateBlockId, makeEmptyBlock(alternateBlockId));
        if (statement.node.alternate) {
          this.#currentBlockId = alternateBlockId;
          this.#buildStatement(
            statement.get("alternate") as NodePath<t.Statement>,
          );
        }

        for (const [declarationId, phi] of this.#currentScope?.phis ?? []) {
          this.#currentScope?.setBinding(declarationId, phi.place);
        }

        // Create fallthrough block
        this.#blocks.set(
          fallthroughBlockId,
          makeEmptyBlock(fallthroughBlockId),
        );
        this.#currentBlockId = fallthroughBlockId;
        break;
      }

      case "FunctionDeclaration": {
        statement.assertFunctionDeclaration();

        // Create a new block for the function body
        const bodyBlockId = this.#nextBlockId++;
        this.#blocks.set(bodyBlockId, makeEmptyBlock(bodyBlockId));

        // Create a place for the function
        const functionPlace = this.#createTemporaryPlace();

        // Handle function name
        const functionName = getFunctionName(statement);
        if (!functionName) {
          throw new Error("Function declaration must have a name");
        }

        if (!this.#currentScope) {
          throw new Error("No current scope");
        }

        // Enter a new scope for the function
        this.#enterScope();

        const body = statement.get("body");

        // Process parameters
        const params = statement.get("params").map((param) => {
          if (!param.isIdentifier()) {
            throw new Error("Only identifier parameters are supported");
          }

          const paramPlace = this.#createTemporaryPlace();
          const name = param.node.name;

          body.scope.rename(name, paramPlace.identifier.name);

          // Add parameter to current scope
          const declarationId = makeDeclarationId(this.#nextDeclarationId++);
          // Using paramPlace.identifier.name because we're renaming the parameter.
          this.#currentScope!.setDeclarationId(
            paramPlace.identifier.name,
            declarationId,
          );
          this.#currentScope!.setBinding(declarationId, paramPlace);

          return paramPlace;
        });

        // Save current block ID
        const previousBlockId = this.#currentBlockId;
        this.#currentBlockId = bodyBlockId;

        // Build function body
        this.#buildStatement(body);

        // Restore previous block and scope
        this.#currentBlockId = previousBlockId;
        this.#exitScope();

        // Add function declaration instruction
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "FunctionDeclaration",
          target: functionPlace,
          params,
          body: bodyBlockId,
          type: "const",
        });

        // Store the function in the current scope
        const declarationId = makeDeclarationId(this.#nextDeclarationId++);
        this.#currentScope.setDeclarationId(
          functionName.node.name,
          declarationId,
        );
        this.#currentScope.setBinding(declarationId, functionPlace);

        break;
      }

      case "VariableDeclaration": {
        statement.assertVariableDeclaration();
        for (const declaration of statement.get("declarations")) {
          const init = declaration.get("init");
          if (init.hasNode()) {
            const valuePlace = this.#buildExpression(init);
            const targetPlace = this.#createTemporaryPlace();
            const name = (declaration.node.id as t.Identifier).name;

            this.#currentBlock.instructions.push({
              id: makeInstructionId(this.#nextInstructionId++),
              kind: "StoreLocal",
              target: targetPlace,
              value: {
                kind: "Load",
                place: valuePlace,
              },
              type: statementNode.kind === "const" ? "const" : "let",
            });

            if (!this.#currentScope) {
              throw new Error("No current scope");
            }

            declaration.scope.rename(name, targetPlace.identifier.name);
            const declarationId = makeDeclarationId(this.#nextDeclarationId++);
            this.#currentScope.setDeclarationId(
              // Using targetPlace.identifier.name because we're renaming the variable.
              targetPlace.identifier.name,
              declarationId,
            );

            this.#currentScope.setBinding(declarationId, targetPlace);

            if (statementNode.kind === "let") {
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
        break;
      }

      case "ExpressionStatement": {
        statement.assertExpressionStatement();
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

            this.#currentBlock.instructions.push({
              id: makeInstructionId(this.#nextInstructionId++),
              kind: "StoreLocal",
              target: targetPlace,
              value: {
                kind: "Load",
                place: valuePlace,
              },
              type: "const",
            });

            if (!this.#currentScope) {
              throw new Error("No current scope");
            }

            expression.scope.rename(name, targetPlace.identifier.name);
            this.#currentScope.renameDeclaration(
              name,
              targetPlace.identifier.name,
            );
            this.#currentScope.setBinding(declarationId, targetPlace);
            const phi = this.#currentScope.getPhi(declarationId);
            if (phi) {
              phi.operands.set(this.#currentBlockId, targetPlace);
            }
          }
        }
        break;
      }

      default: {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "UnsupportedNode",
          target: resultPlace,
          node: statementNode,
          type: "const",
        });
        statement.skip();
      }
    }
  }

  #buildExpression(expression: NodePath<t.Expression>): Place {
    const expressionNode = expression.node;
    switch (expressionNode.type) {
      case "Identifier": {
        const name = expressionNode.name;
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

      case "ArrayExpression":
        expression.assertArrayExpression();

        const resultPlace = this.#createTemporaryPlace();
        const elements = expression.get("elements");
        const elementsPlaces = elements.map((element) => {
          if (element.isSpreadElement()) {
            return this.#buildSpreadElement(element);
          }

          return this.#buildExpression(element as NodePath<t.Expression>);
        });
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "ArrayExpression",
          target: resultPlace,
          elements: elementsPlaces,
          type: "const",
        });

        return resultPlace;

      case "NumericLiteral":
      case "StringLiteral":
      case "BooleanLiteral": {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "StoreLocal",
          target: resultPlace,
          value: {
            kind: "Primitive",
            value: expressionNode.value,
          },
          type: "const",
        });
        return resultPlace;
      }

      case "BinaryExpression": {
        const leftPlace = this.#buildExpression(
          expression.get("left") as NodePath<t.Expression>,
        );
        const rightPlace = this.#buildExpression(
          expression.get("right") as NodePath<t.Expression>,
        );
        const resultPlace = this.#createTemporaryPlace();

        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "BinaryExpression",
          target: resultPlace,
          operator: expressionNode.operator as "+",
          left: leftPlace,
          right: rightPlace,
          type: "const",
        });

        return resultPlace;
      }

      case "UnaryExpression": {
        expression.assertUnaryExpression();
        const operandPlace = this.#buildExpression(
          expression.get("argument") as NodePath<t.Expression>,
        );
        const resultPlace = this.#createTemporaryPlace();

        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "UnaryExpression",
          target: resultPlace,
          operator: expressionNode.operator as "!" | "~",
          value: operandPlace,
          type: "const",
        });

        return resultPlace;
      }

      case "UpdateExpression": {
        expression.assertUpdateExpression();
        const argumentPlace = this.#buildExpression(
          expression.get("argument") as NodePath<t.Expression>,
        );
        const resultPlace = this.#createTemporaryPlace();

        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "UpdateExpression",
          target: resultPlace,
          operator: expressionNode.operator,
          prefix: expressionNode.prefix,
          value: argumentPlace,
          type: "const",
        });

        return resultPlace;
      }

      default: {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "UnsupportedNode",
          target: resultPlace,
          node: expressionNode,
          type: "const",
        });
        return resultPlace;
      }
    }
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

  #createTemporaryPlace(): Place {
    const identifierId = makeIdentifierId(this.#nextIdentifierId++);
    return {
      kind: "Identifier",
      identifier: {
        id: identifierId,
        declarationId: makeDeclarationId(this.#nextDeclarationId++),
        name: makeIdentifierName(identifierId),
      },
    };
  }
}
