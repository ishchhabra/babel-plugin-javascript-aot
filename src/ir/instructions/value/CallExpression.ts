import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a call expression.
 *
 * Example:
 * foo(1, 2)
 */
export class CallExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly callee: Place,
    // Using args instead of arguments since arguments is a reserved word
    public readonly args: Place[],
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new CallExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.callee.identifier) ?? this.callee,
      this.args.map((arg) => values.get(arg.identifier) ?? arg),
    );
  }

  getReadPlaces(): Place[] {
    return [this.callee, ...this.args];
  }

  public get isPure(): boolean {
    return false;
  }
}