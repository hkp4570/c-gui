export default class Controller {
    constructor(parent, object, property, className, elementType = 'div') {
        console.log('父类构造方法执行')
        console.log(this, 'Controller  this')

        /**
         * 包含控制器的GUI
         * @type {GUI}
         */
        this.parent = parent;

        /**
         * 该控制器修改的对象
         * @type {object}
         */
        this.object = object;
        /**
         * 该控制器修改的对象的属性
         * @type {string}
         */
        this.property = property;
        /**
         * 用于确定控制器是否被禁用。
         * 使用controller.disable( true|false ) 来修改这个值。
         * @type {boolean}
         * @private
         */
        this._disabled = false;
        /**
         * 用于确定控制器是否隐藏。
         * 使用“controller.show()”或“controller.hide()”来更改它
         * @type {boolean}
         * @private
         */
        this._hidden = false;
        /**
         * 创建控制器时“object[ property ]”的值
         * @type {any}
         */
        this.initialValue = this.getValue();

        /**
         * 该控制器的最外层容器 DOM 元素。
         * @type {HTMLDivElement}
         */
        this.domElement = document.createElement(elementType);
        this.domElement.classList.add('controller');
        this.domElement.classList.add(className);

        /**
         * 包含控制器名称的 DOM 元素。
         * @type {HTMLDivElement}
         */
        this.$name = document.createElement('div');
        this.$name.classList.add('name');

        Controller.nextNameID = Controller.nextNameID || 0;
        this.$name.id = `c-gui-name-${++Controller.nextNameID}`;

        /**
         * 包含控制器的“小部件”（根据控制器类型而不同）的 DOM 元素
         * @type {HTMLElement}
         */
        this.$widget = document.createElement('div');
        this.$widget.classList.add('widget');

        /**
         * 使用disable()时接收disabled属性的DOM元素。
         * @type {HTMLElement}
         */
        this.$disable = this.$widget;
        this.domElement.appendChild(this.$name);
        this.domElement.appendChild(this.$widget);

        // 在控制器中输入时不要触发全局按键事件
        this.domElement.addEventListener('keydown', e => e.stopPropagation());
        this.domElement.addEventListener('keyup', e => e.stopPropagation());

        this.parent.children.push(this);
        this.parent.controllers.push(this);

        this.parent.$children.appendChild(this.domElement);
        // ?
        this._listenCallback = this._listenCallback.bind(this);
        this.name(property);
    }

    /**
     * 返回 object[property]
     * @return {*}
     */
    getValue() {
        return this.object[this.property];
    }

    /**
     * 设置“object[ property ]”的值，调用任何“onChange”处理程序并更新显示。
     * @param value {any}
     * @returns {this}
     */
    setValue(value){
        if(this.getValue() !== value){
            this.object[this.property] = value;
            this._callOnChange();
        }
        return this;
    }

    /**
     * 调用此控制器及其父 GUI 的 onChange 方法。
     * @protected
     */
    _callOnChange(){
        this.parent._callOnChange(this);
        if(this._onChange !== undefined){
            this._onChange.call(this,this.getValue());
        }
        this._changed = true;
    }

    _listenCallback() {
        this._listenCallbackID = requestAnimationFrame(this._listenCallback);
        // 为了防止帧速率丢失，请确保在更新显示之前该值已更改。
        // 注意：这里使用 save() 而不是 getValue() 只是因为 ColorController。 !== 运算符
        // 不适用于颜色对象或数组，但 ColorController.save() 始终返回一个字符串
        const curValue = this.save();
        if (curValue !== this.__listenPrevValue) {
            this.updateDisplay();
        }

        this.__listenPrevValue = curValue;
    }

    /**
     * 当控制器的小部件失去焦点时应该由控制器调用。
     * @protected
     */
    _callOnFinishChange(){
        if(this._changed){

        }
        this._changed = false;
    }

    /**
     * 控制器的名称。使用`controller.name('Name')`来修改这个值。
     * @param name
     */
    name(name) {
        this._name = name;
        this.$name.textContent = name;
        return this;
    }

    save() {
        return this.getValue();
    }

    /**
     * 更新显示以使其与当前值保持同步。当控制器的值在 GUI 之外被修改时，对于更新控制器很有用。
     * @return {Controller}
     */
    updateDisplay() {
        return this;
    }
}