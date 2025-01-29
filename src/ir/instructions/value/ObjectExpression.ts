import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents an object expression.
 *
 * Example:
 * { a: 1, b: 2 }
 */
export class ObjectExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly properties: Place[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ObjectExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new ObjectExpressionInstruction(
      instructionId,
      place,
      this.nodePath,
      this.properties,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ObjectExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.properties.map(
        (property) => values.get(property.identifier) ?? property,
      ),
    );
  }

  getReadPlaces(): Place[] {
    return this.properties;
  }

  public get isPure(): boolean {
    return true;
  }
}
