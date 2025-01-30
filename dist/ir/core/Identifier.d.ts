/**
 * Simulated opaque type for IdentifierId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueIdentifierId: unique symbol;
export type IdentifierId = number & {
    [opaqueIdentifierId]: "IdentifierId";
};
export declare function makeIdentifierId(id: number): IdentifierId;
export declare function makeIdentifierName(declarationId: DeclarationId, version: number): string;
/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueDeclarationId: unique symbol;
export type DeclarationId = number & {
    [opaqueDeclarationId]: "DeclarationId";
};
export declare function makeDeclarationId(id: number): DeclarationId;
export declare class Identifier {
    readonly id: IdentifierId;
    readonly version: string;
    readonly declarationId: DeclarationId;
    constructor(id: IdentifierId, version: string, declarationId: DeclarationId);
    get name(): string;
}
export {};
