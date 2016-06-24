function WorksheetTranslations(title, translations, locales) {
	var self = this;
	self.locales = locales;
	self.translations = translations;
	self.title = title;

	self.getTitle = function() {
		return self.title;
	};

	self.getLocales = function() {
		return self.locales;
	};

	self.getTranslationsForToken = function(token) {
		return self.translations[token] || {};
	};

	self.getTranslationsForLocale = function(locale) {
		var localeTranslations = {};
		Object.keys(self.translations).forEach(function(token) {
			localeTranslations[token] = self.translations[token][locale];
		});
		return localeTranslations;
	};
}

module.exports = WorksheetTranslations;