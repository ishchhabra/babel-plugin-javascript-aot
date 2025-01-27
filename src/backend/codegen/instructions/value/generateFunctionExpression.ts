import * as t from "@babel/types";
import { FunctionExpressionInstruction } from "../../../../ir/instructions/value/FunctionExpression";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunction } from "../../generateFunction";

export function generateFunctionExpressionInstruction(
  instruction: FunctionExpressionInstruction,
  generator: CodeGenerator,
): t.FunctionExpression {
  const idNode = generator.places.get(instruction.identifier.id);
  t.assertIdentifier(idNode);

  const { params, statements } = generateFunction(
    instruction.functionIR,
    generator,
  );
  const node = t.functionExpression(
    idNode,
    params,
    t.blockStatement(statements),
    instruction.generator,
    instruction.async,
  );
  generator.places.set(instruction.place.id, node);
  return node;
}
