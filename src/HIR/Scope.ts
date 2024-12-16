import { Phi } from "./Phi";
import { Place } from "./Place";

export type ScopeId = number;

export class Scope {
  readonly id: ScopeId;
  readonly parent: Scope | null;
  readonly #bindings: Map<string, Place> = new Map();
  readonly #phis: Map<string, Phi> = new Map();

  constructor(id: ScopeId, parent: Scope | null) {
    this.id = id;
    this.parent = parent;
  }

  get phis() {
    return this.#phis;
  }

  getVariablePlace(name: string): Place | undefined {
    const place = this.#bindings.get(name);
    if (place !== undefined) {
      return place;
    }

    return this.parent?.getVariablePlace(name);
  }

  setVariablePlace(name: string, place: Place) {
    this.#bindings.set(name, place);
  }

  getVariablePhi(name: string): Phi | undefined {
    const phi = this.#phis.get(name);
    if (phi !== undefined) {
      return phi;
    }

    return this.parent?.getVariablePhi(name);
  }

  setVariablePhi(name: string, phi: Phi) {
    this.#phis.set(name, phi);
  }
}

export function makeScopeId(id: number): ScopeId {
  return id;
}
