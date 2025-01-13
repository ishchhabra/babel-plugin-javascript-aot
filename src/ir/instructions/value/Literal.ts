import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Place } from "../../core";

export type TPrimitiveValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

/**
 * Represents a literal value.
 *
 * Example:
 * 42
 * "hello"
 * true
 */
export class LiteralInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: TPrimitiveValue,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Literals can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return true;
  }
}
