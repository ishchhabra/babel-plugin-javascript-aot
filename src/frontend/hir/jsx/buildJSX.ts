import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildJSXElement } from "./buildJSXElement";
import { buildJSXFragment } from "./buildJSXFragment";
import { buildJSXText } from "./buildJSXText";

export function buildJSX(
  nodePath: NodePath<t.JSX>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place | undefined {
  switch (nodePath.type) {
    case "JSXElement":
      nodePath.assertJSXElement();
      return buildJSXElement(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "JSXFragment":
      nodePath.assertJSXFragment();
      return buildJSXFragment(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "JSXText":
      nodePath.assertJSXText();
      return buildJSXText(nodePath, functionBuilder, environment);
    default:
      return buildUnsupportedNode(nodePath, functionBuilder, environment);
  }
}
