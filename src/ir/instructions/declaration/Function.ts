import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  BaseInstruction,
  DeclarationInstruction,
  InstructionId,
} from "../../base";
import { Identifier, Place } from "../../core";
import { FunctionIR } from "../../core/FunctionIR";

export class FunctionDeclarationInstruction extends DeclarationInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly identifier: Place,
    public readonly functionIR: FunctionIR,
    public readonly generator: boolean,
    public readonly async: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): FunctionDeclarationInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      FunctionDeclarationInstruction,
      place,
      this.nodePath,
      this.identifier,
      this.functionIR,
      this.generator,
      this.async,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new FunctionDeclarationInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.identifier.identifier) ?? this.identifier,
      this.functionIR,
      this.generator,
      this.async,
    );
  }

  getReadPlaces(): Place[] {
    return [this.identifier];
  }

  public get isPure(): boolean {
    return false;
  }
}
