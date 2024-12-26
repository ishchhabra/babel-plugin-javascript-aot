import { Bindings, BlockId, DeclarationId, TemporaryPlace } from "../HIR";
import { makeIdentifierName } from "../HIR/Identifier";

import { Place } from "../HIR";
import { makeDeclarationId } from "../HIR/Declaration";
import { makeIdentifierId } from "../HIR/Identifier";

export class Environment {
  bindings: Bindings = new Map();

  nextDeclarationId = 0;
  nextIdentifierId = 0;

  createPlace(
    { declarationId }: { declarationId?: DeclarationId } = {
      declarationId: undefined,
    },
  ): Place {
    const identifierId = makeIdentifierId(this.nextIdentifierId++);
    return new TemporaryPlace({
      id: identifierId,
      declarationId:
        declarationId ?? makeDeclarationId(this.nextDeclarationId++),
      name: makeIdentifierName(identifierId),
    });
  }

  setBinding(declarationId: DeclarationId, blockId: BlockId, place: Place) {
    let declarationBindings = this.bindings.get(declarationId);
    if (!declarationBindings) {
      declarationBindings = new Map();
      this.bindings.set(declarationId, declarationBindings);
    }
    declarationBindings.set(blockId, place);
  }
}
