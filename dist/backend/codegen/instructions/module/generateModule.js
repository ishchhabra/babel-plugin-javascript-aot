import { ExportDefaultDeclarationInstruction } from '../../../../ir/instructions/module/ExportDefaultDeclaration.js';
import { ExportNamedDeclarationInstruction } from '../../../../ir/instructions/module/ExportNamedDeclaration.js';
import { ExportSpecifierInstruction } from '../../../../ir/instructions/module/ExportSpecifier.js';
import { ImportDeclarationInstruction } from '../../../../ir/instructions/module/ImportDeclaration.js';
import { ImportSpecifierInstruction } from '../../../../ir/instructions/module/ImportSpecifier.js';
import { generateExportDefaultDeclarationInstruction } from './generateExportDefaultDeclaration.js';
import { generateExportNamedDeclarationInstruction } from './generateExportNamedDeclaration.js';
import { generateExportSpecifierInstruction } from './generateExportSpecifier.js';
import { generateImportDeclarationInstruction } from './generateImportDeclaration.js';
import { generateImportSpecifierInstruction } from './generateImportSpecifier.js';

function generateModuleInstruction(instruction, generator) {
    if (instruction instanceof ExportDefaultDeclarationInstruction) {
        return generateExportDefaultDeclarationInstruction(instruction, generator);
    }
    else if (instruction instanceof ExportNamedDeclarationInstruction) {
        return generateExportNamedDeclarationInstruction(instruction, generator);
    }
    else if (instruction instanceof ExportSpecifierInstruction) {
        return generateExportSpecifierInstruction(instruction, generator);
    }
    else if (instruction instanceof ImportDeclarationInstruction) {
        return generateImportDeclarationInstruction(instruction, generator);
    }
    else if (instruction instanceof ImportSpecifierInstruction) {
        return generateImportSpecifierInstruction(instruction, generator);
    }
    throw new Error(`Unsupported module instruction: ${instruction.constructor.name}`);
}

export { generateModuleInstruction };
//# sourceMappingURL=generateModule.js.map
