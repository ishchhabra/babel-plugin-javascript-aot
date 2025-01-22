import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { readFileSync } from 'fs';
import { FunctionIRBuilder } from './FunctionIRBuilder.js';

const traverse = _traverse
    .default;
class ModuleIRBuilder {
    path;
    environment;
    exportToInstructions = new Map();
    importToInstructions = new Map();
    functions = new Map();
    constructor(path, environment) {
        this.path = path;
        this.environment = environment;
    }
    build() {
        const code = readFileSync(this.path, "utf-8");
        const ast = parse(code, {
            sourceType: "module",
            plugins: ["typescript"],
        });
        let programPath;
        traverse(ast, {
            Program: (path) => {
                programPath = path;
            },
        });
        if (programPath === undefined) {
            throw new Error("Program path not found");
        }
        const functionIR = new FunctionIRBuilder(programPath, this.environment, this, []).build();
        this.functions.set(functionIR.id, functionIR);
        return {
            environment: this.environment,
            path: this.path,
            functions: this.functions,
            exportToInstructions: this.exportToInstructions,
            importToInstructions: this.importToInstructions,
        };
    }
}

export { ModuleIRBuilder };
//# sourceMappingURL=ModuleIRBuilder.js.map
