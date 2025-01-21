import * as t from '@babel/types';
import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { buildNode } from '../buildNode.js';

function buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder) {
    const declarations = nodePath.get("declarations");
    const declarationPlaces = declarations.map((declaration) => {
        const id = declaration.get("id");
        const lvalPlace = buildNode(id, functionBuilder, moduleBuilder);
        if (lvalPlace === undefined || Array.isArray(lvalPlace)) {
            throw new Error("Lval place must be a single place");
        }
        const init = declaration.get("init");
        let valuePlace;
        if (!init.hasNode()) {
            init.replaceWith(t.identifier("undefined"));
            init.assertIdentifier({ name: "undefined" });
            valuePlace = buildNode(init, functionBuilder, moduleBuilder);
        }
        else {
            valuePlace = buildNode(init, functionBuilder, moduleBuilder);
        }
        if (valuePlace === undefined || Array.isArray(valuePlace)) {
            throw new Error("Value place must be a single place");
        }
        const identifier = createIdentifier(functionBuilder.environment);
        const place = createPlace(identifier, functionBuilder.environment);
        const instructionId = createInstructionId(functionBuilder.environment);
        functionBuilder.addInstruction(new StoreLocalInstruction(instructionId, place, nodePath, lvalPlace, valuePlace, "const"));
        return place;
    });
    return declarationPlaces;
}

export { buildVariableDeclaration };
//# sourceMappingURL=buildVariableDeclaration.js.map
