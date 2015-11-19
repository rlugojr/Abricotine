var remote = require("remote"),
    BrowserWindow = remote.require("browser-window"),
    constants = remote.require("./constants.js"),
    dialog = remote.require("dialog"),
    NativeImage = remote.require("native-image"),
    parsePath = require("parse-filepath");

// Returns the most "logical" window object (it is quite useless actually)
function getWindow (win) {
    if (typeof win === "number") {
        return BrowserWindow.fromId(win);
    } else if (win instanceof BrowserWindow) {
        return win;
    } else if (win && typeof win.browserWindow !== "undefined") {
        return win.browserWindow;
    } else if (typeof remote !== "undefined") {
        return remote.getCurrentWindow();
    } else {
        return BrowserWindow.getFocusedWindow();
    }
}

var appDialogs = {

    about: function (win) {
        win = getWindow(win);
        var image = NativeImage.createFromPath(constants.path.icon);
        dialog.showMessageBox(win, {
            title: "Abricotine",
            message: "Abricotine v. " + constants.appVersion + "\nLICENCE", // TODO: licence informations
            buttons: ['OK'],
            icon: image
        });
    },

    askClose : function (abrDoc, closeFunc, win) {
        var path = abrDoc.path;
        if (!path) {
            path = 'New document';
        }
        win = getWindow(win);
        closeFunc = closeFunc || win.destroy; // win.close() would trigger the 'onbeforeunload' event again
        var filename = parsePath(path).basename || path,
            userChoice = dialog.showMessageBox(win, {
                title: 'Unsaved document',
                message: 'Do you really want to close \'' + filename + '\' without saving?',
                buttons: ['Cancel', 'Save & close', 'Close without saving']
            });
        switch (userChoice) {
            case 1:
                abrDoc.save(null, closeFunc);
                break;
            case 2:
                closeFunc();
                break;
        }
        return false;
    },

    askOpenPath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || 'Open document',
            properties: ['openFile'],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askSavePath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showSaveDialog(win, {
            title: title || 'Save document',
            defaultPath: process.cwd()
        });
        if (path) {
            return path;
        }
        return false;
    },

    askOpenImage: function (title, win) {
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || 'Insert image',
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askNeedSave: function (abrDoc, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
                title: 'Save document',
                message: 'The current document needs to be saved before performing this operation.',
                buttons: ['Cancel', 'Save document']
            });
        if (userChoice === 1) {
            abrDoc.save(null, callback);
        }
        return false;
    },

    fileAccessDenied: function (path, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: "Permission denied",
            message: "The file '" + path + "' could not be written: permission denied. Please choose another path.",
            buttons: ['Cancel', 'OK']
        });
        if (userChoice === 1) {
            callback();
        }
        return false;
    },

    importImagesDone: function (path, win) {
        win = getWindow(win);
        dialog.showMessageBox(win, {
            title: "Images copied",
            message: "Document images have been copied in the '" + path + "' directory.",
            buttons: ['OK']
        });
    }
};

module.exports = appDialogs;
