import {
  BaseInstruction,
  BlockId,
  createPlace,
  DeclarationId,
  Identifier,
  LoadLocalInstruction,
  Place,
} from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { LoadPhiInstruction } from "../../ir/instructions/memory/LoadPhiInstruction";
import { Phi } from "./Phi";
import { createPhiIdentifier } from "./utils";

export interface SSA {
  phis: Set<Phi>;
}

/**
 * Computes the phis for the HIR.
 */
export class SSABuilder {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
  ) {}

  public build(): SSA {
    const phis = this.computePhiNodes();
    this.populatePhiOperands(phis);
    this.rewritePhiReferences(phis);
    return { phis };
  }

  /**
   * Gathers all the φ-nodes needed for every variable that has multiple definitions
   * in different blocks.
   */
  private computePhiNodes(): Set<Phi> {
    const phis = new Set<Phi>();

    for (const [declarationId, places] of this.moduleIR.environment
      .declToPlaces) {
      const definitionBlocks = places.map((p) => p.blockId);
      if (definitionBlocks.length <= 1) {
        continue;
      }

      this.insertPhiNodesForDeclaration(
        declarationId,
        places,
        definitionBlocks,
        phis,
      );
    }

    return phis;
  }

  /**
   * For a single declaration, inserts φ-nodes into the dominance frontier of
   * all definition blocks. Uses a standard "workList + dominanceFrontier" approach.
   */
  private insertPhiNodesForDeclaration(
    declarationId: DeclarationId,
    places: { blockId: BlockId; place: Place }[],
    definitionBlocks: BlockId[],
    phis: Set<Phi>,
  ): void {
    const workList = [...definitionBlocks];
    const hasPhi = new Set<BlockId>();

    while (workList.length > 0) {
      const definitionBlock = workList.pop()!;
      const frontier = this.functionIR.dominanceFrontier.get(definitionBlock);
      if (frontier === undefined) {
        continue;
      }

      for (const blockId of frontier) {
        if (hasPhi.has(blockId)) {
          continue;
        }

        // Insert new φ-node
        const identifier = createPhiIdentifier(this.moduleIR.environment);
        const place = createPlace(identifier, this.moduleIR.environment);
        phis.add(new Phi(blockId, place, new Map(), declarationId));
        hasPhi.add(blockId);

        // Record that this block now also defines the variable
        places.push({ blockId, place });

        // If blockId wasn't already in the definition list, add it to the workList
        if (!definitionBlocks.includes(blockId)) {
          workList.push(blockId);
        }
      }
    }
  }

  /**
   * After computing the φ-nodes, populate each φ-node's map from predecessorBlock -> place.
   * This tells the φ-node which place from each predecessor block flows into it.
   */
  private populatePhiOperands(phis: Set<Phi>): void {
    for (const phi of phis) {
      // For each predecessor of the φ's block, find the place that variable was defined in
      const predecessors = this.functionIR.predecessors.get(phi.blockId);
      if (!predecessors) {
        continue;
      }

      const places = this.moduleIR.environment.declToPlaces.get(
        phi.declarationId,
      );
      if (!places) {
        continue;
      }

      for (const predecessor of predecessors) {
        const place = places.find((p) => p.blockId === predecessor)?.place;
        // If the variable is not defined in the predecessor, ignore it.
        // This occurs with back edges in loops, where the variable is defined
        // within the loop body but not in the block that enters the loop.
        // The variable definition exists in the loop block (a predecessor)
        // but not in the original entry block.
        if (place === undefined) {
          continue;
        }

        phi.operands.set(predecessor, place);
      }
    }
  }

  /**
   * Rewrites references in all blocks that are dominated by each φ's block.
   * Whenever an instruction refers to one of the φ's operand identifiers,
   * replace it with a LoadPhiInstruction referencing the φ-place.
   */
  private rewritePhiReferences(phis: Set<Phi>): void {
    for (const phi of phis) {
      const rewriteMap = new Map(
        Array.from(phi.operands.values()).map((place) => [
          place.identifier,
          phi.place,
        ]),
      );

      const phiBlock = this.functionIR.blocks.get(phi.blockId)!;
      phiBlock.instructions = phiBlock.instructions.map((instruction) =>
        this.rewriteInstruction(instruction, rewriteMap),
      );
    }
  }

  private rewriteInstruction<T extends BaseInstruction>(
    instruction: T,
    values: Map<Identifier, Place>,
  ): T | LoadPhiInstruction {
    if (
      instruction instanceof LoadLocalInstruction &&
      values.has(instruction.value.identifier)
    ) {
      return new LoadPhiInstruction(
        instruction.id,
        instruction.place,
        instruction.nodePath,
        values.get(instruction.value.identifier)!,
      );
    }

    return instruction.rewriteInstruction(values) as T;
  }
}
