export type PrimitiveValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

export type Value = {
  kind: "Primitive";
  value: PrimitiveValue;
};
