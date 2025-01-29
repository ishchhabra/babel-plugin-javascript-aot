import { Environment } from "../environment";
import { InstructionId } from "./base/Instruction";
import { BasicBlock } from "./core/Block";
import { FunctionIR } from "./core/FunctionIR";
export declare function createBlock(environment: Environment): BasicBlock;
export declare function createFunction(environment: Environment): FunctionIR;
export declare function createInstructionId(environment: Environment): InstructionId;
