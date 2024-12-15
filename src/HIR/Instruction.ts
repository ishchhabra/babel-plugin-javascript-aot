import * as t from "@babel/types";
import { Place } from "./Place";

export type InstructionId = number;

type PrimitiveInstructionValue = {
  kind: "Primitive";
  value: string | number | boolean | null | undefined | bigint | symbol;
};

export type LoadInstructionValue = {
  kind: "Load";
  place: Place;
};

export type StoreLocalInstructionValue = {
  kind: "StoreLocal";
  place: Place;
  value: InstructionValue;
};

export type UnaryExpressionInstructionValue = {
  kind: "UnaryExpression";
  operator: "!" | "~";
  value: Place;
};

export type BinaryExpressionInstructionValue = {
  kind: "BinaryExpression";
  operator: "+" | "-" | "/" | "*";
  left: Place;
  right: Place;
};

export type UpdateExpressionInstructionValue = {
  kind: "UpdateExpression";
  operator: t.UpdateExpression["operator"];
  prefix: boolean;
  value: Place;
};

export type UnsupportedNodeInstructionValue = {
  kind: "UnsupportedNode";
  node: t.Node;
};

export type InstructionValue =
  | PrimitiveInstructionValue
  | LoadInstructionValue
  | UnaryExpressionInstructionValue
  | BinaryExpressionInstructionValue
  | StoreLocalInstructionValue
  | UpdateExpressionInstructionValue
  | UnsupportedNodeInstructionValue;

export type Instruction = {
  id: InstructionId;
  value: InstructionValue;
};

export function makeInstructionId(id: number): InstructionId {
  return id;
}
