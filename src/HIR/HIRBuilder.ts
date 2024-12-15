import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { makeIdentifierId, makeIdentifierName } from "./Identifier";
import { InstructionValue, makeInstructionId } from "./Instruction";

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
        const testValue = this.#buildExpression(test);
        const storedTest = this.#createTemporaryStore(testValue);

        const consequentBlockId = this.#nextBlockId++;
        const alternateBlockId = this.#nextBlockId++;
        const fallthroughBlockId = this.#nextBlockId++;

        const branchId = makeInstructionId(this.#nextInstructionId++);
        this.#currentBlock.terminal = {
          kind: "branch",
          test: storedTest,
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
            const value = this.#buildExpression(init);
            const identifierId = this.#nextIdentifierId++;
            const id = makeIdentifierId(identifierId);

            const name = (declaration.node.id as t.Identifier).name;
            this.#bindings.set(name, id);

            this.#currentBlock.instructions.push({
              id: makeInstructionId(this.#nextInstructionId++),
              value: {
                kind: "StoreLocal",
                place: {
                  kind: "Identifier",
                  identifier: {
                    id,
                    name: makeIdentifierName(id),
                  },
                },
                value,
              },
            });
          }
        }
        break;
      }

      default:
        this.#currentBlock.instructions.push({
          id: makeInstructionId(this.#nextInstructionId++),
          value: {
            kind: "UnsupportedNode",
            node: statementNode,
          },
        });
        break;
    }
  }

  #buildExpression(expression: NodePath<t.Expression>): InstructionValue {
    const expressionNode = expression.node;
    switch (expressionNode.type) {
      case "BooleanLiteral":
      case "NumericLiteral":
        expression.assertLiteral();
        return {
          kind: "Primitive",
          value: expressionNode.value,
        };

      case "Identifier": {
        expression.assertIdentifier();
        const binding = this.#bindings.get(expressionNode.name);
        if (binding === undefined) {
          throw new Error(`Undefined variable: ${expressionNode.name}`);
        }
        return {
          kind: "Load",
          place: {
            kind: "Identifier",
            identifier: {
              id: binding,
              name: makeIdentifierName(binding),
            },
          },
        };
      }

      case "UnaryExpression": {
        expression.assertUnaryExpression();
        const operand = expression.get("argument") as NodePath<t.Expression>;
        const operandValue = this.#buildExpression(operand);
        const storedOperand = this.#createTemporaryStore(operandValue);

        return {
          kind: "UnaryExpression",
          operator: expressionNode.operator as "!" | "~",
          value: storedOperand,
        };
      }

      case "BinaryExpression": {
        expression.assertBinaryExpression();
        const left = expression.get("left") as NodePath<t.Expression>;
        const right = expression.get("right") as NodePath<t.Expression>;

        const storedLeft = this.#createTemporaryStore(
          this.#buildExpression(left),
        );
        const storedRight = this.#createTemporaryStore(
          this.#buildExpression(right),
        );

        return {
          kind: "BinaryExpression",
          operator: expressionNode.operator as "+" | "-" | "/" | "*",
          left: storedLeft,
          right: storedRight,
        };
      }

      case "UpdateExpression":
        expression.assertUpdateExpression();
        const argument = expression.get("argument") as NodePath<t.Expression>;
        const argumentValue = this.#buildExpression(argument);

        const instructionId = makeInstructionId(this.#nextInstructionId++);
        const identifierId = makeIdentifierId(this.#nextIdentifierId++);

        this.#currentBlock.instructions.push({
          id: instructionId,
          value: {
            kind: "StoreLocal",
            place: {
              kind: "Identifier",
              identifier: {
                id: identifierId,
                name: makeIdentifierName(identifierId),
              },
            },
            value: argumentValue,
          },
        });

        return {
          kind: "UpdateExpression",
          operator: expressionNode.operator as "++" | "--",
          prefix: expressionNode.prefix,
          value: {
            kind: "Identifier",
            identifier: {
              id: identifierId,
              name: makeIdentifierName(identifierId),
            },
          },
        };

      default:
        console.log(expressionNode.type);
        return {
          kind: "UnsupportedNode",
          node: expressionNode,
        };
    }
  }

  #createTemporaryStore(value: InstructionValue) {
    const instructionId = makeInstructionId(this.#nextInstructionId++);
    const identifierId = makeIdentifierId(this.#nextIdentifierId++);

    this.#currentBlock.instructions.push({
      id: instructionId,
      value: {
        kind: "StoreLocal",
        place: {
          kind: "Identifier",
          identifier: {
            id: identifierId,
            name: makeIdentifierName(identifierId),
          },
        },
        value,
      },
    });

    return {
      kind: "Identifier" as const,
      identifier: {
        id: identifierId,
        name: makeIdentifierName(identifierId),
      },
    };
  }
}
