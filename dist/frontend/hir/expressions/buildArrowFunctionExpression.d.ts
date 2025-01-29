import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildArrowFunctionExpression(nodePath: NodePath<t.ArrowFunctionExpression>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): Place;
