import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Place } from "../../core";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
} from "../../utils";

/**
 * Represents a JSX text node in the IR.
 *
 * Examples:
 * - `"Hello, world!"`
 */
export class JSXTextInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: string,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): JSXTextInstruction {
    const identifier = createIdentifier(environment);
    const place = createPlace(identifier, environment);
    const instructionId = createInstructionId(environment);
    return new JSXTextInstruction(
      instructionId,
      place,
      this.nodePath,
      this.value,
    );
  }

  rewriteInstruction(): BaseInstruction {
    // JSXText can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }
}
