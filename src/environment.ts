import { castArray } from "lodash-es";
import {
  BaseInstruction,
  BasicBlock,
  BlockId,
  InstructionId,
  makeBlockId,
  makeInstructionId,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OmitFirst<T extends unknown[]> = T extends [any, ...infer Rest]
  ? Rest
  : never;

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
  declToPlaces: Map<
    DeclarationId,
    Array<{ blockId: BlockId; placeId: PlaceId }>
  > = new Map();

  /**
   * Maps each `DeclarationId` to the `InstructionId` of the IR instruction responsible
   * for its *declaration statement*. When multiple variables are declared
   * together (e.g. `const a = 1, b = 2`), all associated `DeclarationId`s will
   * map to the *same* StoreLocal instruction.
   */
  declToDeclInstr: Map<DeclarationId, InstructionId> = new Map();

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createInstruction<C extends new (...args: any[]) => any>(
    Class: C,
    ...args: OmitFirst<ConstructorParameters<C>>
  ): InstanceType<C> {
    const instructionId = makeInstructionId(this.nextInstructionId++);
    const instruction = new Class(instructionId, ...args);
    this.instructions.set(instructionId, instruction);
    return instruction;
  }

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

  public registerDeclaration(
    declarationId: DeclarationId,
    blockId: BlockId,
    placeId: PlaceId,
  ) {
    const placeIds = this.declToPlaces.get(declarationId) ?? [];
    placeIds.push({ blockId, placeId });
    this.declToPlaces.set(declarationId, placeIds);
  }

  public getLatestDeclaration(declarationId: DeclarationId) {
    const placeIds = this.declToPlaces.get(declarationId) ?? [];
    return placeIds[placeIds.length - 1];
  }

  public registerDeclarationInstruction(
    declarations: Place | Place[],
    instruction: BaseInstruction,
  ) {
    const declarations_ = castArray(declarations);
    declarations_.forEach((declaration) => {
      this.declToDeclInstr.set(
        declaration.identifier.declarationId,
        instruction.id,
      );
    });
  }

  public getDeclarationInstruction(
    declarationId: DeclarationId,
  ): InstructionId | undefined {
    return this.declToDeclInstr.get(declarationId);
  }
}
