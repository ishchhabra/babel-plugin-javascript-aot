/**
 * Simulated opaque type for PlaceId to prevent using normal numbers as ids
 * accidentally.
 */
function makePlaceId(id) {
    return id;
}
/**
 * Represents a storage space in the intermediate representation (IR).
 */
class Place {
    id;
    identifier;
    constructor(id, identifier) {
        this.id = id;
        this.identifier = identifier;
    }
}

export { Place, makePlaceId };
//# sourceMappingURL=Place.js.map
