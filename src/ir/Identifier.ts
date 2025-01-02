/**
 * Simulated opaque type for IdentifierId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueIdentifierId = Symbol();
export type IdentifierId = number & { [opaqueIdentifierId]: "IdentifierId" };

export function makeIdentifierId(id: number): IdentifierId {
  return id as IdentifierId;
}

export function makeIdentifierName(id: IdentifierId): string {
  return `$${id}`;
}

/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueDeclarationId = Symbol();
export type DeclarationId = number & { [opaqueDeclarationId]: "DeclarationId" };

export function makeDeclarationId(id: number): DeclarationId {
  return id as DeclarationId;
}

export class Identifier {
  constructor(
    public readonly id: IdentifierId,
    public readonly name: string,
    public readonly declarationId: DeclarationId
  ) {}
}
