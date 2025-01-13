import * as t from "@babel/types";
import {
  CopyInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  MemoryInstruction,
  StoreLocalInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateCopyInstruction } from "./generateCopy";
import { generateLoadGlobalInstruction } from "./generateLoadGlobal";
import { generateLoadLocalInstruction } from "./generateLoadLocal";
import { generateStoreLocalInstruction } from "./generateStoreLocal";

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
  } else if (instruction instanceof StoreLocalInstruction) {
    return generateStoreLocalInstruction(instruction, generator);
  }

  throw new Error(
    `Unsupported memory instruction: ${instruction.constructor.name}`,
  );
}
