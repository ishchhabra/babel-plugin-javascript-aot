import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { FunctionIR } from "../../core/FunctionIR";

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
    public readonly body: FunctionIR,
    public readonly computed: boolean,
    public readonly generator: boolean,
    public readonly async: boolean,
    public readonly kind: "method" | "get" | "set",
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ObjectMethodInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      ObjectMethodInstruction,
      place,
      this.nodePath,
      this.key,
      this.body,
      this.computed,
      this.generator,
      this.async,
      this.kind,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new ObjectMethodInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.key.identifier) ?? this.key,
      this.body,
      this.computed,
      this.generator,
      this.async,
      this.kind,
    );
  }

  getReadPlaces(): Place[] {
    return [this.key];
  }
}
