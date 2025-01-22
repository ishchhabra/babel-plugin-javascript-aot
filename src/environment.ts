import { BaseInstruction, BlockId } from "./ir";
import { DeclarationId } from "./ir/core/Identifier";
import { Place, PlaceId } from "./ir/core/Place";

export class Environment {
  /**
   * Maps each `DeclarationId` (representing a declared variable or function name)
   * to an array of objects, where each object includes:
   * - `blockId`: the ID of the basic block in which this version of the declaration
   *   was assigned or updated
   * - `place`: the `Place` holding the (SSA) value for that version
   *
   * In an SSA-based IR, each new assignment to a declaration in a different block
   * or scope effectively creates a new “version” of that declaration, captured by
   * a distinct `Place`. This structure keeps track of those versions over time.
   */
  declToPlaces: Map<DeclarationId, Array<{ blockId: BlockId; place: Place }>> =
    new Map();

  /**
   * Maps each `DeclarationId` to the `PlaceId` of the IR instruction responsible
   * for its *declaration statement*. When multiple variables are declared
   * together (e.g. `const a = 1, b = 2`), all associated `DeclarationId`s will
   * map to the *same* StoreLocal instruction.
   */
  declToDeclInstrPlace: Map<DeclarationId, PlaceId> = new Map();

  /**
   * Maps each `PlaceId` to the IR instruction that is associated with it.
   */
  placeToInstruction: Map<PlaceId, BaseInstruction> = new Map();

  nextFunctionId = 0;
  nextBlockId = 0;
  nextDeclarationId = 0;
  nextIdentifierId = 0;
  nextInstructionId = 0;
  nextPlaceId = 0;
  nextPhiId = 0;
}
