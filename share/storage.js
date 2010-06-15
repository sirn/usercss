var styleStorage = {
    
    getItem: function(key) {
        var jsonString = localStorage.getItem(key);
        if (jsonString) {
            var data = JSON.parse(jsonString);
            if (!data.name)
                data.name = key;
            return data;
        }
        return;
    },
    
    setItem: function(key, data) {
        var jsonString = JSON.stringify(data);
        localStorage.setItem(key, jsonString);
        return;
    },
    
    removeItem: function(key) {
        localStorage.removeItem(key);
        return;
    },
    
    each: function(fn) {
        for (var i = localStorage.length - 1; i >= 0; i--){
            var key = localStorage.key(i),
                data = styleStorage.getItem(key);
            data.key = key;
            fn(key, data);
        };
    },
    
    makeConsistent: function() {
        styleStorage.each(function(key, data){
            // Build 2: enable/disable checkbox.
            if (data.enabled == undefined) {
                data.enabled = true;
                styleStorage.setItem(key, data);
            }
            // Build 3: support for exclusions.
            if (data.excludes == undefined) {
                data.excludes = [];
                styleStorage.setItem(key, data)
            }
        });
    },
    
}