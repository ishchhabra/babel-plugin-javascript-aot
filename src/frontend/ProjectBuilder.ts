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

  /**
   * Builds a ProjectUnit from multiple entry points. Each entry point is
   * built independently (discovering its dependencies), and the post-order
   * traversal covers all reachable modules from all entries.
   */
  public getProjectUnit(entryPoints: string[]): ProjectUnit {
    const visited = new Set<string>();
    const result: string[] = [];

    for (const entry of entryPoints) {
      const moduleIR = this.modules.get(entry);
      if (moduleIR) {
        this.visitPostOrder(moduleIR, visited, result);
      }
    }

    return { modules: this.modules, postOrder: result };
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
      // Skip external packages, unresolvable paths, and node_modules.
      // node_modules are skipped for now because third-party packages
      // often use syntax and patterns not yet supported by the compiler.
      // This filter can be removed once we have broader language coverage.
      if (
        !source.startsWith("/") ||
        !existsSync(source) ||
        source.includes("/node_modules/")
      ) {
        continue;
      }

      this.buildModule(source);
    }

    return moduleIR;
  }

  private getPostOrder(moduleIR: ModuleIR) {
    const visited = new Set<string>();
    const result: string[] = [];
    this.visitPostOrder(moduleIR, visited, result);
    return result;
  }

  private visitPostOrder(
    moduleIR: ModuleIR,
    visited: Set<string>,
    result: string[],
  ) {
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

      this.visitPostOrder(mod, visited, result);
    }
  }
}
