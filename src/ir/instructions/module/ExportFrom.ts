import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";

export interface ExportFromSpecifier {
  local: string;
  exported: string;
}

/**
 * Represents a re-export declaration.
 *
 * Example:
 * export { chunk, compact } from './array/utils.mjs';
 */
export class ExportFromInstruction extends ModuleInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly source: string,
    public specifiers: ExportFromSpecifier[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ExportFromInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      ExportFromInstruction,
      place,
      this.nodePath,
      this.source,
      [...this.specifiers],
    );
  }

  rewrite(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }
}
