import { BlockId, createPlace } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Phi } from "./Phi";
import { createPhiIdentifier } from "./utils";

interface SSA {
  phis: Set<Phi>;
}

/**
 * Computes the phis for the HIR.
 */
export class SSABuilder {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
  ) {}

  public build(): SSA {
    const phis = new Set<Phi>();

    // Compute phis.
    for (const [declarationId, places] of this.moduleIR.environment
      .declToPlaces) {
      const definitionBlocks = places.map((p) => p.blockId);
      if (definitionBlocks.length <= 1) {
        continue;
      }

      const workList = [...definitionBlocks];
      const hasPhi = new Set<BlockId>();
      while (workList.length > 0) {
        const definitionBlock = workList.pop()!;
        const frontier = this.functionIR.dominanceFrontier.get(definitionBlock);
        if (frontier === undefined) {
          continue;
        }

        for (const blockId of frontier) {
          if (hasPhi.has(blockId)) {
            continue;
          }

          // Insert phi node for declarationId in block y.
          const identifier = createPhiIdentifier(this.moduleIR.environment);
          const place = createPlace(identifier, this.moduleIR.environment);
          phis.add(new Phi(blockId, place, new Map(), declarationId));
          hasPhi.add(blockId);

          // Register the phi node declaration.
          this.moduleIR.environment.declToPlaces.set(declarationId, [
            ...places,
            { blockId, place },
          ]);

          // If y is not already a definition block for declarationId, add it to
          // the work list.
          if (!definitionBlocks.includes(blockId)) {
            workList.push(blockId);
          }
        }
      }
    }

    // After collecting all phis, populate their operands.
    for (const phi of phis) {
      const predecessors = [...this.functionIR.predecessors.get(phi.blockId)!];
      const places = this.moduleIR.environment.declToPlaces.get(
        phi.declarationId,
      );

      for (const predecessor of predecessors) {
        const place = places?.find((p) => p.blockId === predecessor)?.place;
        // If the variable is not defined in the predecessor, ignore it.
        // This occurs with back edges in loops, where the variable is defined
        // within the loop body but not in the block that enters the loop.
        // The variable definition exists in the loop block (a predecessor)
        // but not in the original entry block.
        if (place === undefined) {
          continue;
        }

        phi.operands.set(predecessor, place);
      }
    }

    return { phis };
  }
}
