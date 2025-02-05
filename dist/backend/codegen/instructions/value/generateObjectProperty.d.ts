import * as t from "@babel/types";
import { ObjectPropertyInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateObjectPropertyInstruction(instruction: ObjectPropertyInstruction, generator: CodeGenerator): t.ObjectProperty;
