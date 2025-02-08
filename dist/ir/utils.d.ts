import { Environment } from "../environment";
import { InstructionId } from "./base/Instruction";
import { FunctionIR } from "./core/FunctionIR";
export declare function createFunction(environment: Environment): FunctionIR;
export declare function createInstructionId(environment: Environment): InstructionId;
