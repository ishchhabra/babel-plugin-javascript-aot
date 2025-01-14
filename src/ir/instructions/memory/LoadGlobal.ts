import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, MemoryInstruction } from "../../base";
import { Place } from "../../core";

/**
 * Represents a memory instruction that loads a value for a global variable to a place.
 *
 * For example, when `console.log` is referenced, its value needs to be loaded from the global scope
 * before it can be used.
 */
export class LoadGlobalInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly name: string,
    public readonly kind: "builtin" | "import",
    public readonly source?: string,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // LoadGlobal can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return false;
  }
}
