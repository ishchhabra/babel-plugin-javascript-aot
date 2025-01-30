import 'lodash-es';
import { BindingIdentifierInstruction } from '../../ir/instructions/BindingIdentifier.js';

function buildFunctionParams(paramPaths, bodyPath, functionBuilder, environment) {
    return paramPaths.map((paramPath) => {
        paramPath.assertIdentifier();
        const name = paramPath.node.name;
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instruction = environment.createInstruction(BindingIdentifierInstruction, place, paramPath, identifier.name);
        functionBuilder.header.push(instruction);
        const declarationId = identifier.declarationId;
        functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
        functionBuilder.registerDeclarationPlace(declarationId, place);
        return place;
    });
}

export { buildFunctionParams };
//# sourceMappingURL=buildFunctionParams.js.map
