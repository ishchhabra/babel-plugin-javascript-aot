import * as t from "@babel/types";
import {
  CopyInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  LoadPhiInstruction,
  MemoryInstruction,
  StoreLocalInstruction,
} from "../../../../ir";
import { LoadPropertyInstruction } from "../../../../ir/instructions/memory/LoadProperty";
import { StoreDynamicPropertyInstruction } from "../../../../ir/instructions/memory/StoreComputedProperty";
import { StorePropertyInstruction } from "../../../../ir/instructions/memory/StoreProperty";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateCopyInstruction } from "./generateCopy";
import { generateLoadGlobalInstruction } from "./generateLoadGlobal";
import { generateLoadLocalInstruction } from "./generateLoadLocal";
import { generateLoadPhiInstruction } from "./generateLoadPhi";
import { generateLoadPropertyInstruction } from "./generateLoadProperty";
import { generateStoreDynamicPropertyInstruction } from "./generateStoreDynamicProperty";
import { generateStoreLocalInstruction } from "./generateStoreLocal";
import { generateStorePropertyInstruction } from "./generateStoreProperty";

export function generateMemoryInstruction(
  instruction: MemoryInstruction,
  generator: CodeGenerator,
): t.Node {
  if (instruction instanceof CopyInstruction) {
    return generateCopyInstruction(instruction, generator);
  } else if (instruction instanceof LoadGlobalInstruction) {
    return generateLoadGlobalInstruction(instruction, generator);
  } else if (instruction instanceof LoadLocalInstruction) {
    return generateLoadLocalInstruction(instruction, generator);
  } else if (instruction instanceof LoadPhiInstruction) {
    return generateLoadPhiInstruction(instruction, generator);
  } else if (instruction instanceof LoadPropertyInstruction) {
    return generateLoadPropertyInstruction(instruction, generator);
  } else if (instruction instanceof StoreLocalInstruction) {
    return generateStoreLocalInstruction(instruction, generator);
  } else if (instruction instanceof StorePropertyInstruction) {
    return generateStorePropertyInstruction(instruction, generator);
  } else if (instruction instanceof StoreDynamicPropertyInstruction) {
    return generateStoreDynamicPropertyInstruction(instruction, generator);
  }

  throw new Error(
    `Unsupported memory instruction: ${instruction.constructor.name}`,
  );
}
