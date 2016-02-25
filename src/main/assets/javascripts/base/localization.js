define(['cookie', 'mithril-translate'], function (Cookies) {
    'use strict';

    var loc = {};

    loc.tr = function(value) {
        return value;
    };

    mx.translate.configure( { infix: '/lang/messages_' , suffix: '.json' } );
    var language = (Cookies.get("lang") ||
            navigator.userLanguage || navigator.language).split("-")[0];

    loc.format = function(value, type) {
        if (type === 'date') return new Date(value).toLocaleDateString(language);
        else return value;
    };

    loc.loader = mx.translate.use(language);
    loc.loader.then(function() {
        loc.tr = function(value) {
            return mx.translate(value) || value;
        };
    });

    loc.convert = function(msgFun) {
        loc.loader.then(function() {
            var msg = msgFun();
            for (var key in msg) {
                if (msg.hasOwnProperty(key)) {
                    msg[key] = loc.tr(msg[key]);
                }
            }
            msgFun(msg);
        });
    };

    return loc;
});
