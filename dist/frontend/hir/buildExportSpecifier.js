import * as t from '@babel/types';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import 'lodash-es';
import { buildNode } from './buildNode.js';

function buildExportSpecifier(nodePath, functionBuilder, moduleBuilder, environment) {
    const localPath = nodePath.get("local");
    const localPlace = buildNode(localPath, functionBuilder, moduleBuilder, environment);
    if (localPlace === undefined || Array.isArray(localPlace)) {
        throw new Error("Export specifier local must be a single place");
    }
    const localName = getLocalName(nodePath);
    const exportedName = getExportedName(nodePath);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ExportSpecifierInstruction, place, nodePath, localName, exportedName);
    functionBuilder.addInstruction(instruction);
    const declarationId = functionBuilder.getDeclarationId(localName, nodePath);
    const declarationInstructionId = environment.getDeclarationInstruction(declarationId);
    moduleBuilder.exports.set(exportedName, {
        instruction,
        declaration: environment.instructions.get(declarationInstructionId),
    });
    return place;
}
function getLocalName(nodePath) {
    return nodePath.node.local.name;
}
function getExportedName(nodePath) {
    const exportedNode = nodePath.node.exported;
    if (t.isIdentifier(exportedNode)) {
        return exportedNode.name;
    }
    return exportedNode.value;
}

export { buildExportSpecifier };
//# sourceMappingURL=buildExportSpecifier.js.map
