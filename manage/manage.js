var Site = {
    
    /*
     * start: call initialize methods.
     */
    start: function(){
        Site.populateStyles();
        Site.bindEvents();
    },
    
    /*
     * populateStyles: populate style list and bind events to each item.
     */
    populateStyles: function(){
        const list = $('list');
        styleStorage.each(function(data){
            var name = data.key;
            if (data.name)
                name = data.name;
            var item = new Element('li'),
                link = new Element('a', {
                    text: name,
                    href: '#'+data.key,
                    events: {
                        click: function(event){
                            event.stop();
                            var key = this.hash.substr(1),
                                data = styleStorage.getItem(key);
                            
                            $$('.current').each(function(c){
                                c.erase('class');
                            });
                            this.set('class', 'current');
                            
                            Site.bindToForm(data);
                        }
                    }
                });
            item.grab(link).inject(list);
        });
    },
    
    /*
     * bindEvents: bind default events to page elements.
     */
    bindEvents: function(){
        const new_link = $('new');
        new_link.addEvent('click', function(event){
            event.stop();
            console.log('Clicked');
        });
    },
    
    /*
     * bindToForm: fill form with provided data and bind events accordingly.
     */
    bindToForm: function(data){
        const form = $('form'),
              title = $('title'),
              input_name = $$('input[name="name"]')[0],
              input_domains = $$('textarea[name="domains"]')[0],
              input_styles = $$('textarea[name="styles"]')[0],
              input_submit = $$('input[type="submit"]')[0];
        
        var name = data.key;
        if (data.name)
            name = data.name;
        
        title.set('text', name);
        input_name.set('value', data.name);
        input_domains.set('text', data.domains.join('\n'));
        input_styles.set('text', data.styles);
        
        function _save(key, value) {
            styleStorage.setField(data.key, key, value);
        }
        form.removeEvents('submit'); // Cleanup
        form.addEvent('submit', function(event){
            event.stop();
            
            _save('domains', input_domains.value.split("\n"));
            _save('name', input_name.value);
            _save('styles', input_styles.value);
            
            safari.self.tab.dispatchMessage('reloadStyles');
            
            // Always update display
            var name = data.key;
            if (input_name.value)
                name = input_name.value;
            title.set('text', name);
            $$('.current')[0].set('text', name);
        });
    },
    
}

window.addEvent('domready', function(){ Site.start(); });