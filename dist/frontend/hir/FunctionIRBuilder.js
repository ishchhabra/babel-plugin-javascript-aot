import { createBlock } from '../../ir/utils.js';
import { makeFunctionIRId, FunctionIR } from '../../ir/core/FunctionIR.js';
import { buildBindings } from './bindings/buildBindings.js';
import { buildNode } from './buildNode.js';

class FunctionIRBuilder {
    nodePath;
    environment;
    moduleBuilder;
    params;
    currentBlock;
    blocks = new Map();
    constructor(nodePath, environment, moduleBuilder, params) {
        this.nodePath = nodePath;
        this.environment = environment;
        this.moduleBuilder = moduleBuilder;
        this.params = params;
        const entryBlock = createBlock(environment);
        this.blocks.set(entryBlock.id, entryBlock);
        this.currentBlock = entryBlock;
    }
    build() {
        const functionId = makeFunctionIRId(this.environment.nextFunctionId++);
        buildBindings(this.nodePath, this);
        const bodyPath = this.nodePath.get("body");
        for (const statementPath of bodyPath) {
            buildNode(statementPath, this, this.moduleBuilder);
        }
        const functionIR = new FunctionIR(functionId, this.params, this.blocks);
        this.moduleBuilder.functions.set(functionIR.id, functionIR);
        return functionIR;
    }
    addInstruction(instruction) {
        // We only need to register the declaration place if it's not already registered.
        // For declarations, the registrations are already done in the binding phase.
        if (!this.environment.declToDeclInstrPlace.has(instruction.place.identifier.declarationId)) {
            this.registerDeclarationPlace(instruction.place.identifier.declarationId, instruction.place);
        }
        this.currentBlock.instructions.push(instruction);
        this.environment.placeToInstruction.set(instruction.place.id, instruction);
    }
    registerDeclarationName(name, declarationId, nodePath) {
        nodePath.scope.setData(name, declarationId);
    }
    getDeclarationId(name, nodePath) {
        return nodePath.scope.getData(name);
    }
    registerDeclarationPlace(declarationId, place) {
        const places = this.environment.declToPlaces.get(declarationId) ?? [];
        places.push({ blockId: this.currentBlock.id, place });
        this.environment.declToPlaces.set(declarationId, places);
    }
    getLatestDeclarationPlace(declarationId) {
        const places = this.environment.declToPlaces.get(declarationId);
        return places?.at(-1)?.place;
    }
    getDeclarationInstruction(declarationId) {
        const declarationPlace = this.getLatestDeclarationPlace(declarationId);
        if (declarationPlace === undefined) {
            return undefined;
        }
        return this.environment.placeToInstruction.get(declarationPlace.id);
    }
}

export { FunctionIRBuilder };
//# sourceMappingURL=FunctionIRBuilder.js.map
