import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      loadTextFile(path: string): Chainable<string>;
    }
  }
}