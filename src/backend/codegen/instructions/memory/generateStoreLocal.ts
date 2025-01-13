import * as t from "@babel/types";
import { StoreLocalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateStoreLocalInstruction(
  instruction: StoreLocalInstruction,
  generator: CodeGenerator,
): t.Statement {
  let lval = generator.places.get(instruction.lval.id);
  // TODO: Use BindingIdentifierInstruction to generate instead of this hack.
  // Since this is the first time we're using lval, it does not exist in the
  // places map. We need to create a new identifier for it.
  lval ??= t.identifier(instruction.lval.identifier.name);
  generator.places.set(instruction.lval.id, lval);
  t.assertLVal(lval);

  const value = generator.places.get(instruction.value.id);
  t.assertExpression(value);

  const node = t.variableDeclaration(instruction.type, [
    t.variableDeclarator(lval, value),
  ]);
  generator.places.set(instruction.place.id, node);
  return node;
}
