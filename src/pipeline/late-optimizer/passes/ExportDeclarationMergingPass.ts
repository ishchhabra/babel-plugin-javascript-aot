import {
  BasicBlock,
  BindingIdentifierInstruction,
  ExportNamedDeclarationInstruction,
  FunctionDeclarationInstruction,
  StoreLocalInstruction,
} from "../../../ir";
import { ExportSpecifierInstruction } from "../../../ir/instructions/module/ExportSpecifier";
import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";

/**
 * A pass that merges separate variable declarations and export specifiers
 * back into a single export declaration. For example:
 *
 * ```js
 * const $1_0 = "https://api.example.com";
 * export { $1_0 as API_URL };
 * ```
 *
 * Will be transformed into:
 *
 * ```js
 * export const API_URL = "https://api.example.com";
 * ```
 *
 * Similarly for functions:
 *
 * ```js
 * function $1_0() { return 42; }
 * export { $1_0 as foo };
 * ```
 *
 * Will be transformed into:
 *
 * ```js
 * export function foo() { return 42; }
 * ```
 *
 * This undoes the split introduced by `scope.rename()` in the frontend,
 * which separates `export const X = ...` into a renamed declaration
 * plus an export specifier. The pass:
 *
 * 1. Renames the BindingIdentifier to the exported name
 * 2. Points the ExportNamedDeclaration's `declaration` at the declaration
 *    instruction's place and clears its specifiers
 * 3. Marks StoreLocal instructions as non-emitting (codegen still populates
 *    `generator.places` but does not emit a standalone statement)
 * 4. Removes the now-unnecessary ExportSpecifier
 */
export class ExportDeclarationMergingPass extends BaseOptimizationPass {
  protected step(): OptimizationResult {
    let changed = false;

    for (const block of this.functionIR.blocks.values()) {
      if (this.mergeExportDeclarationsInBlock(block)) {
        changed = true;
      }
    }

    return { changed };
  }

  private mergeExportDeclarationsInBlock(block: BasicBlock): boolean {
    const instrs = block.instructions;
    let changed = false;

    // Collect ExportSpecifier instructions.
    const exportSpecifiers: ExportSpecifierInstruction[] = [];
    for (const instr of instrs) {
      if (instr instanceof ExportSpecifierInstruction) {
        exportSpecifiers.push(instr);
      }
    }

    if (exportSpecifiers.length === 0) {
      return false;
    }

    // Track ExportSpecifiers to remove after iteration.
    const toRemove = new Set<ExportSpecifierInstruction>();

    // For each ExportSpecifier, try to merge with its declaration.
    for (const exportSpec of exportSpecifiers) {
      // Find the BI that defines the local place.
      const bi = instrs.find(
        (instr): instr is BindingIdentifierInstruction =>
          instr instanceof BindingIdentifierInstruction &&
          instr.place.id === exportSpec.localPlace.id,
      );
      if (bi === undefined) continue;

      // Find the declaration that uses this BI — either a StoreLocal (for
      // variables/constants) or a FunctionDeclaration (for named functions).
      const decl = this.findDeclaration(instrs, bi);
      if (decl === undefined) continue;

      // Find the ExportNamedDeclaration that contains this ExportSpecifier.
      const exportDecl = instrs.find(
        (instr): instr is ExportNamedDeclarationInstruction =>
          instr instanceof ExportNamedDeclarationInstruction &&
          instr.specifiers.some((sp) => sp.id === exportSpec.place.id),
      );
      if (exportDecl === undefined) continue;

      // Only merge single-specifier exports. Multi-specifier exports
      // (e.g. `export { a, b }`) would need each specifier handled separately.
      if (exportDecl.specifiers.length !== 1) continue;

      // 1. Rename the BI to the exported name.
      const biIndex = instrs.indexOf(bi);
      instrs[biIndex] = new BindingIdentifierInstruction(
        bi.id,
        bi.place,
        bi.nodePath,
        exportSpec.exported,
      );

      // 2. Suppress the standalone statement for the declaration.
      //    Codegen still runs (populating generator.places) but won't emit
      //    a standalone statement. The ExportNamedDeclaration wraps it instead.
      decl.emit = false;

      // 3. Point the ExportNamedDeclaration at the declaration and clear
      //    its specifiers.
      const exportDeclIndex = instrs.indexOf(exportDecl);
      instrs[exportDeclIndex] = new ExportNamedDeclarationInstruction(
        exportDecl.id,
        exportDecl.place,
        exportDecl.nodePath,
        [],
        decl.place,
      );

      // 4. Mark the ExportSpecifier for removal.
      toRemove.add(exportSpec);

      changed = true;
    }

    // Remove marked ExportSpecifiers in reverse order to preserve indices.
    for (let i = instrs.length - 1; i >= 0; i--) {
      if (toRemove.has(instrs[i] as ExportSpecifierInstruction)) {
        instrs.splice(i, 1);
      }
    }

    return changed;
  }

  /**
   * Finds the declaration instruction that uses the given BI as its binding.
   * This can be either a StoreLocal (lval) or a FunctionDeclaration (identifier).
   */
  private findDeclaration(
    instrs: readonly import("../../../ir").BaseInstruction[],
    bi: BindingIdentifierInstruction,
  ): StoreLocalInstruction | FunctionDeclarationInstruction | undefined {
    for (const instr of instrs) {
      if (
        instr instanceof StoreLocalInstruction &&
        instr.lval.id === bi.place.id
      ) {
        return instr;
      }
      if (
        instr instanceof FunctionDeclarationInstruction &&
        instr.identifier.id === bi.place.id
      ) {
        return instr;
      }
    }
    return undefined;
  }
}
