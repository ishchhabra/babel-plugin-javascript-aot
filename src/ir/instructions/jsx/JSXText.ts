import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Place } from "../../core";

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

  rewriteInstruction(): BaseInstruction {
    // JSXText can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }
}
