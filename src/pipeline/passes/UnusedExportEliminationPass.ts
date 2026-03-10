import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BaseInstruction } from "../../ir";
import {
  ExportDefaultDeclarationInstruction,
  ExportFromInstruction,
  ExportNamedDeclarationInstruction,
  ExportSpecifierInstruction,
} from "../../ir/instructions/module";

/**
 * Removes exports from non-entry modules that are not imported by any other
 * module in the project. The entry module's exports are never removed because
 * they face the outside world.
 *
 * This pass runs at the module level, before per-function optimization passes.
 */
export class UnusedExportEliminationPass {
  private readonly entryModules: Set<string>;

  constructor(
    private readonly projectUnit: ProjectUnit,
    entryModules: string[],
  ) {
    this.entryModules = new Set(entryModules);
  }

  public run(): void {
    // 1) Collect the set of (source, importedName) pairs across all modules.
    const importedNames = new Map<string, Set<string>>();

    for (const moduleIR of this.projectUnit.modules.values()) {
      for (const global of moduleIR.globals.values()) {
        if (global.kind === "import") {
          if (!importedNames.has(global.source)) {
            importedNames.set(global.source, new Set());
          }
          importedNames.get(global.source)!.add(global.name);
        }
      }
    }

    // 2) For each non-entry module, remove exports that no other module imports.
    for (const [modulePath, moduleIR] of this.projectUnit.modules) {
      // Never touch entry modules' exports.
      if (this.entryModules.has(modulePath)) {
        continue;
      }

      const usedExportNames = importedNames.get(modulePath) ?? new Set();

      // Find which export names are unused.
      const unusedExportNames = new Set<string>();
      for (const exportName of moduleIR.exports.keys()) {
        if (!usedExportNames.has(exportName)) {
          unusedExportNames.add(exportName);
        }
      }

      if (unusedExportNames.size === 0) {
        continue;
      }

      // Collect the set of instruction references that belong to unused exports,
      // BEFORE deleting from the map.
      const deadExportInstructions = new Set<BaseInstruction>();
      for (const name of unusedExportNames) {
        const entry = moduleIR.exports.get(name);
        if (entry) {
          deadExportInstructions.add(entry.instruction);
        }
      }

      // Remove the unused exports from the moduleIR.exports map.
      for (const name of unusedExportNames) {
        moduleIR.exports.delete(name);
      }

      // Remove the corresponding export instructions from all function blocks.
      for (const functionIR of moduleIR.functions.values()) {
        for (const block of functionIR.blocks.values()) {
          block.instructions = block.instructions.filter((instr) => {
            // Remove ExportSpecifierInstruction for unused exports.
            if (instr instanceof ExportSpecifierInstruction) {
              return !unusedExportNames.has(instr.exported);
            }

            // Remove ExportNamedDeclarationInstruction if it's one of the dead ones.
            if (instr instanceof ExportNamedDeclarationInstruction) {
              return !deadExportInstructions.has(instr);
            }

            // Remove ExportFromInstruction if all its specifiers are unused,
            // or filter out individual unused specifiers.
            if (instr instanceof ExportFromInstruction) {
              instr.specifiers = instr.specifiers.filter(
                (s) => !unusedExportNames.has(s.exported),
              );
              return instr.specifiers.length > 0;
            }

            // Remove ExportDefaultDeclarationInstruction for unused "default" export.
            if (instr instanceof ExportDefaultDeclarationInstruction) {
              return !unusedExportNames.has("default");
            }

            return true;
          });
        }
      }
    }
  }
}
