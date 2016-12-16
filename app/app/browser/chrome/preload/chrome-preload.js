/*if (navigator.userAgent.indexOf('Electron') == -1)
  return;*/

const {remote, desktopCapturer, webFrame, shell, ipcRenderer} = require('electron')
const {Menu, MenuItem, BrowserWindow} = remote;
const {app} = remote;
const path = require('path');
const {
  makeEvent,
  safeWrapEvent,
  getWindowGlobal,
  getWindowGlobals,
  autoUnregister,
  safeRegister,
} = require(path.join(__dirname, '..', 'main', 'global.js'));

const {Port} = require('./chrome-runtime-port.js');

const selfBrowserWindow = remote.getCurrentWindow();
const selfId = selfBrowserWindow.id;

selfBrowserWindow.webContents.insertCSS('body { -webkit-user-select: none; cursor: default; font-family: "Helvetica Neue", "Lucida Grande", sans-serif; font-size: 75%; }');
selfBrowserWindow.webContents.insertCSS('html, body {overflow: hidden;}');

ipcRenderer.on('contentWindow', function(e, name) {
  window[name] = getWindowGlobal(selfId, name);
});

(function() {
  var currentWindowGlobals = getWindowGlobals(selfBrowserWindow.id);
  for (var k in currentWindowGlobals) {
    window[k] = currentWindowGlobals[k];
  }
})();

// hook the onload with whatever a creator default if it wants it.
window.onload = function() {
  var l = getWindowGlobal(remote.getCurrentWindow().id, 'onload');
  if (l)
    l();
}

chrome = remote.getGlobal('chrome');
function deepCopy(o, t) {
  for (var k in o) {
    var v = o[k];
    if (v.constructor == Object)
      t[k] = deepCopy(v, {});
    else
      t[k] = v;
  }
  return t;
}

chrome = deepCopy(chrome, {});

function unremote(v) {
  return JSON.parse(JSON.stringify(v))
}

function errorWrappedCallback(cb) {
  return function(e, v) {
    if (!cb)
      return;
    if (e) {
      try {
        chrome.runtime.lastError = new Error(e);
        if (cb) {
          cb();
        }
      }
      finally {
        delete chrome.runtime.lastError;
      }
    }
    else {
      cb(unremote(v));
    }
  }
}

function wrap0Arg(f) {
  return function(cb) {
    return f(errorWrappedCallback(cb));
  }
}

function wrap1Arg(f) {
  return function(v, cb) {
    return f(v, errorWrappedCallback(cb));
  }
}

chrome.identity.getProfileUserInfo = wrap0Arg(chrome.identity.getProfileUserInfo);
chrome.identity.getAuthToken = wrap1Arg(chrome.identity.getAuthToken);
chrome.identity.launchWebAuthFlow = wrap1Arg(chrome.identity.launchWebAuthFlow);
chrome.identity.getRedirectURL = function(path) {
  path = path || '';
  return `http://localhost:${chrome.identity.authServerPort}/${path}`
}

var chromeNotificationsCreate = chrome.notifications.create;
chrome.notifications.create = function() {
  var nid;
  var opts;
  var cb;
  if (arguments.length == 0)
    throw new Error('arguments: (optional) notificationId, options, (optional) callback');
  var i = 0;
  if (typeof arguments[0] == 'string') {
    if (arguments.length == 1)
      throw new Error('arguments: (optional) notificationId, options, (optional) callback');
    nid = arguments[i++];
  }
  opts = arguments[i++];
  if (opts.iconUrl) {
    // resolve rel path to absolute path
    var link = document.createElement("a");
    link.href = opts.iconUrl;
    opts.iconUrl = link.href;
  }
  if (i < arguments.length)
    cb = arguments[i++];
  else
    cb = function() {};

  chromeNotificationsCreate(nid, opts, cb);
}

var chromeStorageLocalGet = chrome.storage.local.get;
chrome.storage.local.get = function(k, cb) {
  chromeStorageLocalGet(k, function(d) {
    // need to do this or we get a weird remoting object.
    if (cb)
      cb(unremote(d))
  })
}

var chromeRequestSyncFileSystem = chrome.syncFileSystem.requestFileSystem;

