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
  cy.get('[data-cy="continue-btn"]').click();
}

describe("v2 model — diferansiyel test (parite)", () => {
  it("tarayıcıdaki ONNX çıkarımı, Python oracle (tests/parite.py) ile 1e-4 toleransla eşleşir", () => {
    cy.readFile("tests/parite.json").then((parite) => {
      cy.visit("/");
      cy.window({ timeout: 15000 }).should("have.property", "__onnxTahminEt");

      parite.ornekler.forEach((ornek) => {
        const sira = ["seviye_deneyimli", "sahne_no", "karar_suresi_sn", "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar"];
        const vektor = sira.map((f) => ornek.girdi[f]);
        cy.window().then({ timeout: 45000 }, (win) => win.__onnxTahminEt(vektor)).then((p) => {
          expect(Math.abs(p - ornek.p_kotu_son)).to.be.lessThan(parite.tolerans);
        });
      });
    });
  });
});

describe("v2 model — Karar 3 davranış değişikliği (kabul örnek 6-7)", () => {
  it("Karar 1-2'de iki kez riskli (A) seçilince: risk eşiği geçer, Karar 3'te ipucu zorla açılır ve süre sayacı kalkar (seviye=Deneyimliyim olsa da)", () => {
    cy.visit("/", { onBeforeLoad: (win) => win.localStorage.clear() });
    fillOnboarding("Deneyimliyim");
    answerKarar("A");
    answerKarar("A");

    cy.get('[data-cy="p"]', { timeout: 45000 }).should(($el) => {
      expect(parseFloat($el.text())).to.be.gte(0.5);
    });
    cy.get('[data-cy="hint-box"]').should("be.visible");
    cy.get('[data-cy="timer"]').should("not.be.visible");
  });

  it("Karar 1-2'de iki kez veri-odaklı (B) seçilince: risk eşiği geçilmez, Karar 3 seviyeye bağlı v1 davranışını sürdürür", () => {
    // Model, karar süresini de bir özellik olarak kullanıyor (bkz. model/README.md → sınırlar):
    // anlık/düşünmeden tıklama, "veri-odaklı" seçimle birleşse de riskli bir persona sinyali
    // taşıyabilir. Burada gerçekçi bir "düşünerek seçen" oyuncuyu simüle etmek için kısa bir
    // bekleme eklenir (bkz. data/sentetik_uret.py: düşük risk_egilimi → daha uzun karar süresi).
    cy.visit("/", { onBeforeLoad: (win) => win.localStorage.clear() });
    fillOnboarding("Deneyimliyim");
    cy.wait(4500);
    answerKarar("B");
    cy.wait(4500);
    answerKarar("B");

    cy.get('[data-cy="p"]', { timeout: 45000 }).should(($el) => {
      expect(parseFloat($el.text())).to.be.lessThan(0.5);
    });
    cy.get('[data-cy="hint-box"]').should("not.be.visible");
    cy.get('[data-cy="timer"]').should("be.visible");
  });
});
