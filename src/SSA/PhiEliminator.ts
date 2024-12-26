import {
  Bindings,
  Block,
  BlockId,
  DeclarationId,
  Place,
  TemporaryPlace,
} from "../HIR";
import { resolveBinding } from "../HIR/HIRBuilder";
import { makeIdentifierId, makeIdentifierName } from "../HIR/Identifier";
import {
  AssignmentExpressionInstruction,
  ExpressionStatementInstruction,
  LoadLocalInstruction,
  StoreLocalInstruction,
} from "../HIR/Instruction";
import { Phi } from "./Phi";

export function eliminatePhis(
  bindings: Bindings,
  blocks: Map<BlockId, Block>,
  phis: Set<Phi>,
) {
  new PhiEliminator(bindings, blocks, phis).eliminate();
}

// TODO: Phi elimination not working correctly for basic test case:
// - Not creating declarations at top of function
// - Not replacing variable access at merge points after if/else
// - Incorrect handling of SSA variable assignments and phi nodes
export class PhiEliminator {
  #bindings: Bindings;
  #blocks: Map<BlockId, Block>;
  #phis: Set<Phi>;

  #nextIdentifierId = 100;

  constructor(bindings: Bindings, blocks: Map<BlockId, Block>, phis: Set<Phi>) {
    this.#bindings = bindings;
    this.#blocks = blocks;
    this.#phis = phis;
  }

  public eliminate(): Map<BlockId, Block> {
    for (const phi of this.#phis) {
      const declarationId = phi.place.identifier.declarationId;
      const declarationBindings = this.#bindings.get(declarationId);
      if (declarationBindings === undefined) {
        continue;
      }

      const declarationPlace = this.#getDeclarationPlace(declarationId, phi);
      this.#renameDeclaration(declarationPlace, phi);

      const declarationInstruction = this.#findDeclarationInstruction(
        declarationPlace,
        phi,
      );
      if (declarationInstruction) {
        declarationInstruction.type = "let";
      }

      const block = this.#blocks.get(phi.definition);
      if (block === undefined) {
        continue;
      }

      // For each predecessor, add move instructions at the end of the block
      for (const [predBlockId, predPlace] of phi.operands.entries()) {
        const predBlock = this.#blocks.get(predBlockId);
        if (!predBlock) {
          continue;
        }

        // Create an identifier for the phi target
        const phiTargetId = makeIdentifierId(this.#nextIdentifierId++);
        const phiTarget = new TemporaryPlace({
          id: phiTargetId,
          name: phi.place.identifier.name, // Use the original phi name
          declarationId: phi.place.identifier.declarationId,
        });

        // Load the value from predecessor
        const loadInstructionPlace = this.#createTemporaryPlace(
          phi.place.identifier.declarationId,
        );
        const loadInstruction = new LoadLocalInstruction(
          0,
          loadInstructionPlace,
          predPlace,
        );

        // Use AssignmentExpression instead of StoreLocal
        const assignTarget = this.#createTemporaryPlace(
          phi.place.identifier.declarationId,
        );
        const assignInstruction = new AssignmentExpressionInstruction(
          0,
          assignTarget,
          phiTarget,
          loadInstructionPlace,
        );

        const target = this.#createTemporaryPlace(
          phi.place.identifier.declarationId,
        );
        const expressionStatement = new ExpressionStatementInstruction(
          0,
          target,
          assignTarget,
        );

        predBlock.instructions.push(
          loadInstruction,
          assignInstruction,
          expressionStatement,
        );
      }

      // Finally, remove the phi node after replacing it
      for (let i = 0; i < block.instructions.length; i++) {
        const instruction = block.instructions[i];
        if (instruction instanceof StoreLocalInstruction) {
          // Replace phi usages with the actual assigned value
          if (instruction.value === phi.place) {
            instruction.value = phi.operands.get(phi.definition)!;
          }
        }
      }

      this.#removePhiNodeFromBlock(phi, block);
    }

    return this.#blocks;
  }

  #getDeclarationPlace(declarationId: DeclarationId, phi: Phi): Place {
    const declarationPlace = resolveBinding(
      this.#bindings,
      this.#blocks,
      declarationId,
      phi.definition,
    );
    return declarationPlace;
  }

  #renameDeclaration(declarationPlace: Place, phi: Phi) {
    declarationPlace.identifier.name = phi.place.identifier.name;
  }

  #findDeclarationInstruction(
    declarationPlace: Place,
    phi: Phi,
  ): StoreLocalInstruction | undefined {
    const block = this.#blocks.get(phi.definition);
    if (block === undefined) {
      return undefined;
    }

    return block.instructions.find(
      (instruction): instruction is StoreLocalInstruction =>
        instruction instanceof StoreLocalInstruction &&
        instruction.target === declarationPlace,
    );
  }

  #removePhiNodeFromBlock(phi: Phi, block: Block) {
    block.instructions = block.instructions.filter(
      (instruction) =>
        !(
          instruction instanceof StoreLocalInstruction &&
          instruction.target === phi.place
        ),
    );
  }

  #createTemporaryPlace(declarationId: DeclarationId): Place {
    const identifierId = makeIdentifierId(this.#nextIdentifierId++);
    return new TemporaryPlace({
      id: identifierId,
      name: makeIdentifierName(identifierId),
      declarationId: declarationId,
    });
  }
}
//
