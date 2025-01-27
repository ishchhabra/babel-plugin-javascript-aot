import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { FunctionIR } from "../../core/FunctionIR";
import { Identifier } from "../../core/Identifier";
import { Place } from "../../core/Place";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
} from "../../utils";

export class FunctionExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly identifier: Place | null,
    public readonly functionIR: FunctionIR,
    public readonly generator: boolean,
    public readonly async: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): FunctionExpressionInstruction {
    const identifier = createIdentifier(environment);
    const place = createPlace(identifier, environment);
    const instructionId = createInstructionId(environment);
    return new FunctionExpressionInstruction(
      instructionId,
      place,
      this.nodePath,
      this.identifier,
      this.functionIR,
      this.generator,
      this.async,
    );
  }

  public rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new FunctionExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.identifier
        ? (values.get(this.identifier.identifier) ?? this.identifier)
        : null,
      this.functionIR,
      this.generator,
      this.async,
    );
  }

  public getReadPlaces(): Place[] {
    return [...(this.identifier ? [this.identifier] : [])];
  }

  public get isPure(): boolean {
    return false;
  }
}
