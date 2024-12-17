import * as t from "@babel/types";
import { BlockId } from "./Block";
import { Place } from "./Place";
import { Value } from "./Value";

export type InstructionId = number;

export interface BaseInstruction {
  id: InstructionId;
  target: Place;
  type: "const" | "let";
}

export interface FunctionDeclarationInstruction extends BaseInstruction {
  kind: "FunctionDeclaration";
  params: Place[];
  body: BlockId;
}

export interface StoreLocalInstruction extends BaseInstruction {
  kind: "StoreLocal";
  value: Value;
}

export interface SpreadElement {
  kind: "SpreadElement";
  place: Place;
}

export interface ArrayExpressionInstruction extends BaseInstruction {
  kind: "ArrayExpression";
  elements: (Place | SpreadElement)[];
}

export interface UnaryExpressionInstruction extends BaseInstruction {
  kind: "UnaryExpression";
  operator: Exclude<
    t.UnaryExpression["operator"],
    "typeof" | "delete" | "throw" | "void"
  >;
  value: Place;
}

export interface BinaryExpressionInstruction extends BaseInstruction {
  kind: "BinaryExpression";
  operator: Exclude<
    t.BinaryExpression["operator"],
    "in" | "instanceof" | "&&" | "||" | "|>"
  >;
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
  | ArrayExpressionInstruction
  | UnsupportedNodeInstruction
  | FunctionDeclarationInstruction;

export function makeInstructionId(id: number): InstructionId {
  return id;
}
