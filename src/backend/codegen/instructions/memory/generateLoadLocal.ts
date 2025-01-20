import * as t from "@babel/types";
import { LoadLocalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadLocalInstruction(
  instruction: LoadLocalInstruction,
  generator: CodeGenerator,
): t.Expression {
  const maybeNode = generator.places.get(instruction.value.id);
  if (!maybeNode) {
    throw new Error("Could not find a node for the value");
  }

  // TODO: We should refactor the code so that we use generator.places.get()
  // every time. To do that, we need to update the builder to use the
  // BindingIdentifierInstruction properly.
  if (t.isLiteral(maybeNode)) {
    generator.places.set(instruction.place.id, maybeNode);
    return maybeNode;
  }

  const node = t.identifier(instruction.value.identifier.name);
  t.assertExpression(node);
  generator.places.set(instruction.place.id, node);
  return node;
}
