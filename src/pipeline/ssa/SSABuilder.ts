import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { BlockId, createPlace } from "../../ir";
import { Phi } from "./Phi";
import { createPhiIdentifier } from "./utils";

interface SSA {
  phis: Set<Phi>;
}

/**
 * Computes the phis for the HIR.
 */
export class SSABuilder {
  constructor(private readonly moduleUnit: ModuleUnit) {}

  public build(): SSA {
    const phis = new Set<Phi>();

    // Compute phis.
    for (const [declarationId, places] of this.moduleUnit.environment
      .declToPlaces) {
      const definitionBlocks = places.map((p) => p.blockId);
      if (definitionBlocks.length <= 1) {
        continue;
      }

      const workList = [...definitionBlocks];
      const hasPhi = new Set<BlockId>();
      while (workList.length > 0) {
        const definitionBlock = workList.pop()!;
        const frontier = this.moduleUnit.dominanceFrontier.get(definitionBlock);
        if (frontier === undefined) {
          continue;
        }

        for (const blockId of frontier) {
          if (hasPhi.has(blockId)) {
            continue;
          }

          // Insert phi node for declarationId in block y.
          const identifier = createPhiIdentifier(
            this.moduleUnit.environment,
            declarationId,
          );
          const place = createPlace(identifier, this.moduleUnit.environment);
          phis.add(new Phi(blockId, place, new Map()));
          hasPhi.add(blockId);

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
      const predecessors = [...this.moduleUnit.predecessors.get(phi.blockId)!];
      const places = this.moduleUnit.environment.declToPlaces.get(
        phi.place.identifier.declarationId,
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
