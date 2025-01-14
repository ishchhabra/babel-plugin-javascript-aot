import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildStatement(nodePath: NodePath<t.Statement>, builder: HIRBuilder): Place | Place[] | undefined;
