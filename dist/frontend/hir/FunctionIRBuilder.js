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
        const entryBlock = this.environment.createBlock();
        this.blocks.set(entryBlock.id, entryBlock);
        this.currentBlock = entryBlock;
    }
    build() {
        const params = buildFunctionParams(this.paramPaths, this.bodyPath, this, this.environment);
        const functionId = makeFunctionIRId(this.environment.nextFunctionId++);
        if (this.bodyPath.isExpression()) {
            buildNode(this.bodyPath, this, this.moduleBuilder, this.environment);
        }
        else {
            buildBindings(this.bodyPath, this, this.environment);
            const bodyPath = this.bodyPath.get("body");
            if (!Array.isArray(bodyPath)) {
                throw new Error("Body path is not an array");
            }
            for (const statementPath of bodyPath) {
                buildNode(statementPath, this, this.moduleBuilder, this.environment);
            }
        }
        const functionIR = new FunctionIR(functionId, this.header, params, this.blocks);
        this.moduleBuilder.functions.set(functionIR.id, functionIR);
        return functionIR;
    }
    addInstruction(instruction) {
        this.currentBlock.instructions.push(instruction);
        this.environment.placeToInstruction.set(instruction.place.id, instruction);
    }
    registerDeclarationName(name, declarationId, nodePath) {
        nodePath.scope.setData(name, declarationId);
    }
    getDeclarationId(name, nodePath) {
        return nodePath.scope.getData(name);
    }
}

export { FunctionIRBuilder };
//# sourceMappingURL=FunctionIRBuilder.js.map
