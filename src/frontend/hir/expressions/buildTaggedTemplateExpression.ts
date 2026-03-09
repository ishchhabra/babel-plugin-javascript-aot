import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { TaggedTemplateExpressionInstruction } from "../../../ir/instructions/value/TaggedTemplateExpression";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildTaggedTemplateExpression(
  nodePath: NodePath<t.TaggedTemplateExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const tagPath = nodePath.get("tag");
  const tagPlace = buildNode(
    tagPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (tagPlace === undefined || Array.isArray(tagPlace)) {
    throw new Error("Tagged template tag must be a single place");
  }

  const quasiPath = nodePath.get("quasi");
  const quasiPlace = buildNode(
    quasiPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (quasiPlace === undefined || Array.isArray(quasiPlace)) {
    throw new Error("Tagged template quasi must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    TaggedTemplateExpressionInstruction,
    place,
    nodePath,
    tagPlace,
    quasiPlace,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
