import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  BaseInstruction,
  DeclarationInstruction,
  InstructionId,
} from "../../base";
import { Identifier, Place } from "../../core";

export class ClassDeclarationInstruction extends DeclarationInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.ClassDeclaration> | undefined,
    public readonly identifier: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ClassDeclarationInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(
      ClassDeclarationInstruction,
      place,
      this.nodePath,
      this.identifier,
    );
    return instruction;
  }

  public rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new ClassDeclarationInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.identifier.identifier) ?? this.identifier,
    );
  }

  public getReadPlaces(): Place[] {
    return [this.identifier];
  }

  public get isPure(): boolean {
    return false;
  }
}
