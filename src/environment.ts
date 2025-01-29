import {
  BaseInstruction,
  BasicBlock,
  BlockId,
  InstructionId,
  makeBlockId,
} from "./ir";
import {
  FunctionIR,
  FunctionIRId,
  makeFunctionIRId,
} from "./ir/core/FunctionIR";
import {
  DeclarationId,
  Identifier,
  IdentifierId,
  makeDeclarationId,
  makeIdentifierId,
} from "./ir/core/Identifier";
import { makePlaceId, Place, PlaceId } from "./ir/core/Place";

export class Environment {
  public readonly identifiers: Map<IdentifierId, Identifier> = new Map();
  public readonly places: Map<PlaceId, Place> = new Map();
  public readonly instructions: Map<InstructionId, BaseInstruction> = new Map();
  public readonly blocks: Map<BlockId, BasicBlock> = new Map();
  public readonly functions: Map<FunctionIRId, FunctionIR> = new Map();

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

  public createIdentifier(declarationId?: DeclarationId): Identifier {
    declarationId ??= makeDeclarationId(this.nextDeclarationId++);

    const identifierId = makeIdentifierId(this.nextIdentifierId++);
    const version = this.declToPlaces.get(declarationId)?.length ?? 0;
    const identifier = new Identifier(
      identifierId,
      `${version}`,
      declarationId,
    );
    this.identifiers.set(identifierId, identifier);
    return identifier;
  }

  public createPlace(identifier: Identifier): Place {
    const placeId = makePlaceId(this.nextPlaceId++);
    const place = new Place(placeId, identifier);
    this.places.set(placeId, place);
    return place;
  }

  // TODO: Implement createInstruction generic

  public createBlock(): BasicBlock {
    const blockId = makeBlockId(this.nextBlockId++);
    const block = new BasicBlock(blockId, [], undefined);
    this.blocks.set(blockId, block);
    return block;
  }

  public createFunction(): FunctionIR {
    const functionId = makeFunctionIRId(this.nextFunctionId++);
    const functionIR = new FunctionIR(functionId, [], [], new Map());
    this.functions.set(functionId, functionIR);
    return functionIR;
  }
}
