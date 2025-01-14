import { ModuleUnit } from "../../frontend/ModuleBuilder";
import {
  BasicBlock,
  BlockId,
  CopyInstruction,
  createIdentifier,
  createPlace,
  ExpressionStatementInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  StoreLocalInstruction,
} from "../../ir";
import { Phi } from "./Phi";

interface SSAEliminationResult {
  blocks: Map<BlockId, BasicBlock>;
}

/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export class SSAEliminator {
  constructor(
    private readonly moduleUnit: ModuleUnit,
    private readonly phis: Set<Phi>,
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

    return { blocks: this.moduleUnit.blocks };
  }

  #insertPhiDeclaration(phi: Phi) {
    const declaration = this.moduleUnit.environment.declToPlaces.get(
      phi.declarationId,
    )?.[0];
    if (declaration === undefined) {
      throw new Error(`Declaration place not found for ${phi.declarationId}`);
    }

    const declarationBlock = this.moduleUnit.blocks.get(declaration.blockId);
    if (declarationBlock === undefined) {
      throw new Error(`Declaration block not found for ${phi.declarationId}`);
    }

    const identifier = createIdentifier(
      this.moduleUnit.environment,
      phi.place.identifier.declarationId,
    );
    const place = createPlace(identifier, this.moduleUnit.environment);

    const instructionId = makeInstructionId(
      this.moduleUnit.environment.nextInstructionId++,
    );
    const instruction = new StoreLocalInstruction(
      instructionId,
      place,
      undefined,
      phi.place,
      declaration.place,
      "let",
    );

    declarationBlock.instructions.push(instruction);
  }

  #insertPhiCopies(phi: Phi) {
    for (const [blockId, place] of phi.operands) {
      const block = this.moduleUnit.blocks.get(blockId);
      if (block === undefined) {
        throw new Error(`Block not found for ${blockId}`);
      }

      // Step 1: Load the value of the variable into a place.
      const loadId = makeInstructionId(
        this.moduleUnit.environment.nextInstructionId++,
      );
      const loadPlace = createPlace(
        createIdentifier(this.moduleUnit.environment),
        this.moduleUnit.environment,
      );
      block.instructions.push(
        new LoadLocalInstruction(loadId, loadPlace, undefined, place),
      );

      // Step 2: Create a copy instruction using the loaded value.
      const copyId = makeInstructionId(
        this.moduleUnit.environment.nextInstructionId++,
      );
      const copyPlace = createPlace(
        createIdentifier(
          this.moduleUnit.environment,
          phi.place.identifier.declarationId,
        ),
        this.moduleUnit.environment,
      );
      block.instructions.push(
        new CopyInstruction(copyId, copyPlace, undefined, phi.place, loadPlace),
      );

      // Step 3: Wrap the copy instruction in an expression statement.
      const exprId = makeInstructionId(
        this.moduleUnit.environment.nextInstructionId++,
      );
      const exprPlace = createPlace(
        createIdentifier(this.moduleUnit.environment),
        this.moduleUnit.environment,
      );
      block.instructions.push(
        new ExpressionStatementInstruction(
          exprId,
          exprPlace,
          undefined,
          copyPlace,
        ),
      );
    }
  }

  #replacePhiUsages(phi: Phi) {
    const values = new Map(
      Array.from(phi.operands.values()).map((place) => [
        place.identifier,
        phi.place,
      ]),
    );

    for (const [blockId, block] of this.moduleUnit.blocks) {
      const dominators = this.moduleUnit.dominators.get(blockId)!;
      if (!dominators.has(phi.blockId)) {
        continue;
      }

      block.instructions = block.instructions.map((instruction) =>
        instruction.rewriteInstruction(values),
      );
    }
  }
}
