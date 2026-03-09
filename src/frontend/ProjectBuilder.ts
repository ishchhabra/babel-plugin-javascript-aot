import { existsSync } from "fs";
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

    const imports = Array.from(moduleIR.globals.values()).filter(
      (global) => global.kind === "import",
    );
    for (const { source } of imports) {
      // Skip external packages and unresolvable paths
      if (!source.startsWith("/") || !existsSync(source)) {
        continue;
      }

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

      const imports = Array.from(moduleIR.globals.values()).filter(
        (global) => global.kind === "import",
      );
      for (const { source } of imports) {
        const mod = this.modules.get(source);
        if (mod === undefined) {
          continue;
        }

        visit(mod);
      }
    };

    visit(moduleIR);
    return result;
  }
}
