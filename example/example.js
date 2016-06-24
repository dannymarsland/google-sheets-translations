
var spreadsheetId = '1490bY-8fvcd-kdMdAu8dLn8fSK-oZydE0dBaPTn0BI8';
var spreadsheetTranslations = require('../index');
var fs = require('fs');

spreadsheetTranslations.loadTranslations(spreadsheetId, function(error, spreadsheetTranslations) {
	if (error) {
		console.error(error);
	} else {
		spreadsheetTranslations.forEach(function(worksheetTranslations) {
			var brand = worksheetTranslations.getTitle();
			worksheetTranslations.getLocales().forEach(function(locale) {
				var filename = __dirname + '/data/' + brand.toUpperCase() + '.' + locale + '.json'; 
				fs.writeFileSync(filename, JSON.stringify(worksheetTranslations.getTranslationsForLocale(locale), null, 4));
			})
		});
	}
});
