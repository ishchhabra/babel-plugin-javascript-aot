import * as t from "@babel/types";
import { SpreadElementInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateSpreadElementInstruction(instruction: SpreadElementInstruction, builder: CodeGenerator): t.SpreadElement;
