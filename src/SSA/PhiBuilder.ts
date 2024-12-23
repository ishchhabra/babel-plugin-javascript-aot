import { Block, BlockId } from "../HIR/Block";
import { Phi } from "./Phi";

export class PhiBuilder {
  #blocks: Map<BlockId, Block>;

  constructor(blocks: Map<BlockId, Block>) {
    this.#blocks = blocks;
  }

  build(): Set<Phi> {
    return new Set();
  }
}
