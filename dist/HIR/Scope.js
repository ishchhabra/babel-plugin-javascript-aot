"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockScope = exports.FunctionScope = exports.GlobalScope = exports.Scope = void 0;
exports.makeScopeId = makeScopeId;
class Scope {
    id;
    parent;
    #declarations = new Map();
    #bindings = new Map();
    #phis = new Map();
    constructor(id, parent) {
        this.id = id;
        this.parent = parent;
    }
    get phis() {
        return this.#phis;
    }
    get declarations() {
        return this.#declarations;
    }
    get bindings() {
        return this.#bindings;
    }
    getDeclarationId(name) {
        return this.#declarations.get(name) ?? this.parent?.getDeclarationId(name);
    }
    setDeclarationId(name, declarationId) {
        this.#declarations.set(name, declarationId);
    }
    renameDeclaration(oldName, newName) {
        const declarationId = this.#declarations.get(oldName);
        if (declarationId !== undefined) {
            this.#declarations.delete(oldName);
            this.#declarations.set(newName, declarationId);
            return true;
        }
        return this.parent?.renameDeclaration(oldName, newName) ?? false;
    }
    getBinding(declarationId) {
        return (this.#bindings.get(declarationId) ??
            this.parent?.getBinding(declarationId));
    }
    setBinding(declarationId, place) {
        this.#bindings.set(declarationId, place);
    }
    getPhi(declarationId) {
        return this.#phis.get(declarationId) ?? this.parent?.getPhi(declarationId);
    }
    setPhi(declarationId, phi) {
        this.#phis.set(declarationId, phi);
    }
    getGlobalScope() {
        if (this.parent instanceof GlobalScope) {
            return this.parent;
        }
        return this.parent?.getGlobalScope();
    }
}
exports.Scope = Scope;
class GlobalScope extends Scope {
    constructor(id) {
        super(id, null);
    }
}
exports.GlobalScope = GlobalScope;
class LocalScope extends Scope {
    constructor(id, parent) {
        super(id, parent);
    }
    getFunctionScope() {
        if (this.parent instanceof FunctionScope) {
            return this.parent;
        }
        if (this.parent instanceof LocalScope) {
            return this.parent.getFunctionScope();
        }
        return undefined;
    }
}
/**
 * A scope that represents a function.
 *
 * Function scopes are needed because JavaScript's `var` declarations are function-scoped, not block-scoped.
 * Variables declared with `var` are hoisted to their containing function (or global scope), so we need a
 * distinct scope type to handle this behavior correctly during analysis.
 */
class FunctionScope extends LocalScope {
    constructor(id, parent) {
        super(id, parent);
    }
}
exports.FunctionScope = FunctionScope;
class BlockScope extends LocalScope {
    constructor(id, parent) {
        super(id, parent);
    }
}
exports.BlockScope = BlockScope;
function makeScopeId(id) {
    return id;
}
