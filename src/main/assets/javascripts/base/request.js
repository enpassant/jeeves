define(['cookie', 'mithril'], function (Cookies) {
    'use strict';

    var req = {};

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

    var baseExtract = function(xhr, xhrOptions) {
        if (xhr.status >= 400) {
            throw xhr;
        }
        return xhr.response;
    };

    var extract = function(linkVar) {
        return function(xhr, xhrOptions) {
            if (xhr.status >= 400) {
                throw xhr;
            }
            try {
                var links = xhr.getResponseHeader("Link").split(",");
                if (links) {
                    var linkObjs = links.map(parseLink);
                    linkVar(linkObjs);
                }
                var resp = xhr.responseText;
                if (resp) return resp;
            } catch(e) {
                console.log(e);
            }
            return "{}";
        };
    };

    req.head = function(params, linkVar) {
        params.method = 'HEAD';
        params.extract = linkVar ? extract(linkVar) : baseExtract;
        return m.request(params);
    };

    req.send = function(params, linkVar) {
        params.extract = linkVar ? extract(linkVar) : baseExtract;
        return m.request(params);
    };

    return req;
});

