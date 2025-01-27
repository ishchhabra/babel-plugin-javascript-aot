import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';
import { BindingIdentifierInstruction } from '../../ir/instructions/BindingIdentifier.js';

function buildFunctionParams(paramPaths, bodyPath, functionBuilder) {
    return paramPaths.map((paramPath) => {
        paramPath.assertIdentifier();
        const name = paramPath.node.name;
        const identifier = createIdentifier(functionBuilder.environment);
        const place = createPlace(identifier, functionBuilder.environment);
        const instructionId = createInstructionId(functionBuilder.environment);
        functionBuilder.header.push(new BindingIdentifierInstruction(instructionId, place, paramPath, identifier.name));
        const declarationId = identifier.declarationId;
        functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
        functionBuilder.registerDeclarationPlace(declarationId, place);
        return place;
    });
}

export { buildFunctionParams };
//# sourceMappingURL=buildFunctionParams.js.map
