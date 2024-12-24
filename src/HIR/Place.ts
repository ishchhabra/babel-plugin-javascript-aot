import { Identifier } from "./Identifier";

export abstract class Place {
  identifier: Identifier;

  constructor(identifier: Identifier) {
    this.identifier = identifier;
  }
}

export class TemporaryPlace extends Place {
  constructor(identifier: Identifier) {
    super(identifier);
  }
}

export class IdentifierPlace extends Place {
  constructor(identifier: Identifier) {
    super(identifier);
  }
}
