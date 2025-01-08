import { Environment } from "../environment";
import { ModuleBuilder, ModuleUnit } from "./ModuleBuilder";

export class ProjectBuilder {
  private readonly modules: Map<string, ModuleUnit> = new Map();

  constructor() {}

  public build(entryPoint: string) {
    return this.buildModule(entryPoint);
  }

  private buildModule(path: string): ModuleUnit {
    if (this.modules.has(path)) {
      return this.modules.get(path)!;
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
