function reloadStyles() {
    safari.extension.removeContentStyleSheets();
    styleStorage.each(function(key, data){
        if (data.enabled) {
            var styles = data.styles,
                domains = data.domains,
                excludes = data.excludes;
            excludes.push(safari.extension.baseURI + '*');
            safari.extension.addContentStyleSheet(styles, domains, excludes);
        }
    });
}

function makeConsistent() {
    styleStorage.makeConsistent();
}

function handleCommand(event) {
    switch (event.command) {
    case 'manage-user-css':
        var currentWindow = safari.application.activeBrowserWindow;
        var manageURL = safari.extension.baseURI + 'manage/manage.html';
        currentWindow.openTab('foreground').url = manageURL;
        break;
    }
}

function handleMessage(event) {
    switch (event.name) {
    case 'reloadStyles':
        reloadStyles();
        break;
    }
}

safari.application.addEventListener('command', handleCommand, false);
safari.application.addEventListener('message', handleMessage, false);
makeConsistent();
reloadStyles();