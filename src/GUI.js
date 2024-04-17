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

        this.$title.addEventListener('click', () => {
            console.log('title click');
        })
        this.$title.addEventListener('keydown', e => {
            if (e.code === 'Enter' || e.code === 'Space') {
                console.log(e.code);
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

        if (this.parent) {

        }
        if (container) {
            container.appendChild(this.domElement);
        } else if (autoPlace) {
            this.domElement.classList.add('autoPlace');
            document.body.appendChild(this.domElement);
        }
        if(width){
            this.domElement.style.setProperty('--width', width + 'px');
        }
        this._closeFolders = closeFolders;
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
}