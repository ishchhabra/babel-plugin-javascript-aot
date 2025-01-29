import { Environment } from "../environment";
import { InstructionId, makeInstructionId } from "./base/Instruction";
import { BasicBlock, makeBlockId } from "./core/Block";
import { FunctionIR, makeFunctionIRId } from "./core/FunctionIR";

export function createBlock(environment: Environment): BasicBlock {
  const blockId = makeBlockId(environment.nextBlockId++);
  return new BasicBlock(blockId, [], undefined);
}

export function createFunction(environment: Environment): FunctionIR {
  const functionId = makeFunctionIRId(environment.nextFunctionId++);
  return new FunctionIR(functionId, [], [], new Map());
}

export function createInstructionId(environment: Environment): InstructionId {
  return makeInstructionId(environment.nextInstructionId++);
}
