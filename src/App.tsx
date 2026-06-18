import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";


import { SettingsProvider } from "./contexts/SettingsContext";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </I18nextProvider>
  );
}

export default App;
