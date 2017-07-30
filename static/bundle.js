/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3)
__webpack_require__(22)
const $ = __webpack_require__(21)

let getMarginWidth = function (count) {
  return 10 + count * 4
}

let getAlbumHtml = function (item, width, height) {
  let thumbHtml = ''
  for (let thumbnail of item.thumbnails) {
    thumbHtml += `<div class="cropped" style="background-image: url('${thumbnail}')"></div>`
  }
  return `
    <a class="album" href="${item.path}" style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">${thumbHtml}</div>
    </a>
  `
}

let getImageHtml = function (item, width, height) {
  return `
    <a class="image" style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title"></span>
      </span>
      <div class="container">
        <img src="${item.thumbUrl}" data-src="${item.url}" alt="${item.name}">
      </div>
    </a>
  `
}

let addAlbumRowHtml = function (row, rowHeight) {
  let rowHtml = ''
  for (let item of row) {
    if (item.type === 'ALBUM') {
      rowHtml += getAlbumHtml(item, rowHeight, rowHeight)
    } else {
      let width = item.meta.width / item.meta.height * rowHeight
      rowHtml += getImageHtml(item, width, rowHeight)
    }
  }
  rowHtml = `<div class="row" style="height: ${rowHeight}px">${rowHtml}</div>`
  $('#albums').append(rowHtml)
}

let splitRows = function (data, clientWidth, maxRowHeight) {
  let row = []
  let ratio = 0
  let rowHeight
  for (let item of data) {
    row.push(item)
    if (item.type === 'ALBUM') {
      ratio += 1
    } else {
      ratio += item.meta.width / item.meta.height
    }
    rowHeight = (clientWidth - getMarginWidth(row.length)) / ratio
    if (rowHeight < maxRowHeight) {
      addAlbumRowHtml(row, rowHeight)
      row = []
      ratio = 0
    }
  }
  if (row.length) {
    addAlbumRowHtml(row, maxRowHeight)
  }
}

