function isUrlInsideList(url, blacklist) {
    for (var idx = 0; idx < blacklist.length; idx++) {
        var enc = blacklist[idx];
        var regex = new RegExp(enc, 'i');
        if (regex.test(url)) {
            return true;
        }
    }
    return false;
}

function convertListToRegExp(text) {
    var lines = [];
    if (text) {
        lines = text.split(/\n/gm);
    }
    var blacklist = [];
    for (var idx = 0; idx < lines.length; idx++) {
        var regex = lines[idx];
        if (regex.length) {
            regex = regex.replace(/\//g, '\\/'); //=/->\/
            regex = regex.replace(/\./g, '\\.'); //=.->\.
            regex = regex.replace(/\*\*/g, '.+'); //=**->.+
            regex = regex.replace(/\*/g, '[^/]+'); //=*->[^/]+
            blacklist.push(regex);
        }
    }
    return blacklist;
}

var opts = {};
opts.blacklist = [];

chrome.storage.sync.get(
    null,
    function(items) {
        var text = items.text;
        opts.blacklist = convertListToRegExp(text);
    }
);

chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
        var url = info.url;
        var blacklist = opts.blacklist;
        if (isUrlInsideList(url, blacklist)) {
            return {
                cancel: true
            };
        } else {
            return {
                cancel: false
            };
        }
    }, {
        urls: [
            "<all_urls>"
        ]
    }, [
        "blocking"
    ]
);