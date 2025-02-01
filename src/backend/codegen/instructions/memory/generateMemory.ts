import * as t from "@babel/types";
import {
  CopyInstruction,
  LoadDynamicPropertyInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  LoadPhiInstruction,
  MemoryInstruction,
  StoreLocalInstruction,
} from "../../../../ir";
import { LoadStaticPropertyInstruction } from "../../../../ir/instructions/memory/LoadStaticProperty";
import { StoreDynamicPropertyInstruction } from "../../../../ir/instructions/memory/StoreDynamicProperty";
import { StoreStaticPropertyInstruction } from "../../../../ir/instructions/memory/StoreStaticProperty";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateCopyInstruction } from "./generateCopy";
import { generateLoadDynamicPropertyInstruction } from "./generateLoadDynamicProperty";
import { generateLoadGlobalInstruction } from "./generateLoadGlobal";
import { generateLoadLocalInstruction } from "./generateLoadLocal";
import { generateLoadPhiInstruction } from "./generateLoadPhi";
import { generateLoadStaticPropertyInstruction } from "./generateLoadStaticProperty";
import { generateStoreDynamicPropertyInstruction } from "./generateStoreDynamicProperty";
import { generateStoreLocalInstruction } from "./generateStoreLocal";
import { generateStoreStaticPropertyInstruction } from "./generateStoreStaticProperty";

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
  } else if (instruction instanceof LoadStaticPropertyInstruction) {
    return generateLoadStaticPropertyInstruction(instruction, generator);
  } else if (instruction instanceof LoadDynamicPropertyInstruction) {
    return generateLoadDynamicPropertyInstruction(instruction, generator);
  } else if (instruction instanceof StoreLocalInstruction) {
    return generateStoreLocalInstruction(instruction, generator);
  } else if (instruction instanceof StoreStaticPropertyInstruction) {
    return generateStoreStaticPropertyInstruction(instruction, generator);
  } else if (instruction instanceof StoreDynamicPropertyInstruction) {
    return generateStoreDynamicPropertyInstruction(instruction, generator);
  }

  throw new Error(
    `Unsupported memory instruction: ${instruction.constructor.name}`,
  );
}