window.initAlbums = function (data) {
  $('#albums').html('')
  let {clientWidth} = window.document.body
  let maxRowHeight = 300
  if (clientWidth < 720) {
    maxRowHeight = 200
  }
  splitRows(data, clientWidth, maxRowHeight)
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/index.js!./main.less", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/index.js!./main.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(15) + ");\n  src: url(" + __webpack_require__(16) + "?#iefix&v=4.7.0) format('embedded-opentype'), url(" + __webpack_require__(17) + ") format('woff2'), url(" + __webpack_require__(18) + ") format('woff'), url(" + __webpack_require__(19) + ") format('truetype'), url(" + __webpack_require__(20) + "#fontawesomeregular) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n.fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n.fa-2x {\n  font-size: 2em;\n}\n.fa-3x {\n  font-size: 3em;\n}\n.fa-4x {\n  font-size: 4em;\n}\n.fa-5x {\n  font-size: 5em;\n}\n.fa-fw {\n  width: 1.28571429em;\n  text-align: center;\n}\n.fa-ul {\n  padding-left: 0;\n  margin-left: 2.14285714em;\n  list-style-type: none;\n}\n.fa-ul > li {\n  position: relative;\n}\n.fa-li {\n  position: absolute;\n  left: -2.14285714em;\n  width: 2.14285714em;\n  top: 0.14285714em;\n  text-align: center;\n}\n.fa-li.fa-lg {\n  left: -1.85714286em;\n}\n.fa-border {\n  padding: .2em .25em .15em;\n  border: solid 0.08em #eee;\n  border-radius: .1em;\n}\n.fa-pull-left {\n  float: left;\n}\n.fa-pull-right {\n  float: right;\n}\n.fa.fa-pull-left {\n  margin-right: .3em;\n}\n.fa.fa-pull-right {\n  margin-left: .3em;\n}\n/* Deprecated as of 4.4.0 */\n.pull-right {\n  float: right;\n}\n.pull-left {\n  float: left;\n}\n.fa.pull-left {\n  margin-right: .3em;\n}\n.fa.pull-right {\n  margin-left: .3em;\n}\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n  animation: fa-spin 2s infinite linear;\n}\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n  animation: fa-spin 1s infinite steps(8);\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n.fa-rotate-90 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n.fa-rotate-180 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";\n  -webkit-transform: rotate(180deg);\n  -ms-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n.fa-rotate-270 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";\n  -webkit-transform: rotate(270deg);\n  -ms-transform: rotate(270deg);\n  transform: rotate(270deg);\n}\n.fa-flip-horizontal {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";\n  -webkit-transform: scale(-1, 1);\n  -ms-transform: scale(-1, 1);\n  transform: scale(-1, 1);\n}\n.fa-flip-vertical {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";\n  -webkit-transform: scale(1, -1);\n  -ms-transform: scale(1, -1);\n  transform: scale(1, -1);\n}\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical {\n  filter: none;\n}\n.fa-stack {\n  position: relative;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  line-height: 2em;\n  vertical-align: middle;\n}\n.fa-stack-1x,\n.fa-stack-2x {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center;\n}\n.fa-stack-1x {\n  line-height: inherit;\n}\n.fa-stack-2x {\n  font-size: 2em;\n}\n.fa-inverse {\n  color: #fff;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper-pp:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-resistance:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n.fa-gitlab:before {\n  content: \"\\F296\";\n}\n.fa-wpbeginner:before {\n  content: \"\\F297\";\n}\n.fa-wpforms:before {\n  content: \"\\F298\";\n}\n.fa-envira:before {\n  content: \"\\F299\";\n}\n.fa-universal-access:before {\n  content: \"\\F29A\";\n}\n.fa-wheelchair-alt:before {\n  content: \"\\F29B\";\n}\n.fa-question-circle-o:before {\n  content: \"\\F29C\";\n}\n.fa-blind:before {\n  content: \"\\F29D\";\n}\n.fa-audio-description:before {\n  content: \"\\F29E\";\n}\n.fa-volume-control-phone:before {\n  content: \"\\F2A0\";\n}\n.fa-braille:before {\n  content: \"\\F2A1\";\n}\n.fa-assistive-listening-systems:before {\n  content: \"\\F2A2\";\n}\n.fa-asl-interpreting:before,\n.fa-american-sign-language-interpreting:before {\n  content: \"\\F2A3\";\n}\n.fa-deafness:before,\n.fa-hard-of-hearing:before,\n.fa-deaf:before {\n  content: \"\\F2A4\";\n}\n.fa-glide:before {\n  content: \"\\F2A5\";\n}\n.fa-glide-g:before {\n  content: \"\\F2A6\";\n}\n.fa-signing:before,\n.fa-sign-language:before {\n  content: \"\\F2A7\";\n}\n.fa-low-vision:before {\n  content: \"\\F2A8\";\n}\n.fa-viadeo:before {\n  content: \"\\F2A9\";\n}\n.fa-viadeo-square:before {\n  content: \"\\F2AA\";\n}\n.fa-snapchat:before {\n  content: \"\\F2AB\";\n}\n.fa-snapchat-ghost:before {\n  content: \"\\F2AC\";\n}\n.fa-snapchat-square:before {\n  content: \"\\F2AD\";\n}\n.fa-pied-piper:before {\n  content: \"\\F2AE\";\n}\n.fa-first-order:before {\n  content: \"\\F2B0\";\n}\n.fa-yoast:before {\n  content: \"\\F2B1\";\n}\n.fa-themeisle:before {\n  content: \"\\F2B2\";\n}\n.fa-google-plus-circle:before,\n.fa-google-plus-official:before {\n  content: \"\\F2B3\";\n}\n.fa-fa:before,\n.fa-font-awesome:before {\n  content: \"\\F2B4\";\n}\n.fa-handshake-o:before {\n  content: \"\\F2B5\";\n}\n.fa-envelope-open:before {\n  content: \"\\F2B6\";\n}\n.fa-envelope-open-o:before {\n  content: \"\\F2B7\";\n}\n.fa-linode:before {\n  content: \"\\F2B8\";\n}\n.fa-address-book:before {\n  content: \"\\F2B9\";\n}\n.fa-address-book-o:before {\n  content: \"\\F2BA\";\n}\n.fa-vcard:before,\n.fa-address-card:before {\n  content: \"\\F2BB\";\n}\n.fa-vcard-o:before,\n.fa-address-card-o:before {\n  content: \"\\F2BC\";\n}\n.fa-user-circle:before {\n  content: \"\\F2BD\";\n}\n.fa-user-circle-o:before {\n  content: \"\\F2BE\";\n}\n.fa-user-o:before {\n  content: \"\\F2C0\";\n}\n.fa-id-badge:before {\n  content: \"\\F2C1\";\n}\n.fa-drivers-license:before,\n.fa-id-card:before {\n  content: \"\\F2C2\";\n}\n.fa-drivers-license-o:before,\n.fa-id-card-o:before {\n  content: \"\\F2C3\";\n}\n.fa-quora:before {\n  content: \"\\F2C4\";\n}\n.fa-free-code-camp:before {\n  content: \"\\F2C5\";\n}\n.fa-telegram:before {\n  content: \"\\F2C6\";\n}\n.fa-thermometer-4:before,\n.fa-thermometer:before,\n.fa-thermometer-full:before {\n  content: \"\\F2C7\";\n}\n.fa-thermometer-3:before,\n.fa-thermometer-three-quarters:before {\n  content: \"\\F2C8\";\n}\n.fa-thermometer-2:before,\n.fa-thermometer-half:before {\n  content: \"\\F2C9\";\n}\n.fa-thermometer-1:before,\n.fa-thermometer-quarter:before {\n  content: \"\\F2CA\";\n}\n.fa-thermometer-0:before,\n.fa-thermometer-empty:before {\n  content: \"\\F2CB\";\n}\n.fa-shower:before {\n  content: \"\\F2CC\";\n}\n.fa-bathtub:before,\n.fa-s15:before,\n.fa-bath:before {\n  content: \"\\F2CD\";\n}\n.fa-podcast:before {\n  content: \"\\F2CE\";\n}\n.fa-window-maximize:before {\n  content: \"\\F2D0\";\n}\n.fa-window-minimize:before {\n  content: \"\\F2D1\";\n}\n.fa-window-restore:before {\n  content: \"\\F2D2\";\n}\n.fa-times-rectangle:before,\n.fa-window-close:before {\n  content: \"\\F2D3\";\n}\n.fa-times-rectangle-o:before,\n.fa-window-close-o:before {\n  content: \"\\F2D4\";\n}\n.fa-bandcamp:before {\n  content: \"\\F2D5\";\n}\n.fa-grav:before {\n  content: \"\\F2D6\";\n}\n.fa-etsy:before {\n  content: \"\\F2D7\";\n}\n.fa-imdb:before {\n  content: \"\\F2D8\";\n}\n.fa-ravelry:before {\n  content: \"\\F2D9\";\n}\n.fa-eercast:before {\n  content: \"\\F2DA\";\n}\n.fa-microchip:before {\n  content: \"\\F2DB\";\n}\n.fa-snowflake-o:before {\n  content: \"\\F2DC\";\n}\n.fa-superpowers:before {\n  content: \"\\F2DD\";\n}\n.fa-wpexplorer:before {\n  content: \"\\F2DE\";\n}\n.fa-meetup:before {\n  content: \"\\F2E0\";\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n}\nbody {\n  margin: 0;\n  padding: 0;\n  background-color: #E8ECF0;\n}\n.breadcrumb {\n  width: auto;\n  height: 50px;\n  background: #FFF;\n  border-bottom: 1px solid #E8ECF0;\n  font-size: 14px;\n  line-height: 50px;\n  padding: 0 10px;\n}\n.breadcrumb .item {\n  display: inline-block;\n}\n.breadcrumb .item a.title {\n  color: rgba(0, 0, 0, 0.65);\n  transition: color .3s;\n  background: transparent;\n  text-decoration: none;\n  outline: none;\n  cursor: pointer;\n}\n.breadcrumb .item .separator {\n  margin: 0 3px;\n  color: rgba(0, 0, 0, 0.3);\n}\n.breadcrumb .item a.title:hover {\n  color: #49a9ee;\n}\n.breadcrumb .item:last-child a.title {\n  font-weight: 700;\n  color: rgba(0, 0, 0, 0.65);\n}\n.breadcrumb .item:last-child .separator {\n  display: none;\n}\n.albums {\n  font-size: 0;\n  margin: 10px 3px 20px 3px;\n}\n.albums .row {\n  margin-bottom: 4px;\n}\n.albums .row .album,\n.albums .row .image {\n  position: relative;\n  display: inline-block;\n  height: auto;\n  padding: 0;\n  vertical-align: top;\n  transition: transform 0.2s ease-in-out;\n  user-select: none;\n  margin: 2px;\n  background: #FFF;\n}\n.albums .row .album .lable,\n.albums .row .image .lable {\n  display: none;\n  left: 0;\n  bottom: 0;\n  box-sizing: border-box;\n  padding: 5px;\n  overflow-x: hidden;\n  z-index: 11;\n  word-break: break-all;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  transition: opacity 200ms linear;\n  opacity: 1;\n  background-image: linear-gradient(rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 0.35));\n}\n.albums .row .album .container img,\n.albums .row .image .container img {\n  width: 100%;\n  height: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/index.js!./photoswipe.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/index.js!./photoswipe.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*! PhotoSwipe main CSS by Dmitry Semenov | photoswipe.com | MIT license */\n/*\n\tStyles for basic PhotoSwipe functionality (sliding area, open/close transitions)\n*/\n/* pswp = photoswipe */\n.pswp {\n  display: none;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  overflow: hidden;\n  -ms-touch-action: none;\n  touch-action: none;\n  z-index: 1500;\n  -webkit-text-size-adjust: 100%;\n  /* create separate layer, to avoid paint on window.onscroll in webkit/blink */\n  -webkit-backface-visibility: hidden;\n  outline: none;\n}\n.pswp * {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.pswp img {\n  max-width: none;\n}\n/* style is added when JS option showHideOpacity is set to true */\n.pswp--animate_opacity {\n  /* 0.001, because opacity:0 doesn't trigger Paint action, which causes lag at start of transition */\n  opacity: 0.001;\n  will-change: opacity;\n  /* for open/close transition */\n  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n}\n.pswp--open {\n  display: block;\n}\n.pswp--zoom-allowed .pswp__img {\n  /* autoprefixer: off */\n  cursor: -webkit-zoom-in;\n  cursor: -moz-zoom-in;\n  cursor: zoom-in;\n}\n.pswp--zoomed-in .pswp__img {\n  /* autoprefixer: off */\n  cursor: -webkit-grab;\n  cursor: -moz-grab;\n  cursor: grab;\n}\n.pswp--dragging .pswp__img {\n  /* autoprefixer: off */\n  cursor: -webkit-grabbing;\n  cursor: -moz-grabbing;\n  cursor: grabbing;\n}\n/*\n\tBackground is added as a separate element.\n\tAs animating opacity is much faster than animating rgba() background-color.\n*/\n.pswp__bg {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  opacity: 0;\n  -webkit-transform: translateZ(0);\n  transform: translateZ(0);\n  -webkit-backface-visibility: hidden;\n  will-change: opacity;\n}\n.pswp__scroll-wrap {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.pswp__container,\n.pswp__zoom-wrap {\n  -ms-touch-action: none;\n  touch-action: none;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n}\n/* Prevent selection and tap highlights */\n.pswp__container,\n.pswp__img {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n}\n.pswp__zoom-wrap {\n  position: absolute;\n  width: 100%;\n  -webkit-transform-origin: left top;\n  -ms-transform-origin: left top;\n  transform-origin: left top;\n  /* for open/close transition */\n  -webkit-transition: -webkit-transform 333ms cubic-bezier(0.4, 0, 0.22, 1);\n  transition: transform 333ms cubic-bezier(0.4, 0, 0.22, 1);\n}\n.pswp__bg {\n  will-change: opacity;\n  /* for open/close transition */\n  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n}\n.pswp--animated-in .pswp__bg,\n.pswp--animated-in .pswp__zoom-wrap {\n  -webkit-transition: none;\n  transition: none;\n}\n.pswp__container,\n.pswp__zoom-wrap {\n  -webkit-backface-visibility: hidden;\n}\n.pswp__item {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  overflow: hidden;\n}\n.pswp__img {\n  position: absolute;\n  width: auto;\n  height: auto;\n  top: 0;\n  left: 0;\n}\n/*\n\tstretched thumbnail or div placeholder element (see below)\n\tstyle is added to avoid flickering in webkit/blink when layers overlap\n*/\n.pswp__img--placeholder {\n  -webkit-backface-visibility: hidden;\n}\n/*\n\tdiv element that matches size of large image\n\tlarge image loads on top of it\n*/\n.pswp__img--placeholder--blank {\n  background: #222;\n}\n.pswp--ie .pswp__img {\n  width: 100% !important;\n  height: auto !important;\n  left: 0;\n  top: 0;\n}\n/*\n\tError message appears when image is not loaded\n\t(JS option errorMsg controls markup)\n*/\n.pswp__error-msg {\n  position: absolute;\n  left: 0;\n  top: 50%;\n  width: 100%;\n  text-align: center;\n  font-size: 14px;\n  line-height: 16px;\n  margin-top: -8px;\n  color: #CCC;\n}\n.pswp__error-msg a {\n  color: #CCC;\n  text-decoration: underline;\n}\n", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/dist/index.js!./default-skin.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/dist/index.js!./default-skin.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*! PhotoSwipe Default UI CSS by Dmitry Semenov | photoswipe.com | MIT license */\n/*\n\n\tContents:\n\n\t1. Buttons\n\t2. Share modal and links\n\t3. Index indicator (\"1 of X\" counter)\n\t4. Caption\n\t5. Loading indicator\n\t6. Additional styles (root element, top bar, idle state, hidden state, etc.)\n\n*/\n/*\n\t\n\t1. Buttons\n\n */\n/* <button> css reset */\n.pswp__button {\n  width: 44px;\n  height: 44px;\n  position: relative;\n  background: none;\n  cursor: pointer;\n  overflow: visible;\n  -webkit-appearance: none;\n  display: block;\n  border: 0;\n  padding: 0;\n  margin: 0;\n  float: right;\n  opacity: 0.75;\n  -webkit-transition: opacity 0.2s;\n  transition: opacity 0.2s;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.pswp__button:focus,\n.pswp__button:hover {\n  opacity: 1;\n}\n.pswp__button:active {\n  outline: none;\n  opacity: 0.9;\n}\n.pswp__button::-moz-focus-inner {\n  padding: 0;\n  border: 0;\n}\n/* pswp__ui--over-close class it added when mouse is over element that should close gallery */\n.pswp__ui--over-close .pswp__button--close {\n  opacity: 1;\n}\n.pswp__button,\n.pswp__button--arrow--left:before,\n.pswp__button--arrow--right:before {\n  background: url(" + __webpack_require__(10) + ") 0 0 no-repeat;\n  background-size: 264px 88px;\n  width: 44px;\n  height: 44px;\n}\n@media (-webkit-min-device-pixel-ratio: 1.1), (-webkit-min-device-pixel-ratio: 1.09375), (min-resolution: 105dpi), (min-resolution: 1.1dppx) {\n  /* Serve SVG sprite if browser supports SVG and resolution is more than 105dpi */\n  .pswp--svg .pswp__button,\n  .pswp--svg .pswp__button--arrow--left:before,\n  .pswp--svg .pswp__button--arrow--right:before {\n    background-image: url(" + __webpack_require__(11) + ");\n  }\n  .pswp--svg .pswp__button--arrow--left,\n  .pswp--svg .pswp__button--arrow--right {\n    background: none;\n  }\n}\n.pswp__button--close {\n  background-position: 0 -44px;\n}\n.pswp__button--share {\n  background-position: -44px -44px;\n}\n.pswp__button--fs {\n  display: none;\n}\n.pswp--supports-fs .pswp__button--fs {\n  display: block;\n}\n.pswp--fs .pswp__button--fs {\n  background-position: -44px 0;\n}\n.pswp__button--zoom {\n  display: none;\n  background-position: -88px 0;\n}\n.pswp--zoom-allowed .pswp__button--zoom {\n  display: block;\n}\n.pswp--zoomed-in .pswp__button--zoom {\n  background-position: -132px 0;\n}\n/* no arrows on touch screens */\n.pswp--touch .pswp__button--arrow--left,\n.pswp--touch .pswp__button--arrow--right {\n  visibility: hidden;\n}\n/*\n\tArrow buttons hit area\n\t(icon is added to :before pseudo-element)\n*/\n.pswp__button--arrow--left,\n.pswp__button--arrow--right {\n  background: none;\n  top: 50%;\n  margin-top: -50px;\n  width: 70px;\n  height: 100px;\n  position: absolute;\n}\n.pswp__button--arrow--left {\n  left: 0;\n}\n.pswp__button--arrow--right {\n  right: 0;\n}\n.pswp__button--arrow--left:before,\n.pswp__button--arrow--right:before {\n  content: '';\n  top: 35px;\n  background-color: rgba(0, 0, 0, 0.3);\n  height: 30px;\n  width: 32px;\n  position: absolute;\n}\n.pswp__button--arrow--left:before {\n  left: 6px;\n  background-position: -138px -44px;\n}\n.pswp__button--arrow--right:before {\n  right: 6px;\n  background-position: -94px -44px;\n}\n/*\n\n\t2. Share modal/popup and links\n\n */\n.pswp__counter,\n.pswp__share-modal {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.pswp__share-modal {\n  display: block;\n  background: rgba(0, 0, 0, 0.5);\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  padding: 10px;\n  position: absolute;\n  z-index: 1600;\n  opacity: 0;\n  -webkit-transition: opacity 0.25s ease-out;\n  transition: opacity 0.25s ease-out;\n  -webkit-backface-visibility: hidden;\n  will-change: opacity;\n}\n.pswp__share-modal--hidden {\n  display: none;\n}\n.pswp__share-tooltip {\n  z-index: 1620;\n  position: absolute;\n  background: #FFF;\n  top: 56px;\n  border-radius: 2px;\n  display: block;\n  width: auto;\n  right: 44px;\n  -webkit-box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n  -webkit-transform: translateY(6px);\n  -ms-transform: translateY(6px);\n  transform: translateY(6px);\n  -webkit-transition: -webkit-transform 0.25s;\n  transition: transform 0.25s;\n  -webkit-backface-visibility: hidden;\n  will-change: transform;\n}\n.pswp__share-tooltip a {\n  display: block;\n  padding: 8px 12px;\n  color: #000;\n  text-decoration: none;\n  font-size: 14px;\n  line-height: 18px;\n}\n.pswp__share-tooltip a:hover {\n  text-decoration: none;\n  color: #000;\n}\n.pswp__share-tooltip a:first-child {\n  /* round corners on the first/last list item */\n  border-radius: 2px 2px 0 0;\n}\n.pswp__share-tooltip a:last-child {\n  border-radius: 0 0 2px 2px;\n}\n.pswp__share-modal--fade-in {\n  opacity: 1;\n}\n.pswp__share-modal--fade-in .pswp__share-tooltip {\n  -webkit-transform: translateY(0);\n  -ms-transform: translateY(0);\n  transform: translateY(0);\n}\n/* increase size of share links on touch devices */\n.pswp--touch .pswp__share-tooltip a {\n  padding: 16px 12px;\n}\na.pswp__share--facebook:before {\n  content: '';\n  display: block;\n  width: 0;\n  height: 0;\n  position: absolute;\n  top: -12px;\n  right: 15px;\n  border: 6px solid transparent;\n  border-bottom-color: #FFF;\n  -webkit-pointer-events: none;\n  -moz-pointer-events: none;\n  pointer-events: none;\n}\na.pswp__share--facebook:hover {\n  background: #3E5C9A;\n  color: #FFF;\n}\na.pswp__share--facebook:hover:before {\n  border-bottom-color: #3E5C9A;\n}\na.pswp__share--twitter:hover {\n  background: #55ACEE;\n  color: #FFF;\n}\na.pswp__share--pinterest:hover {\n  background: #CCC;\n  color: #CE272D;\n}\na.pswp__share--download:hover {\n  background: #DDD;\n}\n/*\n\n\t3. Index indicator (\"1 of X\" counter)\n\n */\n.pswp__counter {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 44px;\n  font-size: 13px;\n  line-height: 44px;\n  color: #FFF;\n  opacity: 0.75;\n  padding: 0 10px;\n}\n/*\n\t\n\t4. Caption\n\n */\n.pswp__caption {\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  width: 100%;\n  min-height: 44px;\n}\n.pswp__caption small {\n  font-size: 11px;\n  color: #BBB;\n}\n.pswp__caption__center {\n  text-align: left;\n  max-width: 420px;\n  margin: 0 auto;\n  font-size: 13px;\n  padding: 10px;\n  line-height: 20px;\n  color: #CCC;\n}\n.pswp__caption--empty {\n  display: none;\n}\n/* Fake caption element, used to calculate height of next/prev image */\n.pswp__caption--fake {\n  visibility: hidden;\n}\n/*\n\n\t5. Loading indicator (preloader)\n\n\tYou can play with it here - http://codepen.io/dimsemenov/pen/yyBWoR\n\n */\n.pswp__preloader {\n  width: 44px;\n  height: 44px;\n  position: absolute;\n  top: 0;\n  left: 50%;\n  margin-left: -22px;\n  opacity: 0;\n  -webkit-transition: opacity 0.25s ease-out;\n  transition: opacity 0.25s ease-out;\n  will-change: opacity;\n  direction: ltr;\n}\n.pswp__preloader__icn {\n  width: 20px;\n  height: 20px;\n  margin: 12px;\n}\n.pswp__preloader--active {\n  opacity: 1;\n}\n.pswp__preloader--active .pswp__preloader__icn {\n  /* We use .gif in browsers that don't support CSS animation */\n  background: url(" + __webpack_require__(12) + ") 0 0 no-repeat;\n}\n.pswp--css_animation .pswp__preloader--active {\n  opacity: 1;\n}\n.pswp--css_animation .pswp__preloader--active .pswp__preloader__icn {\n  -webkit-animation: clockwise 500ms linear infinite;\n  animation: clockwise 500ms linear infinite;\n}\n.pswp--css_animation .pswp__preloader--active .pswp__preloader__donut {\n  -webkit-animation: donut-rotate 1000ms cubic-bezier(0.4, 0, 0.22, 1) infinite;\n  animation: donut-rotate 1000ms cubic-bezier(0.4, 0, 0.22, 1) infinite;\n}\n.pswp--css_animation .pswp__preloader__icn {\n  background: none;\n  opacity: 0.75;\n  width: 14px;\n  height: 14px;\n  position: absolute;\n  left: 15px;\n  top: 15px;\n  margin: 0;\n}\n.pswp--css_animation .pswp__preloader__cut {\n  /* \n\t\t\tThe idea of animating inner circle is based on Polymer (\"material\") loading indicator \n\t\t\t by Keanu Lee https://blog.keanulee.com/2014/10/20/the-tale-of-three-spinners.html\n\t\t*/\n  position: relative;\n  width: 7px;\n  height: 14px;\n  overflow: hidden;\n}\n.pswp--css_animation .pswp__preloader__donut {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  width: 14px;\n  height: 14px;\n  border: 2px solid #FFF;\n  border-radius: 50%;\n  border-left-color: transparent;\n  border-bottom-color: transparent;\n  position: absolute;\n  top: 0;\n  left: 0;\n  background: none;\n  margin: 0;\n}\n@media screen and (max-width: 1024px) {\n  .pswp__preloader {\n    position: relative;\n    left: auto;\n    top: auto;\n    margin: 0;\n    float: right;\n  }\n}\n@-webkit-keyframes clockwise {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes clockwise {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@-webkit-keyframes donut-rotate {\n  0% {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n  50% {\n    -webkit-transform: rotate(-140deg);\n    transform: rotate(-140deg);\n  }\n  100% {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n}\n@keyframes donut-rotate {\n  0% {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n  50% {\n    -webkit-transform: rotate(-140deg);\n    transform: rotate(-140deg);\n  }\n  100% {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n}\n/*\n\t\n\t6. Additional styles\n\n */\n/* root element of UI */\n.pswp__ui {\n  -webkit-font-smoothing: auto;\n  visibility: visible;\n  opacity: 1;\n  z-index: 1550;\n}\n/* top black bar with buttons and \"1 of X\" indicator */\n.pswp__top-bar {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 44px;\n  width: 100%;\n}\n.pswp__caption,\n.pswp__top-bar,\n.pswp--has_mouse .pswp__button--arrow--left,\n.pswp--has_mouse .pswp__button--arrow--right {\n  -webkit-backface-visibility: hidden;\n  will-change: opacity;\n  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);\n}\n/* pswp--has_mouse class is added only when two subsequent mousemove events occur */\n.pswp--has_mouse .pswp__button--arrow--left,\n.pswp--has_mouse .pswp__button--arrow--right {\n  visibility: visible;\n}\n.pswp__top-bar,\n.pswp__caption {\n  background-color: rgba(0, 0, 0, 0.5);\n}\n/* pswp__ui--fit class is added when main image \"fits\" between top bar and bottom bar (caption) */\n.pswp__ui--fit .pswp__top-bar,\n.pswp__ui--fit .pswp__caption {\n  background-color: rgba(0, 0, 0, 0.3);\n}\n/* pswp__ui--idle class is added when mouse isn't moving for several seconds (JS option timeToIdle) */\n.pswp__ui--idle .pswp__top-bar {\n  opacity: 0;\n}\n.pswp__ui--idle .pswp__button--arrow--left,\n.pswp__ui--idle .pswp__button--arrow--right {\n  opacity: 0;\n}\n/*\n\tpswp__ui--hidden class is added when controls are hidden\n\te.g. when user taps to toggle visibility of controls\n*/\n.pswp__ui--hidden .pswp__top-bar,\n.pswp__ui--hidden .pswp__caption,\n.pswp__ui--hidden .pswp__button--arrow--left,\n.pswp__ui--hidden .pswp__button--arrow--right {\n  /* Force paint & create composition layer for controls. */\n  opacity: 0.001;\n}\n/* pswp__ui--one-slide class is added when there is just one item in gallery */\n.pswp__ui--one-slide .pswp__button--arrow--left,\n.pswp__ui--one-slide .pswp__button--arrow--right,\n.pswp__ui--one-slide .pswp__counter {\n  display: none;\n}\n.pswp__element--disabled {\n  display: none !important;\n}\n.pswp--minimal--dark .pswp__top-bar {\n  background: none;\n}\n", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/default-skin-e3f799.png";

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,bW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArICJpbWFnZXMvZGVmYXVsdC1za2luLWIyNTdmYS5zdmciOw=="

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/preloader-e34aaf.gif";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! PhotoSwipe - v4.1.2 - 2017-04-05
* http://photoswipe.com
* Copyright (c) 2017 Dmitry Semenov; */
!function(a,b){ true?!(__WEBPACK_AMD_DEFINE_FACTORY__ = (b),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof exports?module.exports=b():a.PhotoSwipe=b()}(this,function(){"use strict";var a=function(a,b,c,d){var e={features:null,bind:function(a,b,c,d){var e=(d?"remove":"add")+"EventListener";b=b.split(" ");for(var f=0;f<b.length;f++)b[f]&&a[e](b[f],c,!1)},isArray:function(a){return a instanceof Array},createEl:function(a,b){var c=document.createElement(b||"div");return a&&(c.className=a),c},getScrollY:function(){var a=window.pageYOffset;return void 0!==a?a:document.documentElement.scrollTop},unbind:function(a,b,c){e.bind(a,b,c,!0)},removeClass:function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")},addClass:function(a,b){e.hasClass(a,b)||(a.className+=(a.className?" ":"")+b)},hasClass:function(a,b){return a.className&&new RegExp("(^|\\s)"+b+"(\\s|$)").test(a.className)},getChildByClass:function(a,b){for(var c=a.firstChild;c;){if(e.hasClass(c,b))return c;c=c.nextSibling}},arraySearch:function(a,b,c){for(var d=a.length;d--;)if(a[d][c]===b)return d;return-1},extend:function(a,b,c){for(var d in b)if(b.hasOwnProperty(d)){if(c&&a.hasOwnProperty(d))continue;a[d]=b[d]}},easing:{sine:{out:function(a){return Math.sin(a*(Math.PI/2))},inOut:function(a){return-(Math.cos(Math.PI*a)-1)/2}},cubic:{out:function(a){return--a*a*a+1}}},detectFeatures:function(){if(e.features)return e.features;var a=e.createEl(),b=a.style,c="",d={};if(d.oldIE=document.all&&!document.addEventListener,d.touch="ontouchstart"in window,window.requestAnimationFrame&&(d.raf=window.requestAnimationFrame,d.caf=window.cancelAnimationFrame),d.pointerEvent=navigator.pointerEnabled||navigator.msPointerEnabled,!d.pointerEvent){var f=navigator.userAgent;if(/iP(hone|od)/.test(navigator.platform)){var g=navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);g&&g.length>0&&(g=parseInt(g[1],10),g>=1&&g<8&&(d.isOldIOSPhone=!0))}var h=f.match(/Android\s([0-9\.]*)/),i=h?h[1]:0;i=parseFloat(i),i>=1&&(i<4.4&&(d.isOldAndroid=!0),d.androidVersion=i),d.isMobileOpera=/opera mini|opera mobi/i.test(f)}for(var j,k,l=["transform","perspective","animationName"],m=["","webkit","Moz","ms","O"],n=0;n<4;n++){c=m[n];for(var o=0;o<3;o++)j=l[o],k=c+(c?j.charAt(0).toUpperCase()+j.slice(1):j),!d[j]&&k in b&&(d[j]=k);c&&!d.raf&&(c=c.toLowerCase(),d.raf=window[c+"RequestAnimationFrame"],d.raf&&(d.caf=window[c+"CancelAnimationFrame"]||window[c+"CancelRequestAnimationFrame"]))}if(!d.raf){var p=0;d.raf=function(a){var b=(new Date).getTime(),c=Math.max(0,16-(b-p)),d=window.setTimeout(function(){a(b+c)},c);return p=b+c,d},d.caf=function(a){clearTimeout(a)}}return d.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,e.features=d,d}};e.detectFeatures(),e.features.oldIE&&(e.bind=function(a,b,c,d){b=b.split(" ");for(var e,f=(d?"detach":"attach")+"Event",g=function(){c.handleEvent.call(c)},h=0;h<b.length;h++)if(e=b[h])if("object"==typeof c&&c.handleEvent){if(d){if(!c["oldIE"+e])return!1}else c["oldIE"+e]=g;a[f]("on"+e,c["oldIE"+e])}else a[f]("on"+e,c)});var f=this,g=25,h=3,i={allowPanToNext:!0,spacing:.12,bgOpacity:1,mouseUsed:!1,loop:!0,pinchToClose:!0,closeOnScroll:!0,closeOnVerticalDrag:!0,verticalDragRange:.75,hideAnimationDuration:333,showAnimationDuration:333,showHideOpacity:!1,focus:!0,escKey:!0,arrowKeys:!0,mainScrollEndFriction:.35,panEndFriction:.35,isClickableElement:function(a){return"A"===a.tagName},getDoubleTapZoom:function(a,b){return a?1:b.initialZoomLevel<.7?1:1.33},maxSpreadZoom:1.33,modal:!0,scaleMode:"fit"};e.extend(i,d);var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,aa,ba,ca,da,ea,fa,ga,ha,ia,ja,ka,la,ma=function(){return{x:0,y:0}},na=ma(),oa=ma(),pa=ma(),qa={},ra=0,sa={},ta=ma(),ua=0,va=!0,wa=[],xa={},ya=!1,za=function(a,b){e.extend(f,b.publicMethods),wa.push(a)},Aa=function(a){var b=ac();return a>b-1?a-b:a<0?b+a:a},Ba={},Ca=function(a,b){return Ba[a]||(Ba[a]=[]),Ba[a].push(b)},Da=function(a){var b=Ba[a];if(b){var c=Array.prototype.slice.call(arguments);c.shift();for(var d=0;d<b.length;d++)b[d].apply(f,c)}},Ea=function(){return(new Date).getTime()},Fa=function(a){ja=a,f.bg.style.opacity=a*i.bgOpacity},Ga=function(a,b,c,d,e){(!ya||e&&e!==f.currItem)&&(d/=e?e.fitRatio:f.currItem.fitRatio),a[E]=u+b+"px, "+c+"px"+v+" scale("+d+")"},Ha=function(a){ea&&(a&&(s>f.currItem.fitRatio?ya||(mc(f.currItem,!1,!0),ya=!0):ya&&(mc(f.currItem),ya=!1)),Ga(ea,pa.x,pa.y,s))},Ia=function(a){a.container&&Ga(a.container.style,a.initialPosition.x,a.initialPosition.y,a.initialZoomLevel,a)},Ja=function(a,b){b[E]=u+a+"px, 0px"+v},Ka=function(a,b){if(!i.loop&&b){var c=m+(ta.x*ra-a)/ta.x,d=Math.round(a-tb.x);(c<0&&d>0||c>=ac()-1&&d<0)&&(a=tb.x+d*i.mainScrollEndFriction)}tb.x=a,Ja(a,n)},La=function(a,b){var c=ub[a]-sa[a];return oa[a]+na[a]+c-c*(b/t)},Ma=function(a,b){a.x=b.x,a.y=b.y,b.id&&(a.id=b.id)},Na=function(a){a.x=Math.round(a.x),a.y=Math.round(a.y)},Oa=null,Pa=function(){Oa&&(e.unbind(document,"mousemove",Pa),e.addClass(a,"pswp--has_mouse"),i.mouseUsed=!0,Da("mouseUsed")),Oa=setTimeout(function(){Oa=null},100)},Qa=function(){e.bind(document,"keydown",f),N.transform&&e.bind(f.scrollWrap,"click",f),i.mouseUsed||e.bind(document,"mousemove",Pa),e.bind(window,"resize scroll orientationchange",f),Da("bindEvents")},Ra=function(){e.unbind(window,"resize scroll orientationchange",f),e.unbind(window,"scroll",r.scroll),e.unbind(document,"keydown",f),e.unbind(document,"mousemove",Pa),N.transform&&e.unbind(f.scrollWrap,"click",f),V&&e.unbind(window,p,f),clearTimeout(O),Da("unbindEvents")},Sa=function(a,b){var c=ic(f.currItem,qa,a);return b&&(da=c),c},Ta=function(a){return a||(a=f.currItem),a.initialZoomLevel},Ua=function(a){return a||(a=f.currItem),a.w>0?i.maxSpreadZoom:1},Va=function(a,b,c,d){return d===f.currItem.initialZoomLevel?(c[a]=f.currItem.initialPosition[a],!0):(c[a]=La(a,d),c[a]>b.min[a]?(c[a]=b.min[a],!0):c[a]<b.max[a]&&(c[a]=b.max[a],!0))},Wa=function(){if(E){var b=N.perspective&&!G;return u="translate"+(b?"3d(":"("),void(v=N.perspective?", 0px)":")")}E="left",e.addClass(a,"pswp--ie"),Ja=function(a,b){b.left=a+"px"},Ia=function(a){var b=a.fitRatio>1?1:a.fitRatio,c=a.container.style,d=b*a.w,e=b*a.h;c.width=d+"px",c.height=e+"px",c.left=a.initialPosition.x+"px",c.top=a.initialPosition.y+"px"},Ha=function(){if(ea){var a=ea,b=f.currItem,c=b.fitRatio>1?1:b.fitRatio,d=c*b.w,e=c*b.h;a.width=d+"px",a.height=e+"px",a.left=pa.x+"px",a.top=pa.y+"px"}}},Xa=function(a){var b="";i.escKey&&27===a.keyCode?b="close":i.arrowKeys&&(37===a.keyCode?b="prev":39===a.keyCode&&(b="next")),b&&(a.ctrlKey||a.altKey||a.shiftKey||a.metaKey||(a.preventDefault?a.preventDefault():a.returnValue=!1,f[b]()))},Ya=function(a){a&&(Y||X||fa||T)&&(a.preventDefault(),a.stopPropagation())},Za=function(){f.setScrollOffset(0,e.getScrollY())},$a={},_a=0,ab=function(a){$a[a]&&($a[a].raf&&I($a[a].raf),_a--,delete $a[a])},bb=function(a){$a[a]&&ab(a),$a[a]||(_a++,$a[a]={})},cb=function(){for(var a in $a)$a.hasOwnProperty(a)&&ab(a)},db=function(a,b,c,d,e,f,g){var h,i=Ea();bb(a);var j=function(){if($a[a]){if(h=Ea()-i,h>=d)return ab(a),f(c),void(g&&g());f((c-b)*e(h/d)+b),$a[a].raf=H(j)}};j()},eb={shout:Da,listen:Ca,viewportSize:qa,options:i,isMainScrollAnimating:function(){return fa},getZoomLevel:function(){return s},getCurrentIndex:function(){return m},isDragging:function(){return V},isZooming:function(){return aa},setScrollOffset:function(a,b){sa.x=a,M=sa.y=b,Da("updateScrollOffset",sa)},applyZoomPan:function(a,b,c,d){pa.x=b,pa.y=c,s=a,Ha(d)},init:function(){if(!j&&!k){var c;f.framework=e,f.template=a,f.bg=e.getChildByClass(a,"pswp__bg"),J=a.className,j=!0,N=e.detectFeatures(),H=N.raf,I=N.caf,E=N.transform,L=N.oldIE,f.scrollWrap=e.getChildByClass(a,"pswp__scroll-wrap"),f.container=e.getChildByClass(f.scrollWrap,"pswp__container"),n=f.container.style,f.itemHolders=y=[{el:f.container.children[0],wrap:0,index:-1},{el:f.container.children[1],wrap:0,index:-1},{el:f.container.children[2],wrap:0,index:-1}],y[0].el.style.display=y[2].el.style.display="none",Wa(),r={resize:f.updateSize,orientationchange:function(){clearTimeout(O),O=setTimeout(function(){qa.x!==f.scrollWrap.clientWidth&&f.updateSize()},500)},scroll:Za,keydown:Xa,click:Ya};var d=N.isOldIOSPhone||N.isOldAndroid||N.isMobileOpera;for(N.animationName&&N.transform&&!d||(i.showAnimationDuration=i.hideAnimationDuration=0),c=0;c<wa.length;c++)f["init"+wa[c]]();if(b){var g=f.ui=new b(f,e);g.init()}Da("firstUpdate"),m=m||i.index||0,(isNaN(m)||m<0||m>=ac())&&(m=0),f.currItem=_b(m),(N.isOldIOSPhone||N.isOldAndroid)&&(va=!1),a.setAttribute("aria-hidden","false"),i.modal&&(va?a.style.position="fixed":(a.style.position="absolute",a.style.top=e.getScrollY()+"px")),void 0===M&&(Da("initialLayout"),M=K=e.getScrollY());var l="pswp--open ";for(i.mainClass&&(l+=i.mainClass+" "),i.showHideOpacity&&(l+="pswp--animate_opacity "),l+=G?"pswp--touch":"pswp--notouch",l+=N.animationName?" pswp--css_animation":"",l+=N.svg?" pswp--svg":"",e.addClass(a,l),f.updateSize(),o=-1,ua=null,c=0;c<h;c++)Ja((c+o)*ta.x,y[c].el.style);L||e.bind(f.scrollWrap,q,f),Ca("initialZoomInEnd",function(){f.setContent(y[0],m-1),f.setContent(y[2],m+1),y[0].el.style.display=y[2].el.style.display="block",i.focus&&a.focus(),Qa()}),f.setContent(y[1],m),f.updateCurrItem(),Da("afterInit"),va||(w=setInterval(function(){_a||V||aa||s!==f.currItem.initialZoomLevel||f.updateSize()},1e3)),e.addClass(a,"pswp--visible")}},close:function(){j&&(j=!1,k=!0,Da("close"),Ra(),cc(f.currItem,null,!0,f.destroy))},destroy:function(){Da("destroy"),Xb&&clearTimeout(Xb),a.setAttribute("aria-hidden","true"),a.className=J,w&&clearInterval(w),e.unbind(f.scrollWrap,q,f),e.unbind(window,"scroll",f),zb(),cb(),Ba=null},panTo:function(a,b,c){c||(a>da.min.x?a=da.min.x:a<da.max.x&&(a=da.max.x),b>da.min.y?b=da.min.y:b<da.max.y&&(b=da.max.y)),pa.x=a,pa.y=b,Ha()},handleEvent:function(a){a=a||window.event,r[a.type]&&r[a.type](a)},goTo:function(a){a=Aa(a);var b=a-m;ua=b,m=a,f.currItem=_b(m),ra-=b,Ka(ta.x*ra),cb(),fa=!1,f.updateCurrItem()},next:function(){f.goTo(m+1)},prev:function(){f.goTo(m-1)},updateCurrZoomItem:function(a){if(a&&Da("beforeChange",0),y[1].el.children.length){var b=y[1].el.children[0];ea=e.hasClass(b,"pswp__zoom-wrap")?b.style:null}else ea=null;da=f.currItem.bounds,t=s=f.currItem.initialZoomLevel,pa.x=da.center.x,pa.y=da.center.y,a&&Da("afterChange")},invalidateCurrItems:function(){x=!0;for(var a=0;a<h;a++)y[a].item&&(y[a].item.needsUpdate=!0)},updateCurrItem:function(a){if(0!==ua){var b,c=Math.abs(ua);if(!(a&&c<2)){f.currItem=_b(m),ya=!1,Da("beforeChange",ua),c>=h&&(o+=ua+(ua>0?-h:h),c=h);for(var d=0;d<c;d++)ua>0?(b=y.shift(),y[h-1]=b,o++,Ja((o+2)*ta.x,b.el.style),f.setContent(b,m-c+d+1+1)):(b=y.pop(),y.unshift(b),o--,Ja(o*ta.x,b.el.style),f.setContent(b,m+c-d-1-1));if(ea&&1===Math.abs(ua)){var e=_b(z);e.initialZoomLevel!==s&&(ic(e,qa),mc(e),Ia(e))}ua=0,f.updateCurrZoomItem(),z=m,Da("afterChange")}}},updateSize:function(b){if(!va&&i.modal){var c=e.getScrollY();if(M!==c&&(a.style.top=c+"px",M=c),!b&&xa.x===window.innerWidth&&xa.y===window.innerHeight)return;xa.x=window.innerWidth,xa.y=window.innerHeight,a.style.height=xa.y+"px"}if(qa.x=f.scrollWrap.clientWidth,qa.y=f.scrollWrap.clientHeight,Za(),ta.x=qa.x+Math.round(qa.x*i.spacing),ta.y=qa.y,Ka(ta.x*ra),Da("beforeResize"),void 0!==o){for(var d,g,j,k=0;k<h;k++)d=y[k],Ja((k+o)*ta.x,d.el.style),j=m+k-1,i.loop&&ac()>2&&(j=Aa(j)),g=_b(j),g&&(x||g.needsUpdate||!g.bounds)?(f.cleanSlide(g),f.setContent(d,j),1===k&&(f.currItem=g,f.updateCurrZoomItem(!0)),g.needsUpdate=!1):d.index===-1&&j>=0&&f.setContent(d,j),g&&g.container&&(ic(g,qa),mc(g),Ia(g));x=!1}t=s=f.currItem.initialZoomLevel,da=f.currItem.bounds,da&&(pa.x=da.center.x,pa.y=da.center.y,Ha(!0)),Da("resize")},zoomTo:function(a,b,c,d,f){b&&(t=s,ub.x=Math.abs(b.x)-pa.x,ub.y=Math.abs(b.y)-pa.y,Ma(oa,pa));var g=Sa(a,!1),h={};Va("x",g,h,a),Va("y",g,h,a);var i=s,j={x:pa.x,y:pa.y};Na(h);var k=function(b){1===b?(s=a,pa.x=h.x,pa.y=h.y):(s=(a-i)*b+i,pa.x=(h.x-j.x)*b+j.x,pa.y=(h.y-j.y)*b+j.y),f&&f(b),Ha(1===b)};c?db("customZoomTo",0,1,c,d||e.easing.sine.inOut,k):k(1)}},fb=30,gb=10,hb={},ib={},jb={},kb={},lb={},mb=[],nb={},ob=[],pb={},qb=0,rb=ma(),sb=0,tb=ma(),ub=ma(),vb=ma(),wb=function(a,b){return a.x===b.x&&a.y===b.y},xb=function(a,b){return Math.abs(a.x-b.x)<g&&Math.abs(a.y-b.y)<g},yb=function(a,b){return pb.x=Math.abs(a.x-b.x),pb.y=Math.abs(a.y-b.y),Math.sqrt(pb.x*pb.x+pb.y*pb.y)},zb=function(){Z&&(I(Z),Z=null)},Ab=function(){V&&(Z=H(Ab),Qb())},Bb=function(){return!("fit"===i.scaleMode&&s===f.currItem.initialZoomLevel)},Cb=function(a,b){return!(!a||a===document)&&(!(a.getAttribute("class")&&a.getAttribute("class").indexOf("pswp__scroll-wrap")>-1)&&(b(a)?a:Cb(a.parentNode,b)))},Db={},Eb=function(a,b){return Db.prevent=!Cb(a.target,i.isClickableElement),Da("preventDragEvent",a,b,Db),Db.prevent},Fb=function(a,b){return b.x=a.pageX,b.y=a.pageY,b.id=a.identifier,b},Gb=function(a,b,c){c.x=.5*(a.x+b.x),c.y=.5*(a.y+b.y)},Hb=function(a,b,c){if(a-Q>50){var d=ob.length>2?ob.shift():{};d.x=b,d.y=c,ob.push(d),Q=a}},Ib=function(){var a=pa.y-f.currItem.initialPosition.y;return 1-Math.abs(a/(qa.y/2))},Jb={},Kb={},Lb=[],Mb=function(a){for(;Lb.length>0;)Lb.pop();return F?(la=0,mb.forEach(function(a){0===la?Lb[0]=a:1===la&&(Lb[1]=a),la++})):a.type.indexOf("touch")>-1?a.touches&&a.touches.length>0&&(Lb[0]=Fb(a.touches[0],Jb),a.touches.length>1&&(Lb[1]=Fb(a.touches[1],Kb))):(Jb.x=a.pageX,Jb.y=a.pageY,Jb.id="",Lb[0]=Jb),Lb},Nb=function(a,b){var c,d,e,g,h=0,j=pa[a]+b[a],k=b[a]>0,l=tb.x+b.x,m=tb.x-nb.x;return c=j>da.min[a]||j<da.max[a]?i.panEndFriction:1,j=pa[a]+b[a]*c,!i.allowPanToNext&&s!==f.currItem.initialZoomLevel||(ea?"h"!==ga||"x"!==a||X||(k?(j>da.min[a]&&(c=i.panEndFriction,h=da.min[a]-j,d=da.min[a]-oa[a]),(d<=0||m<0)&&ac()>1?(g=l,m<0&&l>nb.x&&(g=nb.x)):da.min.x!==da.max.x&&(e=j)):(j<da.max[a]&&(c=i.panEndFriction,h=j-da.max[a],d=oa[a]-da.max[a]),(d<=0||m>0)&&ac()>1?(g=l,m>0&&l<nb.x&&(g=nb.x)):da.min.x!==da.max.x&&(e=j))):g=l,"x"!==a)?void(fa||$||s>f.currItem.fitRatio&&(pa[a]+=b[a]*c)):(void 0!==g&&(Ka(g,!0),$=g!==nb.x),da.min.x!==da.max.x&&(void 0!==e?pa.x=e:$||(pa.x+=b.x*c)),void 0!==g)},Ob=function(a){if(!("mousedown"===a.type&&a.button>0)){if($b)return void a.preventDefault();if(!U||"mousedown"!==a.type){if(Eb(a,!0)&&a.preventDefault(),Da("pointerDown"),F){var b=e.arraySearch(mb,a.pointerId,"id");b<0&&(b=mb.length),mb[b]={x:a.pageX,y:a.pageY,id:a.pointerId}}var c=Mb(a),d=c.length;_=null,cb(),V&&1!==d||(V=ha=!0,e.bind(window,p,f),S=ka=ia=T=$=Y=W=X=!1,ga=null,Da("firstTouchStart",c),Ma(oa,pa),na.x=na.y=0,Ma(kb,c[0]),Ma(lb,kb),nb.x=ta.x*ra,ob=[{x:kb.x,y:kb.y}],Q=P=Ea(),Sa(s,!0),zb(),Ab()),!aa&&d>1&&!fa&&!$&&(t=s,X=!1,aa=W=!0,na.y=na.x=0,Ma(oa,pa),Ma(hb,c[0]),Ma(ib,c[1]),Gb(hb,ib,vb),ub.x=Math.abs(vb.x)-pa.x,ub.y=Math.abs(vb.y)-pa.y,ba=ca=yb(hb,ib))}}},Pb=function(a){if(a.preventDefault(),F){var b=e.arraySearch(mb,a.pointerId,"id");if(b>-1){var c=mb[b];c.x=a.pageX,c.y=a.pageY}}if(V){var d=Mb(a);if(ga||Y||aa)_=d;else if(tb.x!==ta.x*ra)ga="h";else{var f=Math.abs(d[0].x-kb.x)-Math.abs(d[0].y-kb.y);Math.abs(f)>=gb&&(ga=f>0?"h":"v",_=d)}}},Qb=function(){if(_){var a=_.length;if(0!==a)if(Ma(hb,_[0]),jb.x=hb.x-kb.x,jb.y=hb.y-kb.y,aa&&a>1){if(kb.x=hb.x,kb.y=hb.y,!jb.x&&!jb.y&&wb(_[1],ib))return;Ma(ib,_[1]),X||(X=!0,Da("zoomGestureStarted"));var b=yb(hb,ib),c=Vb(b);c>f.currItem.initialZoomLevel+f.currItem.initialZoomLevel/15&&(ka=!0);var d=1,e=Ta(),g=Ua();if(c<e)if(i.pinchToClose&&!ka&&t<=f.currItem.initialZoomLevel){var h=e-c,j=1-h/(e/1.2);Fa(j),Da("onPinchClose",j),ia=!0}else d=(e-c)/e,d>1&&(d=1),c=e-d*(e/3);else c>g&&(d=(c-g)/(6*e),d>1&&(d=1),c=g+d*e);d<0&&(d=0),ba=b,Gb(hb,ib,rb),na.x+=rb.x-vb.x,na.y+=rb.y-vb.y,Ma(vb,rb),pa.x=La("x",c),pa.y=La("y",c),S=c>s,s=c,Ha()}else{if(!ga)return;if(ha&&(ha=!1,Math.abs(jb.x)>=gb&&(jb.x-=_[0].x-lb.x),Math.abs(jb.y)>=gb&&(jb.y-=_[0].y-lb.y)),kb.x=hb.x,kb.y=hb.y,0===jb.x&&0===jb.y)return;if("v"===ga&&i.closeOnVerticalDrag&&!Bb()){na.y+=jb.y,pa.y+=jb.y;var k=Ib();return T=!0,Da("onVerticalDrag",k),Fa(k),void Ha()}Hb(Ea(),hb.x,hb.y),Y=!0,da=f.currItem.bounds;var l=Nb("x",jb);l||(Nb("y",jb),Na(pa),Ha())}}},Rb=function(a){if(N.isOldAndroid){if(U&&"mouseup"===a.type)return;a.type.indexOf("touch")>-1&&(clearTimeout(U),U=setTimeout(function(){U=0},600))}Da("pointerUp"),Eb(a,!1)&&a.preventDefault();var b;if(F){var c=e.arraySearch(mb,a.pointerId,"id");if(c>-1)if(b=mb.splice(c,1)[0],navigator.pointerEnabled)b.type=a.pointerType||"mouse";else{var d={4:"mouse",2:"touch",3:"pen"};b.type=d[a.pointerType],b.type||(b.type=a.pointerType||"mouse")}}var g,h=Mb(a),j=h.length;if("mouseup"===a.type&&(j=0),2===j)return _=null,!0;1===j&&Ma(lb,h[0]),0!==j||ga||fa||(b||("mouseup"===a.type?b={x:a.pageX,y:a.pageY,type:"mouse"}:a.changedTouches&&a.changedTouches[0]&&(b={x:a.changedTouches[0].pageX,y:a.changedTouches[0].pageY,type:"touch"})),Da("touchRelease",a,b));var k=-1;if(0===j&&(V=!1,e.unbind(window,p,f),zb(),aa?k=0:sb!==-1&&(k=Ea()-sb)),sb=1===j?Ea():-1,g=k!==-1&&k<150?"zoom":"swipe",aa&&j<2&&(aa=!1,1===j&&(g="zoomPointerUp"),Da("zoomGestureEnded")),_=null,Y||X||fa||T)if(cb(),R||(R=Sb()),R.calculateSwipeSpeed("x"),T){var l=Ib();if(l<i.verticalDragRange)f.close();else{var m=pa.y,n=ja;db("verticalDrag",0,1,300,e.easing.cubic.out,function(a){pa.y=(f.currItem.initialPosition.y-m)*a+m,Fa((1-n)*a+n),Ha()}),Da("onVerticalDrag",1)}}else{if(($||fa)&&0===j){var o=Ub(g,R);if(o)return;g="zoomPointerUp"}if(!fa)return"swipe"!==g?void Wb():void(!$&&s>f.currItem.fitRatio&&Tb(R))}},Sb=function(){var a,b,c={lastFlickOffset:{},lastFlickDist:{},lastFlickSpeed:{},slowDownRatio:{},slowDownRatioReverse:{},speedDecelerationRatio:{},speedDecelerationRatioAbs:{},distanceOffset:{},backAnimDestination:{},backAnimStarted:{},calculateSwipeSpeed:function(d){ob.length>1?(a=Ea()-Q+50,b=ob[ob.length-2][d]):(a=Ea()-P,b=lb[d]),c.lastFlickOffset[d]=kb[d]-b,c.lastFlickDist[d]=Math.abs(c.lastFlickOffset[d]),c.lastFlickDist[d]>20?c.lastFlickSpeed[d]=c.lastFlickOffset[d]/a:c.lastFlickSpeed[d]=0,Math.abs(c.lastFlickSpeed[d])<.1&&(c.lastFlickSpeed[d]=0),c.slowDownRatio[d]=.95,c.slowDownRatioReverse[d]=1-c.slowDownRatio[d],c.speedDecelerationRatio[d]=1},calculateOverBoundsAnimOffset:function(a,b){c.backAnimStarted[a]||(pa[a]>da.min[a]?c.backAnimDestination[a]=da.min[a]:pa[a]<da.max[a]&&(c.backAnimDestination[a]=da.max[a]),void 0!==c.backAnimDestination[a]&&(c.slowDownRatio[a]=.7,c.slowDownRatioReverse[a]=1-c.slowDownRatio[a],c.speedDecelerationRatioAbs[a]<.05&&(c.lastFlickSpeed[a]=0,c.backAnimStarted[a]=!0,db("bounceZoomPan"+a,pa[a],c.backAnimDestination[a],b||300,e.easing.sine.out,function(b){pa[a]=b,Ha()}))))},calculateAnimOffset:function(a){c.backAnimStarted[a]||(c.speedDecelerationRatio[a]=c.speedDecelerationRatio[a]*(c.slowDownRatio[a]+c.slowDownRatioReverse[a]-c.slowDownRatioReverse[a]*c.timeDiff/10),c.speedDecelerationRatioAbs[a]=Math.abs(c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]),c.distanceOffset[a]=c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]*c.timeDiff,pa[a]+=c.distanceOffset[a])},panAnimLoop:function(){if($a.zoomPan&&($a.zoomPan.raf=H(c.panAnimLoop),c.now=Ea(),c.timeDiff=c.now-c.lastNow,c.lastNow=c.now,c.calculateAnimOffset("x"),c.calculateAnimOffset("y"),Ha(),c.calculateOverBoundsAnimOffset("x"),c.calculateOverBoundsAnimOffset("y"),c.speedDecelerationRatioAbs.x<.05&&c.speedDecelerationRatioAbs.y<.05))return pa.x=Math.round(pa.x),pa.y=Math.round(pa.y),Ha(),void ab("zoomPan")}};return c},Tb=function(a){return a.calculateSwipeSpeed("y"),da=f.currItem.bounds,a.backAnimDestination={},a.backAnimStarted={},Math.abs(a.lastFlickSpeed.x)<=.05&&Math.abs(a.lastFlickSpeed.y)<=.05?(a.speedDecelerationRatioAbs.x=a.speedDecelerationRatioAbs.y=0,a.calculateOverBoundsAnimOffset("x"),a.calculateOverBoundsAnimOffset("y"),!0):(bb("zoomPan"),a.lastNow=Ea(),void a.panAnimLoop())},Ub=function(a,b){var c;fa||(qb=m);var d;if("swipe"===a){var g=kb.x-lb.x,h=b.lastFlickDist.x<10;g>fb&&(h||b.lastFlickOffset.x>20)?d=-1:g<-fb&&(h||b.lastFlickOffset.x<-20)&&(d=1)}var j;d&&(m+=d,m<0?(m=i.loop?ac()-1:0,j=!0):m>=ac()&&(m=i.loop?0:ac()-1,j=!0),j&&!i.loop||(ua+=d,ra-=d,c=!0));var k,l=ta.x*ra,n=Math.abs(l-tb.x);return c||l>tb.x==b.lastFlickSpeed.x>0?(k=Math.abs(b.lastFlickSpeed.x)>0?n/Math.abs(b.lastFlickSpeed.x):333,k=Math.min(k,400),k=Math.max(k,250)):k=333,qb===m&&(c=!1),fa=!0,Da("mainScrollAnimStart"),db("mainScroll",tb.x,l,k,e.easing.cubic.out,Ka,function(){cb(),fa=!1,qb=-1,(c||qb!==m)&&f.updateCurrItem(),Da("mainScrollAnimComplete")}),c&&f.updateCurrItem(!0),c},Vb=function(a){return 1/ca*a*t},Wb=function(){var a=s,b=Ta(),c=Ua();s<b?a=b:s>c&&(a=c);var d,g=1,h=ja;return ia&&!S&&!ka&&s<b?(f.close(),!0):(ia&&(d=function(a){Fa((g-h)*a+h)}),f.zoomTo(a,0,200,e.easing.cubic.out,d),!0)};za("Gestures",{publicMethods:{initGestures:function(){var a=function(a,b,c,d,e){A=a+b,B=a+c,C=a+d,D=e?a+e:""};F=N.pointerEvent,F&&N.touch&&(N.touch=!1),F?navigator.pointerEnabled?a("pointer","down","move","up","cancel"):a("MSPointer","Down","Move","Up","Cancel"):N.touch?(a("touch","start","move","end","cancel"),G=!0):a("mouse","down","move","up"),p=B+" "+C+" "+D,q=A,F&&!G&&(G=navigator.maxTouchPoints>1||navigator.msMaxTouchPoints>1),f.likelyTouchDevice=G,r[A]=Ob,r[B]=Pb,r[C]=Rb,D&&(r[D]=r[C]),N.touch&&(q+=" mousedown",p+=" mousemove mouseup",r.mousedown=r[A],r.mousemove=r[B],r.mouseup=r[C]),G||(i.allowPanToNext=!1)}}});var Xb,Yb,Zb,$b,_b,ac,bc,cc=function(b,c,d,g){Xb&&clearTimeout(Xb),$b=!0,Zb=!0;var h;b.initialLayout?(h=b.initialLayout,b.initialLayout=null):h=i.getThumbBoundsFn&&i.getThumbBoundsFn(m);var j=d?i.hideAnimationDuration:i.showAnimationDuration,k=function(){ab("initialZoom"),d?(f.template.removeAttribute("style"),f.bg.removeAttribute("style")):(Fa(1),c&&(c.style.display="block"),e.addClass(a,"pswp--animated-in"),Da("initialZoom"+(d?"OutEnd":"InEnd"))),g&&g(),$b=!1};if(!j||!h||void 0===h.x)return Da("initialZoom"+(d?"Out":"In")),s=b.initialZoomLevel,Ma(pa,b.initialPosition),Ha(),a.style.opacity=d?0:1,Fa(1),void(j?setTimeout(function(){k()},j):k());var n=function(){var c=l,g=!f.currItem.src||f.currItem.loadError||i.showHideOpacity;b.miniImg&&(b.miniImg.style.webkitBackfaceVisibility="hidden"),d||(s=h.w/b.w,pa.x=h.x,pa.y=h.y-K,f[g?"template":"bg"].style.opacity=.001,Ha()),bb("initialZoom"),d&&!c&&e.removeClass(a,"pswp--animated-in"),g&&(d?e[(c?"remove":"add")+"Class"](a,"pswp--animate_opacity"):setTimeout(function(){e.addClass(a,"pswp--animate_opacity")},30)),Xb=setTimeout(function(){if(Da("initialZoom"+(d?"Out":"In")),d){var f=h.w/b.w,i={x:pa.x,y:pa.y},l=s,m=ja,n=function(b){1===b?(s=f,pa.x=h.x,pa.y=h.y-M):(s=(f-l)*b+l,pa.x=(h.x-i.x)*b+i.x,pa.y=(h.y-M-i.y)*b+i.y),Ha(),g?a.style.opacity=1-b:Fa(m-b*m)};c?db("initialZoom",0,1,j,e.easing.cubic.out,n,k):(n(1),Xb=setTimeout(k,j+20))}else s=b.initialZoomLevel,Ma(pa,b.initialPosition),Ha(),Fa(1),g?a.style.opacity=1:Fa(1),Xb=setTimeout(k,j+20)},d?25:90)};n()},dc={},ec=[],fc={index:0,errorMsg:'<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',forceProgressiveLoading:!1,preload:[1,1],getNumItemsFn:function(){return Yb.length}},gc=function(){return{center:{x:0,y:0},max:{x:0,y:0},min:{x:0,y:0}}},hc=function(a,b,c){var d=a.bounds;d.center.x=Math.round((dc.x-b)/2),d.center.y=Math.round((dc.y-c)/2)+a.vGap.top,d.max.x=b>dc.x?Math.round(dc.x-b):d.center.x,d.max.y=c>dc.y?Math.round(dc.y-c)+a.vGap.top:d.center.y,d.min.x=b>dc.x?0:d.center.x,d.min.y=c>dc.y?a.vGap.top:d.center.y},ic=function(a,b,c){if(a.src&&!a.loadError){var d=!c;if(d&&(a.vGap||(a.vGap={top:0,bottom:0}),Da("parseVerticalMargin",a)),dc.x=b.x,dc.y=b.y-a.vGap.top-a.vGap.bottom,d){var e=dc.x/a.w,f=dc.y/a.h;a.fitRatio=e<f?e:f;var g=i.scaleMode;"orig"===g?c=1:"fit"===g&&(c=a.fitRatio),c>1&&(c=1),a.initialZoomLevel=c,a.bounds||(a.bounds=gc())}if(!c)return;return hc(a,a.w*c,a.h*c),d&&c===a.initialZoomLevel&&(a.initialPosition=a.bounds.center),a.bounds}return a.w=a.h=0,a.initialZoomLevel=a.fitRatio=1,a.bounds=gc(),a.initialPosition=a.bounds.center,a.bounds},jc=function(a,b,c,d,e,g){b.loadError||d&&(b.imageAppended=!0,mc(b,d,b===f.currItem&&ya),c.appendChild(d),g&&setTimeout(function(){b&&b.loaded&&b.placeholder&&(b.placeholder.style.display="none",b.placeholder=null)},500))},kc=function(a){a.loading=!0,a.loaded=!1;var b=a.img=e.createEl("pswp__img","img"),c=function(){a.loading=!1,a.loaded=!0,a.loadComplete?a.loadComplete(a):a.img=null,b.onload=b.onerror=null,b=null};return b.onload=c,b.onerror=function(){a.loadError=!0,c()},b.src=a.src,b},lc=function(a,b){if(a.src&&a.loadError&&a.container)return b&&(a.container.innerHTML=""),a.container.innerHTML=i.errorMsg.replace("%url%",a.src),!0},mc=function(a,b,c){if(a.src){b||(b=a.container.lastChild);var d=c?a.w:Math.round(a.w*a.fitRatio),e=c?a.h:Math.round(a.h*a.fitRatio);a.placeholder&&!a.loaded&&(a.placeholder.style.width=d+"px",a.placeholder.style.height=e+"px"),b.style.width=d+"px",b.style.height=e+"px"}},nc=function(){if(ec.length){for(var a,b=0;b<ec.length;b++)a=ec[b],a.holder.index===a.index&&jc(a.index,a.item,a.baseDiv,a.img,!1,a.clearPlaceholder);ec=[]}};za("Controller",{publicMethods:{lazyLoadItem:function(a){a=Aa(a);var b=_b(a);b&&(!b.loaded&&!b.loading||x)&&(Da("gettingData",a,b),b.src&&kc(b))},initController:function(){e.extend(i,fc,!0),f.items=Yb=c,_b=f.getItemAt,ac=i.getNumItemsFn,bc=i.loop,ac()<3&&(i.loop=!1),Ca("beforeChange",function(a){var b,c=i.preload,d=null===a||a>=0,e=Math.min(c[0],ac()),g=Math.min(c[1],ac());for(b=1;b<=(d?g:e);b++)f.lazyLoadItem(m+b);for(b=1;b<=(d?e:g);b++)f.lazyLoadItem(m-b)}),Ca("initialLayout",function(){f.currItem.initialLayout=i.getThumbBoundsFn&&i.getThumbBoundsFn(m)}),Ca("mainScrollAnimComplete",nc),Ca("initialZoomInEnd",nc),Ca("destroy",function(){for(var a,b=0;b<Yb.length;b++)a=Yb[b],a.container&&(a.container=null),a.placeholder&&(a.placeholder=null),a.img&&(a.img=null),a.preloader&&(a.preloader=null),a.loadError&&(a.loaded=a.loadError=!1);ec=null})},getItemAt:function(a){return a>=0&&(void 0!==Yb[a]&&Yb[a])},allowProgressiveImg:function(){return i.forceProgressiveLoading||!G||i.mouseUsed||screen.width>1200},setContent:function(a,b){i.loop&&(b=Aa(b));var c=f.getItemAt(a.index);c&&(c.container=null);var d,g=f.getItemAt(b);if(!g)return void(a.el.innerHTML="");Da("gettingData",b,g),a.index=b,a.item=g;var h=g.container=e.createEl("pswp__zoom-wrap");if(!g.src&&g.html&&(g.html.tagName?h.appendChild(g.html):h.innerHTML=g.html),lc(g),ic(g,qa),!g.src||g.loadError||g.loaded)g.src&&!g.loadError&&(d=e.createEl("pswp__img","img"),d.style.opacity=1,d.src=g.src,mc(g,d),jc(b,g,h,d,!0));else{if(g.loadComplete=function(c){if(j){if(a&&a.index===b){if(lc(c,!0))return c.loadComplete=c.img=null,ic(c,qa),Ia(c),void(a.index===m&&f.updateCurrZoomItem());c.imageAppended?!$b&&c.placeholder&&(c.placeholder.style.display="none",c.placeholder=null):N.transform&&(fa||$b)?ec.push({item:c,baseDiv:h,img:c.img,index:b,holder:a,clearPlaceholder:!0}):jc(b,c,h,c.img,fa||$b,!0)}c.loadComplete=null,c.img=null,Da("imageLoadComplete",b,c)}},e.features.transform){var k="pswp__img pswp__img--placeholder";k+=g.msrc?"":" pswp__img--placeholder--blank";var l=e.createEl(k,g.msrc?"img":"");g.msrc&&(l.src=g.msrc),mc(g,l),h.appendChild(l),g.placeholder=l}g.loading||kc(g),f.allowProgressiveImg()&&(!Zb&&N.transform?ec.push({item:g,baseDiv:h,img:g.img,index:b,holder:a}):jc(b,g,h,g.img,!0,!0))}Zb||b!==m?Ia(g):(ea=h.style,cc(g,d||g.img)),a.el.innerHTML="",a.el.appendChild(h)},cleanSlide:function(a){a.img&&(a.img.onload=a.img.onerror=null),a.loaded=a.loading=a.img=a.imageAppended=!1}}});var oc,pc={},qc=function(a,b,c){var d=document.createEvent("CustomEvent"),e={origEvent:a,target:a.target,releasePoint:b,pointerType:c||"touch"};d.initCustomEvent("pswpTap",!0,!0,e),a.target.dispatchEvent(d)};za("Tap",{publicMethods:{initTap:function(){Ca("firstTouchStart",f.onTapStart),Ca("touchRelease",f.onTapRelease),Ca("destroy",function(){pc={},oc=null})},onTapStart:function(a){a.length>1&&(clearTimeout(oc),oc=null)},onTapRelease:function(a,b){if(b&&!Y&&!W&&!_a){var c=b;if(oc&&(clearTimeout(oc),oc=null,xb(c,pc)))return void Da("doubleTap",c);if("mouse"===b.type)return void qc(a,b,"mouse");var d=a.target.tagName.toUpperCase();if("BUTTON"===d||e.hasClass(a.target,"pswp__single-tap"))return void qc(a,b);Ma(pc,c),oc=setTimeout(function(){qc(a,b),oc=null},300)}}}});var rc;za("DesktopZoom",{publicMethods:{initDesktopZoom:function(){L||(G?Ca("mouseUsed",function(){f.setupDesktopZoom()}):f.setupDesktopZoom(!0))},setupDesktopZoom:function(b){rc={};var c="wheel mousewheel DOMMouseScroll";Ca("bindEvents",function(){e.bind(a,c,f.handleMouseWheel)}),Ca("unbindEvents",function(){rc&&e.unbind(a,c,f.handleMouseWheel)}),f.mouseZoomedIn=!1;var d,g=function(){f.mouseZoomedIn&&(e.removeClass(a,"pswp--zoomed-in"),f.mouseZoomedIn=!1),s<1?e.addClass(a,"pswp--zoom-allowed"):e.removeClass(a,"pswp--zoom-allowed"),h()},h=function(){d&&(e.removeClass(a,"pswp--dragging"),d=!1)};Ca("resize",g),Ca("afterChange",g),Ca("pointerDown",function(){f.mouseZoomedIn&&(d=!0,e.addClass(a,"pswp--dragging"))}),Ca("pointerUp",h),b||g()},handleMouseWheel:function(a){if(s<=f.currItem.fitRatio)return i.modal&&(!i.closeOnScroll||_a||V?a.preventDefault():E&&Math.abs(a.deltaY)>2&&(l=!0,f.close())),!0;if(a.stopPropagation(),rc.x=0,"deltaX"in a)1===a.deltaMode?(rc.x=18*a.deltaX,rc.y=18*a.deltaY):(rc.x=a.deltaX,rc.y=a.deltaY);else if("wheelDelta"in a)a.wheelDeltaX&&(rc.x=-.16*a.wheelDeltaX),a.wheelDeltaY?rc.y=-.16*a.wheelDeltaY:rc.y=-.16*a.wheelDelta;else{if(!("detail"in a))return;rc.y=a.detail}Sa(s,!0);var b=pa.x-rc.x,c=pa.y-rc.y;(i.modal||b<=da.min.x&&b>=da.max.x&&c<=da.min.y&&c>=da.max.y)&&a.preventDefault(),f.panTo(b,c)},toggleDesktopZoom:function(b){b=b||{x:qa.x/2+sa.x,y:qa.y/2+sa.y};var c=i.getDoubleTapZoom(!0,f.currItem),d=s===c;f.mouseZoomedIn=!d,f.zoomTo(d?f.currItem.initialZoomLevel:c,b,333),e[(d?"remove":"add")+"Class"](a,"pswp--zoomed-in")}}});var sc,tc,uc,vc,wc,xc,yc,zc,Ac,Bc,Cc,Dc,Ec={history:!0,galleryUID:1},Fc=function(){return Cc.hash.substring(1)},Gc=function(){sc&&clearTimeout(sc),uc&&clearTimeout(uc)},Hc=function(){var a=Fc(),b={};if(a.length<5)return b;var c,d=a.split("&");for(c=0;c<d.length;c++)if(d[c]){var e=d[c].split("=");e.length<2||(b[e[0]]=e[1])}if(i.galleryPIDs){var f=b.pid;for(b.pid=0,c=0;c<Yb.length;c++)if(Yb[c].pid===f){b.pid=c;break}}else b.pid=parseInt(b.pid,10)-1;return b.pid<0&&(b.pid=0),b},Ic=function(){if(uc&&clearTimeout(uc),_a||V)return void(uc=setTimeout(Ic,500));vc?clearTimeout(tc):vc=!0;var a=m+1,b=_b(m);b.hasOwnProperty("pid")&&(a=b.pid);var c=yc+"&gid="+i.galleryUID+"&pid="+a;zc||Cc.hash.indexOf(c)===-1&&(Bc=!0);var d=Cc.href.split("#")[0]+"#"+c;Dc?"#"+c!==window.location.hash&&history[zc?"replaceState":"pushState"]("",document.title,d):zc?Cc.replace(d):Cc.hash=c,zc=!0,tc=setTimeout(function(){vc=!1},60)};za("History",{publicMethods:{initHistory:function(){if(e.extend(i,Ec,!0),i.history){Cc=window.location,Bc=!1,Ac=!1,zc=!1,yc=Fc(),Dc="pushState"in history,yc.indexOf("gid=")>-1&&(yc=yc.split("&gid=")[0],yc=yc.split("?gid=")[0]),Ca("afterChange",f.updateURL),Ca("unbindEvents",function(){e.unbind(window,"hashchange",f.onHashChange)});var a=function(){xc=!0,Ac||(Bc?history.back():yc?Cc.hash=yc:Dc?history.pushState("",document.title,Cc.pathname+Cc.search):Cc.hash=""),Gc()};Ca("unbindEvents",function(){l&&a()}),Ca("destroy",function(){xc||a()}),Ca("firstUpdate",function(){m=Hc().pid});var b=yc.indexOf("pid=");b>-1&&(yc=yc.substring(0,b),"&"===yc.slice(-1)&&(yc=yc.slice(0,-1))),setTimeout(function(){j&&e.bind(window,"hashchange",f.onHashChange)},40)}},onHashChange:function(){return Fc()===yc?(Ac=!0,void f.close()):void(vc||(wc=!0,f.goTo(Hc().pid),wc=!1))},updateURL:function(){Gc(),wc||(zc?sc=setTimeout(Ic,800):Ic())}}}),e.extend(f,eb)};return a});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! PhotoSwipe Default UI - 4.1.2 - 2017-04-05
* http://photoswipe.com
* Copyright (c) 2017 Dmitry Semenov; */
/**
*
* UI on top of main sliding area (caption, arrows, close button, etc.).
* Built just using public methods/properties of PhotoSwipe.
* 
*/
(function (root, factory) { 
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.PhotoSwipeUI_Default = factory();
	}
})(this, function () {

	'use strict';



var PhotoSwipeUI_Default =
 function(pswp, framework) {

	var ui = this;
	var _overlayUIUpdated = false,
		_controlsVisible = true,
		_fullscrenAPI,
		_controls,
		_captionContainer,
		_fakeCaptionContainer,
		_indexIndicator,
		_shareButton,
		_shareModal,
		_shareModalHidden = true,
		_initalCloseOnScrollValue,
		_isIdle,
		_listen,

		_loadingIndicator,
		_loadingIndicatorHidden,
		_loadingIndicatorTimeout,

		_galleryHasOneSlide,

		_options,
		_defaultUIOptions = {
			barsSize: {top:44, bottom:'auto'},
			closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'], 
			timeToIdle: 4000, 
			timeToIdleOutside: 1000,
			loadingIndicatorDelay: 1000, // 2s
			
			addCaptionHTMLFn: function(item, captionEl /*, isFake */) {
				if(!item.title) {
					captionEl.children[0].innerHTML = '';
					return false;
				}
				captionEl.children[0].innerHTML = item.title;
				return true;
			},

			closeEl:true,
			captionEl: true,
			fullscreenEl: true,
			zoomEl: true,
			shareEl: true,
			counterEl: true,
			arrowEl: true,
			preloaderEl: true,

			tapToClose: false,
			tapToToggleControls: true,

			clickToCloseNonZoomable: true,

			shareButtons: [
				{id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
				{id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
				{id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/'+
													'?url={{url}}&media={{image_url}}&description={{text}}'},
				{id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
			],
			getImageURLForShare: function( /* shareButtonData */ ) {
				return pswp.currItem.src || '';
			},
			getPageURLForShare: function( /* shareButtonData */ ) {
				return window.location.href;
			},
			getTextForShare: function( /* shareButtonData */ ) {
				return pswp.currItem.title || '';
			},
				
			indexIndicatorSep: ' / ',
			fitControlsWidth: 1200

		},
		_blockControlsTap,
		_blockControlsTapTimeout;



	var _onControlsTap = function(e) {
			if(_blockControlsTap) {
				return true;
			}


			e = e || window.event;

			if(_options.timeToIdle && _options.mouseUsed && !_isIdle) {
				// reset idle timer
				_onIdleMouseMove();
			}


			var target = e.target || e.srcElement,
				uiElement,
				clickedClass = target.getAttribute('class') || '',
				found;

			for(var i = 0; i < _uiElements.length; i++) {
				uiElement = _uiElements[i];
				if(uiElement.onTap && clickedClass.indexOf('pswp__' + uiElement.name ) > -1 ) {
					uiElement.onTap();
					found = true;

				}
			}

			if(found) {
				if(e.stopPropagation) {
					e.stopPropagation();
				}
				_blockControlsTap = true;

				// Some versions of Android don't prevent ghost click event 
				// when preventDefault() was called on touchstart and/or touchend.
				// 
				// This happens on v4.3, 4.2, 4.1, 
				// older versions strangely work correctly, 
				// but just in case we add delay on all of them)	
				var tapDelay = framework.features.isOldAndroid ? 600 : 30;
				_blockControlsTapTimeout = setTimeout(function() {
					_blockControlsTap = false;
				}, tapDelay);
			}

		},
		_fitControlsInViewport = function() {
			return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
		},
		_togglePswpClass = function(el, cName, add) {
			framework[ (add ? 'add' : 'remove') + 'Class' ](el, 'pswp__' + cName);
		},

		// add class when there is just one item in the gallery
		// (by default it hides left/right arrows and 1ofX counter)
		_countNumItems = function() {
			var hasOneSlide = (_options.getNumItemsFn() === 1);

			if(hasOneSlide !== _galleryHasOneSlide) {
				_togglePswpClass(_controls, 'ui--one-slide', hasOneSlide);
				_galleryHasOneSlide = hasOneSlide;
			}
		},
		_toggleShareModalClass = function() {
			_togglePswpClass(_shareModal, 'share-modal--hidden', _shareModalHidden);
		},
		_toggleShareModal = function() {

			_shareModalHidden = !_shareModalHidden;
			
			
			if(!_shareModalHidden) {
				_toggleShareModalClass();
				setTimeout(function() {
					if(!_shareModalHidden) {
						framework.addClass(_shareModal, 'pswp__share-modal--fade-in');
					}
				}, 30);
			} else {
				framework.removeClass(_shareModal, 'pswp__share-modal--fade-in');
				setTimeout(function() {
					if(_shareModalHidden) {
						_toggleShareModalClass();
					}
				}, 300);
			}
			
			if(!_shareModalHidden) {
				_updateShareURLs();
			}
			return false;
		},

		_openWindowPopup = function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement;

			pswp.shout('shareLinkClick', e, target);

			if(!target.href) {
				return false;
			}

			if( target.hasAttribute('download') ) {
				return true;
			}

			window.open(target.href, 'pswp_share', 'scrollbars=yes,resizable=yes,toolbar=no,'+
										'location=yes,width=550,height=420,top=100,left=' + 
										(window.screen ? Math.round(screen.width / 2 - 275) : 100)  );

			if(!_shareModalHidden) {
				_toggleShareModal();
			}
			
			return false;
		},
		_updateShareURLs = function() {
			var shareButtonOut = '',
				shareButtonData,
				shareURL,
				image_url,
				page_url,
				share_text;

			for(var i = 0; i < _options.shareButtons.length; i++) {
				shareButtonData = _options.shareButtons[i];

				image_url = _options.getImageURLForShare(shareButtonData);
				page_url = _options.getPageURLForShare(shareButtonData);
				share_text = _options.getTextForShare(shareButtonData);

				shareURL = shareButtonData.url.replace('{{url}}', encodeURIComponent(page_url) )
									.replace('{{image_url}}', encodeURIComponent(image_url) )
									.replace('{{raw_image_url}}', image_url )
									.replace('{{text}}', encodeURIComponent(share_text) );

				shareButtonOut += '<a href="' + shareURL + '" target="_blank" '+
									'class="pswp__share--' + shareButtonData.id + '"' +
									(shareButtonData.download ? 'download' : '') + '>' + 
									shareButtonData.label + '</a>';

				if(_options.parseShareButtonOut) {
					shareButtonOut = _options.parseShareButtonOut(shareButtonData, shareButtonOut);
				}
			}
			_shareModal.children[0].innerHTML = shareButtonOut;
			_shareModal.children[0].onclick = _openWindowPopup;

		},
		_hasCloseClass = function(target) {
			for(var  i = 0; i < _options.closeElClasses.length; i++) {
				if( framework.hasClass(target, 'pswp__' + _options.closeElClasses[i]) ) {
					return true;
				}
			}
		},
		_idleInterval,
		_idleTimer,
		_idleIncrement = 0,
		_onIdleMouseMove = function() {
			clearTimeout(_idleTimer);
			_idleIncrement = 0;
			if(_isIdle) {
				ui.setIdle(false);
			}
		},
		_onMouseLeaveWindow = function(e) {
			e = e ? e : window.event;
			var from = e.relatedTarget || e.toElement;
			if (!from || from.nodeName === 'HTML') {
				clearTimeout(_idleTimer);
				_idleTimer = setTimeout(function() {
					ui.setIdle(true);
				}, _options.timeToIdleOutside);
			}
		},
		_setupFullscreenAPI = function() {
			if(_options.fullscreenEl && !framework.features.isOldAndroid) {
				if(!_fullscrenAPI) {
					_fullscrenAPI = ui.getFullscreenAPI();
				}
				if(_fullscrenAPI) {
					framework.bind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
					ui.updateFullscreen();
					framework.addClass(pswp.template, 'pswp--supports-fs');
				} else {
					framework.removeClass(pswp.template, 'pswp--supports-fs');
				}
			}
		},
		_setupLoadingIndicator = function() {
			// Setup loading indicator
			if(_options.preloaderEl) {
			
				_toggleLoadingIndicator(true);

				_listen('beforeChange', function() {

					clearTimeout(_loadingIndicatorTimeout);

					// display loading indicator with delay
					_loadingIndicatorTimeout = setTimeout(function() {

						if(pswp.currItem && pswp.currItem.loading) {

							if( !pswp.allowProgressiveImg() || (pswp.currItem.img && !pswp.currItem.img.naturalWidth)  ) {
								// show preloader if progressive loading is not enabled, 
								// or image width is not defined yet (because of slow connection)
								_toggleLoadingIndicator(false); 
								// items-controller.js function allowProgressiveImg
							}
							
						} else {
							_toggleLoadingIndicator(true); // hide preloader
						}

					}, _options.loadingIndicatorDelay);
					
				});
				_listen('imageLoadComplete', function(index, item) {
					if(pswp.currItem === item) {
						_toggleLoadingIndicator(true);
					}
				});

			}
		},
		_toggleLoadingIndicator = function(hide) {
			if( _loadingIndicatorHidden !== hide ) {
				_togglePswpClass(_loadingIndicator, 'preloader--active', !hide);
				_loadingIndicatorHidden = hide;
			}
		},
		_applyNavBarGaps = function(item) {
			var gap = item.vGap;

			if( _fitControlsInViewport() ) {
				
				var bars = _options.barsSize; 
				if(_options.captionEl && bars.bottom === 'auto') {
					if(!_fakeCaptionContainer) {
						_fakeCaptionContainer = framework.createEl('pswp__caption pswp__caption--fake');
						_fakeCaptionContainer.appendChild( framework.createEl('pswp__caption__center') );
						_controls.insertBefore(_fakeCaptionContainer, _captionContainer);
						framework.addClass(_controls, 'pswp__ui--fit');
					}
					if( _options.addCaptionHTMLFn(item, _fakeCaptionContainer, true) ) {

						var captionSize = _fakeCaptionContainer.clientHeight;
						gap.bottom = parseInt(captionSize,10) || 44;
					} else {
						gap.bottom = bars.top; // if no caption, set size of bottom gap to size of top
					}
				} else {
					gap.bottom = bars.bottom === 'auto' ? 0 : bars.bottom;
				}
				
				// height of top bar is static, no need to calculate it
				gap.top = bars.top;
			} else {
				gap.top = gap.bottom = 0;
			}
		},
		_setupIdle = function() {
			// Hide controls when mouse is used
			if(_options.timeToIdle) {
				_listen('mouseUsed', function() {
					
					framework.bind(document, 'mousemove', _onIdleMouseMove);
					framework.bind(document, 'mouseout', _onMouseLeaveWindow);

					_idleInterval = setInterval(function() {
						_idleIncrement++;
						if(_idleIncrement === 2) {
							ui.setIdle(true);
						}
					}, _options.timeToIdle / 2);
				});
			}
		},
		_setupHidingControlsDuringGestures = function() {

			// Hide controls on vertical drag
			_listen('onVerticalDrag', function(now) {
				if(_controlsVisible && now < 0.95) {
					ui.hideControls();
				} else if(!_controlsVisible && now >= 0.95) {
					ui.showControls();
				}
			});

			// Hide controls when pinching to close
			var pinchControlsHidden;
			_listen('onPinchClose' , function(now) {
				if(_controlsVisible && now < 0.9) {
					ui.hideControls();
					pinchControlsHidden = true;
				} else if(pinchControlsHidden && !_controlsVisible && now > 0.9) {
					ui.showControls();
				}
			});

			_listen('zoomGestureEnded', function() {
				pinchControlsHidden = false;
				if(pinchControlsHidden && !_controlsVisible) {
					ui.showControls();
				}
			});

		};



	var _uiElements = [
		{ 
			name: 'caption', 
			option: 'captionEl',
			onInit: function(el) {  
				_captionContainer = el; 
			} 
		},
		{ 
			name: 'share-modal', 
			option: 'shareEl',
			onInit: function(el) {  
				_shareModal = el;
			},
			onTap: function() {
				_toggleShareModal();
			} 
		},
		{ 
			name: 'button--share', 
			option: 'shareEl',
			onInit: function(el) { 
				_shareButton = el;
			},
			onTap: function() {
				_toggleShareModal();
			} 
		},
		{ 
			name: 'button--zoom', 
			option: 'zoomEl',
			onTap: pswp.toggleDesktopZoom
		},
		{ 
			name: 'counter', 
			option: 'counterEl',
			onInit: function(el) {  
				_indexIndicator = el;
			} 
		},
		{ 
			name: 'button--close', 
			option: 'closeEl',
			onTap: pswp.close
		},
		{ 
			name: 'button--arrow--left', 
			option: 'arrowEl',
			onTap: pswp.prev
		},
		{ 
			name: 'button--arrow--right', 
			option: 'arrowEl',
			onTap: pswp.next
		},
		{ 
			name: 'button--fs', 
			option: 'fullscreenEl',
			onTap: function() {  
				if(_fullscrenAPI.isFullscreen()) {
					_fullscrenAPI.exit();
				} else {
					_fullscrenAPI.enter();
				}
			} 
		},
		{ 
			name: 'preloader', 
			option: 'preloaderEl',
			onInit: function(el) {  
				_loadingIndicator = el;
			} 
		}

	];

	var _setupUIElements = function() {
		var item,
			classAttr,
			uiElement;

		var loopThroughChildElements = function(sChildren) {
			if(!sChildren) {
				return;
			}

			var l = sChildren.length;
			for(var i = 0; i < l; i++) {
				item = sChildren[i];
				classAttr = item.className;

				for(var a = 0; a < _uiElements.length; a++) {
					uiElement = _uiElements[a];

					if(classAttr.indexOf('pswp__' + uiElement.name) > -1  ) {

						if( _options[uiElement.option] ) { // if element is not disabled from options
							
							framework.removeClass(item, 'pswp__element--disabled');
							if(uiElement.onInit) {
								uiElement.onInit(item);
							}
							
							//item.style.display = 'block';
						} else {
							framework.addClass(item, 'pswp__element--disabled');
							//item.style.display = 'none';
						}
					}
				}
			}
		};
		loopThroughChildElements(_controls.children);

		var topBar =  framework.getChildByClass(_controls, 'pswp__top-bar');
		if(topBar) {
			loopThroughChildElements( topBar.children );
		}
	};


	

	ui.init = function() {

		// extend options
		framework.extend(pswp.options, _defaultUIOptions, true);

		// create local link for fast access
		_options = pswp.options;

		// find pswp__ui element
		_controls = framework.getChildByClass(pswp.scrollWrap, 'pswp__ui');

		// create local link
		_listen = pswp.listen;


		_setupHidingControlsDuringGestures();

		// update controls when slides change
		_listen('beforeChange', ui.update);

		// toggle zoom on double-tap
		_listen('doubleTap', function(point) {
			var initialZoomLevel = pswp.currItem.initialZoomLevel;
			if(pswp.getZoomLevel() !== initialZoomLevel) {
				pswp.zoomTo(initialZoomLevel, point, 333);
			} else {
				pswp.zoomTo(_options.getDoubleTapZoom(false, pswp.currItem), point, 333);
			}
		});

		// Allow text selection in caption
		_listen('preventDragEvent', function(e, isDown, preventObj) {
			var t = e.target || e.srcElement;
			if(
				t && 
				t.getAttribute('class') && e.type.indexOf('mouse') > -1 && 
				( t.getAttribute('class').indexOf('__caption') > 0 || (/(SMALL|STRONG|EM)/i).test(t.tagName) ) 
			) {
				preventObj.prevent = false;
			}
		});

		// bind events for UI
		_listen('bindEvents', function() {
			framework.bind(_controls, 'pswpTap click', _onControlsTap);
			framework.bind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);

			if(!pswp.likelyTouchDevice) {
				framework.bind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);
			}
		});

		// unbind events for UI
		_listen('unbindEvents', function() {
			if(!_shareModalHidden) {
				_toggleShareModal();
			}

			if(_idleInterval) {
				clearInterval(_idleInterval);
			}
			framework.unbind(document, 'mouseout', _onMouseLeaveWindow);
			framework.unbind(document, 'mousemove', _onIdleMouseMove);
			framework.unbind(_controls, 'pswpTap click', _onControlsTap);
			framework.unbind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);
			framework.unbind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);

			if(_fullscrenAPI) {
				framework.unbind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
				if(_fullscrenAPI.isFullscreen()) {
					_options.hideAnimationDuration = 0;
					_fullscrenAPI.exit();
				}
				_fullscrenAPI = null;
			}
		});


		// clean up things when gallery is destroyed
		_listen('destroy', function() {
			if(_options.captionEl) {
				if(_fakeCaptionContainer) {
					_controls.removeChild(_fakeCaptionContainer);
				}
				framework.removeClass(_captionContainer, 'pswp__caption--empty');
			}

			if(_shareModal) {
				_shareModal.children[0].onclick = null;
			}
			framework.removeClass(_controls, 'pswp__ui--over-close');
			framework.addClass( _controls, 'pswp__ui--hidden');
			ui.setIdle(false);
		});
		

		if(!_options.showAnimationDuration) {
			framework.removeClass( _controls, 'pswp__ui--hidden');
		}
		_listen('initialZoomIn', function() {
			if(_options.showAnimationDuration) {
				framework.removeClass( _controls, 'pswp__ui--hidden');
			}
		});
		_listen('initialZoomOut', function() {
			framework.addClass( _controls, 'pswp__ui--hidden');
		});

		_listen('parseVerticalMargin', _applyNavBarGaps);
		
		_setupUIElements();

		if(_options.shareEl && _shareButton && _shareModal) {
			_shareModalHidden = true;
		}

		_countNumItems();

		_setupIdle();

		_setupFullscreenAPI();

		_setupLoadingIndicator();
	};

	ui.setIdle = function(isIdle) {
		_isIdle = isIdle;
		_togglePswpClass(_controls, 'ui--idle', isIdle);
	};

	ui.update = function() {
		// Don't update UI if it's hidden
		if(_controlsVisible && pswp.currItem) {
			
			ui.updateIndexIndicator();

			if(_options.captionEl) {
				_options.addCaptionHTMLFn(pswp.currItem, _captionContainer);

				_togglePswpClass(_captionContainer, 'caption--empty', !pswp.currItem.title);
			}

			_overlayUIUpdated = true;

		} else {
			_overlayUIUpdated = false;
		}

		if(!_shareModalHidden) {
			_toggleShareModal();
		}

		_countNumItems();
	};

	ui.updateFullscreen = function(e) {

		if(e) {
			// some browsers change window scroll position during the fullscreen
			// so PhotoSwipe updates it just in case
			setTimeout(function() {
				pswp.setScrollOffset( 0, framework.getScrollY() );
			}, 50);
		}
		
		// toogle pswp--fs class on root element
		framework[ (_fullscrenAPI.isFullscreen() ? 'add' : 'remove') + 'Class' ](pswp.template, 'pswp--fs');
	};

	ui.updateIndexIndicator = function() {
		if(_options.counterEl) {
			_indexIndicator.innerHTML = (pswp.getCurrentIndex()+1) + 
										_options.indexIndicatorSep + 
										_options.getNumItemsFn();
		}
	};
	
	ui.onGlobalTap = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;

		if(_blockControlsTap) {
			return;
		}

		if(e.detail && e.detail.pointerType === 'mouse') {

			// close gallery if clicked outside of the image
			if(_hasCloseClass(target)) {
				pswp.close();
				return;
			}

			if(framework.hasClass(target, 'pswp__img')) {
				if(pswp.getZoomLevel() === 1 && pswp.getZoomLevel() <= pswp.currItem.fitRatio) {
					if(_options.clickToCloseNonZoomable) {
						pswp.close();
					}
				} else {
					pswp.toggleDesktopZoom(e.detail.releasePoint);
				}
			}
			
		} else {

			// tap anywhere (except buttons) to toggle visibility of controls
			if(_options.tapToToggleControls) {
				if(_controlsVisible) {
					ui.hideControls();
				} else {
					ui.showControls();
				}
			}

			// tap to close gallery
			if(_options.tapToClose && (framework.hasClass(target, 'pswp__img') || _hasCloseClass(target)) ) {
				pswp.close();
				return;
			}
			
		}
	};
	ui.onMouseOver = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;

		// add class when mouse is over an element that should close the gallery
		_togglePswpClass(_controls, 'ui--over-close', _hasCloseClass(target));
	};

	ui.hideControls = function() {
		framework.addClass(_controls,'pswp__ui--hidden');
		_controlsVisible = false;
	};

	ui.showControls = function() {
		_controlsVisible = true;
		if(!_overlayUIUpdated) {
			ui.update();
		}
		framework.removeClass(_controls,'pswp__ui--hidden');
	};

	ui.supportsFullscreen = function() {
		var d = document;
		return !!(d.exitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen || d.msExitFullscreen);
	};

	ui.getFullscreenAPI = function() {
		var dE = document.documentElement,
			api,
			tF = 'fullscreenchange';

		if (dE.requestFullscreen) {
			api = {
				enterK: 'requestFullscreen',
				exitK: 'exitFullscreen',
				elementK: 'fullscreenElement',
				eventK: tF
			};

		} else if(dE.mozRequestFullScreen ) {
			api = {
				enterK: 'mozRequestFullScreen',
				exitK: 'mozCancelFullScreen',
				elementK: 'mozFullScreenElement',
				eventK: 'moz' + tF
			};

			

		} else if(dE.webkitRequestFullscreen) {
			api = {
				enterK: 'webkitRequestFullscreen',
				exitK: 'webkitExitFullscreen',
				elementK: 'webkitFullscreenElement',
				eventK: 'webkit' + tF
			};

		} else if(dE.msRequestFullscreen) {
			api = {
				enterK: 'msRequestFullscreen',
				exitK: 'msExitFullscreen',
				elementK: 'msFullscreenElement',
				eventK: 'MSFullscreenChange'
			};
		}

		if(api) {
			api.enter = function() { 
				// disable close-on-scroll in fullscreen
				_initalCloseOnScrollValue = _options.closeOnScroll; 
				_options.closeOnScroll = false; 

				if(this.enterK === 'webkitRequestFullscreen') {
					pswp.template[this.enterK]( Element.ALLOW_KEYBOARD_INPUT );
				} else {
					return pswp.template[this.enterK](); 
				}
			};
			api.exit = function() { 
				_options.closeOnScroll = _initalCloseOnScrollValue;

				return document[this.exitK](); 

			};
			api.isFullscreen = function() { return document[this.elementK]; };
		}

		return api;
	};



};
return PhotoSwipeUI_Default;


});


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont-674f50.eot";

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont-674f50.eot";

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = "data:application/font-woff2;base64,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"

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont-fee66e.woff";

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/fontawesome-webfont-b06871.ttf";

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,bW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArICJpbWFnZXMvZm9udGF3ZXNvbWUtd2ViZm9udC05MTJlYzYuc3ZnIjs="

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery JavaScript Library v3.2.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2017-03-20T18:59Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};



	function DOMEval( code, doc ) {
		doc = doc || document;

		var script = doc.createElement( "script" );

		script.text = code;
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.2.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE <=9 - 11, Edge 12 - 13
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Simple selector that can be filtered directly, removing non-Elements
	if ( risSimple.test( qualifier ) ) {
		return jQuery.filter( qualifier, elements, not );
	}

	// Complex selector, compare the two sets, removing non-Elements
	qualifier = jQuery.filter( qualifier, elements );
	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
        if ( nodeName( elem, "iframe" ) ) {
            return elem.contentDocument;
        }

        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
        // Treat the template element as a regular one in browsers that
        // don't support it.
        if ( nodeName( elem, "template" ) ) {
            elem = elem.content || elem;
        }

        return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( jQuery.isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ jQuery.camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ jQuery.camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( jQuery.camelCase );
			} else {
				key = jQuery.camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: jQuery.isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( ">tbody", elem )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		div.style.cssText =
			"box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	jQuery.extend( support, {
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {
			computeStyleTests();
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a property mapped along what jQuery.cssProps suggests or to
// a vendor prefixed property.
function finalPropName( name ) {
	var ret = jQuery.cssProps[ name ];
	if ( !ret ) {
		ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
	}
	return ret;
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i,
		val = 0;

	// If we already have the right measurement, avoid augmentation
	if ( extra === ( isBorderBox ? "border" : "content" ) ) {
		i = 4;

	// Otherwise initialize for horizontal or vertical properties
	} else {
		i = name === "width" ? 1 : 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with computed style
	var valueIsBorderBox,
		styles = getStyles( elem ),
		val = curCSS( elem, name, styles ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Computed unit is not pixels. Stop here and return.
	if ( rnumnonpx.test( val ) ) {
		return val;
	}

	// Check for style in case a browser which returns unreliable values
	// for getComputedStyle silently falls back to the reliable elem.style
	valueIsBorderBox = isBorderBox &&
		( support.boxSizingReliable() || val === elem.style[ name ] );

	// Fall back to offsetWidth/Height when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	if ( val === "auto" ) {
		val = elem[ "offset" + name[ 0 ].toUpperCase() + name.slice( 1 ) ];
	}

	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 13
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnothtmlwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = jQuery.isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 13
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( jQuery.isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var doc, docElem, rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		rect = elem.getBoundingClientRect();

		doc = elem.ownerDocument;
		docElem = doc.documentElement;
		win = doc.defaultView;

		return {
			top: rect.top + win.pageYOffset - docElem.clientTop,
			left: rect.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset = {
				top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
				left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
			};
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( jQuery.isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( true ) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
		return jQuery;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6)
__webpack_require__(8)
const PhotoSwipe = __webpack_require__(13)
const PhotoSwipeUI_Default = __webpack_require__(14)

/***/ })
/******/ ]);