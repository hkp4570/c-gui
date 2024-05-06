import OptionController from "./OptionController";
import NumberController from "./NumberController";
import BooleanController from "./BooleanController";
import StringController from "./StringController";
import FunctionController from "./FunctionController";

export default class GUI {
    /**
     * 创建包含控制器的面板
     * parent: 将此 GUI 作为子项添加到另一个 GUI 中。通常这是由 addFolder() 为您完成的。
     * autoPlace: true 将 GUI 添加到 document.body 并将其固定在页面的右上角。
     * container: HTMLElement 将 GUI 添加到指定的 HTMLElement。会覆盖autoPlace。
     * width: 245 GUI 的宽度（以像素为单位），通常在名称标签变得太长时设置。请注意，您可以使用 .lil‑gui { ‑‑name‑width: 55% } 在 CSS 中使名称标签更宽。
     * title: Controls 显示在标题栏中的名称
     * closeFolders: 默认情况下，传递 true 可关闭此 GUI 中的所有文件夹。
     * injectStyles: 如果这是第一个 GUI，则将默认样式表注入到页面中。传递 false 以使用您自己的样式表。
     * touchStyles: 使触摸设备上的控制器变得更大。传递 false 以禁用触摸样式。
     */
    constructor({
                    parent,
                    autoPlace = parent === undefined,
                    container,
                    width,
                    title = 'Controls',
                    closeFolders = false,
                    injectStyles = true,
                    touchStyles = true,
                } = {}) {
        /**
         * 如果当前GUI是子GUI，则parent为父GUI，否则为undefined
         * @type {GUI}
         */
        this.parent = parent;
        /**
         * 如果当前GUI是子GUI，则root为根GUI，否则为当前GUI
         * @type {GUI}
         */
        this.root = parent ? parent.root : this;
        /**
         * 此 GUI 包含的控制器和文件夹的列表。
         * @type {Array<GUI|Controller>}
         */
        this.children = [];
        /**
         * 此 GUI 包含的控制器列表。
         * @type {Array<Controller>}
         */
        this.controllers = [];
        /**
         * 此 GUI 包含的子文件夹列表。
         * @type {Array<GUI>}
         */
        this.folders = [];
        /**
         * 用于确定 GUI 是否关闭。使用 `gui.open()` 或 `gui.close()` 来更改它。
         * @type {boolean}
         * @private
         */
        this._closed = false;
        /**
         * 用于确定 GUI 是否隐藏。使用 `gui.show()` 或 `gui.hide()` 来更改它。
         * @type {boolean}
         * @private
         */
        this._hidden = false;
        /**
         * 最外层的容器元素
         * @type {HTMLElement}
         */
        this.domElement = document.createElement('div');
        this.domElement.classList.add('c-gui');
        this.domElement.classList.add('root');

        // 包含标题的 DOM 元素。
        this.$title = document.createElement('div');
        this.$title.classList.add('title');

        // WAI_ARIA
        this.$title.setAttribute('role', 'button'); // 标记为可操作按钮
        this.$title.setAttribute('aria-expanded', true); // 标记为展开状态
        this.$title.setAttribute('tabindex', 0); // 表示元素可以通过键盘操作

        this.$title.addEventListener('click', () => this.openAnimated(this._closed));
        this.$title.addEventListener('keydown', e => {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                this.$title.click();
            }
        })

        // 移动端 表示 listener 永远不会调用 preventDefault()
        this.$title.addEventListener('touchstart', () => {
        }, {passive: true});

        /**
         * 包含字元素的 DOM 元素。
         * @type {HTMLElement}
         */
        this.$children = document.createElement('div');
        this.$children.classList.add('children');

        this.domElement.appendChild(this.$title);
        this.domElement.appendChild(this.$children);

        this.title(title);

