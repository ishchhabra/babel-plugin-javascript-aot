import * as t from "@babel/types";
import { BlockId } from "../../ir";
import { CodeGenerator } from "../CodeGenerator";
export declare function generateBlock(blockId: BlockId, generator: CodeGenerator): Array<t.Statement>;
export declare function generateBasicBlock(blockId: BlockId, generator: CodeGenerator): Array<t.Statement>;
