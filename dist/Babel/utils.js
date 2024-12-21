"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionName = getFunctionName;
function getFunctionName(path) {
    if (path.isFunctionDeclaration()) {
        const id = path.get("id");
        if (id.isIdentifier()) {
            return id;
        }
        return null;
    }
    return null;
}
