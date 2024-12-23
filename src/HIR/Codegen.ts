import * as t from "@babel/types";
import { BasicBlock, Block, BlockId, ForLoopBlock, LoopBlock } from "./Block";
import { ExpressionInstruction, Instruction } from "./Instruction";
import { Phi } from "./Phi";
import { Place } from "./Place";
import { Terminal } from "./Terminal";
import { Value } from "./Value";

export class Codegen {
  readonly #blocks: Map<BlockId, Block>;
  readonly #phis: Set<Phi>;
  readonly #generatedBlocks: Set<BlockId>;

  constructor(blocks: Map<BlockId, Block>, phis: Set<Phi>) {
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
    const blockPhis = Array.from(this.#phis.values())
      .filter((phi) => phi.source === blockId && phi.operands.size > 1)
      .map((phi) =>
        t.variableDeclaration("let", [
          t.variableDeclarator(t.identifier(phi.place.identifier.name)),
        ]),
      );

    body.push(...blockPhis);
  }

  #generateBlock(blockId: BlockId, body: t.Statement[]) {
    const block = this.#blocks.get(blockId);
    if (block === undefined || this.#generatedBlocks.has(blockId)) {
      return;
    }

    this.#generatedBlocks.add(blockId);

    if (block instanceof BasicBlock) {
      return this.#generateBasicBlock(block, body);
    }

    if (block instanceof ForLoopBlock) {
      return this.#generateForLoopBlock(block, body);
    }

    if (block instanceof LoopBlock) {
      return this.#generateLoopBlock(block, body);
    }
  }

  #generateBasicBlock(block: BasicBlock, body: t.Statement[]) {
    this.#generatedBlocks.add(block.id);
    this.generatePhiAssignments(block.id, body);

    for (const instruction of block.instructions) {
      const instructionNode = this.#generateInstruction(instruction);
      body.push(instructionNode);

      for (const phi of this.#phis) {
        if (!phi.operands.has(block.id)) {
          continue;
        }

        const phiOperand = phi.operands.get(block.id)!;
        const targetName = instruction.target.identifier.name;
        const phiName = phiOperand.identifier.name;

        if (phiName === targetName) {
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

    if (block.terminal !== null) {
      this.#generateTerminal(block.terminal, body);
    }
  }

  #generateForLoopBlock(block: ForLoopBlock, body: t.Statement[]) {
    const bodyBlock = block.body;
    const bodyStatements: t.Statement[] = [];

    this.#generateBlock(bodyBlock.id, bodyStatements);
    const forLoop = t.forStatement(
      block.init.node,
      block.test.node,
      block.update.node,
      t.blockStatement(bodyStatements),
    );

    if (bodyBlock.terminal) {
      this.#generateTerminal(bodyBlock.terminal, bodyStatements);
    }

    body.push(forLoop);
  }

  #generateLoopBlock(block: LoopBlock, body: t.Statement[]) {
    this.#generateBlock(block.header.id, body);

    const bodyBlock = block.body;
    const bodyStatements: t.Statement[] = [];

    this.#generateBlock(bodyBlock.id, bodyStatements);
    const whileLoop = t.whileStatement(
      t.identifier(block.test.identifier.name),
      t.blockStatement(bodyStatements),
    );

    body.push(whileLoop);
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

      case "CallExpression":
      case "UnaryExpression":
      case "BinaryExpression":
      case "UpdateExpression":
      case "ArrayExpression": {
        return t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier(instruction.target.identifier.name),
            this.#generateExpression(instruction),
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

  #generateExpression(instruction: ExpressionInstruction): t.Expression {
    switch (instruction.kind) {
      case "CallExpression": {
        const callee = this.#generatePlace(instruction.callee);
        const args = instruction.args.map((arg) => {
          if (arg.kind === "SpreadElement") {
            return t.spreadElement(this.#generatePlace(arg.place));
          }
          return this.#generatePlace(arg);
        });
        return t.callExpression(callee, args);
      }

      case "UnaryExpression": {
        return t.unaryExpression(
          instruction.operator,
          t.identifier(instruction.value.identifier.name),
        );
      }

      case "BinaryExpression": {
        return t.binaryExpression(
          instruction.operator,
          t.identifier(instruction.left.identifier.name),
          t.identifier(instruction.right.identifier.name),
        );
      }

      case "UpdateExpression": {
        return t.updateExpression(
          instruction.operator,
          t.identifier(instruction.value.identifier.name),
          instruction.prefix,
        );
      }

      case "ArrayExpression": {
        return t.arrayExpression(
          instruction.elements.map((element) => {
            if (element.kind === "SpreadElement") {
              return t.spreadElement(this.#generatePlace(element.place));
            }
            return this.#generatePlace(element);
          }),
        );
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

      case "jump": {
        this.#generateBlock(terminal.target, body);
        this.#generateBlock(terminal.fallthrough, body);
        break;
      }

      case "return": {
        body.push(
          t.returnStatement(t.identifier(terminal.value.identifier.name)),
        );
        break;
      }
    }
  }
}
