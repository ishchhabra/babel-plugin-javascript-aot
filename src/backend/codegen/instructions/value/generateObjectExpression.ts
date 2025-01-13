import * as t from "@babel/types";
import { ObjectExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateObjectExpressionInstruction(
  instruction: ObjectExpressionInstruction,
  generator: CodeGenerator,
): t.ObjectExpression {
  const properties = instruction.properties.map((property) => {
    const propertyNode = generator.places.get(property.id);
    if (propertyNode === undefined) {
      throw new Error(`Place ${property.id} not found`);
    }

    if (!t.isObjectProperty(propertyNode) && !t.isObjectMethod(propertyNode)) {
      throw new Error(`Unsupported property type: ${propertyNode?.type}`);
    }

    return propertyNode;
  });

  const node = t.objectExpression(properties);
  generator.places.set(instruction.place.id, node);
  return node;
}
