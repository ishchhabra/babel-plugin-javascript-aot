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
  abstract cloneWithPlaces(places: Map<IdentifierId, Place>): Value;
}

export class PrimitiveValue extends Value {
  value: TPrimitiveValue;

  constructor(value: TPrimitiveValue) {
    super();
    this.value = value;
  }

  cloneWithPlaces(): PrimitiveValue {
    return this;
  }
}

export class LoadValue extends Value {
  place: Place;

  constructor(place: Place) {
    super();
    this.place = place;
  }

  cloneWithPlaces(places: Map<IdentifierId, Place>): LoadValue {
    return new LoadValue(places.get(this.place.identifier.id) ?? this.place);
  }
}
