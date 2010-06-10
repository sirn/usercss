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
    },
    
    setField: function(key, field, value) {
        var item = styleStorage.getItem(key);
        if (item) {
            item[field] = value;
            styleStorage.setItem(key, item);
        }
    },
    
    each: function(fn) {
        for (var i = localStorage.length - 1; i >= 0; i--){
            var key = localStorage.key(i),
                data = styleStorage.getItem(key);
            data.key = key;
            fn(key, data);
        };
    },
    
}