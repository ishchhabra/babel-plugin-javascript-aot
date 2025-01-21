import { Identifier } from "./Identifier";
/**
 * Simulated opaque type for PlaceId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaquePlaceId: unique symbol;
export type PlaceId = number & {
    [opaquePlaceId]: "PlaceId";
};
export declare function makePlaceId(id: number): PlaceId;
/**
 * Represents a storage space in the intermediate representation (IR).
 */
export declare class Place {
    readonly id: PlaceId;
    readonly identifier: Identifier;
    constructor(id: PlaceId, identifier: Identifier);
}
export {};
