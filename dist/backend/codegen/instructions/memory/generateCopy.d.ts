import * as t from "@babel/types";
import { CopyInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateCopyInstruction(instruction: CopyInstruction, generator: CodeGenerator): t.Node;
