import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents an import specifier.
 *
 * Example:
 * import { x } from "y"; // x is the import specifier
 */
export class ImportSpecifierInstruction extends ModuleInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly local: string,
    public readonly imported: string,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ImportSpecifierInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new ImportSpecifierInstruction(
      instructionId,
      place,
      this.nodePath,
      this.local,
      this.imported,
    );
  }

  rewriteInstruction(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }
}
