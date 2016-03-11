define(['mithril'], function (m) {
    'use strict';

    var req = {};

    var parseLink = function(link) {
        var linkObj = {};
        var re = /<([^>]+)>(.*)/g;
        var result = re.exec(link.trim());
        if (result && result.length >= 3) {
            linkObj.url = result[1];
            var linkArr = result[2].split(";");
            var linkObjArr = linkArr.map(function(linkItem) {
                var linkItemArr = linkItem.trim().split("=");
                if (linkItemArr.length >= 2) {
                    var value = linkItemArr[1];
                    if (value[0] === '"') value = value.substring(1, value.length-1);
                    linkObj[linkItemArr[0]] = value;
                }
            });
        }
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
                var links = xhr.getResponseHeader("Link");
                if (links) {
                    var linkObjs = links.split(",").map(parseLink);
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

    req.head = function(url, linkVar) {
        var link = { method: 'HEAD', fullUrl: url };
        return req.sendLink(link, {}, linkVar);
    };

    req.sendData = function(link, data, contentType, linkVar) {
        return req.sendLink(link, {data: data}, linkVar, contentType);
    };

    req.sendLink = function(link, params, linkVar, contentType) {
        params.serialize = function(data) {
            return JSON.stringify(data);
        };
        params.deserialize = function(data) {
            return JSON.parse(data);
        };
        params.method = link.method;
        params.url = link.fullUrl;
        params.config = function(xhr, xhrOptions) {
            if (sessionStorage.tokenId) {
                xhr.setRequestHeader("X-Auth-Token", sessionStorage.tokenId);
            }
            if (link.type) {
                xhr.setRequestHeader("Accept", link.type);
            }
            if (contentType) {
                xhr.setRequestHeader("Content-Type", contentType + "; charset=utf-8");
            }
            return xhr;
        };
        params.extract = linkVar ? extract(linkVar) : baseExtract;
        return m.request(params);
    };

    return req;
});

