import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildArrayPattern } from "./buildArrayPattern";

export function buildPattern(
  nodePath: NodePath<t.Pattern | t.SpreadElement>,
  builder: HIRBuilder,
): Place {
  switch (nodePath.type) {
    case "ArrayPattern":
      nodePath.assertArrayPattern();
      return buildArrayPattern(nodePath, builder);
    default:
      throw new Error(`Unsupported pattern type: ${nodePath.type}`);
  }
}
