"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
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
}
exports.Scope = Scope;
function makeScopeId(id) {
    return id;
}
