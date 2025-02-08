import { buildExportSpecifier } from './buildExportSpecifier.js';
import { buildIdentifier } from './buildIdentifier.js';
import { buildObjectMethod } from './buildObjectMethod.js';
import { buildObjectProperty } from './buildObjectProperty.js';
import { buildSpreadElement } from './buildSpreadElement.js';
import { buildUnsupportedNode } from './buildUnsupportedNode.js';
import { buildHole } from './buildHole.js';
import '@babel/types';
import 'lodash-es';
import { buildExpression } from './expressions/buildExpression.js';
import { buildPattern } from './patterns/buildPattern.js';
import { buildStatement } from './statements/buildStatement.js';

function buildNode(nodePath, functionBuilder, moduleBuilder, environment) {
    if (nodePath.node === null) {
        return buildHole(nodePath, functionBuilder, environment);
    }
    if (nodePath.isIdentifier()) {
        return buildIdentifier(nodePath, functionBuilder, environment);
    }
    if (nodePath.isObjectMethod()) {
        return buildObjectMethod(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isObjectProperty()) {
        return buildObjectProperty(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isExpression()) {
        return buildExpression(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isStatement()) {
        return buildStatement(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isSpreadElement()) {
        return buildSpreadElement(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isPattern()) {
        return buildPattern(nodePath, functionBuilder, moduleBuilder, environment);
    }
    if (nodePath.isExportSpecifier()) {
        return buildExportSpecifier(nodePath, functionBuilder, moduleBuilder, environment);
    }
    return buildUnsupportedNode(nodePath, functionBuilder, environment);
}

export { buildNode };
//# sourceMappingURL=buildNode.js.map
