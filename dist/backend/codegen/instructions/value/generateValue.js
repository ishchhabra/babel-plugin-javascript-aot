import { ArrayExpressionInstruction } from '../../../../ir/instructions/value/ArrayExpression.js';
import { BinaryExpressionInstruction } from '../../../../ir/instructions/value/BinaryExpression.js';
import { CallExpressionInstruction } from '../../../../ir/instructions/value/CallExpression.js';
import { HoleInstruction } from '../../../../ir/instructions/value/Hole.js';
import { LiteralInstruction } from '../../../../ir/instructions/value/Literal.js';
import { LogicalExpressionInstruction } from '../../../../ir/instructions/value/LogicalExpression.js';
import { MemberExpressionInstruction } from '../../../../ir/instructions/value/MemberExpression.js';
import { ObjectExpressionInstruction } from '../../../../ir/instructions/value/ObjectExpression.js';
import { ObjectMethodInstruction } from '../../../../ir/instructions/value/ObjectMethod.js';
import { ObjectPropertyInstruction } from '../../../../ir/instructions/value/ObjectProperty.js';
import { UnaryExpressionInstruction } from '../../../../ir/instructions/value/UnaryExpression.js';
import { generateArrayExpressionInstruction } from './generateArrayExpression.js';
import { generateBinaryExpressionInstruction } from './generateBinaryExpression.js';
import { generateCallExpression } from './generateCallExpression.js';
import { generateHoleInstruction } from './generateHole.js';
import { generateLiteralInstruction } from './generateLiteral.js';
import { generateLogicalExpressionInstruction } from './generateLogicalExpression.js';
import { generateMemberExpression } from './generateMemberExpression.js';
import { generateObjectExpressionInstruction } from './generateObjectExpression.js';
import { generateObjectMethodInstruction } from './generateObjectMethod.js';
import { generateObjectPropertyInstruction } from './generateObjectProperty.js';
import { generateUnaryExpressionInstruction } from './generateUnaryExpression.js';

function generateValueInstruction(instruction, generator) {
    if (instruction instanceof ArrayExpressionInstruction) {
        return generateArrayExpressionInstruction(instruction, generator);
    }
    else if (instruction instanceof BinaryExpressionInstruction) {
        return generateBinaryExpressionInstruction(instruction, generator);
    }
    else if (instruction instanceof CallExpressionInstruction) {
        return generateCallExpression(instruction, generator);
    }
    else if (instruction instanceof HoleInstruction) {
        return generateHoleInstruction(instruction, generator);
    }
    else if (instruction instanceof LiteralInstruction) {
        return generateLiteralInstruction(instruction, generator);
    }
    else if (instruction instanceof LogicalExpressionInstruction) {
        return generateLogicalExpressionInstruction(instruction, generator);
    }
    else if (instruction instanceof MemberExpressionInstruction) {
        return generateMemberExpression(instruction, generator);
    }
    else if (instruction instanceof ObjectExpressionInstruction) {
        return generateObjectExpressionInstruction(instruction, generator);
    }
    else if (instruction instanceof ObjectMethodInstruction) {
        return generateObjectMethodInstruction(instruction, generator);
    }
    else if (instruction instanceof ObjectPropertyInstruction) {
        return generateObjectPropertyInstruction(instruction, generator);
    }
    else if (instruction instanceof UnaryExpressionInstruction) {
        return generateUnaryExpressionInstruction(instruction, generator);
    }
    throw new Error(`Unsupported value type: ${instruction.constructor.name}`);
}

export { generateValueInstruction };
//# sourceMappingURL=generateValue.js.map
