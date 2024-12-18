import { BasicBlock, BlockId } from "../../HIR/Block";
import { IdentifierId, makeIdentifierId } from "../../HIR/Identifier";
import {
  CallExpressionInstruction,
  FunctionDeclarationInstruction,
  Instruction,
} from "../../HIR/Instruction";
import { Place } from "../../HIR/Place";

export function functionInlining(blocks: Map<BlockId, BasicBlock>): void {
  new FunctionInliner(blocks).optimize();
}

export class FunctionInliner {
  #blocks: Map<BlockId, BasicBlock>;
  #nextIdentifierId = 0;

  constructor(blocks: Map<BlockId, BasicBlock>) {
    this.#blocks = blocks;
  }

  public optimize(): void {
    this.#getFunctionDeclarations();
    this.#inlineFunctionCalls();
  }

  #getFunctionDeclarations(): Map<
    IdentifierId,
    FunctionDeclarationInstruction
  > {
    const functionDeclarations = new Map<
      IdentifierId,
      FunctionDeclarationInstruction
    >();

    for (const block of this.#blocks.values()) {
      for (const instruction of block.instructions) {
        if (instruction.kind === "FunctionDeclaration") {
          functionDeclarations.set(
            instruction.target.identifier.id,
            instruction,
          );
        }
      }
    }

    return functionDeclarations;
  }

  #inlineFunctionCalls(): void {
    const functionDeclarations = this.#getFunctionDeclarations();

    for (const block of this.#blocks.values()) {
      for (const [index, instruction] of block.instructions.entries()) {
        if (instruction.kind !== "CallExpression") {
          continue;
        }

        const callee = instruction.callee.identifier.id;
        const functionInfo = functionDeclarations.get(callee);

        if (!functionInfo) {
          continue;
        }

        const inlinedInstructions = this.inlineFunction(
          instruction,
          functionInfo,
        );
        block.instructions.splice(index, 1, ...inlinedInstructions);
      }
    }
  }

  private createInlinedPlace(originalPlace: Place): Place {
    const id = this.#nextIdentifierId++;
    return {
      kind: "Identifier",
      identifier: {
        id: makeIdentifierId(id),
        name: `$inline${id}`,
        declarationId: originalPlace.identifier.declarationId,
      },
    };
  }

  private inlineFunction(
    callInstruction: CallExpressionInstruction,
    functionInfo: FunctionDeclarationInstruction,
  ): Instruction[] {
    const functionBlock = this.#blocks.get(functionInfo.body);

    if (!functionBlock) {
      return [callInstruction];
    }

    const placeMapping = this.createPlaceMapping(callInstruction, functionInfo);
    const fullMapping = this.createFullMapping(
      functionBlock,
      placeMapping,
      callInstruction,
    );

    return functionBlock.instructions.map((instruction) =>
      instruction.cloneWithPlaces(fullMapping),
    );
  }

  private createPlaceMapping(
    callInstruction: CallExpressionInstruction,
    declaration: FunctionDeclarationInstruction,
  ): Map<IdentifierId, Place> {
    const placeMapping = new Map<IdentifierId, Place>();

    declaration.params.forEach((param, index) => {
      const arg = callInstruction.args[index];
      if (arg && arg.kind !== "SpreadElement") {
        placeMapping.set(param.identifier.id, arg);
      }
    });

    return placeMapping;
  }

  private createFullMapping(
    functionBlock: BasicBlock,
    placeMapping: Map<IdentifierId, Place>,
    callInstruction: CallExpressionInstruction,
  ): Map<IdentifierId, Place> {
    const internalPlaceMapping = new Map<IdentifierId, Place>();

    functionBlock.instructions.forEach((instruction) => {
      instruction.getPlaces().forEach((place) => {
        if (!placeMapping.has(place.identifier.id)) {
          internalPlaceMapping.set(
            place.identifier.id,
            this.createInlinedPlace(place),
          );
        }
      });
    });

    const fullMapping = new Map([...placeMapping, ...internalPlaceMapping]);

    const lastInstruction =
      functionBlock.instructions[functionBlock.instructions.length - 1];
    if (lastInstruction) {
      fullMapping.set(
        lastInstruction.target.identifier.id,
        callInstruction.target,
      );
    }

    return fullMapping;
  }
}
