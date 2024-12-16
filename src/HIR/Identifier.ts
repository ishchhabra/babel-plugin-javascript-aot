import { DeclarationId } from "./Declaration";

export type IdentifierId = number;

export type Identifier = {
  id: IdentifierId;
  name: string;
  declarationId: DeclarationId;
};

export function makeIdentifierId(id: number): IdentifierId {
  return id;
}

export function makeIdentifierName(id: IdentifierId): string {
  return `$${id}`;
}
