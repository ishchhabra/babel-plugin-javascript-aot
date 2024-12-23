import { BlockId } from "../HIR/Block";
import { IdentifierId } from "../HIR/Identifier";
import { Place } from "../HIR/Place";

export interface Phi {
  source: BlockId;
  place: Place;
  operands: Map<BlockId, Place>;
}

export function makePhiName(id: IdentifierId): string {
  return `$p${id}`;
}
