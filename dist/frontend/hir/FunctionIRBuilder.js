import { createBlock } from '../../ir/utils.js';
import { makeFunctionIRId, FunctionIR } from '../../ir/core/FunctionIR.js';
import { buildBindings } from './bindings/buildBindings.js';
import { buildNode } from './buildNode.js';

class FunctionIRBuilder {
    nodePath;
    environment;
    moduleBuilder;
    currentBlock;
    blocks = new Map();
    constructor(nodePath, environment, moduleBuilder) {
        this.nodePath = nodePath;
        this.environment = environment;
        this.moduleBuilder = moduleBuilder;
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
        const functionIR = new FunctionIR(functionId, this.blocks);
        this.moduleBuilder.functions.set(functionIR.id, functionIR);
        return functionIR;
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
}

export { FunctionIRBuilder };
//# sourceMappingURL=FunctionIRBuilder.js.map
