import * as t from "@babel/types";
import {
  BaseInstruction,
  BindingIdentifierInstruction,
  DeclarationInstruction,
  ExportSpecifierInstruction,
  ExpressionStatementInstruction,
  ImportSpecifierInstruction,
  JSXInstruction,
  MemoryInstruction,
  ModuleInstruction,
  PatternInstruction,
  RestElementInstruction,
  SpreadElementInstruction,
  StoreLocalInstruction,
  UnsupportedNodeInstruction,
  ValueInstruction,
} from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
import { generateUnsupportedNode } from "../generateUnsupportedNode";
import { generateDeclarationInstruction } from "./declaration/generateDeclaration";
import { generateBindingIdentifierInstruction } from "./generateBindingIdentifier";
import { generateExpressionStatementInstruction } from "./generateExpressionStatement";
import { generateRestElementInstruction } from "./generateRestElement";
import { generateJSXInstruction } from "./jsx/generateJSX";
import { generateMemoryInstruction } from "./memory/generateMemory";
import { generateModuleInstruction } from "./module/generateModule";
import { generatePatternInstruction } from "./pattern/generatePattern";
import { generateSpreadElementInstruction } from "./pattern/generateSpreadElement";
import { generateValueInstruction } from "./value/generateValue";

export function generateInstruction(
  instruction: BaseInstruction,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  if (instruction instanceof BindingIdentifierInstruction) {
    generateBindingIdentifierInstruction(instruction, generator);
    return [];
  } else if (instruction instanceof DeclarationInstruction) {
    const statement = generateDeclarationInstruction(instruction, generator);
    return [statement];
  } else if (instruction instanceof ExpressionStatementInstruction) {
    const statement = generateExpressionStatementInstruction(
      instruction,
      generator,
    );
    if (statement === undefined) {
      return [];
    }
    return [statement];
  } else if (instruction instanceof JSXInstruction) {
    generateJSXInstruction(instruction, generator);
    return [];
  } else if (instruction instanceof MemoryInstruction) {
    const statement = generateMemoryInstruction(instruction, generator);
    // TODO: Refactor HIRBuilder to include a property indicating whether
    // the place is temporary or not.
    if (instruction instanceof StoreLocalInstruction) {
      return [statement as t.Statement];
    }

    return [];
  } else if (instruction instanceof ModuleInstruction) {
    const statement = generateModuleInstruction(instruction, generator);
    if (
      instruction instanceof ImportSpecifierInstruction ||
      instruction instanceof ExportSpecifierInstruction
    ) {
      return [];
    }

    return [statement as t.Statement];
  } else if (instruction instanceof PatternInstruction) {
    generatePatternInstruction(instruction, generator);
    return [];
  } else if (instruction instanceof RestElementInstruction) {
    generateRestElementInstruction(instruction, generator);
    return [];
  } else if (instruction instanceof SpreadElementInstruction) {
    generateSpreadElementInstruction(instruction, generator);
    return [];
  } else if (instruction instanceof ValueInstruction) {
    generateValueInstruction(instruction, functionIR, generator);
    return [];
  } else if (instruction instanceof UnsupportedNodeInstruction) {
    generateUnsupportedNode(instruction, generator);
    return [];
  }

  throw new Error(
    `Unsupported instruction type: ${instruction.constructor.name}`,
  );
}
