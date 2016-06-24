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
    console.log('Getting translations for : '+ worksheet.title);
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
                        console.warn('Overiding duplicate translation for: ' + token + ' in worksheet: ' + worksheet.title);
                    }
                    translations[token] = {}
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

function isValidLocale(locale) {
    //return locale !== 'id' && /^[a-zA-Z]{2}(_[a-zA-Z]{2})?$/.test(locale);
    return locale !== 'id' && locale !== 'token' && /^[a-zA-Z]+([_-][a-zA-Z]+)?$/.test(locale);
}

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
}
