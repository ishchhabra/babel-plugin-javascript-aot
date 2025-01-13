import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";

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
    public readonly imported: Place,
    public readonly local: Place | undefined,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [this.imported, ...(this.local ? [this.local] : [])];
  }
}
