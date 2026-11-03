const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
    video: true,
    videosFolder: "cypress/videos",
    // Bu makinede arka planda ağır uygulamalar (ör. yerel LLM, oyun launcher'ı) çalışırken
    // Electron'un basit bir tıklama sonrası DOM güncellemesi bile birkaç saniye gecikebiliyor;
    // varsayılan 4000ms gerçek bir mantık hatası yokken de testleri flaky yapıyordu.
    defaultCommandTimeout: 20000,
  },
});
