var Manager = {
    
    $n: function(key) { return 'item-'+key; },
    $: function(key) { return $(Manager.$n(key)); },
    
    setTitle: function(title){
        $('title').set('text', title);
    },
    
    createItem: function(key, data){
        const list = $('list');
        var item = new Element('li'),
            link = new Element('a', {
                id: Manager.$n(key),
                href: '#'+key,
                text: data.name,
                events: {
                    click: function(event){
                        event.stop();
                        var key = this.hash.substr(1);
                        Manager.markCurrent(this);
                        Manager.bindEditForm(key, styleStorage.getItem(key));
                    }
                }
            });
        item.grab(link).inject(list);
        return item;
    },
    
    markCurrent: function(element){
        $$('.current').each(function(c){
            c.erase('class');
        });
        if (typeof element === 'string')
            element = Manager.$(element);
        element.set('class', 'current');
    },
    
    bindForm: function(data, fn){
        const form = $('form');
        
        form.name.set('value', data.name);
        form.domains.set('text', data.domains.join('\n'));
        form.styles.set('text', data.styles);
        
        form.removeEvents('submit'); // Cleanup
        if (fn)
            form.addEvent('submit', fn);
    },
    
    bindEditForm: function(key, data){
        Manager.setTitle(data.name)
        Manager.bindForm(data, function(event){
            event.stop();
            
            data = data;
            data.name = this.name.value;
            data.domains = this.domains.value.split("\n");
            data.styles = this.styles.value;
            
            styleStorage.setItem(key, data);
            safari.self.tab.dispatchMessage('reloadStyles');
            
            // Always update display
            var name = data.name;
            if (this.name.value)
                name = this.name.value;
            Manager.setTitle(name);
            Manager.$(key).set('text', name);
        });
    },
    
    bindNewForm: function(){
        Manager.setTitle('New User CSS');
        Manager.bindForm({'domains':[]}, function(event){
            event.stop();
            console.log('TODO');
        });
    },
    
}

var Site = {
    
    start: function(){
        Site.populateStyles();
        Site.bindEvents();
    },
    
    populateStyles: function(){
        styleStorage.each(Manager.createItem);
    },
    
    bindEvents: function(){
        const link = $('new');
        link.addEvent('click', function(event){
            event.stop();
            Manager.markCurrent(this);
            Manager.bindNewForm();
        });
    },

}

window.addEvent('domready', function(){ Site.start(); });