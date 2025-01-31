import * as t from "@babel/types";
import { LoadPhiInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadPhiInstruction(instruction: LoadPhiInstruction, generator: CodeGenerator): t.Expression;
