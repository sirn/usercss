function reloadStyles() {
    safari.extension.removeContentStyleSheets();
    styleStorage.each(function(key, data){
        if (data.enabled) {
            var styles = data.styles,
                domains = sanitizeRules(data.domains),
                excludes = sanitizeRules(data.excludes);
            excludes.push(safari.extension.baseURI + '*');
            safari.extension.addContentStyleSheet(styles, domains, excludes);
        }
    });
}

function sanitizeRules(domains) {
    /* Process domains */
    var result = [];
    for (var i = domains.length - 1; i >= 0; i--){
        var domain = domains[i];
        if (domain !== '') {
            /* Make sure user input always has trailing slash.
             * Workaround of Safari 5's URL parsing bug. */
            if (domain.search(/https?:\/\/(.*)\//) == -1) {
                if (domain.substr(-1) == '*')
                    domain = domain.substr(0, domain.length-1) + '/*';
                else
                    domain = domain + '/';
            }
            result.push(domain);
        }
    }
    return result;
}

function handleCommand(event) {
    switch (event.command) {
    case 'manage-user-css':
        var manageURL = safari.extension.baseURI + 'manage/manage.html',
            currentWindow = safari.application.activeBrowserWindow,
            currentTab = currentWindow.activeTab;
        if (currentTab.url === "")    currentTab.url = manageURL;
        else currentWindow.openTab('foreground').url = manageURL;
        break;
    default:
        break;
    }
}

function handleMessage(event) {
    switch (event.name) {
    case 'reloadStyles':
        reloadStyles();
        break;
    case 'getItem':
        var item = styleStorage.getItem(event.message);
        event.target.page.dispatchMessage('getItem', [event.message, item]);
        break;
    case 'removeItem':
        styleStorage.removeItem(event.message);
        break;
    case 'setItem':
        styleStorage.setItem(event.message[0], event.message[1]);
        break;
    case 'items':
        var items = [];
        styleStorage.each(function(key, data){
            items.push({'key': key, 'data': data});
        });
        event.target.page.dispatchMessage('items', items);
        break;
    case 'shouldConvert':
        if (localStorage.length === 0) {
            event.target.page.dispatchMessage('shouldConvert', true);
            break;
        }
    default:
        break;
    }
}

function handleValidate(event) {
    switch (event.target.identifier) {
    case 'ManageUserCssItem':
        event.target.disabled = !safari.extension.settings.enableContextMenu;
        break;
    default:
        break;
    }
}

safari.application.addEventListener('command', handleCommand, false);
safari.application.addEventListener('message', handleMessage, false);
safari.application.addEventListener('validate', handleValidate, false);
reloadStyles();
