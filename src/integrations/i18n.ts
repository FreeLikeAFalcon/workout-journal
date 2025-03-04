
// Simple i18n implementation for our app
const i18n = {
  language: 'en',
  changeLanguage: (lng: string) => {
    i18n.language = lng;
    return Promise.resolve();
  }
};

export default i18n;
