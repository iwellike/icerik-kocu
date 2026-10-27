function fillOnboarding(seviye) {
  cy.get(`[data-field="seviye"][data-value="${seviye}"]`).click();
  cy.get('[data-field="rol"][data-value="Bireysel içerik üretici"]').click();
  cy.get('[data-field="hedef"][data-value="Erişim/takipçi büyütmek"]').click();
  cy.get('[data-cy="start-btn"]').should("not.be.disabled").click();
}

function answerKarar(key) {
  cy.get(`[data-cy="karar-option"][data-key="${key}"]`).click();
  cy.get('[data-cy="reflection-input"]').type("Çünkü bu mantıklı geldi.");
  cy.get('[data-cy="submit-reflection"]').should("not.be.disabled").click();
  cy.get('[data-cy="tutor-box"]').should("be.visible");
  cy.get('[data-cy="tutor-text"]').should("not.be.empty");
  cy.get('[data-cy="continue-btn"]').click();
}

function playPath(choices) {
  cy.visit("/", { onBeforeLoad: (win) => win.localStorage.clear() });
  fillOnboarding("Yeni başlıyorum");
  choices.forEach((key) => answerKarar(key));
}

describe("İçerik Koçu — Primer", () => {
  it("onboarding tamamlanmadan Başla kilitli, 3 soru cevaplanınca açılır", () => {
    cy.visit("/", { onBeforeLoad: (win) => win.localStorage.clear() });
    cy.get('[data-cy="start-btn"]').should("be.disabled");
    fillOnboarding("Yeni başlıyorum");
    cy.get('[data-cy="screen-karar"]').should("be.visible");
    cy.get('[data-cy="hint-box"]').should("be.visible");
    cy.get('[data-cy="timer"]').should("not.be.visible");
  });

  // Tüm 8 yol: 3 karar x 2 seçenek (A=riskli, B=veri-odaklı)
  const paths = [
    ["A", "A", "A"], ["A", "A", "B"], ["A", "B", "A"], ["A", "B", "B"],
    ["B", "A", "A"], ["B", "A", "B"], ["B", "B", "A"], ["B", "B", "B"],
  ];

  paths.forEach((choices) => {
    const score = choices.filter((c) => c === "B").length;
    const expected = score >= 2 ? "Son A" : "Son B";

    it(`yol ${choices.join("-")} → puan ${score} → ${expected}`, () => {
      playPath(choices);
      cy.get('[data-cy="screen-son"]').should("be.visible");
      cy.get('[data-cy="son-title"]').should("contain.text", expected);
      cy.get('[data-cy="son-score"]').should("contain.text", `${score}/3`);
    });
  });

  it("Deneyimliyim seçilince süre sayacı görünür ve 60s dolunca riskli seçenek otomatik seçilir", () => {
    cy.clock();
    cy.visit("/", { onBeforeLoad: (win) => win.localStorage.clear() });
    fillOnboarding("Deneyimliyim");

    cy.get('[data-cy="timer"]').should("be.visible");
    cy.get('[data-cy="hint-box"]').should("not.be.visible");

    cy.tick(60000);
    cy.get('[data-cy="reflection-box"]').should("be.visible");
    cy.get('[data-cy="karar-option"][data-key="A"]').should("have.class", "selected");
  });

  it("Baştan Başla, onboarding'e döner ve state'i sıfırlar", () => {
    playPath(["B", "B", "B"]);
    cy.get('[data-cy="restart-btn"]').click();
    cy.get('[data-cy="screen-onboarding"]').should("be.visible");
    cy.get('[data-cy="start-btn"]').should("be.disabled");
  });
});
