import { transformSync } from "@babel/core";
import { parse } from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync } from "fs";
import { Environment } from "../../environment";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleExport, ModuleGlobal, ModuleIR } from "../../ir/core/ModuleIR";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

const traverse = (_traverse as unknown as { default: typeof _traverse })
  .default;

export class ModuleIRBuilder {
  public readonly globals: Map<string, ModuleGlobal> = new Map();
  public readonly exports: Map<string, ModuleExport> = new Map();

  public readonly functions: Map<FunctionIRId, FunctionIR> = new Map();

  constructor(
    public readonly path: string,
    public readonly environment: Environment,
  ) {}

  private stripTypeScript(code: string): string {
    const isTSFile = this.path.endsWith(".ts") || this.path.endsWith(".tsx");
    if (!isTSFile) {
      return code;
    }

    const result = transformSync(code, {
      filename: this.path,
      presets: [
        [
          "@babel/preset-typescript",
          { isTSX: this.path.endsWith(".tsx"), allExtensions: true },
        ],
      ],
      configFile: false,
      babelrc: false,
    });
    if (result?.code == null) {
      throw new Error(`Failed to strip TypeScript from ${this.path}`);
    }
    return result.code;
  }

  public build(): ModuleIR {
    const code = this.stripTypeScript(readFileSync(this.path, "utf-8"));
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    let programPath: NodePath<t.Program> | undefined;
    traverse(ast, {
      Program: (path) => {
        programPath = path;
      },
    });

    if (programPath === undefined) {
      throw new Error("Program path not found");
    }

    const functionIR = new FunctionIRBuilder(
      [],
      programPath,
      this.environment,
      this,
    ).build();
    this.functions.set(functionIR.id, functionIR);

    return {
      environment: this.environment,
      path: this.path,
      functions: this.functions,
      globals: this.globals,
      exports: this.exports,
    };
  }
}
