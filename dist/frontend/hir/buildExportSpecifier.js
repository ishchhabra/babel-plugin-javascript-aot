import * as t from '@babel/types';
import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import { buildNode } from './buildNode.js';

function buildExportSpecifier(nodePath, functionBuilder, moduleBuilder) {
    const localPath = nodePath.get("local");
    const localPlace = buildNode(localPath, functionBuilder, moduleBuilder);
    if (localPlace === undefined || Array.isArray(localPlace)) {
        throw new Error("Export specifier local must be a single place");
    }
    const localName = getLocalName(nodePath);
    const exportedName = getExportedName(nodePath);
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    const instruction = new ExportSpecifierInstruction(instructionId, place, nodePath, localName, exportedName);
    functionBuilder.addInstruction(instruction);
    const declarationId = functionBuilder.getDeclarationId(localName, nodePath);
    moduleBuilder.exports.set(exportedName, {
        instruction,
        declaration: functionBuilder.getDeclarationInstruction(declarationId),
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
