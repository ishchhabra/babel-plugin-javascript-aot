import { SpreadElementInstruction } from '../../ir/instructions/SpreadElement.js';
import 'lodash-es';
import { buildNode } from './buildNode.js';

function buildSpreadElement(nodePath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder, environment);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Spread element argument must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(SpreadElementInstruction, place, nodePath, argumentPlace);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildSpreadElement };
//# sourceMappingURL=buildSpreadElement.js.map
