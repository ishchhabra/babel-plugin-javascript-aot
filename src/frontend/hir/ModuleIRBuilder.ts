import { parse } from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync } from "fs";
import { Environment } from "../../environment";
import { BaseInstruction, ImportDeclarationInstruction } from "../../ir";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

const traverse = (_traverse as unknown as { default: typeof _traverse })
  .default;

export class ModuleIRBuilder {
  public readonly exportToInstructions: Map<string, BaseInstruction> =
    new Map();
  public readonly importToInstructions: Map<
    string,
    ImportDeclarationInstruction
  > = new Map();

  public readonly functions: Map<FunctionIRId, FunctionIR> = new Map();

  constructor(
    public readonly path: string,
    public readonly environment: Environment,
  ) {}

  public build(): ModuleIR {
    const code = readFileSync(this.path, "utf-8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript"],
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
      programPath,
      this.environment,
      this,
      [],
    ).build();
    this.functions.set(functionIR.id, functionIR);

    return {
      environment: this.environment,
      path: this.path,
      functions: this.functions,
      exportToInstructions: this.exportToInstructions,
      importToInstructions: this.importToInstructions,
    };
  }
}
