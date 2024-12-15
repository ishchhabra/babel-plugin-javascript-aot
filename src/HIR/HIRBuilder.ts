import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { makeIdentifierId, makeIdentifierName } from "./Identifier";
import {
  BinaryExpressionInstruction,
  makeInstructionId,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
  UpdateExpressionInstruction,
} from "./Instruction";
import { Place } from "./Place";

export class HIRBuilder {
  #program: NodePath<t.Program>;
  #blocks: Map<BlockId, BasicBlock>;
  #currentBlockId: BlockId;
  #bindings: Map<string, number>;

  #nextBlockId = 0;
  #nextIdentifierId = 0;
  #nextInstructionId = 0;

  constructor(program: NodePath<t.Program>) {
    this.#program = program;
    this.#blocks = new Map();
    this.#bindings = new Map();

    this.#blocks.set(0, {
      kind: "block",
      id: this.#nextBlockId++,
      instructions: [],
      terminal: {
        kind: "unsupported",
      },
    });
    this.#currentBlockId = 0;
  }

  public get blocks() {
    return this.#blocks;
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

        const branchId = makeInstructionId(this.#nextInstructionId++);
        this.#currentBlock.terminal = {
          kind: "branch",
          test: testPlace,
          consequent: consequentBlockId,
          alternate: alternateBlockId,
          fallthrough: fallthroughBlockId,
          id: branchId,
        };

        this.#blocks.set(consequentBlockId, {
          kind: "block",
          id: consequentBlockId,
          instructions: [],
          terminal: {
            kind: "unsupported",
          },
        });

        this.#currentBlockId = consequentBlockId;
        const consequent = statement.get("consequent") as NodePath<t.Statement>;
        this.#buildStatement(consequent);

        this.#blocks.set(alternateBlockId, {
          kind: "block",
          id: alternateBlockId,
          instructions: [],
          terminal: {
            kind: "unsupported",
          },
        });

        if (statement.node.alternate) {
          this.#currentBlockId = alternateBlockId;
          const alternate = statement.get("alternate") as NodePath<t.Statement>;
          this.#buildStatement(alternate);
        }

        this.#blocks.set(fallthroughBlockId, {
          kind: "block",
          id: fallthroughBlockId,
          instructions: [],
          terminal: {
            kind: "unsupported",
          },
        });

        this.#currentBlockId = fallthroughBlockId;
        break;
      }

      case "VariableDeclaration": {
        statement.assertVariableDeclaration();
        for (const declaration of statement.get("declarations")) {
          const init = declaration.get("init");
          if (init.hasNode()) {
            const valuePlace = this.#buildExpression(init);
            const identifierId = this.#nextIdentifierId++;
            const id = makeIdentifierId(identifierId);

            const targetPlace = {
              kind: "Identifier" as const,
              identifier: {
                id,
                name: makeIdentifierName(id),
              },
            };

            const name = (declaration.node.id as t.Identifier).name;
            this.#bindings.set(name, id);

            this.#currentBlock.instructions.push({
              id: makeInstructionId(this.#nextInstructionId++),
              kind: "StoreLocal",
              target: targetPlace,
              place: targetPlace,
              value: {
                kind: "Load",
                place: valuePlace,
              },
            });
          }
        }
        break;
      }

      default:
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          kind: "UnsupportedNode",
          target: resultPlace,
          node: statementNode,
        });
        break;
    }
  }

  #buildExpression(expression: NodePath<t.Expression>): Place {
    const expressionNode = expression.node;
    const instructionId = makeInstructionId(this.#nextInstructionId++);

    switch (expressionNode.type) {
      case "BooleanLiteral":
      case "NumericLiteral": {
        expression.assertLiteral();

        const resultPlace = this.#createTemporaryPlace();
        const instruction: StoreLocalInstruction = {
          id: instructionId,
          kind: "StoreLocal",
          target: resultPlace,
          place: resultPlace,
          value: {
            kind: "Primitive",
            value: expressionNode.value,
          },
        };
        this.#currentBlock.instructions.push(instruction);
        return resultPlace;
      }

      case "Identifier": {
        // Look up the binding for this identifier
        const binding = this.#bindings.get(expressionNode.name);
        if (binding === undefined) {
          throw new Error(`Undefined variable: ${expressionNode.name}`);
        }

        // Return a place referencing this identifier
        return {
          kind: "Identifier",
          identifier: {
            id: binding,
            name: makeIdentifierName(binding),
          },
        };
      }

      case "UnaryExpression": {
        expression.assertUnaryExpression();
        const operandPlace = this.#buildExpression(
          expression.get("argument") as NodePath<t.Expression>,
        );

        const resultPlace = this.#createTemporaryPlace();
        const instruction: UnaryExpressionInstruction = {
          id: instructionId,
          kind: "UnaryExpression",
          target: resultPlace,
          operator: expressionNode.operator as "!" | "~",
          value: operandPlace,
        };
        this.#currentBlock.instructions.push(instruction);
        return resultPlace;
      }

      case "BinaryExpression": {
        expression.assertBinaryExpression();
        const leftPlace = this.#buildExpression(
          expression.get("left") as NodePath<t.Expression>,
        );
        const rightPlace = this.#buildExpression(
          expression.get("right") as NodePath<t.Expression>,
        );

        const resultPlace = this.#createTemporaryPlace();
        const instruction: BinaryExpressionInstruction = {
          id: instructionId,
          kind: "BinaryExpression",
          target: resultPlace,
          operator: expressionNode.operator as "+" | "-" | "/" | "*",
          left: leftPlace,
          right: rightPlace,
        };
        this.#currentBlock.instructions.push(instruction);
        return resultPlace;
      }

      case "UpdateExpression": {
        expression.assertUpdateExpression();
        const argumentPlace = this.#buildExpression(
          expression.get("argument") as NodePath<t.Expression>,
        );

        const resultPlace = this.#createTemporaryPlace();
        const instruction: UpdateExpressionInstruction = {
          id: instructionId,
          kind: "UpdateExpression",
          target: resultPlace,
          operator: expressionNode.operator,
          prefix: expressionNode.prefix,
          value: argumentPlace,
        };
        this.#currentBlock.instructions.push(instruction);
        return resultPlace;
      }

      default: {
        console.log("Unsupported node", expressionNode.type);
        const resultPlace = this.#createTemporaryPlace();
        const instruction: UnsupportedNodeInstruction = {
          id: instructionId,
          kind: "UnsupportedNode",
          target: resultPlace,
          node: expressionNode,
        };
        this.#currentBlock.instructions.push(instruction);
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
