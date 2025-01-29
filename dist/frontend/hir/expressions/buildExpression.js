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

function buildExpression(nodePath, functionBuilder, moduleBuilder) {
    switch (nodePath.type) {
        case "AssignmentExpression":
            nodePath.assertAssignmentExpression();
            return buildAssignmentExpression(nodePath, functionBuilder, moduleBuilder);
        case "ArrayExpression":
            nodePath.assertArrayExpression();
            return buildArrayExpression(nodePath, functionBuilder, moduleBuilder);
        case "ArrowFunctionExpression":
            nodePath.assertArrowFunctionExpression();
            return buildArrowFunctionExpression(nodePath, functionBuilder, moduleBuilder);
        case "BinaryExpression":
            nodePath.assertBinaryExpression();
            return buildBinaryExpression(nodePath, functionBuilder, moduleBuilder);
        case "BooleanLiteral":
            nodePath.assertBooleanLiteral();
            return buildLiteral(nodePath, functionBuilder);
        case "CallExpression":
            nodePath.assertCallExpression();
            return buildCallExpression(nodePath, functionBuilder, moduleBuilder);
        case "FunctionExpression":
            nodePath.assertFunctionExpression();
            return buildFunctionExpression(nodePath, functionBuilder, moduleBuilder);
        case "LogicalExpression":
            nodePath.assertLogicalExpression();
            return buildLogicalExpression(nodePath, functionBuilder, moduleBuilder);
        case "MemberExpression":
            nodePath.assertMemberExpression();
            return buildMemberExpression(nodePath, functionBuilder, moduleBuilder);
        case "NumericLiteral":
            nodePath.assertNumericLiteral();
            return buildLiteral(nodePath, functionBuilder);
        case "ObjectExpression":
            nodePath.assertObjectExpression();
            return buildObjectExpression(nodePath, functionBuilder, moduleBuilder);
        case "StringLiteral":
            nodePath.assertStringLiteral();
            return buildLiteral(nodePath, functionBuilder);
        case "UnaryExpression":
            nodePath.assertUnaryExpression();
            return buildUnaryExpression(nodePath, functionBuilder, moduleBuilder);
        case "UpdateExpression":
            nodePath.assertUpdateExpression();
            return buildUpdateExpression(nodePath, functionBuilder, moduleBuilder);
        default:
            return buildUnsupportedNode(nodePath, functionBuilder);
    }
}

export { buildExpression };
//# sourceMappingURL=buildExpression.js.map
