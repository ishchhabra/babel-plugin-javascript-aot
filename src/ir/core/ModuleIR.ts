import { Environment } from "../../environment";
import { BaseInstruction } from "../base";
import { FunctionIR, FunctionIRId } from "./FunctionIR";

export type ModuleGlobal =
  | {
      kind: "import";
      source: string;
      name: string;
    }
  | {
      kind: "builtin";
    };

export interface ModuleExport {
  /** The ExportDeclarationInstruction for the export */
  instruction: BaseInstruction;

  /** The instruction that declares the exported variable */
  declaration: BaseInstruction;
}

export interface ModuleIR {
  path: string;
  environment: Environment;
  functions: Map<FunctionIRId, FunctionIR>;
  globals: Map<string, ModuleGlobal>;
  exports: Map<string, ModuleExport>;
}
