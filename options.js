var storage = chrome.storage.sync;
var runtime = chrome.runtime;

var el = function(obj) {
    return document.getElementById(obj);
};

function save() {
    var key = this.id;
    var value = this.value;
    if (value.length) {
        var opts = {};
        opts[key] = value;
        storage.set(opts);
    } else {
        storage.remove(key);
    }
}

function restore() {
    storage.get(
        null,
        function(items) {
            console.log(items);
            var keys = Object.keys(items);
            for (idx in keys) {
                var key = keys[idx];
                var value = items[key];
                var dom = el(key);
                if (dom) {
                    dom.value = value;
                }
            }
        }
    );
}

function reload() {
    runtime.sendMessage({});
}

function reset() {
    storage.clear();
    window.location = window.location;
}

document.addEventListener('DOMContentLoaded', restore);
el('fp').addEventListener('blur', save);
el('fp').addEventListener('blur', reload);

el('reset').addEventListener('click', reset);
el('reload').addEventListener('click', reload);