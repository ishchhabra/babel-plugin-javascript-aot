import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildVariableDeclaration(
  nodePath: NodePath<t.VariableDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place | Place[] | undefined {
  const declarations = nodePath.get("declarations");
  const declarationPlaces = declarations.map((declaration) => {
    const id = declaration.get("id");
    const lvalPlace = buildNode(id, functionBuilder, moduleBuilder);
    if (lvalPlace === undefined || Array.isArray(lvalPlace)) {
      throw new Error("Lval place must be a single place");
    }

    const init: NodePath<t.Expression | null | undefined> =
      declaration.get("init");
    let valuePlace: Place | Place[] | undefined;
    if (!init.hasNode()) {
      init.replaceWith(t.identifier("undefined"));
      init.assertIdentifier({ name: "undefined" });
      valuePlace = buildNode(init, functionBuilder, moduleBuilder);
    } else {
      valuePlace = buildNode(init, functionBuilder, moduleBuilder);
    }
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
      throw new Error("Value place must be a single place");
    }

    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(
      new StoreLocalInstruction(
        instructionId,
        place,
        nodePath,
        lvalPlace,
        valuePlace,
        "const",
      ),
    );

    return place;
  });

  return declarationPlaces;
}
