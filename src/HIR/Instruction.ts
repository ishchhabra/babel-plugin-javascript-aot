import * as t from "@babel/types";
import { BlockId } from "./Block";
import { Place } from "./Place";
import { Value } from "./Value";

export type InstructionId = number;

export abstract class BaseInstruction {
  id: InstructionId;
  target: Place;
  type: "const" | "let";

  constructor(id: InstructionId, target: Place, type: "const" | "let") {
    this.id = id;
    this.target = target;
    this.type = type;
  }

  getPlaces(): Place[] {
    return [this.target];
  }
}

export class FunctionDeclarationInstruction extends BaseInstruction {
  kind: "FunctionDeclaration";
  params: Place[];
  body: BlockId;

  constructor(
    id: InstructionId,
    target: Place,
    params: Place[],
    body: BlockId,
  ) {
    super(id, target, "const");
    this.kind = "FunctionDeclaration";
    this.params = params;
    this.body = body;
  }

  getPlaces(): Place[] {
    return [...super.getPlaces(), ...this.params];
  }
}

export class StoreLocalInstruction extends BaseInstruction {
  kind: "StoreLocal";
  value: Value;
  type: "const" | "let";

  constructor(
    id: InstructionId,
    target: Place,
    value: Value,
    type: "const" | "let",
  ) {
    super(id, target, type);
    this.kind = "StoreLocal";
    this.value = value;
    this.type = type;
  }

  getPlaces(): Place[] {
    return [...super.getPlaces()];
  }
}

export interface SpreadElement {
  kind: "SpreadElement";
  place: Place;
}

export class ArrayExpressionInstruction extends BaseInstruction {
  kind: "ArrayExpression";
  elements: (Place | SpreadElement)[];

  constructor(
    id: InstructionId,
    target: Place,
    elements: (Place | SpreadElement)[],
  ) {
    super(id, target, "const");
    this.kind = "ArrayExpression";
    this.elements = elements;
  }
}

export class UnaryExpressionInstruction extends BaseInstruction {
  kind: "UnaryExpression";
  operator: Exclude<
    t.UnaryExpression["operator"],
    "typeof" | "delete" | "throw" | "void"
  >;
  value: Place;

  constructor(
    id: InstructionId,
    target: Place,
    operator: Exclude<
      t.UnaryExpression["operator"],
      "typeof" | "delete" | "throw" | "void"
    >,
    value: Place,
  ) {
    super(id, target, "const");
    this.kind = "UnaryExpression";
    this.operator = operator;
    this.value = value;
  }
}

export class BinaryExpressionInstruction extends BaseInstruction {
  kind: "BinaryExpression";
  operator: Exclude<
    t.BinaryExpression["operator"],
    "in" | "instanceof" | "&&" | "||" | "|>"
  >;
  left: Place;
  right: Place;

  constructor(
    id: InstructionId,
    target: Place,
    operator: Exclude<
      t.BinaryExpression["operator"],
      "in" | "instanceof" | "&&" | "||" | "|>"
    >,
    left: Place,
    right: Place,
  ) {
    super(id, target, "const");
    this.kind = "BinaryExpression";
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class UpdateExpressionInstruction extends BaseInstruction {
  kind: "UpdateExpression";
  operator: t.UpdateExpression["operator"];
  prefix: boolean;
  value: Place;

  constructor(
    id: InstructionId,
    target: Place,
    operator: t.UpdateExpression["operator"],
    prefix: boolean,
    value: Place,
  ) {
    super(id, target, "const");
    this.kind = "UpdateExpression";
    this.operator = operator;
    this.prefix = prefix;
    this.value = value;
  }
}

export class CallExpressionInstruction extends BaseInstruction {
  kind: "CallExpression";
  callee: Place;
  args: (Place | SpreadElement)[];

  constructor(
    id: InstructionId,
    target: Place,
    callee: Place,
    args: (Place | SpreadElement)[],
  ) {
    super(id, target, "const");
    this.kind = "CallExpression";
    this.callee = callee;
    this.args = args;
  }
}

export class UnsupportedNodeInstruction extends BaseInstruction {
  kind: "UnsupportedNode";
  node: t.Node;

  constructor(id: InstructionId, target: Place, node: t.Node) {
    super(id, target, "const");
    this.kind = "UnsupportedNode";
    this.node = node;
  }
}

export type Instruction =
  | StoreLocalInstruction
  | UnaryExpressionInstruction
  | BinaryExpressionInstruction
  | UpdateExpressionInstruction
  | ArrayExpressionInstruction
  | UnsupportedNodeInstruction
  | FunctionDeclarationInstruction
  | CallExpressionInstruction;

export function makeInstructionId(id: number): InstructionId {
  return id;
}
