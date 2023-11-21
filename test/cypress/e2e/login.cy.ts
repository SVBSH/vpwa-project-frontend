/* eslint-disable cypress/unsafe-to-chain-command */
describe("Log user in", { env: { autoLogin: false } }, () => {
  beforeEach(() => {
    cy.visit("/")

    cy.dataCy("login-form")
      .find('[aria-label="Nickname"]')
      .as("inputUsername")

    cy.dataCy("login-form")
      .find('[aria-label="Password"]')
      .as("inputPassword")
    cy.dataCy("login-form").contains("button", "Login").as("loginButton")
  })

  it("Log user in with valid creadentials", () => {
    cy.get("@inputUsername").next().contains("Nickname")

    cy.dataCy("login-form").contains("button", "Create account")

    // Log user in
    cy.get("@inputUsername").clear().type(Cypress.env("username"))
    cy.get("@inputPassword").clear().type(Cypress.env("password"))
    cy.get("@loginButton").click()
    cy.url().should("not.include", "/login")
  })

  it.skip("Try to log user in without credentials", () => {
    cy.get("@inputUsername").clear()
    cy.get("@inputPassword").clear()
    cy.get("@loginButton").click()

    cy.get("[role='alert']").should("have.length", 2).each(element => {
      expect(element).to.have.text("Please type something")
    })

    cy.url().should("include", "/login")
  })
})
