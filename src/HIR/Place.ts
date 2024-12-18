import { Identifier } from "./Identifier";

export class Place {
  kind: "Identifier";
  identifier: Identifier;

  constructor(identifier: Identifier) {
    this.kind = "Identifier";
    this.identifier = identifier;
  }
}
