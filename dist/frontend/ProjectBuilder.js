import { Environment } from '../environment.js';
import { ModuleBuilder } from './ModuleBuilder.js';

class ProjectBuilder {
    modules = new Map();
    constructor() { }
    build(entryPoint) {
        return this.buildModule(entryPoint);
    }
    buildModule(path) {
        if (this.modules.has(path)) {
            return this.modules.get(path);
        }
        const environment = new Environment();
        const moduleUnit = new ModuleBuilder(path, environment).build();
        this.modules.set(path, moduleUnit);
        const importToPlaces = moduleUnit.hir.importToPlaces;
        for (const [source] of importToPlaces) {
            this.buildModule(source);
        }
        return moduleUnit;
    }
}

export { ProjectBuilder };
//# sourceMappingURL=ProjectBuilder.js.map
