import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import messages from './local/index';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: Localization.getLocales()[0]?.languageCode || 'en',
    fallbackLng: 'en',
    debug: false,
    resources: messages,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
