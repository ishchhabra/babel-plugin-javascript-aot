import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, InstructionId } from "../base";
import { Place } from "../core";

/**
 * Represents a binding identifier in the IR.
 *
 * A binding identifier is used when declaring new identifiers that are not already
 * in context. This differs from a load instruction which references existing identifiers.
 *
 * Examples:
 * - Variable declarations: `let x = 10` - "x" is a binding identifier
 * - Import declarations: `import { x } from "y"` - "x" is a binding identifier
 * - Function parameters: `function f(x) {}` - "x" is a binding identifier
 */
export class BindingIdentifierInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly name: string,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): BindingIdentifierInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      BindingIdentifierInstruction,
      place,
      this.nodePath,
      identifier.name,
    );
  }

  rewrite(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }
}
