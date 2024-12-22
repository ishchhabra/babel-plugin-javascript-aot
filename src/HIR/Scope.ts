import { DeclarationId } from "./Declaration";
import { Phi } from "./Phi";
import { Place } from "./Place";

export type ScopeId = number;

export abstract class Scope {
  readonly id: ScopeId;
  readonly parent: Scope | null;
  readonly #declarations: Map<string, DeclarationId> = new Map();
  readonly #bindings: Map<DeclarationId, Place> = new Map();
  readonly #phis: Map<DeclarationId, Phi> = new Map();

  constructor(id: ScopeId, parent: Scope | null) {
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

  getDeclarationId(name: string): DeclarationId | undefined {
    return this.#declarations.get(name) ?? this.parent?.getDeclarationId(name);
  }

  setDeclarationId(name: string, declarationId: DeclarationId) {
    this.#declarations.set(name, declarationId);
  }

  renameDeclaration(oldName: string, newName: string): boolean {
    const declarationId = this.#declarations.get(oldName);
    if (declarationId !== undefined) {
      this.#declarations.delete(oldName);
      this.#declarations.set(newName, declarationId);

      return true;
    }

    return this.parent?.renameDeclaration(oldName, newName) ?? false;
  }

  getBinding(declarationId: DeclarationId): Place | undefined {
    return (
      this.#bindings.get(declarationId) ??
      this.parent?.getBinding(declarationId)
    );
  }

  setBinding(declarationId: DeclarationId, place: Place) {
    this.#bindings.set(declarationId, place);
  }

  getPhi(declarationId: DeclarationId): Phi | undefined {
    return this.#phis.get(declarationId) ?? this.parent?.getPhi(declarationId);
  }

  setPhi(declarationId: DeclarationId, phi: Phi) {
    const scope = this.#findDeclarationScope(declarationId) ?? this;
    scope.#phis.set(declarationId, phi);
  }

  getGlobalScope(): GlobalScope | undefined {
    if (this.parent instanceof GlobalScope) {
      return this.parent;
    }

    return this.parent?.getGlobalScope();
  }

  #findDeclarationScope(declarationId: DeclarationId): Scope | undefined {
    if (this.parent !== null) {
      return this.parent.#findDeclarationScope(declarationId);
    }

    return undefined;
  }
}

export class GlobalScope extends Scope {
  constructor(id: ScopeId) {
    super(id, null);
  }
}

abstract class LocalScope extends Scope {
  constructor(id: ScopeId, parent: Scope | null) {
    super(id, parent);
  }

  getFunctionScope(): FunctionScope | undefined {
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
export class FunctionScope extends LocalScope {
  constructor(id: ScopeId, parent: Scope | null) {
    super(id, parent);
  }
}

export class BlockScope extends LocalScope {
  constructor(id: ScopeId, parent: Scope | null) {
    super(id, parent);
  }
}

export function makeScopeId(id: number): ScopeId {
  return id;
}
