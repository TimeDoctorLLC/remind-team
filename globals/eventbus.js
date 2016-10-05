var debug = require('debug');
var _ = require('underscore');

/*
    Holds event listeners and triggers those events.
    Represents an event bus.
*/
module.exports = (function() {
    
    function instance(id) {

        var handler = {
            debug: debug(id),
            id: id ? id : _.uniqueId('eb'),
            listeners: {}
        };
        
        handler.trigger = function(ev, data) {
            if (handler.listeners[ev]) {
                for (var e = 0; e < handler.listeners[ev].length; e++) {
                    var res = handler.listeners[ev][e].apply(this, data);
                    if (res === false) {
                        return;
                    }
                }
            } else {
                handler.debug('No listener for', ev);
            }
        };
        
        handler.on = function(ev, cb) {
            handler.debug('Adding listener for ' + ev);
            var evs = ev.split(/\,/g);
            for (var e in evs) {
                if (!handler.listeners[evs[e]]) {
                    handler.listeners[evs[e]] = [];
                }
                handler.listeners[evs[e]].push(cb);
            }
            return this;
        };
        
        handler.clear = function() {
            handler.debug('Removing all listeners');
            handler.listeners = {};
        };
                    
        return handler;
    }
    
    return {
        instance: instance
    };
    
})();