import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";

/**
 * Represents a rest element in the IR.
 *
 * Examples:
 * - const [a, ...b] = [1, 2, 3, 4, 5];
 */
export class RestElementInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.RestElement>,
    public readonly argument: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): RestElementInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      RestElementInstruction,
      place,
      this.nodePath,
      this.argument,
    );
  }

  public rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new RestElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.argument.identifier) ?? this.argument,
    );
  }

  public getReadPlaces(): Place[] {
    return [this.argument];
  }

  public get isPure(): boolean {
    return true;
  }
}
