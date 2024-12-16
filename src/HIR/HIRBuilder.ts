import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { BasicBlock, BlockId, makeEmptyBlock } from "./Block";
import { makeIdentifierId, makeIdentifierName } from "./Identifier";
import { makeInstructionId } from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";

export class HIRBuilder {
  #program: NodePath<t.Program>;
  #blocks: Map<BlockId, BasicBlock>;
  #currentBlockId: BlockId;
  #phis: Map<string, Phi>;
  #variablePlaces: Map<string, Place>; // Map from variable name to current Place

  #nextBlockId = 0;
  #nextIdentifierId = 0;
  #nextInstructionId = 0;

  constructor(program: NodePath<t.Program>) {
    this.#program = program;
    this.#blocks = new Map();
    this.#phis = new Map();
    this.#variablePlaces = new Map();

    this.#blocks.set(0, makeEmptyBlock(this.#nextBlockId++));
    this.#currentBlockId = 0;
  }

  public get blocks() {
    return this.#blocks;
  }

  public get phis() {
    return this.#phis;
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
        for (const stmt of statement.get("body")) {
          this.#buildStatement(stmt);
        }
        break;
      }

      case "IfStatement": {
        statement.assertIfStatement();
        const test = statement.get("test");
        const testPlace = this.#buildExpression(test);

        const consequentBlockId = this.#nextBlockId++;
        const alternateBlockId = this.#nextBlockId++;
        const fallthroughBlockId = this.#nextBlockId++;

        // Save current variable places
        const savedPlaces = new Map(this.#variablePlaces);

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
        const consequentPlaces = new Map(this.#variablePlaces);

        // Process alternate
        this.#blocks.set(alternateBlockId, makeEmptyBlock(alternateBlockId));
        this.#variablePlaces = new Map(savedPlaces);
        if (statement.node.alternate) {
          this.#currentBlockId = alternateBlockId;
          this.#buildStatement(
            statement.get("alternate") as NodePath<t.Statement>,
          );
        }
        const alternatePlaces = new Map(this.#variablePlaces);

        // Create fallthrough block and phi nodes
        this.#blocks.set(
          fallthroughBlockId,
          makeEmptyBlock(fallthroughBlockId),
        );
        this.#currentBlockId = fallthroughBlockId;

        // Create phi nodes for variables modified in either branch
        for (const [name, phi] of this.#phis) {
          const consequentPlace = consequentPlaces.get(name);
          const alternatePlace = alternatePlaces.get(name);

          if (consequentPlace || alternatePlace) {
            phi.operands.set(consequentBlockId, consequentPlace || phi.place);
            phi.operands.set(alternateBlockId, alternatePlace || phi.place);
            // Update the current place to be the phi's place
            this.#variablePlaces.set(name, phi.place);
          }
        }

        break;
      }

      case "VariableDeclaration": {
        statement.assertVariableDeclaration();
        for (const declaration of statement.get("declarations")) {
          const init = declaration.get("init");
          if (init.node) {
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
            });

            this.#variablePlaces.set(name, targetPlace);

            if (statementNode.kind === "let") {
              const phiPlace = this.#createTemporaryPlace();
              this.#phis.set(name, {
                source: this.#currentBlockId,
                place: phiPlace,
                operands: new Map([[this.#currentBlockId, targetPlace]]),
              });
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
            });

            this.#variablePlaces.set(name, targetPlace);

            const phi = this.#phis.get(name);
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
        });
      }
    }
  }

  #buildExpression(expression: NodePath<t.Expression>): Place {
    const expressionNode = expression.node;
    switch (expressionNode.type) {
      case "Identifier": {
        const name = expressionNode.name;
        const place = this.#variablePlaces.get(name);
        if (!place) {
          throw new Error(`Undefined variable: ${name}`);
        }
        return place;
      }

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
          operator: expressionNode.operator,
          left: leftPlace,
          right: rightPlace,
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
        });
        return resultPlace;
      }
    }
  }

  #createTemporaryPlace(): Place {
    const identifierId = makeIdentifierId(this.#nextIdentifierId++);
    return {
      kind: "Identifier",
      identifier: {
        id: identifierId,
        name: makeIdentifierName(identifierId),
      },
    };
  }
}
