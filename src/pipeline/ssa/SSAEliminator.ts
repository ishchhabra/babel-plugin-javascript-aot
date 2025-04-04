import {
  BasicBlock,
  BlockId,
  CopyInstruction,
  ExpressionStatementInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  StoreLocalInstruction,
} from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Phi } from "./Phi";

interface SSAEliminationResult {
  blocks: Map<BlockId, BasicBlock>;
}

/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export class SSAEliminator {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
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

    return { blocks: this.functionIR.blocks };
  }

  #insertPhiDeclaration(phi: Phi) {
    const declaration = this.moduleIR.environment.declToPlaces.get(
      phi.declarationId,
    )?.[0];
    if (declaration === undefined) {
      throw new Error(`Declaration place not found for ${phi.declarationId}`);
    }

    const declarationBlock = this.functionIR.blocks.get(declaration.blockId);
    if (declarationBlock === undefined) {
      throw new Error(`Declaration block not found for ${phi.declarationId}`);
    }

    const identifier = this.moduleIR.environment.createIdentifier(
      phi.place.identifier.declarationId,
    );
    const place = this.moduleIR.environment.createPlace(identifier);

    const instructionId = makeInstructionId(
      this.moduleIR.environment.nextInstructionId++,
    );
    const declarationPlace = this.moduleIR.environment.places.get(
      declaration.placeId,
    );
    if (declarationPlace === undefined) {
      throw new Error(`Declaration place not found for ${phi.declarationId}`);
    }
    const instruction = new StoreLocalInstruction(
      instructionId,
      place,
      undefined,
      phi.place,
      declarationPlace,
      "let",
    );

    declarationBlock.instructions.push(instruction);
  }

  #insertPhiCopies(phi: Phi) {
    for (const [blockId, place] of phi.operands) {
      const block = this.functionIR.blocks.get(blockId);
      if (block === undefined) {
        throw new Error(`Block not found for ${blockId}`);
      }

      // Step 1: Load the value of the variable into a place.
      const loadId = makeInstructionId(
        this.moduleIR.environment.nextInstructionId++,
      );
      const loadPlace = this.moduleIR.environment.createPlace(
        this.moduleIR.environment.createIdentifier(),
      );
      block.instructions.push(
        new LoadLocalInstruction(loadId, loadPlace, undefined, place),
      );

      // Step 2: Create a copy instruction using the loaded value.
      const copyId = makeInstructionId(
        this.moduleIR.environment.nextInstructionId++,
      );
      const copyPlace = this.moduleIR.environment.createPlace(
        this.moduleIR.environment.createIdentifier(
          phi.place.identifier.declarationId,
        ),
      );
      block.instructions.push(
        new CopyInstruction(copyId, copyPlace, undefined, phi.place, loadPlace),
      );

      // Step 3: Wrap the copy instruction in an expression statement.
      const exprId = makeInstructionId(
        this.moduleIR.environment.nextInstructionId++,
      );
      const exprPlace = this.moduleIR.environment.createPlace(
        this.moduleIR.environment.createIdentifier(),
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

    for (const [blockId, block] of this.functionIR.blocks) {
      const dominators = this.functionIR.dominators.get(blockId)!;
      if (!dominators.has(phi.blockId)) {
        continue;
      }

      block.instructions = block.instructions.map((instruction) =>
        instruction.rewrite(values),
      );
    }
  }
}
