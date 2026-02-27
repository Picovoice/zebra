
Cypress.Commands.add("loadTextFile", (path: string) => {
  cy.fixture(path).then(text => {
    return text;
  });
});
