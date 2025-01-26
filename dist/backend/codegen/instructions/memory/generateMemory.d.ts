import * as t from "@babel/types";
import { MemoryInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateMemoryInstruction(instruction: MemoryInstruction, generator: CodeGenerator): t.Node;
