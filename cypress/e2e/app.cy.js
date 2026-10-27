describe("İçerik Koçu", () => {
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });
  });

  it("onboarding ekranını gösterir ve niş seçince ana panele geçer", () => {
    cy.get('[data-cy="screen-onboarding"]').should("be.visible");
    cy.get('[data-niche="Fitness"]').click();

    cy.get('[data-cy="screen-home"]').should("be.visible");
    cy.get("#home-greeting").should("contain.text", "Fitness");
    cy.get("#progress-label").should("contain.text", "0/4");
  });

  it("bir senaryoyu tamamlar, rozet kazanır ve ana panelde görünür", () => {
    cy.get('[data-niche="Yemek"]').click();

    cy.get('[data-cy="scenario-card"]').first().click();
    cy.get('[data-cy="screen-scenario"]').should("be.visible");
    cy.get("#scenario-situation").should("contain.text", "Yemek");

    cy.get('[data-cy="scenario-option"]').first().click();
    cy.get('[data-cy="reflection-box"]').should("be.visible");
    cy.get('[data-cy="submit-reflection"]').should("be.disabled");

    cy.get("#reflection-input").type("Çünkü veriye bakmak daha güvenli geldi.");
    cy.get('[data-cy="submit-reflection"]').should("not.be.disabled").click();

    cy.get('[data-cy="screen-result"]').should("be.visible");
    cy.get('[data-cy="badge-earned"]').should("contain.text", "Rozet kazandın");
    cy.get('[data-cy="result-text"]').should("not.be.empty");
    cy.get('[data-cy="research-tip"]').should("contain.text", "Araştır");

    cy.get("#back-to-home-2").click();
    cy.get("#progress-label").should("contain.text", "1/4");
    cy.get('[data-cy="badge-row"]').find(".badge-pill").should("have.length", 1);
  });

  it("tamamlanmış bir senaryoya tekrar girince sonucu (seçenekleri değil) gösterir", () => {
    cy.get('[data-niche="Moda"]').click();
    cy.get('[data-cy="scenario-card"]').first().click();
    cy.get('[data-cy="scenario-option"]').first().click();
    cy.get("#reflection-input").type("Test yansıması");
    cy.get('[data-cy="submit-reflection"]').click();
    cy.get("#back-to-home-2").click();

    cy.get('[data-cy="scenario-card"]').first().should("have.class", "done").click();
    cy.get('[data-cy="screen-result"]').should("be.visible");
  });

  it("baştan başla, uygulamayı sıfırlar", () => {
    cy.get('[data-niche="Fitness"]').click();
    cy.get('[data-cy="reset-btn"]').click();
    cy.get('[data-cy="screen-onboarding"]').should("be.visible");
  });
});
