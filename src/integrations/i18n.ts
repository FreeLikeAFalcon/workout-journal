
// Verbesserte i18n-Implementierung für unsere App
const i18n = {
  language: 'de', // Standardsprache auf Deutsch setzen
  changeLanguage: (lng: string) => {
    i18n.language = lng;
    return Promise.resolve();
  }
};

export default i18n;
