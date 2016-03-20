define(['mithril'], function (m) {
    'use strict';

    const req = {};

    const dequote = function(str) {
        if (str[0] === '"') return str.substring(1, str.length-1);
        return str;
    };

    const parseLink = function(link) {
        const linkObj = {};
        const re = /<([^>]+)>(.*)/g;
        const result = re.exec(link.trim());
        if (result && result.length >= 3) {
            linkObj.url = result[1];
            const linkArr = result[2].split(";");
            const linkObjArr = linkArr.map(function(linkItem) {
                const linkItemArr = linkItem.trim().split("=");
                if (linkItemArr.length >= 2) {
                    const value = dequote(linkItemArr[1]);
                    linkObj[linkItemArr[0]] = value;
                }
            });
        }
        return linkObj;
    };

    const baseExtract = function(xhr, xhrOptions) {
        if (xhr.status >= 400) {
            throw xhr;
        }
        return xhr.response;
    };

    const extract = function(linkVar) {
        return function(xhr, xhrOptions) {
            if (xhr.status >= 400) {
                throw xhr;
            }
            try {
                const links = xhr.getResponseHeader("Link");
                if (links) {
                    const linkObjs = links.split(",").map(parseLink);
                    linkVar(linkObjs);
                }
                const resp = xhr.responseText;
                if (resp) return resp;
            } catch(e) {
                console.log(e);
            }
            return "{}";
        };
    };

    req.head = function(url, linkVar) {
        const link = { method: 'HEAD', fullUrl: url };
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

