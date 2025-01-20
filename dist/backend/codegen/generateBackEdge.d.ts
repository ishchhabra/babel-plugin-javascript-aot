import * as t from "@babel/types";
import { BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
export declare function generateBackEdge(blockId: BlockId, functionIR: FunctionIR, generator: CodeGenerator): Array<t.Statement>;
