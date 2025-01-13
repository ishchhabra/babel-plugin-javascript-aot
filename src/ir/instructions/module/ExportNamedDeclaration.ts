import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";

/**
 * Represents an export named declaration.
 *
 * Example:
 * export { x };
 * export const y = 1;
 */
export class ExportNamedDeclarationInstruction extends ModuleInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly specifiers: Place[],
    public readonly declaration: Place | undefined,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [
      ...this.specifiers,
      ...(this.declaration ? [this.declaration] : []),
    ];
  }
}
