import { getFunctionName } from '../../../babel-utils.js';
import { FunctionDeclarationInstruction } from '../../../ir/instructions/declaration/Function.js';
import { createInstructionId } from '../../../ir/utils.js';
import { buildBindings } from '../bindings/buildBindings.js';
import { buildIdentifier } from '../buildIdentifier.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildFunctionDeclaration(nodePath, functionBuilder, moduleBuilder) {
    buildBindings(nodePath, functionBuilder);
    const idPath = nodePath.get("id");
    if (!idPath.isIdentifier()) {
        throw new Error("Invalid function declaration");
    }
    const identifierPlace = buildIdentifier(idPath, functionBuilder);
    const params = nodePath.get("params");
    const paramPlaces = params.map((param) => {
        if (!param.isIdentifier()) {
            throw new Error(`Unsupported parameter type: ${param.type}`);
        }
        const declarationId = functionBuilder.getDeclarationId(param.node.name, nodePath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${param.node.name}`);
        }
        const place = functionBuilder.getLatestDeclarationPlace(declarationId);
        if (place === undefined) {
            throw new Error(`Unable to find the place for ${param.node.name}`);
        }
        return place;
    });
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(bodyPath, functionBuilder.environment, moduleBuilder).build();
    const functionName = getFunctionName(nodePath);
    if (functionName === null) {
        throw new Error("Invalid function declaration");
    }
    const declarationId = functionBuilder.getDeclarationId(functionName.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Function accessed before declaration: ${functionName.node.name}`);
    }
    const functionPlace = functionBuilder.getLatestDeclarationPlace(declarationId);
    if (functionPlace === undefined) {
        throw new Error(`Unable to find the place for ${functionName.node.name} (${declarationId})`);
    }
    functionBuilder.currentBlock.instructions.push(new FunctionDeclarationInstruction(createInstructionId(functionBuilder.environment), functionPlace, nodePath, identifierPlace, paramPlaces, functionIR, nodePath.node.generator, nodePath.node.async));
    return functionPlace;
}

export { buildFunctionDeclaration };
//# sourceMappingURL=buildFunctionDeclaration.js.map
