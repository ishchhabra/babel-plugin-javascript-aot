import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { Instruction } from "./Instruction";
import { Place } from "./Place";
import { Value } from "./Value";

export class Codegen {
  #blocks: Map<BlockId, BasicBlock>;
  #generatedBlocks: Set<BlockId>;

  constructor(blocks: Map<BlockId, BasicBlock>) {
    this.#blocks = blocks;
    this.#generatedBlocks = new Set();
  }

  public generate() {
    const body: t.Statement[] = [];

    // Start with block 0 and recursively process all blocks
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

    // Generate instructions for this block
    for (const instruction of block.instructions) {
      const instructionNode = this.#generateInstruction(instruction);
      body.push(instructionNode);
    }

    // Handle block terminal
    switch (block.terminal.kind) {
      case "branch": {
        const test = this.#generatePlace(block.terminal.test);
        const consequent: t.Statement[] = [];
        const alternate: t.Statement[] = [];

        // Generate consequent block
        this.#generateBlock(block.terminal.consequent, consequent);

        // Generate alternate block
        this.#generateBlock(block.terminal.alternate, alternate);

        // Create if statement
        body.push(
          t.ifStatement(
            test,
            t.blockStatement(consequent),
            alternate.length > 0 ? t.blockStatement(alternate) : null,
          ),
        );

        // Generate fallthrough block
        this.#generateBlock(block.terminal.fallthrough, body);
        break;
      }

      case "unsupported":
        // Nothing to do for unsupported terminals
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

      case "UpdateExpression":
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.updateExpression(
              instruction.operator,
              this.#generatePlace(instruction.value),
              instruction.prefix,
            ),
          ),
        ]);

      case "UnsupportedNode":
        return instruction.node as t.Statement;
    }
  }

  #generateValue(value: Value): t.Expression {
    switch (value.kind) {
      case "Primitive":
        if (typeof value.value === "number") {
          return t.numericLiteral(value.value);
        }
        if (typeof value.value === "string") {
          return t.stringLiteral(value.value);
        }
        if (typeof value.value === "boolean") {
          return t.booleanLiteral(value.value);
        }
        if (value.value === null) {
          return t.nullLiteral();
        }
        if (value.value === undefined) {
          return t.identifier("undefined");
        }
        break;

      case "Load":
        return this.#generatePlace(value.place);
    }

    throw new Error(`Unsupported value kind: ${value}`);
  }

  #generatePlace(place: Place): t.Expression {
    switch (place.kind) {
      case "Identifier":
        return t.identifier(place.identifier.name);
      default:
        throw new Error(`Unsupported place kind: ${place.kind}`);
    }
  }
}
