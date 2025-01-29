import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";
import { createInstructionId } from "../utils";

/**
 * Represents a node that is not supported by the IR. This is used to bail out
 * when we encounter a node that we don't know how to handle.
 *
 * Example:
 * let x = { y: z }
 */
export class UnsupportedNodeInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly node: t.Node,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): UnsupportedNodeInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new UnsupportedNodeInstruction(
      instructionId,
      place,
      this.nodePath,
      this.node,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    for (const [identifier, place] of values) {
      // The only other place we're renaming is in the binding phase of the
      // HIR Builder. So, when we rename here, we need to use the declaration
      // name of the identifier that we're renaming.

      // Since by definition, there can only be one phi node for a variable
      // in a block, it is safe to do this.
      const oldName = `$${identifier.declarationId}_0`;
      const newName = place.identifier.name;
      this.nodePath?.scope.rename(oldName, newName);
    }

    return this;
  }

  getReadPlaces(): Place[] {
    throw new Error("Unable to get read places for unsupported node");
  }

  public get isPure(): boolean {
    return false;
  }
}
