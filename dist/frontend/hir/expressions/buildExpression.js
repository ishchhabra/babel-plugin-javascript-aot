import { buildUnsupportedNode } from '../buildUnsupportedNode.js';
import { buildArrayExpression } from './buildArrayExpression.js';
import { buildArrowFunctionExpression } from './buildArrowFunctionExpression.js';
import { buildAssignmentExpression } from './buildAssignmentExpression.js';
import { buildBinaryExpression } from './buildBinaryExpression.js';
import { buildCallExpression } from './buildCallExpression.js';
import { buildFunctionExpression } from './buildFunctionExpression.js';
import { buildLiteral } from './buildLiteral.js';
import { buildLogicalExpression } from './buildLogicalExpression.js';
import { buildMemberExpression } from './buildMemberExpression.js';
import { buildObjectExpression } from './buildObjectExpression.js';
import { buildUnaryExpression } from './buildUnaryExpression.js';
import { buildUpdateExpression } from './buildUpdateExpression.js';

function buildExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    switch (nodePath.type) {
        case "AssignmentExpression":
            nodePath.assertAssignmentExpression();
            return buildAssignmentExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "ArrayExpression":
            nodePath.assertArrayExpression();
            return buildArrayExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "ArrowFunctionExpression":
            nodePath.assertArrowFunctionExpression();
            return buildArrowFunctionExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "BinaryExpression":
            nodePath.assertBinaryExpression();
            return buildBinaryExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "BooleanLiteral":
            nodePath.assertBooleanLiteral();
            return buildLiteral(nodePath, functionBuilder, environment);
        case "CallExpression":
            nodePath.assertCallExpression();
            return buildCallExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "FunctionExpression":
            nodePath.assertFunctionExpression();
            return buildFunctionExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "LogicalExpression":
            nodePath.assertLogicalExpression();
            return buildLogicalExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "MemberExpression":
            nodePath.assertMemberExpression();
            return buildMemberExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "NumericLiteral":
            nodePath.assertNumericLiteral();
            return buildLiteral(nodePath, functionBuilder, environment);
        case "ObjectExpression":
            nodePath.assertObjectExpression();
            return buildObjectExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "StringLiteral":
            nodePath.assertStringLiteral();
            return buildLiteral(nodePath, functionBuilder, environment);
        case "UnaryExpression":
            nodePath.assertUnaryExpression();
            return buildUnaryExpression(nodePath, functionBuilder, moduleBuilder, environment);
        case "UpdateExpression":
            nodePath.assertUpdateExpression();
            return buildUpdateExpression(nodePath, functionBuilder, moduleBuilder, environment);
        default:
            return buildUnsupportedNode(nodePath, functionBuilder, environment);
    }
}

export { buildExpression };
//# sourceMappingURL=buildExpression.js.map
