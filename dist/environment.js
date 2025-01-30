import { makeInstructionId } from './ir/base/Instruction.js';
import { makeBlockId, BasicBlock } from './ir/core/Block.js';
import { makeDeclarationId, makeIdentifierId, Identifier } from './ir/core/Identifier.js';
import { makePlaceId, Place } from './ir/core/Place.js';
import { makeFunctionIRId, FunctionIR } from './ir/core/FunctionIR.js';

class Environment {
    identifiers = new Map();
    places = new Map();
    instructions = new Map();
    blocks = new Map();
    functions = new Map();
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
    declToPlaces = new Map();
    /**
     * Maps each `DeclarationId` to the `PlaceId` of the IR instruction responsible
     * for its *declaration statement*. When multiple variables are declared
     * together (e.g. `const a = 1, b = 2`), all associated `DeclarationId`s will
     * map to the *same* StoreLocal instruction.
     */
    declToDeclInstrPlace = new Map();
    /**
     * Maps each `PlaceId` to the IR instruction that is associated with it.
     */
    placeToInstruction = new Map();
    nextFunctionId = 0;
    nextBlockId = 0;
    nextDeclarationId = 0;
    nextIdentifierId = 0;
    nextInstructionId = 0;
    nextPlaceId = 0;
    nextPhiId = 0;
    createIdentifier(declarationId) {
        declarationId ??= makeDeclarationId(this.nextDeclarationId++);
        const identifierId = makeIdentifierId(this.nextIdentifierId++);
        const version = this.declToPlaces.get(declarationId)?.length ?? 0;
        const identifier = new Identifier(identifierId, `${version}`, declarationId);
        this.identifiers.set(identifierId, identifier);
        return identifier;
    }
    createPlace(identifier) {
        const placeId = makePlaceId(this.nextPlaceId++);
        const place = new Place(placeId, identifier);
        this.places.set(placeId, place);
        return place;
    }
    createInstruction(Class, ...args) {
        const instructionId = makeInstructionId(this.nextInstructionId++);
        const instruction = new Class(instructionId, ...args);
        this.instructions.set(instructionId, instruction);
        return instruction;
    }
    createBlock() {
        const blockId = makeBlockId(this.nextBlockId++);
        const block = new BasicBlock(blockId, [], undefined);
        this.blocks.set(blockId, block);
        return block;
    }
    createFunction() {
        const functionId = makeFunctionIRId(this.nextFunctionId++);
        const functionIR = new FunctionIR(functionId, [], [], new Map());
        this.functions.set(functionId, functionIR);
        return functionIR;
    }
}

export { Environment };
//# sourceMappingURL=environment.js.map
