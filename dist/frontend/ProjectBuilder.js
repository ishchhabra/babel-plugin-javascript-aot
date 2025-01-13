import { Environment } from '../environment.js';
import { ModuleBuilder } from './ModuleBuilder.js';

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
        const moduleUnit = new ModuleBuilder(path, environment).build();
        this.modules.set(path, moduleUnit);
        const importToPlaces = moduleUnit.importToPlaces;
        for (const [source] of importToPlaces) {
            this.buildModule(source);
        }
        return moduleUnit;
    }
    getPostOrder(moduleUnit) {
        const visited = new Set();
        const result = [];
        const visit = (moduleUnit) => {
            if (visited.has(moduleUnit.path)) {
                return;
            }
            visited.add(moduleUnit.path);
            result.push(moduleUnit.path);
            for (const [source] of moduleUnit.importToPlaces) {
                visit(this.modules.get(source));
            }
        };
        visit(moduleUnit);
        return result;
    }
}

export { ProjectBuilder };
//# sourceMappingURL=ProjectBuilder.js.map
