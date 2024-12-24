import { Block, BlockId } from "../HIR/Block";
import { DeclarationId } from "../HIR/Declaration";
import { Bindings } from "../HIR/HIRBuilder";
import { StoreLocalInstruction } from "../HIR/Instruction";
import { Place } from "../HIR/Place";
import {
  computeDominators,
  getImmediateDominators,
  getLeastCommonDominator,
} from "../utils/dominators";
import { makePhiName, Phi } from "./Phi";

export class PhiBuilder {
  #bindings: Bindings;
  #blocks: Map<BlockId, Block>;

  #nextPhiId = 0;

  constructor(bindings: Bindings, blocks: Map<BlockId, Block>) {
    this.#bindings = bindings;
    this.#blocks = blocks;
  }

  /**
   * Build phi instructions for blocks that have multiple predecessors,
   * and unify variables that differ among those preds.
   * This is the same logic you already have, but now we can also
   * show how to find the "common node" if you want it.
   */
  public build(): Set<Phi> {
    const doms = computeDominators(this.#blocks, 0);
    const iDom = getImmediateDominators(doms);

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
          iDom,
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

        this.#updateBindingsAfterPhi(blockId, declarationId, phi.place, phi);
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

  #updateBindingsAfterPhi(
    blockId: BlockId,
    declarationId: DeclarationId,
    phiPlace: Place,
    phi: Phi,
  ) {
    const declarationBindings = this.#bindings.get(declarationId);
    if (!declarationBindings) return;

    // Get the block where we want to insert the phi
    const block = this.#blocks.get(blockId);
    if (!block) return;

    // Create a set of places we're looking to replace
    const placesToReplace = new Set(Array.from(phi.operands.values()));

    // Find the first load instruction that uses any of our operand places
    for (let i = 0; i < block.instructions.length; i++) {
      const inst = block.instructions[i];
      if (
        inst instanceof StoreLocalInstruction &&
        inst.value.kind === "Load" &&
        Array.from(placesToReplace).some(
          (place) =>
            inst.value.kind === "Load" &&
            place.identifier.id === inst.value.place.identifier.id,
        )
      ) {
        // Replace the load's place with our phi place
        inst.value.place = phiPlace;
        break;
      }
    }

    // Update bindings as before
    declarationBindings.set(blockId, phiPlace);
    const doms = computeDominators(this.#blocks, blockId);

    for (const [otherBlockId, _] of this.#blocks) {
      if (otherBlockId === blockId) continue;
      if (doms.has(otherBlockId) && !declarationBindings.has(otherBlockId)) {
        declarationBindings.set(otherBlockId, phiPlace);
      }
    }
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
