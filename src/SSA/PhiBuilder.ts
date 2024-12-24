import { Bindings, Block, BlockId, DeclarationId, Place } from "../HIR";
import {
  computeDominators,
  getImmediateDominators,
  getLeastCommonDominator,
} from "../utils/dominators";
import { makePhiName, Phi } from "./Phi";

export class PhiBuilder {
  #bindings: Bindings;
  #blocks: Map<BlockId, Block>;

  #dominators: Map<BlockId, Set<BlockId>>;
  #immediateDominators: Map<BlockId, BlockId | undefined>;

  #nextPhiId = 0;

  constructor(bindings: Bindings, blocks: Map<BlockId, Block>) {
    this.#bindings = bindings;
    this.#blocks = blocks;

    this.#dominators = computeDominators(blocks, 0);
    this.#immediateDominators = getImmediateDominators(this.#dominators);
  }

  /**
   * Build phi instructions for blocks that have multiple predecessors,
   * and unify variables that differ among those preds.
   * This is the same logic you already have, but now we can also
   * show how to find the "common node" if you want it.
   */
  public build(): Set<Phi> {
    const phis = new Set<Phi>();

    for (const [blockId, block] of this.#blocks) {
      const predecessors = [...block.predecessors];

      // If there's only one predecessor, there is no need for a phi.
      if (predecessors.length <= 1) {
        continue;
      }

      for (const [declarationId, declarationBindings] of this.#bindings) {
        const placesFromPreds = this.#getPredecessorPlaces(
          predecessors,
          declarationBindings,
        );

        if (!this.#shouldCreatePhi(placesFromPreds)) {
          continue;
        }

        const leastCommonDominator = getLeastCommonDominator(
          placesFromPreds[0]!.pred,
          placesFromPreds[1]!.pred,
          this.#immediateDominators,
        );

        const phi: Phi = {
          source: leastCommonDominator!,
          place: this.#createPhiPlace(declarationId),
          operands: new Map(),
        };
        for (const { pred, place } of placesFromPreds) {
          phi.operands.set(pred, place);
        }
        phis.add(phi);
      }
    }

    return phis;
  }

  #getPredecessorPlaces(
    predecessors: BlockId[],
    declarationBindings: Map<BlockId, Place>,
  ): { pred: BlockId; place: Place }[] {
    const places: { pred: BlockId; place: Place }[] = [];

    for (const predId of predecessors) {
      const place = declarationBindings.get(predId);
      if (place === undefined) {
        continue;
      }

      places.push({ pred: predId, place });
    }

    return places;
  }

  #shouldCreatePhi(places: { pred: BlockId; place: Place }[]): boolean {
    if (places.length <= 1) {
      return false;
    }

    const firstDefinition = places[0]!.place;
    return places.some((pp) => pp.place !== firstDefinition);
  }

  #createPhiPlace(declarationId: DeclarationId): Place {
    const id = this.#nextPhiId++;

    return {
      kind: "Identifier",
      identifier: {
        id,
        declarationId,
        name: makePhiName(id),
      },
    };
  }
}
