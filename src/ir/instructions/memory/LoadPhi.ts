import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

export class LoadPhiInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): LoadPhiInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new LoadPhiInstruction(
      instructionId,
      place,
      this.nodePath,
      this.value,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): LoadPhiInstruction {
    return new LoadPhiInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.value.identifier) ?? this.value,
    );
  }

  getReadPlaces(): Place[] {
    return [this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}
