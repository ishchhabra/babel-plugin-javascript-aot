import * as t from "@babel/types";
import { BindingIdentifierInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateBindingIdentifierInstruction(instruction: BindingIdentifierInstruction, generator: CodeGenerator): t.Identifier;
