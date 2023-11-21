// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your e2e test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands"

beforeEach(() => {
  if (Cypress.env("autoLogin")) {
    cy.loginWithSession(Cypress.env("username"), Cypress.env("password"))
  }
})

Cypress.on("uncaught:exception", (_err, _runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
