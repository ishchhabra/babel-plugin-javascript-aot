import * as t from "@babel/types";
import { TaggedTemplateExpressionInstruction } from "../../../../ir/instructions/value/TaggedTemplateExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateTaggedTemplateExpressionInstruction(
  instruction: TaggedTemplateExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const tag = generator.places.get(instruction.tag.id);
  if (!tag) {
    throw new Error(
      `Place not found for tagged template tag: ${instruction.tag.id}`,
    );
  }
  t.assertExpression(tag);

  const quasi = generator.places.get(instruction.quasi.id);
  if (!quasi) {
    throw new Error(
      `Place not found for tagged template quasi: ${instruction.quasi.id}`,
    );
  }
  t.assertTemplateLiteral(quasi);

  const node = t.taggedTemplateExpression(tag, quasi);
  generator.places.set(instruction.place.id, node);
  return node;
}
