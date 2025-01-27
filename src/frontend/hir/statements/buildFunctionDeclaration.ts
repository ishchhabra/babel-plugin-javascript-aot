import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../../../babel-utils";
import {
  createInstructionId,
  FunctionDeclarationInstruction,
} from "../../../ir";
import { buildIdentifier } from "../buildIdentifier";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildFunctionDeclaration(
  nodePath: NodePath<t.FunctionDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const idPath = nodePath.get("id");
  if (!idPath.isIdentifier()) {
    throw new Error("Invalid function declaration");
  }

  const identifierPlace = buildIdentifier(idPath, functionBuilder);

  const paramPaths = nodePath.get("params");
  const bodyPath = nodePath.get("body");
  const functionIR = new FunctionIRBuilder(
    paramPaths,
    bodyPath,
    functionBuilder.environment,
    moduleBuilder,
  ).build();

  const functionName = getFunctionName(nodePath);
  if (functionName === null) {
    throw new Error("Invalid function declaration");
  }

  const declarationId = functionBuilder.getDeclarationId(
    functionName.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Function accessed before declaration: ${functionName.node.name}`,
    );
  }

  const functionPlace =
    functionBuilder.getLatestDeclarationPlace(declarationId);
  if (functionPlace === undefined) {
    throw new Error(
      `Unable to find the place for ${functionName.node.name} (${declarationId})`,
    );
  }

  functionBuilder.addInstruction(
    new FunctionDeclarationInstruction(
      createInstructionId(functionBuilder.environment),
      functionPlace,
      nodePath,
      identifierPlace,
      functionIR,
      nodePath.node.generator,
      nodePath.node.async,
    ),
  );

  return functionPlace;
}
