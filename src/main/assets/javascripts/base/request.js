define(['cookie', 'mithril'], function (Cookies) {
    'use strict';

    var req = {};

    req.head = function(params, linkVar) {
        params.method = 'HEAD';
        if (linkVar) params.extract = req.extract(linkVar);
        return m.request(params);
    };

    req.send = function(params, linkVar) {
        if (linkVar) params.extract = req.extract(linkVar);
        return m.request(params);
    };

    var parseLink = function(link) {
        var linkArr = link.trim().split(";");
        var linkObj = {};
        var linkObjArr = linkArr.map(function(linkItem) {
            var linkItemArr = linkItem.trim().split("=");
            if (linkItemArr.length >= 2) {
                var value = linkItemArr[1];
                if (value[0] === '"') value = value.substring(1, value.length-1);
                linkObj[linkItemArr[0]] = value;
            }
            else linkObj.url = linkItemArr[0].substring(1, linkItemArr[0].length-1);
        });
        return linkObj;
    };

    req.extract = function(linkVar) {
        return function(xhr, xhrOptions) {
            var links = xhr.getResponseHeader("Link").split(",");
            if (links) {
                var linkObjs = links.map(parseLink);
                linkVar(linkObjs);
            }
            var resp = xhr.responseText;
            if (resp) return resp;
            return "{}";
        };
    };

    return req;
});

