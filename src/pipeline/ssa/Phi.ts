import { BlockId, IdentifierId, Place } from "../../frontend/ir";

export function makePhiIdentifierName(id: IdentifierId): string {
  return `phi_${id}`;
}

/**
 * Represents a Phi node in the SSA form.
 */
export class Phi {
  constructor(
    public readonly blockId: BlockId,
    public readonly place: Place,
    public readonly operands: Map<BlockId, Place>,
  ) {}
}
