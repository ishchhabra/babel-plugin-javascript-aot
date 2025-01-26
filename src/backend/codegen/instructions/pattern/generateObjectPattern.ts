import * as t from "@babel/types";
import { ObjectPatternInstruction } from "../../../../ir/instructions/pattern/ObjectPattern";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateObjectPatternInstruction(
  instruction: ObjectPatternInstruction,
  generator: CodeGenerator,
): t.ObjectPattern {
  const properties = instruction.properties.map((property) => {
    const node = generator.places.get(property.id);
    if (node === undefined) {
      throw new Error(`Place ${property.id} not found`);
    }

    t.assertObjectProperty(node);
    return node;
  });

  const node = t.objectPattern(properties);
  generator.places.set(instruction.place.id, node);
  return node;
}
