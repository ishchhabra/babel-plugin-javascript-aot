import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  BaseInstruction,
  DeclarationInstruction,
  InstructionId,
} from "../../base";
import { BlockId, Identifier, Place } from "../../core";

export class FunctionDeclarationInstruction extends DeclarationInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly params: Place[],
    public readonly body: BlockId,
    public readonly generator: boolean,
    public readonly async: boolean,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new FunctionDeclarationInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.params.map((param) => values.get(param.identifier) ?? param),
      this.body,
      this.generator,
      this.async,
    );
  }

  getReadPlaces(): Place[] {
    return this.params;
  }

  public get isPure(): boolean {
    return false;
  }
}
