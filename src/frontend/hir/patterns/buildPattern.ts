import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildArrayPattern } from "./buildArrayPattern";

export function buildPattern(
  nodePath: NodePath<t.Pattern | t.SpreadElement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  switch (nodePath.type) {
    case "ArrayPattern":
      nodePath.assertArrayPattern();
      return buildArrayPattern(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    default:
      throw new Error(`Unsupported pattern type: ${nodePath.type}`);
  }
}
