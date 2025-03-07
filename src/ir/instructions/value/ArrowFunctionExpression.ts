import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { FunctionIR } from "../../core/FunctionIR";
import { Place } from "../../core/Place";

/**
 * Represents an arrow function expression, e.g.
 *   `const arrow = (x) => x + 1;`
 *
 * The `functionIR` property contains the IR for the arrow's body,
 * `async` indicates if it's `async ( ) => { }`,
 * `expression` indicates if it has a concise expression body rather than a block.
 */
export class ArrowFunctionExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.ArrowFunctionExpression> | undefined,
    public readonly functionIR: FunctionIR,
    public readonly async: boolean,
    public readonly expression: boolean,
    public readonly generator: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ArrowFunctionExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      ArrowFunctionExpressionInstruction,
      place,
      this.nodePath,
      this.functionIR,
      this.async,
      this.expression,
      this.generator,
    );
  }

  public rewrite(): BaseInstruction {
    return this;
  }

  public getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return false;
  }
}
