import { DeclarationId } from "./Declaration";
import { Phi } from "./Phi";
import { Place } from "./Place";

export type ScopeId = number;

export class Scope {
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
    this.#phis.set(declarationId, phi);
  }
}

export function makeScopeId(id: number): ScopeId {
  return id;
}