chrome.syncFileSystem.requestFileSystem = function(cb) {
  // chromeRequestSyncFileSystem(errorWrappedCallback(cb));
  navigator.webkitPersistentStorage.requestQuota(10 * 1024 * 1024, function(granted) {
    webkitRequestFileSystem(window.PERSISTENT, granted, cb, errorWrappedCallback(cb));
  })
};

chrome.fileSystem.requestFileSystem = chrome.syncFileSystem.requestFileSystem;

(function() {
  let rightClickPosition = null;
  var chromeIsRelease = remote.getGlobal('chromeIsRelease');

  const menu = new Menu()
  menu.append(new MenuItem({label: 'Reload App', click() { chrome.runtime.reload() }}))
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(new MenuItem({label: 'Inspect', click() {
    // can't call these in succession, electron crashes
    if (selfBrowserWindow.isDevToolsOpened())
      selfBrowserWindow.inspectElement(rightClickPosition.x, rightClickPosition.y)
    else
      selfBrowserWindow.webContents.openDevTools({mode: 'detach'})
  }}))
  menu.append(new MenuItem({label: 'Inspect Background Page', click() { chrome.app.window.get('__background').w.webContents.openDevTools({mode: 'detach'}) }}))
  menu.append(new MenuItem({label: 'Inspect Runtime Page', click() { remote.getGlobal('chromeRuntimeWindow').webContents.openDevTools({mode: 'detach'}) }}))

  var rapidClickCount = 0;
  var lastRapidClick = 0;
  window.addEventListener('contextmenu', (e) => {
    if (chromeIsRelease) {
      var now = Date.now();
      if (now > lastRapidClick + 1000) {
        rapidClickCount = 0;
        lastRapidClick = now;
        return;
      }
      if (++rapidClickCount < 3)
        return;
      chromeIsRelease = true;
    }
    e.preventDefault()
    rightClickPosition = {x: e.x, y: e.y}
    menu.popup(remote.getCurrentWindow())
  }, false)
})();

safeWrapEvent(selfBrowserWindow, chrome.identity.onSignInChanged);
safeWrapEvent(selfBrowserWindow, chrome.app.runtime.onLaunched);

safeWrapEvent(selfBrowserWindow, chrome.notifications.onClicked);
safeWrapEvent(selfBrowserWindow, chrome.notifications.onButtonClicked);
safeWrapEvent(selfBrowserWindow, chrome.notifications.onClosed);

safeWrapEvent(selfBrowserWindow, chrome.idle.onStateChanged);
safeWrapEvent(selfBrowserWindow, chrome.alarms.onAlarm);

safeWrapEvent(selfBrowserWindow, chrome.runtime.onInstalled);
safeWrapEvent(selfBrowserWindow, chrome.runtime.onStartup);
safeWrapEvent(selfBrowserWindow, chrome.runtime.onMessage);
safeWrapEvent(selfBrowserWindow, chrome.runtime.onMessageExternal);
safeWrapEvent(selfBrowserWindow, chrome.runtime.onUpdateAvailable);

safeWrapEvent(selfBrowserWindow, chrome.storage.onChanged);

const {AppWindow, getChromeAppWindow, selfWindow} = require('./chrome-app-window.js');
window.sharedGlobals = selfWindow.contentWindow;

chrome.app.window = getChromeAppWindow(chrome.app.window);

//var chromeManifest = require('fs').readFileSync(`${__dirname}/../manifest.json`).toString();
var chromeManifest = JSON.stringify(chrome.runtime.manifest);
chrome.runtime.getManifest = function() {
  return JSON.parse(chromeManifest);
};
chrome.runtime.getBackgroundPage = function(cb) {
  if (cb) {
    process.nextTick(function() {
      cb(chrome.app.window.get('__background').contentWindow);
    })
  }
}
chrome.runtime.connect = function() {
  var extensionId;
  var i = 0;
  console.log('argumments', arguments);
  if (i < arguments.length && typeof arguments[i] == 'string')
    extensionId = arguments[i++];

  // ignored for now
  // if (i < arguments.length)
  //   connectInfo = arguments[i++];
  return new Port(extensionId)
}
chrome.runtime.getAppDirectory = function() {
  return remote.getGlobal('chromeAppDir');
}
