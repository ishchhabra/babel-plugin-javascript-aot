import { buildUnsupportedNode } from '../buildUnsupportedNode.js';
import { buildBlockStatement } from './buildBlockStatement.js';
import { buildExportDefaultDeclaration } from './buildExportDefaultDeclaration.js';
import { buildExportNamedDeclaration } from './buildExportNamedDeclaration.js';
import { buildExpressionStatement } from './buildExpressionStatement.js';
import { buildForStatement } from './buildForStatement.js';
import { buildFunctionDeclaration } from './buildFunctionDeclaration.js';
import { buildIfStatement } from './buildIfStatement.js';
import { buildImportDeclaration } from './buildImportDeclaration.js';
import { buildReturnStatement } from './buildReturnStatement.js';
import { buildVariableDeclaration } from './buildVariableDeclaration.js';
import { buildWhileStatement } from './buildWhileStatement.js';

function buildStatement(nodePath, functionBuilder, moduleBuilder, environment) {
    switch (nodePath.type) {
        case "BlockStatement":
            nodePath.assertBlockStatement();
            return buildBlockStatement(nodePath, functionBuilder, moduleBuilder, environment);
        case "ExportDefaultDeclaration":
            nodePath.assertExportDefaultDeclaration();
            return buildExportDefaultDeclaration(nodePath, functionBuilder, moduleBuilder, environment);
        case "ExportNamedDeclaration":
            nodePath.assertExportNamedDeclaration();
            return buildExportNamedDeclaration(nodePath, functionBuilder, moduleBuilder, environment);
        case "ForStatement":
            nodePath.assertForStatement();
            return buildForStatement(nodePath, functionBuilder, moduleBuilder, environment);
        case "IfStatement":
            nodePath.assertIfStatement();
            return buildIfStatement(nodePath, functionBuilder, moduleBuilder, environment);
        case "ImportDeclaration":
            nodePath.assertImportDeclaration();
            return buildImportDeclaration(nodePath, functionBuilder, moduleBuilder, environment);
        case "ExpressionStatement":
            nodePath.assertExpressionStatement();
            return buildExpressionStatement(nodePath, functionBuilder, moduleBuilder, environment);
        case "FunctionDeclaration":
            nodePath.assertFunctionDeclaration();
            return buildFunctionDeclaration(nodePath, functionBuilder, moduleBuilder, environment);
        case "ReturnStatement":
            nodePath.assertReturnStatement();
            return buildReturnStatement(nodePath, functionBuilder, moduleBuilder, environment);
        case "VariableDeclaration":
            nodePath.assertVariableDeclaration();
            return buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder, environment);
        case "WhileStatement":
            nodePath.assertWhileStatement();
            return buildWhileStatement(nodePath, functionBuilder, moduleBuilder, environment);
        default:
            return buildUnsupportedNode(nodePath, functionBuilder, environment);
    }
}

export { buildStatement };
//# sourceMappingURL=buildStatement.js.map
