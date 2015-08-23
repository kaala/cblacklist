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
opts.enabled = true;
opts.blacklist = [];

function readList() {
    opts.blacklist = [];
    chrome.storage.sync.get(
        null,
        function(items) {
            var fp = items.fp;
            if (fp) {
                var oReq = new XMLHttpRequest();
                oReq.onload = function() {
                    var text = this.responseText;
                    console.log(text);
                    opts.blacklist = convertListToRegExp(text);
                };
                oReq.open("get", fp, true);
                oReq.send();
            }
        }
    );

}

chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
        if (!opts.enabled) {
            return {
                cancel: false
            }
        }
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

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        readList();
    }
);

readList();
