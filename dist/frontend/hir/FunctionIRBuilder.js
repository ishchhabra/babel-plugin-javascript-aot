import { createBlock } from '../../ir/utils.js';
import { makeFunctionIRId, FunctionIR } from '../../ir/core/FunctionIR.js';
import { buildBindings } from './bindings/buildBindings.js';
import { buildFunctionParams } from './buildFunctionParams.js';
import { buildNode } from './buildNode.js';

class FunctionIRBuilder {
    paramPaths;
    bodyPath;
    environment;
    moduleBuilder;
    currentBlock;
    blocks = new Map();
    header = [];
    constructor(paramPaths, bodyPath, environment, moduleBuilder) {
        this.paramPaths = paramPaths;
        this.bodyPath = bodyPath;
        this.environment = environment;
        this.moduleBuilder = moduleBuilder;
        const entryBlock = createBlock(environment);
        this.blocks.set(entryBlock.id, entryBlock);
        this.currentBlock = entryBlock;
    }
    build() {
        const params = buildFunctionParams(this.paramPaths, this.bodyPath, this);
        const functionId = makeFunctionIRId(this.environment.nextFunctionId++);
        if (this.bodyPath.isExpression()) {
            buildNode(this.bodyPath, this, this.moduleBuilder);
        }
        else {
            buildBindings(this.bodyPath, this);
            const bodyPath = this.bodyPath.get("body");
            if (!Array.isArray(bodyPath)) {
                throw new Error("Body path is not an array");
            }
            for (const statementPath of bodyPath) {
                buildNode(statementPath, this, this.moduleBuilder);
            }
        }
        const functionIR = new FunctionIR(functionId, this.header, params, this.blocks);
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
