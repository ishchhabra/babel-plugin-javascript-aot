import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildVariableDeclaration(nodePath, builder) {
    const declarations = nodePath.get("declarations");
    const declarationPlaces = declarations.map((declaration) => {
        const id = declaration.get("id");
        const lvalPlace = buildNode(id, builder);
        if (lvalPlace === undefined || Array.isArray(lvalPlace)) {
            throw new Error("Lval place must be a single place");
        }
        const init = declaration.get("init");
        let valuePlace;
        if (!init.hasNode()) {
            init.replaceWith(t.identifier("undefined"));
            init.assertIdentifier({ name: "undefined" });
            valuePlace = buildNode(init, builder);
        }
        else {
            valuePlace = buildNode(init, builder);
        }
        if (valuePlace === undefined || Array.isArray(valuePlace)) {
            throw new Error("Value place must be a single place");
        }
        const identifier = createIdentifier(builder.environment);
        const place = createPlace(identifier, builder.environment);
        const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
        builder.currentBlock.instructions.push(new StoreLocalInstruction(instructionId, place, nodePath, lvalPlace, valuePlace, "const"));
        return place;
    });
    return declarationPlaces;
}

export { buildVariableDeclaration };
//# sourceMappingURL=buildVariableDeclaration.js.map