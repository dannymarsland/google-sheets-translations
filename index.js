var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var WorksheetTranslations = require('./worksheet-translations');

function getTranslationsFromSpreadsheet(doc, cb) {        
    doc.getInfo(function(err, info) {
        if (err) {
            cb(err);
        } else {
            console.log('Loaded doc: ' + info.title);  
              async.map(info.worksheets, getTranslationsFromWorksheet, cb);
          }
    });
}

function getTranslationsFromWorksheet(worksheet, cb) {
    console.log('Getting translations for : ' + worksheet.title);
    worksheet.getRows({}, function(err, rows) {
        if (err) {
            cb(err)
        } else {
            var translations = {};
            var locales = [];
            rows.forEach( function(row) {
                var token = row.token;
                if (token) {
                    if (translations[token]) {
                        console.warn('Overriding duplicate translation for: ' + token + ' in worksheet: ' + worksheet.title);
                    }
                    translations[token] = {};
                    Object.keys(row)
                    .filter(function(key) {
                        return typeof row[key] != 'function';
                    })
                    .filter(isValidLocale)
                    .forEach( function(locale){
                        if (locales.indexOf(locale) === -1) {
                            locales.push(locale);
                        }
                        translations[token][locale] = row[locale];
                    });
                } else {
                    console.error('Column "token" is not defined for worksheet ' + worksheet.title);
                }
            });
            cb(null, new WorksheetTranslations(worksheet.title, translations, locales));
        }
    });
}

function updateWorksheetTokens(worksheet, tokens, cb) {
    console.log('Updating translation tokens for : ' + worksheet.title);
    worksheet.getRows({}, function(err, rows) {
        if (err) {
            cb(err)
        } else {
            var currentTokens = rows.map(function(row) {
                return row.token;
            }).filter(function(token){
                return token && token.length;
            });
            var missingTokens = tokens.filter(function(token) {
                return currentTokens.indexOf(token) === -1;
            });

            console.log('Following tokens were missing in the translations spreadsheet: ' + missingTokens.join(','));

            async.eachSeries(missingTokens, function(token, next) {
                console.log('Adding token: ' + token);

                worksheet.addRow({'token': token}, next);
            }, cb);
        }
    });
}


function isValidLocale(locale) {
    //return locale !== 'id' && /^[a-zA-Z]{2}(_[a-zA-Z]{2})?$/.test(locale);
    return locale !== 'id' && locale !== 'token' && /^[a-zA-Z]+([_-][a-zA-Z]+)?$/.test(locale);
}

function updateSpreadsheetWithTranslations(doc, spreadsheetTranslations, cb) {
    var addTranslations = function(worksheetTranslations, cb) {
        addWorksheetTranslations(doc, worksheetTranslations, cb);
    };
    async.eachSeries(spreadsheetTranslations, addTranslations, cb);
}

function updateSpreadsheetWithTokens(doc, tokens, cb) {
    doc.getInfo(function(err, info) {
        if (err) {
            cb(err);
        } else {
            console.log('Loaded doc: ' + info.title);
            async.map(info.worksheets, function(worksheet, next) {
                updateWorksheetTokens(worksheet, tokens, next);
            }, cb);
        }
    });
}


function addWorksheetTranslations(doc, worksheetTranslations, cb) {
    var headers = [].concat('token', worksheetTranslations.getLocales());
    var worksheet;
    async.series([
        function(next) {
            doc.addWorksheet({
                    title: worksheetTranslations.getTitle(),
                    headers: headers},
                function(error, sheet) {
                    if (error) {
                        next(error);
                    } else {
                        worksheet = sheet;
                        next();
                    }
                }
            )
        },
        function(next) {
           async.eachSeries(worksheetTranslations.getTokens(), function(token, next) {
               var translations = worksheetTranslations.getTranslationsForToken(token);
               translations['token'] = token;
              worksheet.addRow(translations, next);
           }, next)
        }
    ], cb);
}

module.exports.createTranslationsSpreadsheet = function(spreadsheetId, spreadsheetTranslations, credentials, cb) {
    var doc = new GoogleSpreadsheet(spreadsheetId);
    doc.useServiceAccountAuth(credentials, function(error) {
        if (error) {
            cb(error)
        } else {
            updateSpreadsheetWithTranslations(doc, spreadsheetTranslations, cb);
        }
    });
};

module.exports.loadTranslations = function(spreadsheetId, credentials, cb) {
    var doc = new GoogleSpreadsheet(spreadsheetId);    
    if (typeof credentials === 'function') {
        cb = credentials;
        getTranslationsFromSpreadsheet(doc, cb);
    } else {
        doc.useServiceAccountAuth(credentials, function(error) {
            if (error) {
                cb(error)
            } else {
                getTranslationsFromSpreadsheet(doc, cb);
            }
        });
    }
};

module.exports.updateTokens = function(spreadsheetId, tokens, credentials, cb) {
    var doc = new GoogleSpreadsheet(spreadsheetId);
    if (typeof credentials === 'function') {
        cb = credentials;
        updateSpreadsheetWithTokens(doc, tokens, cb);
    } else {
        doc.useServiceAccountAuth(credentials, function(error) {
            if (error) {
                cb(error)
            } else {
                updateSpreadsheetWithTokens(doc, tokens, cb);
            }
        });
    }
};

module.exports.WorksheetTranslations = WorksheetTranslations;
