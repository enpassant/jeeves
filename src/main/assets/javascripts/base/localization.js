define([], function () {
    'use strict';

    var loc = {};

    loc.tr = function(msg, value) {
        return msg[value] || value;
    };

    var language = localStorage.lang || navigator.userLanguage || navigator.language;

    loc.format = function(value, type) {
        if (type === 'date') return new Date(value).toLocaleDateString(language);
        else return value;
    };

    return loc;
});
