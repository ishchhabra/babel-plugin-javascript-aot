import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";

/**
 * Represents an export default declaration.
 *
 * Example:
 * export default x;
 */
export class ExportDefaultDeclarationInstruction extends ModuleInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly declaration: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ExportDefaultDeclarationInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      ExportDefaultDeclarationInstruction,
      place,
      this.nodePath,
      this.declaration,
    );
  }

  rewrite(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [this.declaration];
  }
}
