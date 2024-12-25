import * as t from "@babel/types";
import { BlockId } from "./Block";
import { IdentifierId } from "./Identifier";
import { Place } from "./Place";
import { TPrimitiveValue, Value } from "./Value";

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

  /**
   * Clones the function declaration instruction with remapped places.
   *
   * @param places - A map of identifier ids to their new places.
   * @returns A new FunctionDeclarationInstruction with remapped places.
   */
  abstract cloneWithPlaces(places: Map<IdentifierId, Place>): Instruction;
}

export class ArrayExpressionInstruction extends BaseInstruction {
  kind: "ArrayExpression";
  elements: Place[];

  constructor(id: InstructionId, target: Place, elements: Place[]) {
    super(id, target, "const");
    this.kind = "ArrayExpression";
    this.elements = elements;
  }

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): ArrayExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newElements = this.elements.map(
      (element) => places.get(element.identifier.id) ?? element,
    );
    return new ArrayExpressionInstruction(this.id, newTarget, newElements);
  }
}

export class AssignmentExpressionInstruction extends BaseInstruction {
  kind: "AssignmentExpression";
  value: Value;

  constructor(id: InstructionId, target: Place, value: Value) {
    super(id, target, "const");
    this.kind = "AssignmentExpression";
    this.value = value;
  }

  cloneWithPlaces(places: Map<IdentifierId, Place>): Instruction {
    throw new Error("Method not implemented.");
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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): BinaryExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newLeft = places.get(this.left.identifier.id) ?? this.left;
    const newRight = places.get(this.right.identifier.id) ?? this.right;
    return new BinaryExpressionInstruction(
      this.id,
      newTarget,
      this.operator,
      newLeft,
      newRight,
    );
  }
}

export class CallExpressionInstruction extends BaseInstruction {
  kind: "CallExpression";
  callee: Place;
  args: Place[];

  constructor(id: InstructionId, target: Place, callee: Place, args: Place[]) {
    super(id, target, "const");
    this.kind = "CallExpression";
    this.callee = callee;
    this.args = args;
  }

  cloneWithPlaces(places: Map<IdentifierId, Place>): CallExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newCallee = places.get(this.callee.identifier.id) ?? this.callee;
    const newArgs = this.args.map(
      (arg) => places.get(arg.identifier.id) ?? arg,
    );
    return new CallExpressionInstruction(
      this.id,
      newTarget,
      newCallee,
      newArgs,
    );
  }
}

export type ExpressionStatementInstruction = {
  kind: "ExpressionStatement";
  id: InstructionId;
  expression: Place;
};

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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): FunctionDeclarationInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newParams = this.params.map(
      (param) => places.get(param.identifier.id) ?? param,
    );
    return new FunctionDeclarationInstruction(
      this.id,
      newTarget,
      newParams,
      this.body,
    );
  }
}

export class LiteralInstruction extends BaseInstruction {
  kind: "Literal";
  value: TPrimitiveValue;

  constructor(id: InstructionId, target: Place, value: TPrimitiveValue) {
    super(id, target, "const");
    this.kind = "Literal";
    this.value = value;
  }

  cloneWithPlaces(): LiteralInstruction {
    return this;
  }
}

export class LoadLocalInstruction extends BaseInstruction {
  kind: "LoadLocal";
  value: Place;

  constructor(id: InstructionId, target: Place, value: Place) {
    super(id, target, "const");
    this.kind = "LoadLocal";
    this.value = value;
  }

  cloneWithPlaces(): LoadLocalInstruction {
    return this;
  }
}

export function makeInstructionId(id: number): InstructionId {
  return id;
}

export interface SpreadElement {
  kind: "SpreadElement";
  place: Place;
}

export class SpreadElementInstruction extends BaseInstruction {
  kind: "SpreadElement";
  value: Place;

  constructor(id: InstructionId, target: Place, value: Place) {
    super(id, target, "const");
    this.kind = "SpreadElement";
    this.value = value;
  }

  cloneWithPlaces(places: Map<IdentifierId, Place>): SpreadElementInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newValue = places.get(this.value.identifier.id) ?? this.value;
    return new SpreadElementInstruction(this.id, newTarget, newValue);
  }
}

export class StoreLocalInstruction extends BaseInstruction {
  kind: "StoreLocal";
  value: Place;
  type: "const" | "let";

  constructor(
    id: InstructionId,
    target: Place,
    value: Place,
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

  cloneWithPlaces(places: Map<IdentifierId, Place>): StoreLocalInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newValue = places.get(this.value.identifier.id) ?? this.value;
    return new StoreLocalInstruction(this.id, newTarget, newValue, this.type);
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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): UnaryExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newValue = places.get(this.value.identifier.id) ?? this.value;
    return new UnaryExpressionInstruction(
      this.id,
      newTarget,
      this.operator,
      newValue,
    );
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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): UnsupportedNodeInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    return new UnsupportedNodeInstruction(this.id, newTarget, this.node);
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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): UpdateExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newValue = places.get(this.value.identifier.id) ?? this.value;
    return new UpdateExpressionInstruction(
      this.id,
      newTarget,
      this.operator,
      this.prefix,
      newValue,
    );
  }
}

export type ExpressionInstruction =
  | UnaryExpressionInstruction
  | BinaryExpressionInstruction
  | UpdateExpressionInstruction
  | ArrayExpressionInstruction
  | CallExpressionInstruction
  | AssignmentExpressionInstruction;

export type Instruction =
  | SpreadElementInstruction
  | LiteralInstruction
  | ExpressionInstruction
  | StoreLocalInstruction
  | LoadLocalInstruction
  | UnsupportedNodeInstruction
  | FunctionDeclarationInstruction;
