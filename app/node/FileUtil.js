/**
 * Created by cjh1 on 2016/12/10.
 */

const tool = require('./tool.js');

const fileUtil = {
    getUserPath: function () {
        return "use strict";
    },
    getExt: function(filename) {
        if (!filename) {
            return null;
        }
        return filename.toLowerCase().substr(filename.lastIndexOf(".") + 1);
    },
    getNameFromPath: function (filename) {
        return filename.substr(filename.lastIndexOf('\\')+1);
    },
    getType: function(filename) {
        var ext = this.getExt(filename);
        if (!ext) {
            return null;
        }
        if ('txt|css|md'.contains(ext)) {
            return 'text';
        } else if ('png|jpg|gif'.contains(ext)) {
            return 'image'
        } else if ('mp4'.contains(ext)) {
            return 'video';
        } else if ('mp3'.contains(ext)) {
            return 'audio';
        }

        return 'text'; // TODO
        //text/plain
        //text/html
        //application
    }
};

module.exports = fileUtil;