import * as t from "@babel/types";
import { ReturnTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";

export function generateReturnTerminal(
  terminal: ReturnTerminal,
  generator: CodeGenerator,
): Array<t.Statement> {
  const value = generator.places.get(terminal.value.id);
  if (value === undefined) {
    throw new Error(`Place ${terminal.value.id} not found`);
  }

  t.assertExpression(value);
  return [t.returnStatement(value)];
}
