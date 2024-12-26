import { Bindings } from "../../HIR";
import { BasicBlock, BlockId } from "../../HIR/Block";
import { resolveBinding } from "../../HIR/HIRBuilder";
import { IdentifierId, makeIdentifierId } from "../../HIR/Identifier";
import {
  CallExpressionInstruction,
  FunctionDeclarationInstruction,
  Instruction,
} from "../../HIR/Instruction";
import { Place, TemporaryPlace } from "../../HIR/Place";
import { OptimizationReporter } from "../OptimizationPipeline/OptimizationReporter";
import { CallGraph } from "./CallGraph";

export function functionInlining(
  bindings: Bindings,
  blocks: Map<BlockId, BasicBlock>,
  reporter?: OptimizationReporter,
): void {
  new FunctionInliner(bindings, blocks, reporter).optimize();
}

class FunctionInliner {
  #bindings: Bindings;
  #blocks: Map<BlockId, BasicBlock>;
  #reporter?: OptimizationReporter;
  #nextInlinedId = 1000;
  #callGraph: CallGraph;

  constructor(
    bindings: Bindings,
    blocks: Map<BlockId, BasicBlock>,
    reporter?: OptimizationReporter,
  ) {
    this.#bindings = bindings;
    this.#blocks = blocks;
    this.#reporter = reporter;
    this.#callGraph = new CallGraph(bindings, blocks);
  }

  public optimize(): void {
    this.#inlineFunctions();
  }

  /**
   * Inlines all eligible functions.
   */
  #inlineFunctions(): void {
    for (const block of [...this.#blocks.values()].reverse()) {
      this.#inlineFunctionsInBlock(block);
    }
  }

  /**
   * Inlines all eligible functions in the given block.
   */
  #inlineFunctionsInBlock(block: BasicBlock): void {
    for (const [index, instruction] of block.instructions.entries()) {
      if (!(instruction instanceof CallExpressionInstruction)) {
        continue;
      }

      if (!this.#canInlineFunction(instruction, block.id)) {
        continue;
      }

      let functionDeclPlace: Place;
      try {
        functionDeclPlace = resolveBinding(
          this.#bindings,
          this.#blocks,
          instruction.callee.identifier.declarationId,
          block.id,
        );
      } catch (e) {
        continue;
      }

      const target = this.#callGraph.getFunctionDeclaration(
        functionDeclPlace.identifier.id,
      );
      if (target === undefined) {
        continue;
      }

      const functionBody = this.#blocks.get(target.body);
      if (
        functionBody === undefined ||
        functionBody.terminal?.kind !== "return"
      ) {
        continue;
      }

      const instructions = this.#inlineFunctionCall(instruction, target);
      block.instructions.splice(index, 1, ...instructions);
    }
  }

  /**
   * Inlines the given function call instruction with the given target function.
   *
   * @param call - The function call instruction to inline.
   *
   * @param target - The target function to inline.
   * @returns The new instructions to replace the call instruction with.
   */
  #inlineFunctionCall(
    call: CallExpressionInstruction,
    target: FunctionDeclarationInstruction,
  ): Array<Instruction> {
    const functionBody = this.#blocks.get(target.body);
    if (functionBody === undefined) {
      throw new Error(
        `Function body not found for function declaration: ${target.target.identifier.id}`,
      );
    }

    const variableMap = new Map([
      ...this.#buildParamMap(call, target),
      ...this.#buildLocalVarMap(target),
    ]);

    if (functionBody.terminal?.kind === "return") {
      variableMap.set(functionBody.terminal.value.identifier.id, call.target);
    }

    const transformedInstructions = functionBody.instructions.map(
      (instruction) => this.#remapVariables(instruction, variableMap),
    );

    return transformedInstructions;
  }

  #buildParamMap(
    call: CallExpressionInstruction,
    target: FunctionDeclarationInstruction,
  ): Map<IdentifierId, Place> {
    const paramMap = new Map<IdentifierId, Place>();

    target.params.forEach((param, index) => {
      const arg = call.args[index];
      if (arg && arg instanceof Place) {
        paramMap.set(param.identifier.id, arg);
      }
    });

    return paramMap;
  }

  #buildLocalVarMap(
    target: FunctionDeclarationInstruction,
  ): Map<IdentifierId, Place> {
    const functionBody = this.#blocks.get(target.body);
    if (functionBody === undefined) {
      throw new Error(
        `Function body not found for function declaration: ${target.target.identifier.id}`,
      );
    }

    const localVarMap = new Map<IdentifierId, Place>();

    for (const instruction of functionBody.instructions) {
      const newPlace = this.#createInlinedPlace(instruction.target);
      localVarMap.set(instruction.target.identifier.id, newPlace);
    }

    return localVarMap;
  }

  #remapVariables(
    instruction: Instruction,
    variableMap: Map<IdentifierId, Place>,
  ): Instruction {
    return instruction.cloneWithPlaces(variableMap);
  }

  /**
   * Creates a new temporary place for an inlined variable
   */
  #createInlinedPlace(originalPlace: Place): Place {
    const id = this.#nextInlinedId++;
    return new TemporaryPlace({
      id: makeIdentifierId(id),
      name: `$inlined${id}`,
      declarationId: originalPlace.identifier.declarationId,
    });
  }

  /**
   * Checks if the given function call instruction can be inlined.
   */
  #canInlineFunction(
    call: CallExpressionInstruction,
    blockId: BlockId,
  ): boolean {
    const block = this.#blocks.get(blockId);
    if (block === undefined) {
      return false;
    }

    try {
      const functionDeclPlace = resolveBinding(
        this.#bindings,
        this.#blocks,
        call.callee.identifier.declarationId,
        blockId,
      );
      return !this.#callGraph.isFunctionRecursive(
        functionDeclPlace.identifier.id,
      );
    } catch (e) {
      return false;
    }
  }
}
