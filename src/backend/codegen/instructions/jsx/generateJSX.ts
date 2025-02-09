import {
  JSXElementInstruction,
  JSXFragmentInstruction,
  JSXInstruction,
  JSXTextInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateJSXElementInstruction } from "./generateJSXElement";
import { generateJSXFragmentInstruction } from "./generateJSXFragment";
import { generateJSXTextInstruction } from "./generateJSXText";

export function generateJSXInstruction(
  instruction: JSXInstruction,
  generator: CodeGenerator,
) {
  if (instruction instanceof JSXElementInstruction) {
    return generateJSXElementInstruction(instruction, generator);
  } else if (instruction instanceof JSXFragmentInstruction) {
    return generateJSXFragmentInstruction(instruction, generator);
  } else if (instruction instanceof JSXTextInstruction) {
    return generateJSXTextInstruction(instruction, generator);
  }
}
