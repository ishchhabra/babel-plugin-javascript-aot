import {
  JSXElementInstruction,
  JSXFragmentInstruction,
  JSXInstruction,
  JSXTextInstruction,
} from "../../../../ir";
import { JSXAttributeInstruction } from "../../../../ir/instructions/jsx/JSXAttribute";
import { JSXOpeningElementInstruction } from "../../../../ir/instructions/jsx/JSXOpeningElement";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateJSXAttributeInstruction } from "./generateJSXAttribute";
import { generateJSXElementInstruction } from "./generateJSXElement";
import { generateJSXFragmentInstruction } from "./generateJSXFragment";
import { generateJSXOpeningElementInstruction } from "./generateJSXOpeningElement";
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
  } else if (instruction instanceof JSXAttributeInstruction) {
    return generateJSXAttributeInstruction(instruction, generator);
  } else if (instruction instanceof JSXOpeningElementInstruction) {
    return generateJSXOpeningElementInstruction(instruction, generator);
  }
}
