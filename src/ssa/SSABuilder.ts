import { Environment } from "../compiler";
import { BlockId, createPlace } from "../ir";
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
    private readonly predecessors: Map<BlockId, Set<BlockId>>,
    private readonly environment: Environment
  ) {}

  public build(): SSA {
    const phis = new Set<Phi>();

    // Compute phis.
    for (const [declarationId, places] of this.environment.declToPlaces) {
      const definitionBlocks = places.map((p) => p.blockId);
      if (definitionBlocks.length <= 1) {
        continue;
      }

      const workList = [...definitionBlocks];
      const hasPhi = new Set<BlockId>();
      while (workList.length > 0) {
        const definitionBlock = workList.pop()!;
        const frontier =
          this.environment.dominanceFrontier.get(definitionBlock);
        if (frontier === undefined) {
          continue;
        }

        for (const blockId of frontier) {
          if (hasPhi.has(blockId)) {
            continue;
          }

          // Insert phi node for declarationId in block y.
          const identifier = createPhiIdentifier(
            this.environment,
            declarationId
          );
          const place = createPlace(identifier, this.environment);
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
      const predecessors = [...this.predecessors.get(phi.blockId)!];
      const places = this.environment.declToPlaces.get(
        phi.place.identifier.declarationId
      );

      for (const predecessor of predecessors) {
        const place = places?.find((p) => p.blockId === predecessor)?.place;
        if (place === undefined) {
          throw new Error(
            `Unable to find the place for ${phi.place.identifier.name} (${phi.place.identifier.declarationId})`
          );
        }

        phi.operands.set(predecessor, place);
      }
    }

    return { phis };
  }
}
