import { createBlock } from '../ir/utils.js';
import { buildBindings } from './hir/bindings/buildBindings.js';
import { buildNode } from './hir/buildNode.js';

/**
 * Builds the High-Level Intermediate Representation (HIR) from the AST.
 */
class HIRBuilder {
    path;
    program;
    environment;
    exportToInstructions = new Map();
    importToPlaces = new Map();
    currentBlock;
    blocks = new Map();
    constructor(path, program, environment) {
        this.path = path;
        this.program = program;
        this.environment = environment;
        const entryBlock = createBlock(environment);
        this.blocks.set(entryBlock.id, entryBlock);
        this.currentBlock = entryBlock;
    }
    build() {
        buildBindings(this.program, this);
        const bodyPath = this.program.get("body");
        for (const statementPath of bodyPath) {
            buildNode(statementPath, this);
        }
        return {
            blocks: this.blocks,
            exportToInstructions: this.exportToInstructions,
            importToPlaces: this.importToPlaces,
        };
    }
    registerDeclarationName(name, declarationId, nodePath) {
        nodePath.scope.setData(name, declarationId);
    }
    getDeclarationId(name, nodePath) {
        return nodePath.scope.getData(name);
    }
    registerDeclarationPlace(declarationId, place) {
        let places = this.environment.declToPlaces.get(declarationId);
        places ??= [];
        places.push({ blockId: this.currentBlock.id, place });
        this.environment.declToPlaces.set(declarationId, places);
    }
    getLatestDeclarationPlace(declarationId) {
        const places = this.environment.declToPlaces.get(declarationId);
        return places?.at(-1)?.place;
    }
}

export { HIRBuilder };
//# sourceMappingURL=HIRBuilder.js.map
