import { Environment } from '../environment.js';
import { ModuleIRBuilder } from './hir/ModuleIRBuilder.js';

class ProjectBuilder {
    modules = new Map();
    constructor() { }
    build(entryPoint) {
        this.buildModule(entryPoint);
        const postOrder = this.getPostOrder(this.modules.get(entryPoint));
        return { modules: this.modules, postOrder };
    }
    buildModule(path) {
        if (this.modules.has(path)) {
            return this.modules.get(path);
        }
        const environment = new Environment();
        const moduleIR = new ModuleIRBuilder(path, environment).build();
        this.modules.set(path, moduleIR);
        const importToInstructions = moduleIR.importToInstructions;
        for (const [source] of importToInstructions) {
            this.buildModule(source);
        }
        return moduleIR;
    }
    getPostOrder(moduleIR) {
        const visited = new Set();
        const result = [];
        const visit = (moduleIR) => {
            if (visited.has(moduleIR.path)) {
                return;
            }
            visited.add(moduleIR.path);
            result.push(moduleIR.path);
            for (const [source] of moduleIR.importToInstructions) {
                visit(this.modules.get(source));
            }
        };
        visit(moduleIR);
        return result;
    }
}

export { ProjectBuilder };
//# sourceMappingURL=ProjectBuilder.js.map
