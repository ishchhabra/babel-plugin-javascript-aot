import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { readFileSync } from 'fs';
import { HIRBuilder } from './HIRBuilder.js';

const traverse = _traverse
    .default;
class ModuleBuilder {
    path;
    environment;
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
        const hir = new HIRBuilder(programPath, this.environment).build();
        return {
            path: this.path,
            environment: this.environment,
            hir,
        };
    }
}

export { ModuleBuilder };
//# sourceMappingURL=ModuleBuilder.js.map
