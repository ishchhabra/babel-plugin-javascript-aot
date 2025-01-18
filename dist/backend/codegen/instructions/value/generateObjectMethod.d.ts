import * as t from "@babel/types";
import { ObjectMethodInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateObjectMethodInstruction(instruction: ObjectMethodInstruction, generator: CodeGenerator): t.ObjectMethod;
