define([], function () {
    'use strict';

    const loc = {};

    loc.tr = function(msg, value) {
        return msg[value] || value;
    };

    const language = localStorage.lang || navigator.userLanguage || navigator.language;

    loc.format = function(value, type) {
        if (type === 'date') return new Date(value).toLocaleDateString(language);
        else return value;
    };

    return loc;
});
