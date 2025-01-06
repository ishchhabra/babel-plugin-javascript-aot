/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
function makeInstructionId(id) {
    return id;
}
/**
 * Base class for all instructions.
 *
 * @param id - The unique identifier for the instruction.
 * @param place - The place where the instruction is stored.
 */
class BaseInstruction {
    id;
    place;
    nodePath;
    constructor(id, place, nodePath) {
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
    }
    /** Whether this instruction is pure. */
    get isPure() {
        return false;
    }
}
class ExpressionInstruction extends BaseInstruction {
}
class StatementInstruction extends BaseInstruction {
}
class PatternInstruction extends BaseInstruction {
}
class JSXInstruction extends BaseInstruction {
}
class MiscellaneousInstruction extends BaseInstruction {
}
class ArrayExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    elements;
    constructor(id, place, nodePath, elements) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.elements = elements;
    }
    rewriteInstruction(values) {
        return new ArrayExpressionInstruction(this.id, this.place, this.nodePath, this.elements.map((element) => values.get(element.identifier) ?? element));
    }
    getReadPlaces() {
        return this.elements;
    }
    get isPure() {
        return true;
    }
}
class ArrayPatternInstruction extends PatternInstruction {
    id;
    place;
    nodePath;
    elements;
    constructor(id, place, nodePath, elements) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.elements = elements;
    }
    rewriteInstruction(values) {
        return new ArrayPatternInstruction(this.id, this.place, this.nodePath, this.elements.map((element) => values.get(element.identifier) ?? element));
    }
    getReadPlaces() {
        return this.elements;
    }
    get isPure() {
        return true;
    }
}
class BinaryExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    operator;
    left;
    right;
    constructor(id, place, nodePath, operator, left, right) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    rewriteInstruction(values) {
        return new BinaryExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.left.identifier) ?? this.left, values.get(this.right.identifier) ?? this.right);
    }
    getReadPlaces() {
        return [this.left, this.right];
    }
    get isPure() {
        return true;
    }
}
class CallExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    callee;
    args;
    constructor(id, place, nodePath, callee, 
    // Using args instead of arguments since arguments is a reserved word
    args) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.callee = callee;
        this.args = args;
    }
    rewriteInstruction(values) {
        return new CallExpressionInstruction(this.id, this.place, this.nodePath, values.get(this.callee.identifier) ?? this.callee, this.args.map((arg) => values.get(arg.identifier) ?? arg));
    }
    getReadPlaces() {
        return [this.callee, ...this.args];
    }
    get isPure() {
        return false;
    }
}
class CopyInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    lval;
    value;
    constructor(id, place, nodePath, lval, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.lval = lval;
        this.value = value;
    }
    rewriteInstruction(values) {
        return new CopyInstruction(this.id, this.place, this.nodePath, values.get(this.lval.identifier) ?? this.lval, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.lval, this.value];
    }
    get isPure() {
        return true;
    }
}
class ExpressionStatementInstruction extends StatementInstruction {
    id;
    place;
    nodePath;
    expression;
    constructor(id, place, nodePath, expression) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.expression = expression;
    }
    rewriteInstruction(values) {
        return new ExpressionStatementInstruction(this.id, this.place, this.nodePath, values.get(this.expression.identifier) ?? this.expression);
    }
    getReadPlaces() {
        return [this.expression];
    }
    get isPure() {
        return false;
    }
}
class FunctionDeclarationInstruction extends StatementInstruction {
    id;
    place;
    nodePath;
    params;
    body;
    generator;
    async;
    constructor(id, place, nodePath, params, body, generator, async) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.async = async;
    }
    rewriteInstruction(values) {
        return new FunctionDeclarationInstruction(this.id, this.place, this.nodePath, this.params.map((param) => values.get(param.identifier) ?? param), this.body, this.generator, this.async);
    }
    getReadPlaces() {
        return this.params;
    }
    get isPure() {
        return false;
    }
}
class HoleInstruction extends MiscellaneousInstruction {
    id;
    place;
    nodePath;
    constructor(id, place, nodePath) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
    }
    rewriteInstruction() {
        // Hole can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return true;
    }
}
class JSXElementInstruction extends JSXInstruction {
    id;
    place;
    nodePath;
    openingElement;
    closingElement;
    children;
    constructor(id, place, nodePath, openingElement, closingElement, children) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.openingElement = openingElement;
        this.closingElement = closingElement;
        this.children = children;
    }
    rewriteInstruction(values) {
        return new JSXElementInstruction(this.id, this.place, this.nodePath, values.get(this.openingElement.identifier) ?? this.openingElement, values.get(this.closingElement.identifier) ?? this.closingElement, this.children.map((child) => values.get(child.identifier) ?? child));
    }
    getReadPlaces() {
        return [this.openingElement, this.closingElement, ...this.children];
    }
}
class JSXFragmentInstruction extends JSXInstruction {
    id;
    place;
    nodePath;
    openingFragment;
    closingFragment;
    children;
    constructor(id, place, nodePath, openingFragment, closingFragment, children) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.openingFragment = openingFragment;
        this.closingFragment = closingFragment;
        this.children = children;
    }
    rewriteInstruction(values) {
        return new JSXFragmentInstruction(this.id, this.place, this.nodePath, this.openingFragment, this.closingFragment, this.children.map((child) => values.get(child.identifier) ?? child));
    }
    getReadPlaces() {
        return [this.openingFragment, this.closingFragment, ...this.children];
    }
}
class JSXTextInstruction extends JSXInstruction {
    id;
    place;
    nodePath;
    value;
    constructor(id, place, nodePath, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.value = value;
    }
    rewriteInstruction() {
        // JSXText can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
}
class LiteralInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    value;
    constructor(id, place, nodePath, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.value = value;
    }
    rewriteInstruction() {
        // Literals can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return true;
    }
}
class LoadGlobalInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    name;
    constructor(id, place, nodePath, name) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.name = name;
    }
    rewriteInstruction() {
        // LoadGlobal can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return false;
    }
}
class LoadLocalInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    value;
    constructor(id, place, nodePath, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.value = value;
    }
    rewriteInstruction(values) {
        const rewrittenTarget = values.get(this.value.identifier) ?? this.value;
        if (rewrittenTarget === this.value) {
            return this;
        }
        return new LoadLocalInstruction(this.id, this.place, this.nodePath, rewrittenTarget);
    }
    getReadPlaces() {
        return [this.value];
    }
    get isPure() {
        return true;
    }
}
class LogicalExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    operator;
    left;
    right;
    constructor(id, place, nodePath, operator, left, right) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    rewriteInstruction(values) {
        return new LogicalExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.left.identifier) ?? this.left, values.get(this.right.identifier) ?? this.right);
    }
    getReadPlaces() {
        return [this.left, this.right];
    }
    get isPure() {
        return false;
    }
}
class MemberExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    object;
    property;
    computed;
    constructor(id, place, nodePath, object, property, computed) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
    rewriteInstruction(values) {
        return new MemberExpressionInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, values.get(this.property.identifier) ?? this.property, this.computed);
    }
    getReadPlaces() {
        return [this.object, this.property];
    }
    get isPure() {
        return false;
    }
}
class ObjectExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    properties;
    constructor(id, place, nodePath, properties) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.properties = properties;
    }
    rewriteInstruction(values) {
        return new ObjectExpressionInstruction(this.id, this.place, this.nodePath, this.properties.map((property) => values.get(property.identifier) ?? property));
    }
    getReadPlaces() {
        return this.properties;
    }
    get isPure() {
        return true;
    }
}
class ObjectMethodInstruction extends MiscellaneousInstruction {
    id;
    place;
    nodePath;
    key;
    params;
    body;
    computed;
    generator;
    async;
    kind;
    constructor(id, place, nodePath, key, params, body, computed, generator, async, kind) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.key = key;
        this.params = params;
        this.body = body;
        this.computed = computed;
        this.generator = generator;
        this.async = async;
        this.kind = kind;
    }
    rewriteInstruction(values) {
        return new ObjectMethodInstruction(this.id, this.place, this.nodePath, values.get(this.key.identifier) ?? this.key, this.params.map((param) => values.get(param.identifier) ?? param), this.body, this.computed, this.generator, this.async, this.kind);
    }
    getReadPlaces() {
        return [this.key, ...this.params];
    }
}
class ObjectPropertyInstruction extends MiscellaneousInstruction {
    id;
    place;
    nodePath;
    key;
    value;
    computed;
    shorthand;
    constructor(id, place, nodePath, key, value, computed, shorthand) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.key = key;
        this.value = value;
        this.computed = computed;
        this.shorthand = shorthand;
    }
    rewriteInstruction(values) {
        return new ObjectPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.key.identifier) ?? this.key, values.get(this.value.identifier) ?? this.value, this.computed, this.shorthand);
    }
    getReadPlaces() {
        return [this.key, this.value];
    }
}
class SpreadElementInstruction extends MiscellaneousInstruction {
    id;
    place;
    nodePath;
    argument;
    constructor(id, place, nodePath, argument) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.argument = argument;
    }
    rewriteInstruction(values) {
        return new SpreadElementInstruction(this.id, this.place, this.nodePath, values.get(this.argument.identifier) ?? this.argument);
    }
    getReadPlaces() {
        return [this.argument];
    }
    get isPure() {
        return true;
    }
}
class StoreLocalInstruction extends StatementInstruction {
    id;
    place;
    nodePath;
    lval;
    value;
    type;
    constructor(id, place, nodePath, lval, value, type) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.lval = lval;
        this.value = value;
        this.type = type;
    }
    rewriteInstruction(values) {
        return new StoreLocalInstruction(this.id, this.place, this.nodePath, this.lval, values.get(this.value.identifier) ?? this.value, this.type);
    }
    getReadPlaces() {
        return [this.value];
    }
    get isPure() {
        return true;
    }
}
class UnaryExpressionInstruction extends ExpressionInstruction {
    id;
    place;
    nodePath;
    operator;
    argument;
    constructor(id, place, nodePath, operator, argument) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.operator = operator;
        this.argument = argument;
    }
    rewriteInstruction(values) {
        return new UnaryExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.argument.identifier) ?? this.argument);
    }
    getReadPlaces() {
        return [this.argument];
    }
    get isPure() {
        return ["throw", "delete"].includes(this.operator);
    }
}
class UnsupportedNodeInstruction extends BaseInstruction {
    id;
    place;
    nodePath;
    node;
    constructor(id, place, nodePath, node) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.node = node;
    }
    rewriteInstruction(values) {
        for (const [identifier, place] of values) {
            // The only other place we're renaming is in the binding phase of the
            // HIR Builder. So, when we rename here, we need to use the declaration
            // name of the identifier that we're renaming.
            // Since by definition, there can only be one phi node for a variable
            // in a block, it is safe to do this.
            const oldName = `$${identifier.declarationId}_0`;
            const newName = place.identifier.name;
            this.nodePath?.scope.rename(oldName, newName);
        }
        return this;
    }
    getReadPlaces() {
        throw new Error("Unable to get read places for unsupported node");
    }
    get isPure() {
        return false;
    }
}

export { ArrayExpressionInstruction, ArrayPatternInstruction, BaseInstruction, BinaryExpressionInstruction, CallExpressionInstruction, CopyInstruction, ExpressionInstruction, ExpressionStatementInstruction, FunctionDeclarationInstruction, HoleInstruction, JSXElementInstruction, JSXFragmentInstruction, JSXInstruction, JSXTextInstruction, LiteralInstruction, LoadGlobalInstruction, LoadLocalInstruction, LogicalExpressionInstruction, MemberExpressionInstruction, MiscellaneousInstruction, ObjectExpressionInstruction, ObjectMethodInstruction, ObjectPropertyInstruction, PatternInstruction, SpreadElementInstruction, StatementInstruction, StoreLocalInstruction, UnaryExpressionInstruction, UnsupportedNodeInstruction, makeInstructionId };
//# sourceMappingURL=Instruction.js.map
