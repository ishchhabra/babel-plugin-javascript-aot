import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildExpression(nodePath: NodePath<t.Expression>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): Place;
