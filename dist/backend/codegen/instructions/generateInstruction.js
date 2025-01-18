import { DeclarationInstruction, MemoryInstruction, ModuleInstruction, PatternInstruction, ValueInstruction } from '../../../ir/base/Instruction.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { ExportSpecifierInstruction } from '../../../ir/instructions/module/ExportSpecifier.js';
import { ImportSpecifierInstruction } from '../../../ir/instructions/module/ImportSpecifier.js';
import { SpreadElementInstruction } from '../../../ir/instructions/SpreadElement.js';
import { BindingIdentifierInstruction } from '../../../ir/instructions/BindingIdentifier.js';
import { UnsupportedNodeInstruction } from '../../../ir/instructions/UnsupportedNode.js';
import 'lodash-es';
import { generateUnsupportedNode } from '../generateUnsupportedNode.js';
import { generateDeclarationInstruction } from './declaration/generateDeclaration.js';
import { generateBindingIdentifierInstruction } from './generateBindingIdentifier.js';
import { generateExpressionStatementInstruction } from './generateExpressionStatement.js';
import { generateMemoryInstruction } from './memory/generateMemory.js';
import { generateModuleInstruction } from './module/generateModule.js';
import { generatePatternInstruction } from './pattern/generatePattern.js';
import { generateSpreadElementInstruction } from './pattern/generateSpreadElement.js';
import { generateValueInstruction } from './value/generateValue.js';

function generateInstruction(instruction, functionIR, generator) {
    if (instruction instanceof BindingIdentifierInstruction) {
        generateBindingIdentifierInstruction(instruction, generator);
        return [];
    }
    else if (instruction instanceof DeclarationInstruction) {
        const statement = generateDeclarationInstruction(instruction, generator);
        return [statement];
    }
    else if (instruction instanceof ExpressionStatementInstruction) {
        const statement = generateExpressionStatementInstruction(instruction, generator);
        if (statement === undefined) {
            return [];
        }
        return [statement];
    }
    else if (instruction instanceof MemoryInstruction) {
        const statement = generateMemoryInstruction(instruction, generator);
        // TODO: Refactor HIRBuilder to include a property indicating whether
        // the place is temporary or not.
        if (instruction instanceof StoreLocalInstruction) {
            return [statement];
        }
        return [];
    }
    else if (instruction instanceof ModuleInstruction) {
        const statement = generateModuleInstruction(instruction, generator);
        if (instruction instanceof ImportSpecifierInstruction ||
            instruction instanceof ExportSpecifierInstruction) {
            return [];
        }
        return [statement];
    }
    else if (instruction instanceof PatternInstruction) {
        generatePatternInstruction(instruction, generator);
        return [];
    }
    else if (instruction instanceof SpreadElementInstruction) {
        generateSpreadElementInstruction(instruction, generator);
        return [];
    }
    else if (instruction instanceof ValueInstruction) {
        generateValueInstruction(instruction, functionIR, generator);
        return [];
    }
    else if (instruction instanceof UnsupportedNodeInstruction) {
        generateUnsupportedNode(instruction, generator);
        return [];
    }
    throw new Error(`Unsupported instruction type: ${instruction.constructor.name}`);
}

export { generateInstruction };
//# sourceMappingURL=generateInstruction.js.map
