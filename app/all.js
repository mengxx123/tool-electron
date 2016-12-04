/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _es = __webpack_require__(6);

	var _tabEx = __webpack_require__(7);

	var _tabEx2 = _interopRequireDefault(_tabEx);

	var _contextmenu = __webpack_require__(8);

	var _contextmenu2 = _interopRequireDefault(_contextmenu);

	var _storage = __webpack_require__(9);

	var _storage2 = _interopRequireDefault(_storage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var isInline = function isInline(token) {
	    return token && token.type === 'inline';
	};
	var isParagraph = function isParagraph(token) {
	    return token && token.type === 'paragraph_open';
	};
	var isListItem = function isListItem(token) {
	    return token && token.type === 'list_item_open';
	};
	var startsWithTodoMarkdown = function startsWithTodoMarkdown(token) {
	    return token && /^\[( |x|X)\]/.test(token.content);
	};

	function isTodoItem(tokens, index) {
	    return isInline(tokens[index]) && isParagraph(tokens[index - 1]) && isListItem(tokens[index - 2]) && startsWithTodoMarkdown(tokens[index]);
	}

	function setAttr(token, name, value) {
	    var index = token.attrIndex(name);
	    var attr = [name, value];

	    if (index < 0) {
	        token.attrPush(attr);
	    } else {
	        token.attrs[index] = attr;
	    }
	}

	function parentToken(tokens, index) {
	    var targetLevel = tokens[index].level - 1;
	    for (var i = index - 1; i >= 0; i--) {
	        if (tokens[i].level === targetLevel) {
	            return i;
	        }
	    }
	    return -1;
	}

	function todoify(token, TokenConstructor) {
	    token.children.unshift(createTodoItem(token, TokenConstructor));

	    var sliceIndex = '[ ]'.length;
	    token.content = token.content.slice(sliceIndex);
	    token.children[1].content = token.children[1].content.slice(sliceIndex);
	}

	function createTodoItem(token, TokenConstructor) {
	    var todo = new TokenConstructor('html_inline', '', 0);
	    if (/^\[ \]/.test(token.content)) {
	        todo.content = '<input type="checkbox">';
	    } else if (/^\[(x|X)\]/.test(token.content)) {
	        todo.content = '<input type="checkbox" checked>';
	    }
	    return todo;
	}

	// 文件管理器

	var FileManager = function () {
	    function FileManager() {
	        _classCallCheck(this, FileManager);

	        this.rootFile = 'F:\\Users\\cjh1\\Desktop\\note'; // 根目录
	        this.selectFile = null; // 选择的文件
	        this.curFile = null; // 当前正在编辑的文件
	    }

	    // 刷新


	    _createClass(FileManager, [{
	        key: 'refresh',
	        value: function refresh() {
	            this.openFolder(this.rootFile);
	        }

	        // 打开文件夹

	    }, {
	        key: 'openFolder',
	        value: function openFolder(path) {
	            this.rootFile = path;
	            this.curFile = null;
	            system.loadFiles(path, function (err, results) {
	                if (err) {
	                    throw err;
	                }

	                var zTreeObj;
	                // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
	                var setting = {
	                    view: {
	                        /*showLine: false,*/
	                        dblClickExpand: false
	                    },
	                    callback: {
	                        onClick: function onClick(event, treeId, treeNode, clickFlag) {
	                            var ext = getExt(treeNode.file);
	                            var type = getType(treeNode.file);
	                            if (type === 'text') {
	                                if (!treeNode.children) {
	                                    openFile(treeNode.file);
	                                }
	                            } else if (type === 'image') {
	                                system.openUri(treeNode.file);
	                            } else {
	                                ui.msg('暂不支持打开此类型的文件');
	                            }
	                        },
	                        onRightClick: function onRightClick(e, treeId, treeNode) {
	                            if (!treeNode) {
	                                return false;
	                            }
	                            fm.selectFile = treeNode.file;
	                            ui.contextmenu($('#file-menu')[0], e.clientX, e.clientY);
	                            /*var ext = getExt(treeNode.file);
	                             var type = getType(treeNode.file);
	                             if (type === 'text') {
	                             if (treeNode.children) {
	                             fm.selectFile = treeNode.file;
	                             } else {
	                             openFile(treeNode.file);
	                             //$('#layout-file').hide();
	                             }
	                             } else if (type === 'image') {
	                             system.openUri(treeNode.file);
	                             } else {
	                             ui.msg('暂不支持打开此类型的文件')
	                             }*/
	                            return false;
	                        },
	                        beforeDrop: function beforeDrop(treeId, treeNodes, targetNode, moveType) {
	                            return targetNode ? targetNode.drop !== false : true;
	                        },
	                        onDrop: function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
	                            if (targetNode) {
	                                treeNodes.forEach(function (node) {
	                                    var fileName = getNameFromPath(node.file);
	                                    var newName = targetNode.file + '\\' + fileName;
	                                    system.rename(node.file, newName);
	                                    node.file = newName;
	                                });
	                            }
	                        }
	                    },
	                    edit: {
	                        enable: true,
	                        showRemoveBtn: false,
	                        showRenameBtn: false,
	                        drag: {
	                            isMove: true
	                        }
	                    }

	                };
	                // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
	                var zNodes = [{
	                    id: '1212',
	                    name: "test1",
	                    open: true,
	                    children: [{ name: "test1_1" }, { name: "test1_2" }]
	                }, {
	                    id: '1aaa',
	                    name: "test2",
	                    open: true,
	                    children: [{
	                        name: "test2_1" }, { name: "test2_2" }] }];
	                zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, results);
	            });
	        }
	    }]);

	    return FileManager;
	}();

	var system = System.getInstance();

	var preview = document.getElementById("preview");

	var editor = CodeMirror.fromTextArea(document.getElementById("text-input"), {
	    //theme: 'emd',
	    mode: 'gfm',
	    selectionPointer: true,
	    //lineNumbers: true,
	    matchBrackets: true,
	    indentUnit: 4,
	    indentWithTabs: true,
	    onChange: function onChange() {}
	});

	var fm = new FileManager();
	fm.openFolder(fm.rootFile);
	openFile(fm.rootFile + '\\readme.md');

	Array.prototype.contains = Array.prototype.contains || function (obj) {
	    var i = this.length;
	    while (i--) {
	        if (this[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	};

	String.prototype.contains = String.prototype.contains || function (str) {
	    return this.indexOf(str) >= 0;
	};

	;(function () {
	    function MdEditor(option) {
	        var that = this;
	        this.opts = $.extend({}, MdEditor.DEFAULTS, option);

	        // 五分钟自动保存一次
	        if (that.opts.autoSave) {
	            setInterval(function () {
	                save();
	            }, 5 * 60 * 1000);
	        }
	    }

	    MdEditor.DEFAULTS = {
	        autoSave: false
	    };

	    window.MdEditor = MdEditor;
	})();

	var mdeditor = new MdEditor({
	    autoSave: true
	});

	$(document).contextmenu({
	    content: '#global-menu'
	});
	$('#layout-preview').contextmenu({
	    item: 'img',
	    content: '#image-menu'
	});
	$('#layout-file').contextmenu({
	    content: '#files-menu'
	});

	$('#global-menu-about').on('click', function () {
	    ui.alert('markdown编辑器 v2016.11.26');
	});
	$('#global-menu-help').on('click', function () {
	    ui.frame('help.html', {
	        title: '帮助'
	    });
	});
	$('#global-menu-close-preview').on('click', function () {
	    $('#layout-preview').hide();
	});

	editor.setOption('lineWrapping', true);

	function setEditorTheme(theme) {
	    editor.setOption("theme", theme);
	    if (!$('#style-' + theme).length) {
	        $('head').append($('<link id="style-' + theme + '" rel="stylesheet" href="asset/lib/codemirror/theme/' + theme + '.css">'));
	    }
	}
	setEditorTheme('emd');

	$('#theme-select').on('change', function () {
	    var theme = this.options[this.selectedIndex].text;
	    setEditorTheme(theme);
	});

	editor.on("change", function (cm, event) {
	    var text = editor.getValue();
	    var md = window.markdownit();
	    md.core.ruler.after('inline', 'evernote-todo', function (state) {
	        var tokens = state.tokens;
	        for (var i = 0; i < tokens.length; i++) {
	            if (isTodoItem(tokens, i)) {
	                todoify(tokens[i], state.Token);
	                setAttr(tokens[i - 2], 'class', 'task-list-item');
	                setAttr(tokens[parentToken(tokens, i - 2)], 'class', 'task-list');
	            }
	        }
	    });
	    //md.use(require('markdown-it-enml-todo'))
	    preview.innerHTML = md.render(text);

	    // 字数统计
	    var p = $('#preview').find('p').length;
	    $('#status').text(text.replace(/\s/g, '').length + '字符, ' + p + '段落');
	});

	editor.on("scroll", function (cm, event) {
	    var info = cm.getScrollInfo();
	    var percent = info.top / (info.height - info.clientHeight);
	    var scrollTop = ($('#layout-preview')[0].scrollHeight - $('#layout-preview')[0].clientHeight) * percent;
	    $('#layout-preview').scrollTop(scrollTop);
	});

	$('#layout-preview').on('scroll', function () {
	    var range = this.scrollHeight - this.clientHeight;
	});

	function blobToFile(theBlob, fileName) {
	    //A Blob() is almost a File() - it's just missing the two properties below which we will add
	    theBlob.lastModifiedDate = new Date();
	    theBlob.name = fileName;
	    return theBlob;
	}
	editor.on("paste", function (cm, e) {
	    var clipboard = e.clipboardData;
	    var text,
	        textType = 'text/plain';
	    if (clipboard) {
	        // w3c(webkit,opera...)
	        if (clipboard.types && clipboard.types.contains(textType)) {
	            //e.preventDefault();
	            text = clipboard.getData(textType);
	            //this.replaceText(range, text)
	        }

	        if (e.clipboardData.items) {
	            // google-chrome
	            var ele = e.clipboardData.items;
	            for (var i = 0; i < ele.length; ++i) {
	                if (ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1) {

	                    var blob = ele[i].getAsFile();

	                    window.URL = window.URL || window.webkitURL;
	                    var blobUrl = window.URL.createObjectURL(blob);

	                    var imagePath = fm.rootFile + '\\data\\img\\123.jpg';
	                    var buf = new Buffer(blob, 'base64'); // decode
	                    /*fs.writeFile(imagePath, blob, function(err) {
	                      })*/

	                    /*fs.writeFile(imagePath, blob, "binary", function(err){
	                        if(err){
	                        }
	                    });*/
	                }
	            }
	        } else {
	            alert('non-chrome');
	        }
	    }

	    return true;
	});

	function createDir() {
	    //是否显示导航栏
	    var showNavBar = true;
	    //是否展开导航栏
	    var expandNavBar = true;

	    var h1s = $("#preview").find("h1");
	    var h2s = $("#preview").find("h2");
	    var h3s = $("#preview").find("h3");
	    var h4s = $("#preview").find("h4");
	    var h5s = $("#preview").find("h5");
	    var h6s = $("#preview").find("h6");

	    var headCounts = [h1s.length, h2s.length, h3s.length, h4s.length, h5s.length, h6s.length];
	    var vH1Tag = null;
	    var vH2Tag = null;
	    for (var i = 0; i < headCounts.length; i++) {
	        if (headCounts[i] > 0) {
	            if (vH1Tag == null) {
	                vH1Tag = 'h' + (i + 1);
	            } else {
	                vH2Tag = 'h' + (i + 1);
	            }
	        }
	    }
	    if (vH1Tag == null) {
	        return;
	    }

	    $("#toc").append('<div class="BlogAnchor">' + '<span style="color:red;position:absolute;top:-6px;left:0px;cursor:pointer;" onclick="$(\'.BlogAnchor\').hide();">×</span>' + '<p>' + '<b id="AnchorContentToggle" title="收起" style="cursor:pointer;">目录▲</b>' + '</p>' + '<div class="AnchorContent" id="AnchorContent"> </div>' + '</div>');

	    var vH1Index = 0;
	    var vH2Index = 0;
	    $("#preview").find("h1,h2,h3,h4,h5,h6").each(function (i, item) {
	        var id = '';
	        var name = '';
	        var tag = $(item).get(0).tagName.toLowerCase();
	        var className = '';
	        if (tag == vH1Tag) {
	            id = name = ++vH1Index;
	            name = id;
	            vH2Index = 0;
	            className = 'item_h1';
	        } else if (tag == vH2Tag) {
	            id = vH1Index + '_' + ++vH2Index;
	            name = vH1Index + '.' + vH2Index;
	            className = 'item_h2';
	        }
	        $(item).attr("id", "wow" + id);
	        $(item).addClass("wow_head");
	        $("#AnchorContent").css('max-height', $(window).height() - 180 + 'px');
	        $("#AnchorContent").append('<li><a class="nav_item ' + className + ' anchor-link" onclick="return false;" href="#" link="#wow' + id + '">' + name + " · " + $(this).text() + '</a></li>');
	    });

	    $("#AnchorContentToggle").click(function () {
	        var text = $(this).html();
	        if (text == "目录▲") {
	            $(this).html("目录▼");
	            $(this).attr({ "title": "展开" });
	        } else {
	            $(this).html("目录▲");
	            $(this).attr({ "title": "收起" });
	        }
	        $("#AnchorContent").toggle();
	    });
	    $(".anchor-link").click(function () {
	        $("html,body").animate({ scrollTop: $($(this).attr("link")).offset().top }, 500);
	    });

	    var headerNavs = $(".BlogAnchor li .nav_item");
	    var headerTops = [];
	    $(".wow_head").each(function (i, n) {
	        headerTops.push($(n).offset().top);
	    });
	    $(window).scroll(function () {
	        var scrollTop = $(window).scrollTop();
	        $.each(headerTops, function (i, n) {
	            var distance = n - scrollTop;
	            if (distance >= 0) {
	                $(".BlogAnchor li .nav_item.current").removeClass('current');
	                $(headerNavs[i]).addClass('current');
	                return false;
	            }
	        });
	    });

	    if (!showNavBar) {
	        $('.BlogAnchor').hide();
	    }
	    if (!expandNavBar) {
	        $(this).html("目录▼");
	        $(this).attr({ "title": "展开" });
	        $("#AnchorContent").hide();
	    }
	}

	function openFile(path) {
	    fm.curFile = path;
	    system.readFile(path, function (err, data) {
	        editor.setValue(data);
	    });

	    var html = editor.getValue();
	    preview.innerHTML = markdown.toHTML(html);
	    createDir();
	}

	var btn = document.getElementById('open-file');

	function openFolder() {
	    system.selectDir(function (path) {
	        if (path) {
	            fm.openFolder(path);
	        }
	    });
	}

	$(document).on('keydown', function (e) {
	    if (e.ctrlKey) {

	        switch (e.keyCode) {
	            case 66:
	                // b
	                editor.replaceSelection('**' + editor.getSelection() + '**');
	                return false;
	            case 73:
	                // i
	                editor.replaceSelection('*' + editor.getSelection() + '*');
	                return false;
	            case 82:
	                // r
	                window.location.reload(true);
	                return false;
	            case 83:
	                // s
	                save();
	                return false;
	            case 191:
	                // /
	                help();
	                return false;
	        }
	    }
	});

	var holder = document.getElementById('layout-editor');
	holder.ondragover = function () {
	    return false;
	};
	holder.ondragleave = holder.ondragend = function () {
	    return false;
	};

	function getExt(filename) {
	    return filename.toLowerCase().substr(filename.lastIndexOf(".") + 1);
	}
	function getNameFromPath(filename) {
	    return filename.substr(filename.lastIndexOf('\\') + 1);
	}

	function getType(filename) {
	    var ext = getExt(filename);
	    if (!ext) {
	        return null;
	    }
	    if ('txt|css|md'.contains(ext)) {
	        return 'text';
	    } else if ('png|jpg|gif'.contains(ext)) {
	        return 'image';
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

	holder.ondrop = function (e) {
	    e.preventDefault();
	    var file = e.dataTransfer.files[0];
	    if (/image*/.test(file.type)) {
	        var imagePath = fm.rootFile + '\\data\\img';
	        fs.exists(imagePath, function (exists) {
	            if (!exists) {
	                fs.mkdirSync(imagePath, 777);
	            }

	            var newImageFile = imagePath + '\\' + new Date().getTime() + '.' + getExt(file.path);
	            fs.writeFileSync(newImageFile, fs.readFileSync(file.path));

	            editor.replaceSelection('![](' + newImageFile + ')');
	        });
	    } else {
	        fs.stat(file.path, function (err, stat) {
	            if (stat && stat.isDirectory()) {
	                fm.openFolder(file.path);
	            } else {
	                openFile(file.path);
	            }
	        });
	    }
	    //openFile(file.path);
	    return false;
	};
	$('#show-files').on('click', function (e) {
	    e.preventDefault();
	    $('#layout-file').show();
	});

	$('#global-menu-toggle').on('click', function (e) {
	    e.preventDefault();
	    if ($('#layout-file').is(':hidden')) {
	        $('#layout-file').show();
	        $('#layout-editor').css({
	            'width': '40%',
	            'left': '20%'
	        });
	        $('#layout-preview').css('width', '40%');
	    } else {
	        $('#layout-file').hide();
	        $('#layout-editor').css({
	            'width': '50%',
	            'left': '0'
	        });
	        $('#layout-preview').css('width', '50%');
	    }
	});

	$('#files-refresh').on('click', function (e) {
	    e.preventDefault();
	    fm.openFolder(fm.rootFile);
	});

	function save() {
	    if (fm.curFile) {
	        system.writeFile(fm.curFile, editor.getValue(), function () {
	            ui.msg('保存成功');
	        });
	    }
	}
	$('#save').on('click', function (e) {
	    e.preventDefault();
	    save();
	});
	$('#remove-file').on('click', function () {
	    var fileName = getNameFromPath(fm.selectFile);
	    ui.confirm('删除  ' + fileName, function (index) {
	        ui.close(index);
	        system.removeFile(fm.selectFile, function () {
	            fm.refresh();
	        });
	    });
	});
	$('#remame').on('click', function () {
	    var fileName = getNameFromPath(fm.selectFile);
	    ui.prompt({
	        title: '新的名称',
	        value: fileName
	    }, function (name, index) {
	        if (!name) {
	            ui.msg('请输入文件名');
	            return;
	        }
	        ui.close(index);
	        system.rename(fm.selectFile, fm.selectFile.replace(fileName, name));
	        fm.refresh();
	    });
	});
	$('#add-file').on('click', function () {
	    ui.prompt({
	        title: '文件名'
	    }, function (name, index) {
	        if (!name) {
	            ui.msg('请输入文件名');
	            return;
	        }
	        ui.close(index);
	        system.writeFile(fm.selectFile + '\\' + name, '', function () {
	            ui.msg('添加成功');
	            fm.openFolder(fm.rootFile);
	        });
	    });
	});
	$('#add-folder').on('click', function () {
	    ui.prompt({
	        title: '文件夹名'
	    }, function (name, index) {
	        if (!name) {
	            ui.msg('请输入文件夹名');
	            return;
	        }
	        ui.close(index);
	        system.mkdir(fm.selectFile + '\\' + name, function () {
	            ui.msg('添加成功');
	            fm.openFolder(fm.rootFile);
	        });
	    });
	});

	function help() {
	    ui.frame('help.html', {
	        title: '帮助'
	    });
	}

	var textarea = document.getElementsByTagName('textarea')[0],
	    read_btn = document.getElementById('read_btn'),
	    write_btn = document.getElementById('write_btn');

	$('#preview').on('click', 'a', function (e) {
	    e.preventDefault();
	    system.openUri(this.href);
	});

	var trayMenuTemplate = [{
	    label: '文件',
	    //enabled: false
	    submenu: [{
	        label: '新建',
	        click: function click() {
	            fm.curFile = null;
	            editor.setValue(''); // TODO
	        }
	    }, {
	        label: '打开文件',
	        click: function click() {
	            system.fm.selectFile(function (uri) {
	                if (uri) {
	                    openFile(uri);
	                }
	            });
	        }
	    }, {
	        label: '打开文件夹',
	        click: function click() {
	            openFolder();
	        }
	    }, {
	        label: '保存',
	        click: function click() {
	            save();
	            if (!fm.curFile) {}
	        }
	    }, {
	        label: '另存为',
	        click: function click() {
	            ui.msg('暂不支持');
	        }
	    }]
	}, {
	    label: '更多',
	    submenu: [{
	        label: '设置',
	        click: function click() {
	            ui.frame('setting.html', {
	                title: '关于'
	            });
	        }
	    }, {
	        label: 'html转markdown',
	        click: function click() {
	            window.open('html2md.html');
	        }
	    }, {
	        label: '导出为网页',
	        click: function click() {}
	    }]
	}, {
	    label: '工具',
	    submenu: [{
	        label: '生成文档',
	        click: function click() {
	            system.selectDir(function (path) {
	                system.createDoc(path);
	            });
	        }
	    }]
	}, {
	    label: '帮助',
	    submenu: [{
	        label: '查看帮助',
	        click: function click() {
	            help();
	        }
	    }, {
	        label: '关于',
	        //accelerator: 'CmdOrCtrl+M',
	        //role: 'reload', minimize minimize
	        click: function click() {
	            ui.frame('about.html', {
	                title: '关于'
	            });
	        }
	    }]
	}];

	var menuevent = {};
	function showMenu(menu) {
	    var html = '';
	    for (var i = 0; i < menu.length; i++) {
	        var item = menu[i];

	        html += '<li class="nav-item dropdown dropdown-hover">' + '<a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" data-id="' + i + '-0">' + item.label + '<i class="caret"></i>' + '</a>' + function () {
	            if (item.submenu) {
	                var submenu = '<ul class="dropdown-menu">';
	                for (var j = 0; j < item.submenu.length; j++) {
	                    submenu += '<li><a data-id="' + i + (j + 1) + '" href="#">' + item.submenu[j].label + '</a></li>';
	                    if (item.submenu[j].click) {
	                        menuevent[i + '' + (j + 1)] = item.submenu[j].click;
	                    }
	                }
	                submenu += '</ul>';
	                return submenu;
	            } else {
	                return '';
	            }
	        }() + '</li>';
	        if (item.click) {
	            menuevent[i + '0'] = click;
	        }
	    }
	    $('#menu-layoutit')[0].innerHTML = html;
	    $('#menu-layoutit').on('click', 'a', function () {
	        var id = $(this).data('id');
	        if (menuevent[id]) {
	            menuevent[id]();
	        }
	    });
	}

	showMenu(trayMenuTemplate);

	var tab = new _tabEx2.default('#tabs', {
	    //monitor: '.topbar'
	});

	//$('#tabs').addtabs({});

	var iddd = 123;
	function getIdd() {
	    return iddd++;
	}

	var id = getIdd();
	/*tab.add({
	    id: $(this).attr('addtabs'),
	    title: '标题',
	    content: '<textarea id="' + id + '"></textarea>',
	})
	var editor = CodeMirror.fromTextArea(document.getElementById(id), {
	    //theme: 'emd',
	    mode: 'gfm',
	    selectionPointer: true,
	    //lineNumbers: true,
	    matchBrackets: true,
	    indentUnit: 4,
	    indentWithTabs: true,
	    onChange: function () {

	    }
	});
	 */
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).Buffer))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(3)
	var ieee754 = __webpack_require__(4)
	var isArray = __webpack_require__(5)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)

	  var actual = that.write(string, encoding)

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len)
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8'

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0

	  if (this === target) return 0

	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)

	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0

	  if (!val) val = 0

	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).Buffer, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict'

	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray

	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}

	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63

	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}

	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}

	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)

	  arr = new Arr(len * 3 / 4 - placeHolders)

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len

	  var L = 0

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }

	  parts.push(output)

	  return parts.join('')
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var asd = exports.asd = 'asd';

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * tab-ex.js v16.12
	 */

	;(function ($) {})(jQuery);

	var TabEx = function () {
	    function TabEx(elem, option) {
	        _classCallCheck(this, TabEx);

	        var that = this;

	        that.elem = document.getElementById(elem);
	        that.$elem = $(elem);

	        that.opts = $.extend({}, TabEx.DEFAULTS, option);

	        var monitor = document.getElementById(that.opts.monitor);
	        $(that.opts.monitor).on('click', '[data-addtab]', function () {
	            that.add({
	                id: $(this).attr('data-addtab'),
	                title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
	                content: that.opts.content ? that.opts.content : $(this).attr('content'),
	                url: $(this).attr('url'),
	                ajax: $(this).attr('ajax') ? true : false
	            });
	        });

	        that.$elem.on('click', '.close-tab', function () {
	            var id = $(this).prev("a").attr("aria-controls");
	            that.close(id);
	        });

	        $(window).resize(function () {
	            that.drop();
	        });
	    }

	    _createClass(TabEx, [{
	        key: 'add',
	        value: function add(opts) {
	            var that = this;

	            var id = 'tab_' + opts.id;
	            that.$elem.find('.active').removeClass('active');
	            //如果TAB不存在，创建一个新的TAB
	            if (!$("#" + id)[0]) {
	                //创建新TAB的title
	                console.log('不存在');

	                var title = $('<li>', {
	                    'class': 'nav-item',
	                    'role': 'presentation',
	                    'id': 'tab_' + id
	                }).append($('<a>', {
	                    'class': 'nav-link',
	                    'href': '#' + id,
	                    'aria-controls': id,
	                    'role': 'tab',
	                    'data-toggle': 'tab'
	                }).html(opts.title));

	                //是否允许关闭
	                if (that.opts.close) {
	                    title.append($('<i>', { class: 'close-tab icon icon-close' }));
	                }
	                //创建新TAB的内容
	                var content = $('<div>', {
	                    'class': 'tab-pane',
	                    'id': id,
	                    'role': 'tabpanel'
	                });

	                //是否指定TAB内容
	                if (opts.content) {
	                    content.append(opts.content);
	                } else if (that.opts.iframeUse && !opts.ajax) {
	                    //没有内容，使用IFRAME打开链接
	                    content.append($('<iframe>', {
	                        'class': 'iframeClass',
	                        'height': that.opts.iframeHeight,
	                        'frameborder': "no",
	                        'border': "0",
	                        'src': opts.url
	                    }));
	                } else {
	                    $.get(opts.url, function (data) {
	                        content.append(data);
	                    });
	                }
	                //加入TABS
	                that.$elem.children('.nav').append(title);
	                that.$elem.children(".tab-content").append(content);
	            }

	            //激活TAB
	            $("#tab_" + id).addClass('active');
	            $("#" + id).addClass("active");
	            that.drop();
	        }
	    }, {
	        key: 'close',
	        value: function close(id) {
	            var that = this;

	            //如果关闭的是当前激活的TAB，激活他的前一个TAB
	            if (that.$elem.find("li.active").attr('id') == "tab_" + id) {
	                $("#tab_" + id).prev().addClass('active');
	                $("#" + id).prev().addClass('active');
	            }
	            //关闭TAB
	            $("#tab_" + id).remove();
	            $("#" + id).remove();
	            that.drop();
	            that.opts.callback();
	        }
	    }, {
	        key: 'drop',
	        value: function drop() {
	            var that = this;

	            var element = that.$elem.find('.nav-tabs');
	            //创建下拉标签
	            var dropdown = $('<li>', {
	                'class': 'nav-item dropdown pull-right hide tabdrop'
	            }).append($('<a>', {
	                'class': 'nav-link dropdown-toggle',
	                'data-toggle': 'dropdown',
	                'href': '#'
	            }).append($('<i>', { 'class': "fa fa-trash" })).append($('<b>', { 'class': 'caret' }))).append($('<ul>', { 'class': "dropdown-menu" }));

	            //检测是否已增加
	            if (!$('.tabdrop').html()) {
	                dropdown.prependTo(element);
	            } else {
	                dropdown = element.find('.tabdrop');
	            }
	            //检测是否有下拉样式
	            if (element.parent().is('.tabs-below')) {
	                dropdown.addClass('dropup');
	            }
	            var collection = 0;

	            //检查超过一行的标签页
	            element.append(dropdown.find('li')).find('>li').not('.tabdrop').each(function () {
	                if (this.offsetTop > 0 || element.width() - $(this).position().left - $(this).width() < 53) {
	                    dropdown.find('ul').append($(this));
	                    collection++;
	                }
	            });

	            //如果有超出的，显示下拉标签
	            if (false) {
	                console.log('显示下拉菜单');
	                dropdown.removeClass('hide');
	                if (dropdown.find('.active').length == 1) {
	                    dropdown.addClass('active');
	                } else {
	                    dropdown.removeClass('active');
	                }
	            } else {
	                dropdown.addClass('hide');
	            }
	        }
	    }]);

	    return TabEx;
	}();

	TabEx.DEFAULTS = {
	    content: '', //直接指定所有页面TABS内容
	    close: true, //是否可以关闭
	    monitor: 'body', //监视的区域
	    iframeUse: true, //使用iframe还是ajax
	    iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
	    method: 'init',
	    callback: function callback() {//关闭后回调函数
	    }
	};

	window.UI.TabEx = TabEx;

	exports.default = TabEx;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * 上下文菜单插件
	 */

	var $ = jQuery;
	var ui = window.UI;

	ui.$curContextElem = null; // 全局唯一上下文菜单

	function Context(elem, option) {
	    var that = this;
	    that.opts = $.extend({}, Context.DEFAULTS, option);
	    that.elem = elem;
	    var $menu = $(that.opts.content);

	    function handle(elem, e) {
	        e.preventDefault();
	        e.stopPropagation();

	        ui.contextmenu($menu[0], e.clientX, e.clientY);

	        that.opts.show && that.opts.show(elem);
	    }

	    if (that.opts.item) {
	        $(elem).on('contextmenu', that.opts.item, function (e) {
	            handle(this, e);
	            return true;
	        });
	    } else {
	        $(elem).on('contextmenu', function (e) {
	            handle(this, e);
	            return true;
	        });
	    }

	    $menu.on('contextmenu', function () {
	        return false;
	    });
	}

	Context.DEFAULTS = {
	    //content
	    show: function show(ui) {},
	    hide: function hide(ui) {}
	};

	$.fn.contextmenu = function (option) {
	    return $(this).each(function (e) {
	        new Context(this, option);
	    });
	};

	$(document).on('click', function (e) {
	    if ($(e.target).parents(".context-active").length == 0 || $(e.target).is('.dropdown-menu a')) {
	        if (ui.$curContextElem) {
	            ui.$curContextElem.hide();
	            ui.$curContextElem.removeClass('context-active');
	            ui.$curContextElem = null;
	        }
	    }
	});

	ui.contextmenu = function (elem, x, y) {
	    var $elem = $(elem);
	    var width = $elem.outerWidth();
	    var height = $elem.outerHeight();
	    var winWidth = $(window).width();
	    var winHeight = $(window).height();
	    var ptX = x;
	    var ptY = y;

	    if (ptY < winHeight - height) {} else if (ptY > height) {
	        ptY = y - height;
	    } else {
	        ptY = winHeight - height;
	    }

	    if (ptX < winWidth - width) {} else if (ptX > width) {
	        ptX = x - width;
	    } else {
	        ptX = winWidth - width;
	    }

	    // 如果已经显示了上下文菜单，则关闭
	    if (ui.$curContextElem) {
	        ui.$curContextElem.hide();
	        ui.$curContextElem.removeClass('context-active');
	        ui.$curContextElem = null;
	    }

	    // 显示新的菜单
	    $elem.css({
	        'left': ptX,
	        'top': ptY
	    });
	    $elem.css('zIndex', 10000001);
	    $elem.show();
	    $elem.addClass('context-active');
	    ui.$curContextElem = $elem;
	};

	exports.default = Context;

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * storage
	 */

	var storage = {
	    setItem: function setItem(key, value) {
	        localStorage.setItem(key, JSON.stringify(value));
	    },

	    getItem: function getItem(key, value) {
	        return JSON.parse(localStorage.getItem(key));
	    }
	};

	exports.default = storage;

/***/ }
/******/ ]);