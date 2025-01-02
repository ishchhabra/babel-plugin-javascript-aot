import { BlockId } from "../ir";
import { DeclarationId } from "../ir/Identifier";
import { Place } from "../ir/Place";

export class Environment {
  declToPlaces: Map<DeclarationId, Array<{ blockId: BlockId; place: Place }>> =
    new Map();

  nextBlockId = 0;
  nextDeclarationId = 0;
  nextIdentifierId = 0;
  nextInstructionId = 0;
  nextPlaceId = 0;

  // Using getters and setters with private properties to simulate Dart's
  // `late` keyword.
  private _dominators: Map<BlockId, Set<BlockId>> | undefined;
  private _immediateDominators: Map<BlockId, BlockId | undefined> | undefined;
  private _dominanceFrontier: Map<BlockId, Set<BlockId>> | undefined;

  get dominators() {
    if (this._dominators === undefined) {
      throw new Error("Dominators accessed before initialization");
    }

    return this._dominators;
  }

  set dominators(dominators: Map<BlockId, Set<BlockId>>) {
    this._dominators = dominators;
  }

  get immediateDominators() {
    if (this._immediateDominators === undefined) {
      throw new Error("Immediate dominators accessed before initialization");
    }

    return this._immediateDominators;
  }

  set immediateDominators(
    immediateDominators: Map<BlockId, BlockId | undefined>
  ) {
    this._immediateDominators = immediateDominators;
  }

  get dominanceFrontier() {
    if (this._dominanceFrontier === undefined) {
      throw new Error("Dominance frontier accessed before initialization");
    }

    return this._dominanceFrontier;
  }

  set dominanceFrontier(dominanceFrontier: Map<BlockId, Set<BlockId>>) {
    this._dominanceFrontier = dominanceFrontier;
  }
}
