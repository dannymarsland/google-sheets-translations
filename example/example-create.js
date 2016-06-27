
var spreadsheetId = '1490bY-8fvcd-kdMdAu8dLn8fSK-oZydE0dBaPTn0BI8';
var spreadsheetTranslations = require('../index');
var WorksheetTranslations = spreadsheetTranslations.WorksheetTranslations;
var fs = require('fs');


var worksheetTranslations = new WorksheetTranslations('TEST');

worksheetTranslations.addLocale('en_US', require('./TEST.en_US.json'));
worksheetTranslations.addLocale('de_DE', require('./TEST.de_DE.json'));

spreadsheetTranslations.createTranslationsSpreadsheet(spreadsheetId, [worksheetTranslations], __dirname + '/easy-rollouts-3ee98a59bcf6.json', function(error) {
	if (error) {
		console.error(error);
	} else {
		console.log('success');
	}
});
