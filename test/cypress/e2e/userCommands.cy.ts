/* eslint-disable cypress/unsafe-to-chain-command */
describe("User Commands", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.dataCy("menu-button").click()
    cy.dataCy("menu-container")
      .contains("general")
      .click()
    cy.url().should("include", "/channel/")
  })

  it.only("Non existing command", () => {
    cy.dataCy("command-bar")
      .click()
      .clear().type("/some non existing command")
    cy.dataCy("command-bar")
      .get('[type="submit"]').click()

    cy.contains(".q-notification__message", "Invalid command")
  })

  it("Command Join", () => {
    cy.dataCy("command-bar")
      .click()
      .clear().type("asd")

    cy.dataCy("command-bar").get('[type="submit"]').click()
  })
})
