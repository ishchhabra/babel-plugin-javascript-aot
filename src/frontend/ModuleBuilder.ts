import { parse } from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import { Program } from "@babel/types";
import { readFileSync } from "fs";
import { Environment } from "../environment";
import { HIR, HIRBuilder } from "./HIRBuilder";

const traverse = (_traverse as unknown as { default: typeof _traverse })
  .default;

export interface ModuleUnit {
  path: string;
  environment: Environment;
  hir: HIR;
}

export class ModuleBuilder {
  constructor(
    private readonly path: string,
    public readonly environment: Environment,
  ) {}

  public build(): ModuleUnit {
    const code = readFileSync(this.path, "utf-8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript"],
    });

    let programPath: NodePath<Program> | undefined;
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
