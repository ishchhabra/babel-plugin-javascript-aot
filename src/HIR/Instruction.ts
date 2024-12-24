import * as t from "@babel/types";
import { BlockId } from "./Block";
import { IdentifierId } from "./Identifier";
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

  /**
   * Clones the function declaration instruction with remapped places.
   *
   * @param places - A map of identifier ids to their new places.
   * @returns A new FunctionDeclarationInstruction with remapped places.
   */
  abstract cloneWithPlaces(places: Map<IdentifierId, Place>): Instruction;
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

  cloneWithPlaces(places: Map<IdentifierId, Place>): StoreLocalInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    return new StoreLocalInstruction(this.id, newTarget, this.value, this.type);
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

  cloneWithPlaces(
    places: Map<IdentifierId, Place>,
  ): ArrayExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newElements = this.elements.map((element) =>
      element.kind === "SpreadElement"
        ? element
        : (places.get(element.identifier.id) ?? element),
    );
    return new ArrayExpressionInstruction(this.id, newTarget, newElements);
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

// export class MemberExpressionInstruction extends BaseInstruction {
//   kind: "MemberExpression";
//   object: Place;
//   property: Place;
//   computed: boolean;

//   constructor(
//     id: InstructionId,
//     target: Place,
//     object: Place,
//     property: Place,
//     computed: boolean,
//   ) {
//     super(id, target, "const");
//     this.kind = "MemberExpression";
//     this.object = object;
//     this.property = property;
//     this.computed = computed;
//   }

//   cloneWithPlaces(
//     places: Map<IdentifierId, Place>,
//   ): MemberExpressionInstruction {
//     const newTarget = places.get(this.target.identifier.id) ?? this.target;
//     const newObject = places.get(this.object.identifier.id) ?? this.object;
//     const newProperty =
//       places.get(this.property.identifier.id) ?? this.property;
//     return new MemberExpressionInstruction(
//       this.id,
//       newTarget,
//       newObject,
//       newProperty,
//       this.computed,
//     );
//   }
// }

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

  cloneWithPlaces(places: Map<IdentifierId, Place>): CallExpressionInstruction {
    const newTarget = places.get(this.target.identifier.id) ?? this.target;
    const newCallee = places.get(this.callee.identifier.id) ?? this.callee;
    const newArgs = this.args.map((arg) =>
      arg.kind === "SpreadElement"
        ? arg
        : (places.get(arg.identifier.id) ?? arg),
    );
    return new CallExpressionInstruction(
      this.id,
      newTarget,
      newCallee,
      newArgs,
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

export type ExpressionStatementInstruction = {
  kind: "ExpressionStatement";
  id: InstructionId;
  expression: Place;
};

export type ExpressionInstruction =
  | UnaryExpressionInstruction
  | BinaryExpressionInstruction
  | UpdateExpressionInstruction
  | ArrayExpressionInstruction
  | CallExpressionInstruction;

export type Instruction =
  | ExpressionInstruction
  | StoreLocalInstruction
  | UnsupportedNodeInstruction
  | FunctionDeclarationInstruction;

export function makeInstructionId(id: number): InstructionId {
  return id;
}
