import { BasicBlock, BlockId } from "../../HIR/Block";
import { IdentifierId, makeIdentifierId } from "../../HIR/Identifier";
import {
  CallExpressionInstruction,
  FunctionDeclarationInstruction,
  Instruction,
} from "../../HIR/Instruction";
import { Place, TemporaryPlace } from "../../HIR/Place";
import { CallGraph } from "./CallGraph";

export function functionInlining(blocks: Map<BlockId, BasicBlock>): void {
  new FunctionInliner(blocks).optimize();
}

export class FunctionInliner {
  #blocks: Map<BlockId, BasicBlock>;
  #nextIdentifierId = 0;
  #callGraph: CallGraph;

  constructor(blocks: Map<BlockId, BasicBlock>) {
    this.#blocks = blocks;
    this.#callGraph = CallGraph.fromBlocks(blocks);
  }

  public optimize(): void {
    this.#inlineEligibleFunctions();
  }

  #inlineEligibleFunctions(): void {
    for (const block of [...this.#blocks.values()].reverse()) {
      this.#inlineFunctionsInBlock(block);
    }
  }

  #inlineFunctionsInBlock(block: BasicBlock): void {
    for (const [index, instruction] of block.instructions.entries()) {
      if (!this.#isInlineable(instruction)) {
        continue;
      }

      const targetFunction = this.#callGraph
        .getFunctionDeclarations()
        .get((instruction as CallExpressionInstruction).callee.identifier.id);

      if (!targetFunction) {
        continue;
      }

      const inlinedCode = this.#inlineFunction(
        instruction as CallExpressionInstruction,
        targetFunction,
      );

      block.instructions.splice(index, 1, ...inlinedCode);
    }
  }

  #isInlineable(instruction: Instruction): boolean {
    if (instruction.kind !== "CallExpression") {
      console.log(`Not inlineable: ${instruction.kind}`);
      return false;
    }

    const callee = instruction.callee.identifier.id;
    console.log(
      `Is recursive: ${callee}`,
      this.#callGraph.isFunctionRecursive(callee),
    );
    return !this.#callGraph.isFunctionRecursive(callee);
  }

  #generateUniquePlace(originalPlace: Place): Place {
    const id = this.#nextIdentifierId++;
    return new TemporaryPlace({
      id: makeIdentifierId(id),
      name: `$inline${id}`,
      declarationId: originalPlace.identifier.declarationId,
    });
  }

  #inlineFunction(
    call: CallExpressionInstruction,
    targetFunction: FunctionDeclarationInstruction,
  ): Instruction[] {
    const functionBody = this.#blocks.get(targetFunction.body);
    if (!functionBody) {
      return [call];
    }

    const { paramMap, localVarMap } = this.#buildVariableMaps(
      call,
      targetFunction,
    );

    return this.#transformInstructions(
      functionBody,
      paramMap,
      localVarMap,
      call,
    );
  }

  #buildVariableMaps(
    call: CallExpressionInstruction,
    targetFunction: FunctionDeclarationInstruction,
  ) {
    const paramMap = new Map<IdentifierId, Place>();
    const localVarMap = new Map<IdentifierId, Place>();

    targetFunction.params.forEach((param, index) => {
      const arg = call.args[index];
      if (arg && arg instanceof Place) {
        paramMap.set(param.identifier.id, arg);
      }
    });

    return { paramMap, localVarMap };
  }

  #transformInstructions(
    functionBody: BasicBlock,
    paramMap: Map<IdentifierId, Place>,
    localVarMap: Map<IdentifierId, Place>,
    call: CallExpressionInstruction,
  ): Instruction[] {
    const transformed: Instruction[] = [];

    for (const instruction of functionBody.instructions) {
      if (instruction.kind === "FunctionDeclaration") {
        continue;
      }

      const newPlace = this.#generateUniquePlace(instruction.target);
      localVarMap.set(instruction.target.identifier.id, newPlace);

      transformed.push(
        this.#remapVariables(instruction, paramMap, localVarMap),
      );
    }

    return this.#mapReturnValue(transformed, call);
  }

  #remapVariables(
    instruction: Instruction,
    paramMap: Map<IdentifierId, Place>,
    localVarMap: Map<IdentifierId, Place>,
  ): Instruction {
    return instruction.cloneWithPlaces(new Map([...paramMap, ...localVarMap]));
  }

  #mapReturnValue(
    instructions: Instruction[],
    call: CallExpressionInstruction,
  ): Instruction[] {
    const lastInstruction = instructions[instructions.length - 1];
    if (!lastInstruction) {
      return instructions;
    }

    const finalMapping = new Map<IdentifierId, Place>([
      [lastInstruction.target.identifier.id, call.target],
    ]);

    instructions[instructions.length - 1] =
      lastInstruction.cloneWithPlaces(finalMapping);

    return instructions;
  }
}
