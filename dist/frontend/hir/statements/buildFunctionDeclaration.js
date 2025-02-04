import { getFunctionName } from '../../../babel-utils.js';
import { FunctionDeclarationInstruction } from '../../../ir/instructions/declaration/Function.js';
import 'lodash-es';
import { buildIdentifier } from '../buildIdentifier.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildFunctionDeclaration(nodePath, functionBuilder, moduleBuilder, environment) {
    const idPath = nodePath.get("id");
    if (!idPath.isIdentifier()) {
        throw new Error("Invalid function declaration");
    }
    const identifierPlace = buildIdentifier(idPath, functionBuilder, environment);
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const functionName = getFunctionName(nodePath);
    if (functionName === null) {
        throw new Error("Invalid function declaration");
    }
    const declarationId = functionBuilder.getDeclarationId(functionName.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Function accessed before declaration: ${functionName.node.name}`);
    }
    const latestDeclaration = environment.getLatestDeclaration(declarationId);
    const functionPlace = environment.places.get(latestDeclaration.placeId);
    if (functionPlace === undefined) {
        throw new Error(`Unable to find the place for ${functionName.node.name} (${declarationId})`);
    }
    const instruction = environment.createInstruction(FunctionDeclarationInstruction, functionPlace, nodePath, identifierPlace, functionIR, nodePath.node.generator, nodePath.node.async);
    functionBuilder.addInstruction(instruction);
    environment.registerDeclarationInstruction(identifierPlace, instruction);
    return functionPlace;
}

export { buildFunctionDeclaration };
//# sourceMappingURL=buildFunctionDeclaration.js.map
