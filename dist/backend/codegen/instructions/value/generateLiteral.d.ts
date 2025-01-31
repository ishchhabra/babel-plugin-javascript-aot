import * as t from "@babel/types";
import { LiteralInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLiteralInstruction(instruction: LiteralInstruction, generator: CodeGenerator): t.Expression;
