import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { Instruction } from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";
import { Value } from "./Value";

export class Codegen {
  #blocks: Map<BlockId, BasicBlock>;
  #phis: Map<string, Phi>;
  #generatedBlocks: Set<BlockId>;

  constructor(blocks: Map<BlockId, BasicBlock>, phis: Map<string, Phi>) {
    this.#blocks = blocks;
    this.#phis = phis;
    this.#generatedBlocks = new Set();
  }

  public generate() {
    const body: t.Statement[] = [];
    this.#generateBlock(0, body);
    return t.program(body);
  }

  #generateBlock(blockId: BlockId, body: t.Statement[]) {
    if (this.#generatedBlocks.has(blockId)) {
      return;
    }

    const block = this.#blocks.get(blockId);
    if (!block) {
      throw new Error(`Block ${blockId} not found`);
    }

    this.#generatedBlocks.add(blockId);

    // Generate phi declarations at the start of this block
    const blockPhis = Array.from(this.#phis.values())
      .filter((phi) => phi.source === blockId)
      .map((phi) =>
        t.variableDeclaration("let", [
          t.variableDeclarator(t.identifier(phi.place.identifier.name)),
        ]),
      );
    body.push(...blockPhis);

    // Generate instructions for this block
    for (const instruction of block.instructions) {
      const instructionNode = this.#generateInstruction(instruction);
      body.push(instructionNode);

      // Update phi values if this instruction is a store
      if (instruction.kind === "StoreLocal") {
        for (const phi of this.#phis.values()) {
          const phiOperand = phi.operands.get(blockId);
          if (phiOperand?.identifier.id === instruction.target.identifier.id) {
            body.push(
              t.expressionStatement(
                t.assignmentExpression(
                  "=",
                  t.identifier(phi.place.identifier.name),
                  t.identifier(instruction.target.identifier.name),
                ),
              ),
            );
          }
        }
      }
    }

    // Handle block terminal
    switch (block.terminal.kind) {
      case "branch": {
        const test = this.#generatePlace(block.terminal.test);
        const consequent: t.Statement[] = [];
        const alternate: t.Statement[] = [];

        this.#generateBlock(block.terminal.consequent, consequent);
        this.#generateBlock(block.terminal.alternate, alternate);

        body.push(
          t.ifStatement(
            test,
            t.blockStatement(consequent),
            alternate.length > 0 ? t.blockStatement(alternate) : null,
          ),
        );

        this.#generateBlock(block.terminal.fallthrough, body);
        break;
      }

      case "unsupported":
        break;
    }
  }

  #generateInstruction(instruction: Instruction): t.Statement {
    switch (instruction.kind) {
      case "StoreLocal":
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            this.#generateValue(instruction.value),
          ),
        ]);

      case "BinaryExpression":
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.binaryExpression(
              instruction.operator,
              this.#generatePlace(instruction.left),
              this.#generatePlace(instruction.right),
            ),
          ),
        ]);

      case "UnaryExpression":
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.unaryExpression(
              instruction.operator,
              this.#generatePlace(instruction.value),
            ),
          ),
        ]);

      case "UnsupportedNode":
        return instruction.node as t.Statement;

      default:
        throw new Error(
          `Unsupported instruction kind: ${(instruction as any).kind}`,
        );
    }
  }

  #generateValue(value: Value): t.Expression {
    switch (value.kind) {
      case "Primitive":
        return t.valueToNode(value.value);
      case "Load":
        return this.#generatePlace(value.place);
      default:
        throw new Error(`Unsupported value kind: ${(value as any).kind}`);
    }
  }

  #generatePlace(place: Place): t.Expression {
    return t.identifier(place.identifier.name);
  }
}
