import * as t from "@babel/types";

export function generateLoadPhiInstruction(): t.Expression {
  throw new Error(
    "LoadPhiInstruction should be rewritten to a LoadLocalInstruction during SSA elimination",
  );
}