        // gui.addFolder()  parent是GUI或者undefined
        if (this.parent) {
            this.parent.children.push(this);
            this.parent.folders.push(this);
            this.parent.$children.appendChild(this.domElement);
            return;
        }
        if (container) {
            container.appendChild(this.domElement);
        } else if (autoPlace) {
            this.domElement.classList.add('autoPlace');
            document.body.appendChild(this.domElement);
        }
        if (width) {
            this.domElement.style.setProperty('--width', width + 'px');
        }
        this._closeFolders = closeFolders;
    }

    /**
     * 将控制器添加到 GUI，使用“typeof”运算符推断控制器类型
     * @param object 控制器将要修改的对象
     * @param property 控制的属性的名称
     * @param {number|object|Array} [$1] 数字控制器的最小值，或下拉列表的一组可选值
     * @param [max] 数字控制器的最大值
     * @param [step] 数字控制器的步长值
     * @return {this}
     */
    add(object, property, $1, max, step) {
        // 是一个对象或者是一个数组
        if (Object($1) === $1) {
            return new OptionController(this, object, property, $1);
        }
        const initialValue = object[property];
        switch (typeof initialValue) {
            case 'number':
                return new NumberController(this, object, property, $1, max, step);
            case 'boolean':
                return new BooleanController(this, object, property);
            case 'string':
                return new StringController(this, object, property);
            case 'function':
                return new FunctionController(this, object, property);
        }
    }

    /**
     * 向 GUI 添加一个文件夹，这只是另一个 GUI。该方法返回嵌套的 GUI，以便您可以向其中添加控制器。
     * @param {string} title 显示在文件夹标题栏中的名称。
     * @returns {GUI}
     * @example
     * const folder = gui.addFolder( 'Position' );
     * folder.add( position, 'x' );
     * folder.add( position, 'y' );
     * folder.add( position, 'z' );
     */
    addFolder(title) {
        const folder = new GUI({
            parent: this,
            title,
        })
        if (this.root._closeFolders) folder.close();
        return folder;
    }

    /**
     * 打开 GUI 或文件夹。 GUI 和文件夹默认打开。
     * @param {boolean} open
     * @return {this}
     * @example
     * gui.open(); // open
     * gui.open( false ); // close
     * gui.open( gui._closed ); // toggle
     */
    open(open = true) {
        this._setClosed(!open);
        this.$title.setAttribute('aria-expanded', !this._closed);
        this.domElement.classList.toggle('closed', this._closed);
        return this;
    }

    close() {
        return this.open(false);
    }

    _setClosed(closed) {
        if (this._closed === closed) return;
        this._closed = closed;
        this._callOnOpenClose(this);
    }

    /**
     * 显示隐藏后的 GUI。
     * @param {boolean} show
     * @returns {this}
     * @example
     * gui.show();
     * gui.show( false ); // hide
     * gui.show( gui._hidden ); // toggle
     */
    show(show = true) {
        this._hidden = !show;
        this.domElement.style.display = this._hidden ? 'none' : '';
        return this;
    }

    /**
     * 隐藏GUI
     * @returns {this}
     */
    hide() {
        return this.show(false)
    }

    /**
     * 更改gui的标题
     * @param title
     * @return {this}
     */
    title(title) {
        // GUI 的当前标题。使用 `gui.title( 'Title' )` 修改该值。
        this._title = title;
        this.$title.textContent = title;
        return this;
    }

    /**
     * 销毁与此 GUI 关联的所有 DOM 元素和事件侦听器。
     *
     */
    destroy() {
        if (this.parent) {
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
            this.parent.folders.splice(this.parent.folders.indexOf(this), 1);
        }
        if (this.domElement.parentElement) {
            this.domElement.parentElement.removeChild(this.domElement);
        }
        Array.from(this.children).forEach(c => c.destroy());
    }

    /**
     * 将所有控制器重置为其初始值。
     * @param {boolean} recursive 传递 false 以排除从此 GUI 继承的文件夹。
     * @returns {this}
     */
    reset(recursive = true) {
        const controllers = recursive ? this.controllersRecursive() : this.controllers;
        controllers.forEach(c => c.reset());
        return this;
    }

    /**
     * 返回此 GUI 及其后代所包含的控制器数组。
     * @returns {Controller[]}
     */
    controllersRecursive() {
        let controllers = Array.from(this.controllers);
        this.folders.forEach(f => {
            controllers = controllers.concat(f.controllersRecursive());
        })
        return controllers;
    }

    /**
     * 返回此 GUI 及其后代所包含的文件夹数组。
     * @returns {GUI[]}
     */
    foldersRecursive() {
        let folders = Array.from(this.folders);
        this.folders.forEach(f => {
            folders = folders.concat(f.foldersRecursive());
        })
        return folders;
    }

    /**
     * 传递一个函数，每当此 GUI 中的控制器发生更改时就会调用该函数
     * @param callback
     * @returns {this}
     * @example
     * gui.onChange( event => {
     *    event.object     // object that was modified
     *    event.property   // string, name of property
     *    event.value      // new value of controller
     *    event.controller // controller that was modified
     * } );
     */
    onChange(callback) {
        this._onChange = callback;
        return this;
    }

    /**
     * controller选项改变时调用
     * @param controller
     */
    _callOnChange(controller) {
        if (this.parent) {

        }
        if (this._onChange !== undefined) {
            this._onChange.call(this, {
                object: controller.object,
                property: controller.property,
                value: controller.getValue(),
                controller: controller
            })
        }
    }

    /**
     * 传递一个函数，每当此 GUI 中的控制器完成更改时就会调用该函数。
     * @param {function} callback
     * @returns {this}
     * @example
     * gui.onFinishChange( event => {
     *    event.object     // object that was modified
     *    event.property   // string, name of property
     *    event.value      // new value of controller
     *    event.controller // controller that was modified
     * } );
     */
    onFinishChange(callback) {
        this._onFinishChange = callback;
        return this;
    }

    _callOnFinishChange(controller) {
        if (this.parent) {

        }
        if (this._onFinishChange !== undefined) {
            this._onFinishChange.call(this, {
                object: controller.object,
                property: controller.property,
                value: controller.getValue(),
                controller: controller
            })
        }
    }

    /**
     * 传递一个在该 GUI 或其后代打开或关闭时调用的函数。
     * @param {function} callback
     * @returns {this}
     * @example
     * gui.onOpenClose( changedGUI => {
     *   console.log( changedGUI._closed );
     * } );
     */
    onOpenClose(callback) {
        this._onOpenClose = callback;
        return this;
    }

    _callOnOpenClose(changeGUI) {
        if (this.parent) {
            this.parent._callOnOpenClose(changeGUI);
        }
        if (this._onOpenClose !== undefined) {
            this._onOpenClose.call(this, changeGUI);
        }
    }

    openAnimated(open = true) {
        this._setClosed(!open);
        this.$title.setAttribute('aria-expanded', !this._closed);
        requestAnimationFrame(() => {
            const initialHeight = this.$children.clientHeight;
            this.$children.style.height = initialHeight + 'px';

            this.domElement.classList.add('transition');

            const onTransitionEnd = e => {
                if (e.target !== this.$children) return;
                this.$children.style.height = '';
                this.domElement.classList.remove('transition');
                this.$children.removeEventListener('transitionend', onTransitionEnd);
            }

            this.$children.addEventListener('transitionend', onTransitionEnd);

            const targetHeight = !open ? 0 : this.$children.scrollHeight;
            this.domElement.classList.toggle('closed', !open);
            requestAnimationFrame(() => {
                this.$children.style.height = targetHeight + 'px';
            })
        })
    }

    /**
     * 返回将控制器名称映射到值的对象。该对象可以传递给“gui.load()”来调用这些值。
     * @example
     * {
     *    controllers: {
     *        prop1: 1,
     *        prop2: 'value',
     *        ...
     *    },
     *    folders: {
     *        folderName1: { controllers, folders },
     *        folderName2: { controllers, folders }
     *        ...
     *    }
     * }
     * @param {boolean} recursive 传递 false 以排除从此 GUI 继承的文件夹。
     * @returns {object}
     */
    save(recursive = true) {
        const obj = {
            controllers: {},
            folders: {},
        }
        this.controllers.forEach(c => {
            if (c instanceof FunctionController) return;
            if (c._name in obj.controllers) {
                throw new Error(`无法保存具有重复属性的 GUI "${c._name}"`);
            }
            obj.controllers[c._name] = c.save();
        })
        if (recursive) {
            this.folders.forEach(f => {
                if (f._title in obj.folders) {
                    throw new Error(`无法使用重复的文件夹保存 GUI "${f._title}"`);
                }
                obj.folders[f._title] = f.save();
            })
        }
        return obj;
    }

    /**
     * 调用使用 `gui.save()` 保存的值。
     * @param {object} obj
     * @param {boolean} recursive
     * @returns {this}
     */
    load(obj, recursive = true) {
        if (obj.controllers) {
            this.controllers.forEach(c => {
                if (c instanceof FunctionController) return;
                if (c._name in obj.controllers) {
                    c.load(obj.controllers[c._name]);
                }
            })
        }
        if (recursive && obj.folders) {
            this.folders.forEach(f => {
                if (f._title in obj.folders) {
                    f.load(obj.folders[f._title]);
                }
            })
        }
    }
}