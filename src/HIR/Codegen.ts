import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { Instruction, InstructionValue } from "./Instruction";
import { Place } from "./Place";

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
    switch (instruction.value.kind) {
      case "StoreLocal":
        const value = this.#generateValue(instruction.value);
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.value.place.identifier.name),
            value as t.Expression,
          ),
        ]);

      case "UnsupportedNode":
        return instruction.value.node as t.Statement;
    }

    throw new Error(`Unsupported instruction kind: ${instruction.value.kind}`);
  }

  #generateValue(value: InstructionValue): t.Node {
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

      case "UnaryExpression":
        return t.unaryExpression(
          value.operator,
          this.#generatePlace(value.value),
        );

      case "BinaryExpression":
        return t.binaryExpression(
          value.operator,
          this.#generatePlace(value.left),
          this.#generatePlace(value.right),
        );

      case "StoreLocal":
        return this.#generateValue(value.value);

      case "UpdateExpression":
        return t.updateExpression(
          value.operator,
          this.#generatePlace(value.value),
          value.prefix,
        );

      case "UnsupportedNode":
        return value.node;
    }

    throw new Error(`Unsupported value kind: ${JSON.stringify(value)}`);
  }

  #generatePlace(place: Place): t.Expression {
    switch (place.kind) {
      case "Identifier":
        return t.identifier(place.identifier.name);
    }
  }
}
