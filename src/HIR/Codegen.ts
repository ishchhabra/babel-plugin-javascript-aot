import * as t from "@babel/types";
import { BasicBlock, BlockId } from "./Block";
import { Instruction } from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";
import { Terminal } from "./Terminal";
import { Value } from "./Value";

export class Codegen {
  readonly #blocks: Map<BlockId, BasicBlock>;
  readonly #phis: Phi[];
  readonly #generatedBlocks: Set<BlockId>;

  constructor(blocks: Map<BlockId, BasicBlock>, phis: Phi[]) {
    this.#blocks = blocks;
    this.#phis = phis;
    this.#generatedBlocks = new Set();
  }

  generate(): t.Program {
    const body: t.Statement[] = [];
    this.#generateBlock(0, body);
    return t.program(body);
  }

  private generatePhiAssignments(blockId: BlockId, body: t.Statement[]) {
    const blockPhis = this.#phis
      .filter((phi) => phi.source === blockId)
      .map((phi) =>
        t.variableDeclaration("let", [
          t.variableDeclarator(t.identifier(phi.place.identifier.name)),
        ]),
      );

    body.push(...blockPhis);
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
    this.generatePhiAssignments(blockId, body);

    for (const instruction of block.instructions) {
      const instructionNode = this.#generateInstruction(instruction);
      body.push(instructionNode);

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

    this.#generateTerminal(block.terminal, body);
  }

  #generateInstruction(instruction: Instruction): t.Statement {
    switch (instruction.kind) {
      case "StoreLocal": {
        const value = this.#generateValue(instruction.value);
        return t.variableDeclaration(instruction.type, [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            value,
          ),
        ]);
      }

      case "FunctionDeclaration": {
        const params = instruction.params.map((param) =>
          t.identifier(param.identifier.name),
        );
        const functionBody: t.Statement[] = [];
        this.#generateBlock(instruction.body, functionBody);
        return t.functionDeclaration(
          t.identifier(instruction.target.identifier.name),
          params,
          t.blockStatement(functionBody),
        );
      }

      case "ArrayExpression": {
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.arrayExpression(
              instruction.elements.map((element) => {
                if (element.kind === "SpreadElement") {
                  return t.spreadElement(this.#generatePlace(element.place));
                }

                return this.#generatePlace(element);
              }),
            ),
          ),
        ]);
      }

      case "UnaryExpression": {
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.unaryExpression(
              instruction.operator,
              t.identifier(instruction.value.identifier.name),
            ),
          ),
        ]);
      }

      case "BinaryExpression": {
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.binaryExpression(
              instruction.operator,
              t.identifier(instruction.left.identifier.name),
              t.identifier(instruction.right.identifier.name),
            ),
          ),
        ]);
      }

      case "UpdateExpression": {
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            t.updateExpression(
              instruction.operator,
              t.identifier(instruction.value.identifier.name),
              instruction.prefix,
            ),
          ),
        ]);
      }

      case "UnsupportedNode": {
        if (!t.isStatement(instruction.node)) {
          return t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier(instruction.target.identifier.name),
              instruction.node as t.Expression,
            ),
          ]);
        }

        return instruction.node as t.Statement;
      }
    }
  }

  #generatePlace(place: Place): t.Expression {
    switch (place.kind) {
      case "Identifier":
        return t.identifier(place.identifier.name);
    }
  }

  #generateValue(value: Value): t.Expression {
    switch (value.kind) {
      case "Primitive":
        return t.valueToNode(value.value) as t.Expression;
      case "Load":
        return t.identifier(value.place.identifier.name);
    }
  }

  #generateTerminal(terminal: Terminal, body: t.Statement[]) {
    switch (terminal.kind) {
      case "branch": {
        const test = t.identifier(terminal.test.identifier.name);
        const consequent: t.Statement[] = [];
        const alternate: t.Statement[] = [];

        this.#generateBlock(terminal.consequent, consequent);
        this.#generateBlock(terminal.alternate, alternate);

        body.push(
          t.ifStatement(
            test,
            t.blockStatement(consequent),
            alternate.length > 0 ? t.blockStatement(alternate) : null,
          ),
        );

        this.#generateBlock(terminal.fallthrough, body);
        break;
      }

      case "return": {
        body.push(
          t.returnStatement(t.identifier(terminal.value.identifier.name)),
        );
        break;
      }

      case "unsupported":
        break;
    }
  }
}
