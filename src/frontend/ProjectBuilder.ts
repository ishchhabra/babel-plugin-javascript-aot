import { Environment } from "../environment";
import { ModuleIR } from "../ir/core/ModuleIR";
import { ModuleIRBuilder } from "./hir/ModuleIRBuilder";

export interface ProjectUnit {
  modules: Map<string, ModuleIR>;
  postOrder: string[];
}

export class ProjectBuilder {
  private readonly modules: Map<string, ModuleIR> = new Map();

  constructor() {}

  public build(entryPoint: string): ProjectUnit {
    this.buildModule(entryPoint);
    const postOrder = this.getPostOrder(this.modules.get(entryPoint)!);
    return { modules: this.modules, postOrder };
  }

  private buildModule(path: string): ModuleIR {
    if (this.modules.has(path)) {
      return this.modules.get(path)!;
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

  private getPostOrder(moduleIR: ModuleIR) {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (moduleIR: ModuleIR) => {
      if (visited.has(moduleIR.path)) {
        return;
      }

      visited.add(moduleIR.path);
      result.push(moduleIR.path);

      for (const [source] of moduleIR.importToInstructions) {
        visit(this.modules.get(source)!);
      }
    };

    visit(moduleIR);
    return result;
  }
}
