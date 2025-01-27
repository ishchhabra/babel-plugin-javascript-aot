import * as t from "@babel/types";
import { UnsupportedNodeInstruction } from "../../ir";
import { CodeGenerator } from "../CodeGenerator";
export declare function generateUnsupportedNode(instruction: UnsupportedNodeInstruction, generator: CodeGenerator): t.Node;
