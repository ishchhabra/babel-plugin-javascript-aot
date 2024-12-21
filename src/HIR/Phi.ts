import { BlockId } from "./Block";
import { IdentifierId } from "./Identifier";
import { Place } from "./Place";

export interface Phi {
  source: BlockId;
  place: Place;
  operands: Map<BlockId, Place>;
}

export function makePhiName(id: IdentifierId): string {
  return `$p${id}`;
}
