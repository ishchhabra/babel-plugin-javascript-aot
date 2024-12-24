import { IdentifierId } from "./Identifier";
import { Place } from "./Place";

export type TPrimitiveValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

export abstract class Value {
  abstract kind: "Primitive" | "Load";

  abstract cloneWithPlaces(places: Map<IdentifierId, Place>): Value;
}

export class PrimitiveValue extends Value {
  kind: "Primitive";
  value: TPrimitiveValue;

  constructor(value: TPrimitiveValue) {
    super();
    this.kind = "Primitive";
    this.value = value;
  }

  cloneWithPlaces(): PrimitiveValue {
    return this;
  }
}

export class LoadValue extends Value {
  kind: "Load";
  place: Place;

  constructor(place: Place) {
    super();
    this.kind = "Load";
    this.place = place;
  }

  cloneWithPlaces(places: Map<IdentifierId, Place>): LoadValue {
    return new LoadValue(places.get(this.place.identifier.id) ?? this.place);
  }
}
