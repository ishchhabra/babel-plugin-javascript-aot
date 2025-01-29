import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents an import declaration.
 *
 * Example:
 * import x from "y";
 * import { x } from "y";
 */
export class ImportDeclarationInstruction extends ModuleInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly source: string,
    public readonly resolvedSource: string,
    public readonly specifiers: Place[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ImportDeclarationInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new ImportDeclarationInstruction(
      instructionId,
      place,
      this.nodePath,
      this.source,
      this.resolvedSource,
      this.specifiers,
    );
  }

  rewriteInstruction(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [...this.specifiers];
  }
}
