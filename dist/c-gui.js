/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["c-gui"] = factory();
	else
		root["c-gui"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./style/index.scss":
/*!**************************!*\
  !*** ./style/index.scss ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://c-gui/./style/index.scss?");

/***/ }),

/***/ "./src/GUI.js":
/*!********************!*\
  !*** ./src/GUI.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GUI)\n/* harmony export */ });\nclass GUI {\n    /**\n     * 创建包含控制器的面板\n     * parent: 将此 GUI 作为子项添加到另一个 GUI 中。通常这是由 addFolder() 为您完成的。\n     * autoPlace: true 将 GUI 添加到 document.body 并将其固定在页面的右上角。\n     * container: HTMLElement 将 GUI 添加到指定的 HTMLElement。会覆盖autoPlace。\n     * width: 245 GUI 的宽度（以像素为单位），通常在名称标签变得太长时设置。请注意，您可以使用 .lil‑gui { ‑‑name‑width: 55% } 在 CSS 中使名称标签更宽。\n     * title: Controls 显示在标题栏中的名称\n     * closeFolders: 默认情况下，传递 true 可关闭此 GUI 中的所有文件夹。\n     * injectStyles: 如果这是第一个 GUI，则将默认样式表注入到页面中。传递 false 以使用您自己的样式表。\n     * touchStyles: 使触摸设备上的控制器变得更大。传递 false 以禁用触摸样式。\n     */\n    constructor({\n                    parent,\n                    autoPlace = parent === undefined,\n                    container,\n                    width,\n                    title = 'Controls',\n                    closeFolders = false,\n                    injectStyles = true,\n                    touchStyles = true,\n                } = {}) {\n        /**\n         * 如果当前GUI是子GUI，则parent为父GUI，否则为undefined\n         * @type {GUI}\n         */\n        this.parent = parent;\n        /**\n         * 如果当前GUI是子GUI，则root为根GUI，否则为当前GUI\n         * @type {GUI}\n         */\n        this.root = parent ? parent.root : this;\n        /**\n         * 此 GUI 包含的控制器和文件夹的列表。\n         * @type {Array<GUI|Controller>}\n         */\n        this.children = [];\n        /**\n         * 此 GUI 包含的控制器列表。\n         * @type {Array<Controller>}\n         */\n        this.controllers = [];\n        /**\n         * 此 GUI 包含的子文件夹列表。\n         * @type {Array<GUI>}\n         */\n        this.folders = [];\n        /**\n         * 用于确定 GUI 是否关闭。使用 `gui.open()` 或 `gui.close()` 来更改它。\n         * @type {boolean}\n         * @private\n         */\n        this._closed = false;\n        /**\n         * 用于确定 GUI 是否隐藏。使用 `gui.show()` 或 `gui.hide()` 来更改它。\n         * @type {boolean}\n         * @private\n         */\n        this._hidden = false;\n        /**\n         * 最外层的容器元素\n         * @type {HTMLElement}\n         */\n        this.domElement = document.createElement('div');\n        this.domElement.classList.add('c-gui');\n        this.domElement.classList.add('root');\n\n        // 包含标题的 DOM 元素。\n        this.$title = document.createElement('div');\n        this.$title.classList.add('title');\n\n        // WAI_ARIA\n        this.$title.setAttribute('role', 'button'); // 标记为可操作按钮\n        this.$title.setAttribute('aria-expanded', true); // 标记为展开状态\n        this.$title.setAttribute('tabindex', 0); // 表示元素可以通过键盘操作\n\n        this.$title.addEventListener('click', () => {\n            console.log('title click');\n        })\n        this.$title.addEventListener('keydown', e => {\n            if (e.code === 'Enter' || e.code === 'Space') {\n                console.log(e.code);\n            }\n        })\n\n        // 移动端 表示 listener 永远不会调用 preventDefault()\n        this.$title.addEventListener('touchstart', () => {\n        }, {passive: true});\n\n        /**\n         * 包含字元素的 DOM 元素。\n         * @type {HTMLElement}\n         */\n        this.$children = document.createElement('div');\n        this.$children.classList.add('children');\n\n        this.domElement.appendChild(this.$title);\n        this.domElement.appendChild(this.$children);\n\n        this.title(title);\n\n        if (this.parent) {\n\n        }\n        if (container) {\n            container.appendChild(this.domElement);\n        } else if (autoPlace) {\n            this.domElement.classList.add('autoPlace');\n            document.body.appendChild(this.domElement);\n        }\n        if(width){\n            this.domElement.style.setProperty('--width', width + 'px');\n        }\n        this._closeFolders = closeFolders;\n    }\n\n    /**\n     * 更改gui的标题\n     * @param title\n     * @return {this}\n     */\n    title(title) {\n        // GUI 的当前标题。使用 `gui.title( 'Title' )` 修改该值。\n        this._title = title;\n        this.$title.textContent = title;\n        return this;\n    }\n}\n\n//# sourceURL=webpack://c-gui/./src/GUI.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GUI: () => (/* reexport safe */ _GUI_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])\n/* harmony export */ });\n/* harmony import */ var _GUI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GUI.js */ \"./src/GUI.js\");\n/* harmony import */ var _style_index_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../style/index.scss */ \"./style/index.scss\");\n\n\n\nconsole.log(_style_index_scss__WEBPACK_IMPORTED_MODULE_1__[\"default\"])\n// console.log(GUI);\n\n\n\n//# sourceURL=webpack://c-gui/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_require__("./src/index.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./style/index.scss");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});