import { BlockId } from "./Block";
import { Place } from "./Place";

export interface Phi {
  source: BlockId;
  place: Place;
  operands: Map<BlockId, Place>;
}
