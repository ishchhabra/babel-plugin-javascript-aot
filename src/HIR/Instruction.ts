import * as t from "@babel/types";
import { Place } from "./Place";
import { Value } from "./Value";

export type InstructionId = number;

export interface BaseInstruction {
  id: InstructionId;
  target: Place;
}

export interface StoreLocalInstruction extends BaseInstruction {
  kind: "StoreLocal";
  place: Place;
  value: Value;
}

export interface UnaryExpressionInstruction extends BaseInstruction {
  kind: "UnaryExpression";
  operator: "!" | "~";
  value: Place;
}

export interface BinaryExpressionInstruction extends BaseInstruction {
  kind: "BinaryExpression";
  operator: "+" | "-" | "/" | "*";
  left: Place;
  right: Place;
}

export interface UpdateExpressionInstruction extends BaseInstruction {
  kind: "UpdateExpression";
  operator: t.UpdateExpression["operator"];
  prefix: boolean;
  value: Place;
}

export interface UnsupportedNodeInstruction extends BaseInstruction {
  kind: "UnsupportedNode";
  node: t.Node;
}

export type Instruction =
  | StoreLocalInstruction
  | UnaryExpressionInstruction
  | BinaryExpressionInstruction
  | UpdateExpressionInstruction
  | UnsupportedNodeInstruction;

export function makeInstructionId(id: number): InstructionId {
  return id;
}
