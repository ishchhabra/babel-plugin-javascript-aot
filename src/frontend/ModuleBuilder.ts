import { parse } from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import { Program } from "@babel/types";
import { readFileSync } from "fs";
import { Environment } from "../environment";
import {
  BaseInstruction,
  BasicBlock,
  BlockId,
  makeBlockId,
  Place,
} from "../ir";
import { getBackEdges } from "../pipeline/getBackEdges";
import { getPredecessors } from "../pipeline/getPredecessors";
import {
  getDominanceFrontier,
  getDominators,
  getImmediateDominators,
} from "../pipeline/ssa/dominator-utils";
import { HIRBuilder } from "./HIRBuilder";

const traverse = (_traverse as unknown as { default: typeof _traverse })
  .default;

export interface ModuleUnit {
  path: string;
  environment: Environment;
  blocks: Map<BlockId, BasicBlock>;
  exportToInstructions: Map<string, BaseInstruction>;
  importToPlaces: Map<string, Place>;
  predecessors: Map<BlockId, Set<BlockId>>;
  dominators: Map<BlockId, Set<BlockId>>;
  dominanceFrontier: Map<BlockId, Set<BlockId>>;
  backEdges: Map<BlockId, Set<BlockId>>;
}

export class ModuleBuilder {
  constructor(
    private readonly path: string,
    public readonly environment: Environment,
  ) {}

  public build(): ModuleUnit {
    const code = readFileSync(this.path, "utf-8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript"],
    });

    let programNodePath: NodePath<Program> | undefined;
    traverse(ast, {
      Program: (path) => {
        programNodePath = path;
      },
    });

    if (programNodePath === undefined) {
      throw new Error("Program path not found");
    }

    const { blocks, exportToInstructions, importToPlaces } = new HIRBuilder(
      this.path,
      programNodePath,
      this.environment,
    ).build();

    const predecessors = getPredecessors(blocks);
    const dominators = getDominators(predecessors, makeBlockId(0));
    const iDoms = getImmediateDominators(dominators);
    const dominanceFrontier = getDominanceFrontier(predecessors, iDoms);
    const backEdges = getBackEdges(blocks, dominators, predecessors);

    return {
      path: this.path,
      environment: this.environment,
      blocks,
      exportToInstructions,
      importToPlaces,
      predecessors,
      dominators,
      dominanceFrontier,
      backEdges,
    };
  }
}
