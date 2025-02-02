import { BaseInstruction, BasicBlock, BlockId, InstructionId } from "./ir";
import { FunctionIR, FunctionIRId } from "./ir/core/FunctionIR";
import { DeclarationId, Identifier, IdentifierId } from "./ir/core/Identifier";
import { Place, PlaceId } from "./ir/core/Place";
type OmitFirst<T extends unknown[]> = T extends [any, ...infer Rest] ? Rest : never;
export declare class Environment {
    readonly identifiers: Map<IdentifierId, Identifier>;
    readonly places: Map<PlaceId, Place>;
    readonly instructions: Map<InstructionId, BaseInstruction>;
    readonly blocks: Map<BlockId, BasicBlock>;
    readonly functions: Map<FunctionIRId, FunctionIR>;
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
    declToPlaces: Map<DeclarationId, Array<{
        blockId: BlockId;
        placeId: PlaceId;
    }>>;
    /**
     * Maps each `DeclarationId` to the `InstructionId` of the IR instruction responsible
     * for its *declaration statement*. When multiple variables are declared
     * together (e.g. `const a = 1, b = 2`), all associated `DeclarationId`s will
     * map to the *same* StoreLocal instruction.
     */
    declToDeclInstr: Map<DeclarationId, InstructionId>;
    /**
     * Maps each `PlaceId` to the IR instruction that is associated with it.
     */
    placeToInstruction: Map<PlaceId, BaseInstruction>;
    nextFunctionId: number;
    nextBlockId: number;
    nextDeclarationId: number;
    nextIdentifierId: number;
    nextInstructionId: number;
    nextPlaceId: number;
    nextPhiId: number;
    createIdentifier(declarationId?: DeclarationId): Identifier;
    createPlace(identifier: Identifier): Place;
    createInstruction<C extends new (...args: any[]) => any>(Class: C, ...args: OmitFirst<ConstructorParameters<C>>): InstanceType<C>;
    createBlock(): BasicBlock;
    createFunction(): FunctionIR;
    registerDeclaration(declarationId: DeclarationId, blockId: BlockId, placeId: PlaceId): void;
    getLatestDeclaration(declarationId: DeclarationId): {
        blockId: BlockId;
        placeId: PlaceId;
    };
    registerDeclarationInstruction(declarations: Place | Place[], instruction: BaseInstruction): void;
    getDeclarationInstruction(declarationId: DeclarationId): InstructionId | undefined;
}
export {};
