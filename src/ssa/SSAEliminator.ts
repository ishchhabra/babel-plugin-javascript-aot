import { Environment } from "../compiler";
import {
  BasicBlock,
  BlockId,
  createIdentifier,
  createPlace,
  ExpressionStatementInstruction,
  makeInstructionId,
  StoreLocalInstruction,
} from "../ir";
import { CopyInstruction, LoadLocalInstruction } from "../ir/Instruction";
import { Phi } from "./Phi";

interface SSAEliminationResult {
  blocks: Map<BlockId, BasicBlock>;
}

/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export class SSAEliminator {
  constructor(
    private readonly environment: Environment,
    private readonly blocks: Map<BlockId, BasicBlock>,
    private readonly phis: Set<Phi>
  ) {}

  public eliminate(): SSAEliminationResult {
    for (const phi of this.phis) {
      // Ignore phis with only one operand since they are redundant.
      if (phi.operands.size <= 1) {
        continue;
      }

      this.#insertPhiDeclaration(phi);
      // NOTE: We need to replace phi usages before inserting copies, otherwise
      // the copies will be rewritten as well, making it `phi = phi`.
      this.#replacePhiUsages(phi);
      this.#insertPhiCopies(phi);
    }

    return { blocks: this.blocks };
  }

  #insertPhiDeclaration(phi: Phi) {
    const declarationId = phi.place.identifier.declarationId;
    const declaration = this.environment.declToPlaces.get(declarationId)?.[0];
    if (declaration === undefined) {
      throw new Error(`Declaration place not found for ${declarationId}`);
    }

    const declarationBlock = this.blocks.get(declaration.blockId);
    if (declarationBlock === undefined) {
      throw new Error(`Declaration block not found for ${declarationId}`);
    }

    const identifier = createIdentifier(this.environment, declarationId);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    const instruction = new StoreLocalInstruction(
      instructionId,
      place,
      undefined,
      phi.place,
      declaration.place,
      "let"
    );

    declarationBlock.instructions.push(instruction);
  }

  #insertPhiCopies(phi: Phi) {
    for (const [blockId, place] of phi.operands) {
      const block = this.blocks.get(blockId);
      if (block === undefined) {
        throw new Error(`Block not found for ${blockId}`);
      }

      // Step 1: Load the value of the variable into a place.
      const loadId = makeInstructionId(this.environment.nextInstructionId++);
      const loadPlace = createPlace(
        createIdentifier(this.environment),
        this.environment
      );
      block.instructions.push(
        new LoadLocalInstruction(loadId, loadPlace, undefined, place)
      );

      // Step 2: Create a copy instruction using the loaded value.
      const copyId = makeInstructionId(this.environment.nextInstructionId++);
      const copyPlace = createPlace(
        createIdentifier(this.environment),
        this.environment
      );
      block.instructions.push(
        new CopyInstruction(copyId, copyPlace, undefined, phi.place, loadPlace)
      );

      // Step 3: Wrap the copy instruction in an expression statement.
      const exprId = makeInstructionId(this.environment.nextInstructionId++);
      const exprPlace = createPlace(
        createIdentifier(this.environment),
        this.environment
      );
      block.instructions.push(
        new ExpressionStatementInstruction(
          exprId,
          exprPlace,
          undefined,
          copyPlace
        )
      );
    }
  }

  #replacePhiUsages(phi: Phi) {
    const values = new Map(
      Array.from(phi.operands.values()).map((place) => [
        place.identifier,
        phi.place,
      ])
    );

    for (const [blockId, block] of this.blocks) {
      const dominators = this.environment.dominators.get(blockId)!;
      if (!dominators.has(phi.blockId)) {
        continue;
      }

      block.instructions = block.instructions.map((instruction) =>
        instruction.rewriteInstruction(values)
      );
    }
  }
}
