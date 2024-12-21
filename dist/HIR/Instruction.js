"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedNodeInstruction = exports.CallExpressionInstruction = exports.UpdateExpressionInstruction = exports.BinaryExpressionInstruction = exports.UnaryExpressionInstruction = exports.ArrayExpressionInstruction = exports.StoreLocalInstruction = exports.FunctionDeclarationInstruction = exports.BaseInstruction = void 0;
exports.makeInstructionId = makeInstructionId;
class BaseInstruction {
    id;
    target;
    type;
    constructor(id, target, type) {
        this.id = id;
        this.target = target;
        this.type = type;
    }
    getPlaces() {
        return [this.target];
    }
}
exports.BaseInstruction = BaseInstruction;
class FunctionDeclarationInstruction extends BaseInstruction {
    kind;
    params;
    body;
    constructor(id, target, params, body) {
        super(id, target, "const");
        this.kind = "FunctionDeclaration";
        this.params = params;
        this.body = body;
    }
    getPlaces() {
        return [...super.getPlaces(), ...this.params];
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newParams = this.params.map((param) => places.get(param.identifier.id) ?? param);
        return new FunctionDeclarationInstruction(this.id, newTarget, newParams, this.body);
    }
}
exports.FunctionDeclarationInstruction = FunctionDeclarationInstruction;
class StoreLocalInstruction extends BaseInstruction {
    kind;
    value;
    type;
    constructor(id, target, value, type) {
        super(id, target, type);
        this.kind = "StoreLocal";
        this.value = value;
        this.type = type;
    }
    getPlaces() {
        return [...super.getPlaces()];
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        return new StoreLocalInstruction(this.id, newTarget, this.value, this.type);
    }
}
exports.StoreLocalInstruction = StoreLocalInstruction;
class ArrayExpressionInstruction extends BaseInstruction {
    kind;
    elements;
    constructor(id, target, elements) {
        super(id, target, "const");
        this.kind = "ArrayExpression";
        this.elements = elements;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newElements = this.elements.map((element) => element.kind === "SpreadElement"
            ? element
            : (places.get(element.identifier.id) ?? element));
        return new ArrayExpressionInstruction(this.id, newTarget, newElements);
    }
}
exports.ArrayExpressionInstruction = ArrayExpressionInstruction;
class UnaryExpressionInstruction extends BaseInstruction {
    kind;
    operator;
    value;
    constructor(id, target, operator, value) {
        super(id, target, "const");
        this.kind = "UnaryExpression";
        this.operator = operator;
        this.value = value;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newValue = places.get(this.value.identifier.id) ?? this.value;
        return new UnaryExpressionInstruction(this.id, newTarget, this.operator, newValue);
    }
}
exports.UnaryExpressionInstruction = UnaryExpressionInstruction;
class BinaryExpressionInstruction extends BaseInstruction {
    kind;
    operator;
    left;
    right;
    constructor(id, target, operator, left, right) {
        super(id, target, "const");
        this.kind = "BinaryExpression";
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newLeft = places.get(this.left.identifier.id) ?? this.left;
        const newRight = places.get(this.right.identifier.id) ?? this.right;
        return new BinaryExpressionInstruction(this.id, newTarget, this.operator, newLeft, newRight);
    }
}
exports.BinaryExpressionInstruction = BinaryExpressionInstruction;
class UpdateExpressionInstruction extends BaseInstruction {
    kind;
    operator;
    prefix;
    value;
    constructor(id, target, operator, prefix, value) {
        super(id, target, "const");
        this.kind = "UpdateExpression";
        this.operator = operator;
        this.prefix = prefix;
        this.value = value;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newValue = places.get(this.value.identifier.id) ?? this.value;
        return new UpdateExpressionInstruction(this.id, newTarget, this.operator, this.prefix, newValue);
    }
}
exports.UpdateExpressionInstruction = UpdateExpressionInstruction;
class CallExpressionInstruction extends BaseInstruction {
    kind;
    callee;
    args;
    constructor(id, target, callee, args) {
        super(id, target, "const");
        this.kind = "CallExpression";
        this.callee = callee;
        this.args = args;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        const newCallee = places.get(this.callee.identifier.id) ?? this.callee;
        const newArgs = this.args.map((arg) => arg.kind === "SpreadElement"
            ? arg
            : (places.get(arg.identifier.id) ?? arg));
        return new CallExpressionInstruction(this.id, newTarget, newCallee, newArgs);
    }
}
exports.CallExpressionInstruction = CallExpressionInstruction;
class UnsupportedNodeInstruction extends BaseInstruction {
    kind;
    node;
    constructor(id, target, node) {
        super(id, target, "const");
        this.kind = "UnsupportedNode";
        this.node = node;
    }
    cloneWithPlaces(places) {
        const newTarget = places.get(this.target.identifier.id) ?? this.target;
        return new UnsupportedNodeInstruction(this.id, newTarget, this.node);
    }
}
exports.UnsupportedNodeInstruction = UnsupportedNodeInstruction;
function makeInstructionId(id) {
    return id;
}
