var Manager = {
    
    $n: function(key) { return 'item-'+key; },
    $p: function(key) { return $(Manager.$n(key)); },
    $a: function(key) { return Manager.$p(key).getChildren('a')[0]; },
    
    setTitle: function(title){
        $('title').set('text', title);
    },
    
    createItem: function(key, data){
        const list = $('list');
        var item = new Element('li', {id: Manager.$n(key)}),
            link = new Element('a', {
                'class': 'selector',
                href: '#'+key,
                text: data.name,
                events: {
                    click: function(event){
                        var key = this.hash.substr(1);
                        Manager.markCurrent(this);
                        Manager.bindEditForm(key, styleStorage.getItem(key));
                    }
                }
            }),
            delete_link = new Element('a', {
                'class': 'delete',
                href: '#delete'+key,
                text: '[delete]',
                events: {
                    click: function(event){
                        var key = this.hash.substr(7),
                            element = Manager.$p(key);
                        
                        if (Manager.$a(key).hasClass('current')) {
                            var prev = element.getPrevious(),
                                next = element.getNext();
                            if (next) {
                                next.getChildren('a')[0].fireEvent('click');
                            } else if (prev) {
                                prev.getChildren('a')[0].fireEvent('click');
                            } else {
                                $('new').fireEvent('click');
                            }
                        }
                        element.destroy();
                        styleStorage.removeItem(key);
                        safari.self.tab.dispatchMessage('reloadStyles');
                    }
                }
            });
        item.grab(link).grab(delete_link).inject(list);
        return item;
    },
    
    markCurrent: function(element){
        $$('.current').each(function(c){
            c.removeClass('current');
        });
        if (typeof element === 'string')
            element = Manager.$a(element);
        element.addClass('current');
    },
    
    constructDataFromForm: function(data, form){
        data.name = form.name.value;
        data.domains = form.domains.value.split('\n');
        data.styles = form.styles.value;
        return data;
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
            
            data = Manager.constructDataFromForm(data, this);
            styleStorage.setItem(key, data);
            safari.self.tab.dispatchMessage('reloadStyles');
            
            // Always update display
            var name = data.name;
            if (this.name.value)
                name = this.name.value;
            Manager.setTitle(name);
            Manager.$a(key).set('text', name);
        });
    },
    
    bindNewForm: function(){
        Manager.setTitle('New User CSS');
        Manager.bindForm({'domains':[]}, function(event){
            event.stop();
            
            var data = Manager.constructDataFromForm({}, this),
                key = new Date().getTime();
            if (data.styles && data.domains) {
                styleStorage.setItem(key, data);
                if (!data.name)
                    data.name = key;
                var item = Manager.createItem(key, data);
                item.getChildren('a')[0].fireEvent('click');
                safari.self.tab.dispatchMessage('reloadStyles');
            }
        });
    },
    
}

var Site = {
    
    start: function(){
        Site.populateStyles();
        Site.bindEvents();
        $('new').fireEvent('click');
    },
    
    populateStyles: function(){
        styleStorage.each(Manager.createItem);
    },
    
    bindEvents: function(){
        const link = $('new');
        link.addEvent('click', function(event){
            Manager.markCurrent(this);
            Manager.bindNewForm();
        });
    },
    
}

window.addEvent('domready', function(){ Site.start(); });