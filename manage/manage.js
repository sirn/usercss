var Manager = {

    // Style storage
    createItems: function(){
        safari.self.tab.dispatchMessage('items');
    },

    removeItem: function(key){
        safari.self.tab.dispatchMessage('removeItem', key);
    },

    getItem: function(key){
        safari.self.tab.dispatchMessage('getItem', key);
    },

    setItem: function(key, values){
        safari.self.tab.dispatchMessage('setItem', [key, values]);
    },

    // Manager application
    start: function(){
        const newLink = $('new'),
              domainLabels = $$('span.label'),
              form = $('form');
        Manager.createItems();

        /* Events for the "New User CSS" sidebar link. */
        newLink.addEvent('click', function(event){
            Manager.markCurrent(this);
            Manager.bindNewForm();
        });

        /* Events for the Includes/Excludes domain labels. */
        domainLabels.addEvents({
            expand: function(e){
                this.store('state:expanded', true);
                this.removeClass('hidden').addClass('expanded');
                this.getNext('textarea').setStyle('display', '');
            },
            hide: function(e){
                this.store('state:expanded', false);
                this.removeClass('expanded').addClass('hidden');
                this.getNext('textarea').setStyle('display', 'none');
            },
            toggle: function(e){
                var f = this.retrieve('state:expanded') ? 'hide' : 'expand';
                this.fireEvent(f);
            },
            click: function(e){
                e.stop();
                this.fireEvent('toggle');
            }
        });

        /* Disable save button */
        form.addEvents({
            keyup: function(e){
                if (!$chk(form.styles.value)) {
                    form.save.disabled = true;
                } else {
                    form.save.disabled = false;
                }
            },
        });

        /* Defaults */
        newLink.fireEvent('click');
    },

    $n: function(key) { return 'item-'+key; },
    $p: function(key) { return $(Manager.$n(key)); },
    $a: function(key) { return Manager.$p(key).getChildren('a')[0]; },

    reloadStyles: function(){
        safari.self.tab.dispatchMessage('reloadStyles');
    },

    setTitle: function(title){
        $('title').set('text', title);
    },

    setDomainsLabelState: function(includes, excludes){
        const includeLabel = $('label-includes'),
              excludeLabel = $('label-excludes');
        includeLabel.fireEvent(includes ? 'expand' : 'hide');
        excludeLabel.fireEvent(excludes ? 'expand' : 'hide');
    },

    createItem: function(key, data){
        const list = $('list');
        var item = new Element('li', {id: Manager.$n(key)}),
            link = new Element('a', {
                'class': 'selector' + (data.enabled ? '' : ' disabled'),
                href: '#'+key,
                text: data.name,
                events: {
                    click: function(event){
                        var key = this.hash.substr(1);
                        Manager.markCurrent(this);
                        Manager.getItem(key);
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
                                next = element.getNext(),
                                target = $('new');
                            if (next) {
                                target = next.getChildren('a')[0];
                            } else if (prev) {
                                target = prev.getChildren('a')[0];
                            }
                            target.fireEvent('click');
                        }
                        element.destroy();
                        Manager.removeItem(key);
                        Manager.reloadStyles();
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
        data.enabled = form.enabled.checked;
        data.domains = form.domains.value.split('\n');
        data.excludes = form.excludes.value.split('\n');
        data.styles = form.styles.value;
        return data;
    },

    bindForm: function(data, fn){
        const form = $('form');
        if (data.domains === undefined)  data.domains = [];
        if (data.excludes === undefined) data.excludes = [];

        form.name.set('value', data.name);
        form.domains.set('text', data.domains.join('\n'));
        form.excludes.set('text', data.excludes.join('\n'));
        form.styles.set('text', data.styles);
        form.enabled.set('checked', data.enabled);

        form.domains.value = data.domains.join('\n');
        form.excludes.value = data.excludes.join('\n');
        form.styles.value = data.styles === undefined ? null : data.styles;

        form.fireEvent('keyup');

        /* Display */
        if ($chk(data.domains[0]) && $chk(data.excludes[0]))
            Manager.setDomainsLabelState(true, true);
        else if (!$chk(data.domains[0]) && $chk(data.excludes[0]))
            Manager.setDomainsLabelState(false, true);
        else
            Manager.setDomainsLabelState(true, false);

        form.removeEvents('submit'); // Cleanup
        if (fn) {
            form.addEvent('submit', function(event){
                event.stop();
                var formData = Manager.constructDataFromForm(data, this);
                fn(formData);
            });
        }
    },

    bindEditForm: function(key, data){
        Manager.setTitle(data.name);
        Manager.bindForm(data, function(formData){
            Manager.setItem(key, formData);
            Manager.reloadStyles();
            // Always update display
            var name = formData.name,
                element = Manager.$a(key);
            if (this.name.value)
                name = this.name.value;
            Manager.setTitle(name);
            element.set('text', name);
            element.removeClass('disabled');
            if (!formData.enabled)
                element.addClass('disabled');
        });
    },

    bindNewForm: function(){
        Manager.setTitle('New User CSS');
        Manager.bindForm({}, function(formData){
            var key = new Date().getTime();
            if (formData.styles && formData.domains) {
                Manager.setItem(key, formData);
                if (!formData.name)
                    formData.name = key;
                var item = Manager.createItem(key, formData);
                item.getChildren('a')[0].fireEvent('click');
                Manager.reloadStyles();
                if (!formData.enabled)
                    item.addClass('disabled');
            }
        });
    }

};

function handleMessage(event) {
    switch (event.name) {
    case 'items':
        event.message.each(function(item){
            Manager.createItem(item.key, item.data);
        });
        break;
    case 'getItem':
        Manager.bindEditForm(event.message[0], event.message[1]);
        break;
    }
}

safari.self.addEventListener("message", handleMessage, false);
window.addEvent('domready', function(){ Manager.start(); });
