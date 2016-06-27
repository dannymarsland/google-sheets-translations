function WorksheetTranslations(title, translations, locales) {
    var self = this;
    self.locales = locales || [];
    self.translations = translations || {};
    self.title = title;

    self.getTitle = function () {
        return self.title;
    };

    self.getLocales = function () {
        return self.locales;
    };

    self.getTranslationsForToken = function (token) {
        return self.translations[token] || {};
    };

    self.getTranslationsForLocale = function (locale) {
        var localeTranslations = {};
        Object.keys(self.translations).forEach(function (token) {
            localeTranslations[token] = self.translations[token][locale];
        });
        return localeTranslations;
    };

    self.getTokens = function () {
        return Object.keys(self.translations);
    };

    self.addLocale = function (locale, translations) {
        if (self.locales.indexOf(locale) !== -1) {
            throw new Error('cannot add locale ' + locale + ' as it already exists')
        }
        Object.keys(translations)
            .forEach(function (key) {
                if (!self.translations[key]) {
                    self.translations[key] = {};
                }
                self.translations[key][locale] = translations[key];


            });
        self.locales.push(locale);
    };
}

module.exports = WorksheetTranslations;
