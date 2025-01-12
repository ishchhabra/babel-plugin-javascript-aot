import { Environment } from "../environment";
import { ModuleBuilder, ModuleUnit } from "./ModuleBuilder";

export interface ProjectUnit {
  modules: Map<string, ModuleUnit>;
  postOrder: string[];
}

export class ProjectBuilder {
  private readonly modules: Map<string, ModuleUnit> = new Map();

  constructor() {}

  public build(entryPoint: string): ProjectUnit {
    this.buildModule(entryPoint);
    const postOrder = this.getPostOrder(this.modules.get(entryPoint)!);
    return { modules: this.modules, postOrder };
  }

  private buildModule(path: string): ModuleUnit {
    if (this.modules.has(path)) {
      return this.modules.get(path)!;
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

  private getPostOrder(moduleUnit: ModuleUnit) {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (moduleUnit: ModuleUnit) => {
      if (visited.has(moduleUnit.path)) {
        return;
      }

      visited.add(moduleUnit.path);
      result.push(moduleUnit.path);

      for (const [source] of moduleUnit.importToPlaces) {
        visit(this.modules.get(source)!);
      }
    };

    visit(moduleUnit);
    return result;
  }
}
