import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  BaseInstruction,
  createInstructionId,
  Identifier,
  InstructionId,
  PatternInstruction,
  Place,
} from "../..";
import { Environment } from "../../../environment";

/**
 * Represents an object pattern in the IR.
 *
 * Examples:
 * - `const { x, y } = { x: 1, y: 2 } // { x, y } is the object pattern`
 */
export class ObjectPatternInstruction extends PatternInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.ObjectPattern> | undefined,
    public readonly properties: Place[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ObjectPatternInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new ObjectPatternInstruction(
      instructionId,
      place,
      this.nodePath,
      this.properties,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ObjectPatternInstruction(
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
}
