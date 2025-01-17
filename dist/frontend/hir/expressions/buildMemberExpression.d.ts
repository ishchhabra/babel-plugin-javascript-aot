import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildMemberExpression(nodePath: NodePath<t.MemberExpression>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): import("../../../ir").Place;
