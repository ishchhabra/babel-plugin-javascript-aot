import { BlockId, IdentifierId, Place } from "../HIR";

export interface Phi {
  source: BlockId;
  place: Place;
  operands: Map<BlockId, Place>;
}

export function makePhiName(id: IdentifierId): string {
  return `$p${id}`;
}
