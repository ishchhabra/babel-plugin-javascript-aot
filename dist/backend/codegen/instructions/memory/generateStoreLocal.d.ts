import * as t from "@babel/types";
import { StoreLocalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateStoreLocalInstruction(instruction: StoreLocalInstruction, generator: CodeGenerator): t.Statement;
