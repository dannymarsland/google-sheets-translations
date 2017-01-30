
var spreadsheetId = '1490bY-8fvcd-kdMdAu8dLn8fSK-oZydE0dBaPTn0BI8';
var spreadsheetTranslations = require('../index');
var fs = require('fs');

var newTokens = [
    'TOKEN_' +Date.now(),
    'TOKEN2_' +Date.now()
];

spreadsheetTranslations.updateTokens(spreadsheetId, newTokens, __dirname + '/easy-rollouts-3ee98a59bcf6.json', function(error) {
	if (error) {
		console.error(error);
	} else {
		console.log('Success');
	}
});
