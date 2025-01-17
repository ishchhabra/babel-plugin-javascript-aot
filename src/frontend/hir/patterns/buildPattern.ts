import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildArrayPattern } from "./buildArrayPattern";

export function buildPattern(
  nodePath: NodePath<t.Pattern | t.SpreadElement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  switch (nodePath.type) {
    case "ArrayPattern":
      nodePath.assertArrayPattern();
      return buildArrayPattern(nodePath, functionBuilder, moduleBuilder);
    default:
      throw new Error(`Unsupported pattern type: ${nodePath.type}`);
  }
}
