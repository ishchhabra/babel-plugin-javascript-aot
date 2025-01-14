import * as t from "@babel/types";
import { BlockId } from "../../ir";
import { CodeGenerator } from "../CodeGenerator";
export declare function generateBackEdge(blockId: BlockId, generator: CodeGenerator): Array<t.Statement>;
