const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
    video: true,
    videosFolder: "cypress/videos",
    // Yerel makinede arka plan yükü altında varsayılan 4000ms bazen dar geliyor; model
    // yüklemesi gibi gerçekten yavaş adımlar zaten kendi dosyalarında (model.cy.js) daha
    // yüksek bir timeout kullanıyor, bu sadece genel bir güvenlik payı.
    defaultCommandTimeout: 8000,
  },
});
