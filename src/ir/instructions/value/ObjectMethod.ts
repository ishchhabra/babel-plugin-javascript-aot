import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { BlockId, Identifier, Place } from "../../core";

/**
 * Represents an object method in the IR.
 *
 * Examples:
 * - `{ foo() {} } // foo is the object method`
 */
export class ObjectMethodInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly key: Place,
    public readonly params: Place[],
    public readonly body: BlockId,
    public readonly computed: boolean,
    public readonly generator: boolean,
    public readonly async: boolean,
    public readonly kind: "method" | "get" | "set",
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ObjectMethodInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.key.identifier) ?? this.key,
      this.params.map((param) => values.get(param.identifier) ?? param),
      this.body,
      this.computed,
      this.generator,
      this.async,
      this.kind,
    );
  }

  getReadPlaces(): Place[] {
    return [this.key, ...this.params];
  }
}
