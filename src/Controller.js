export default class Controller {
    constructor(parent, object, property, className, elementType = 'div') {
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
        // this._listenCallback = this._listenCallback.bind(this);
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
            // 调用的是子类控制器的updateDisplay方法
            this.updateDisplay();
        }
        return this;
    }

    /**
     * 传递一个函数，每当该控制器修改该值时就会调用该函数。该函数接收新值作为其第一个参数。它的值将是控制器。
     * 对于函数控制器，onChange 回调将在函数执行后单击时触发。
     * @param callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     * controller.onChange( function( v ) {
     * 	console.log( 'The value is now ' + v );
     * 	console.assert( this === controller );
     * } );
     */
    onChange(callback){
        /**
         * 用于访问绑定到“onChange”事件的函数。不要直接修改该值。
         * 使用`controller.onChange(callback)`方法来代替。
         */
        this._onChange = callback;
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
     * 传递一个在该控制器被修改并失去焦点后调用的函数。
     * @param {Function} callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     * controller.onFinishChange( function( v ) {
     * console.log( 'Changes complete: ' + v );
     * console.assert( this === controller );
     */
    onFinishChange(callback){
        this._onFinishChange = callback;
        return this;
    }

    /**
     * 当控制器的小部件失去焦点时应该由控制器调用。
     * @protected
     */
    _callOnFinishChange(){
        if(this._changed){
            this.parent._callOnFinishChange(this);
            if(this._onFinishChange !== undefined){
                this._onFinishChange.call(this, this.getValue());
            }
        }
        this._changed = false;
    }

    /**
     * 控制器的名称。使用`controller.name('Name')`来修改这个值。
     * 设置控制器的名称及其在 GUI 中的标签。
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
    reset(){
        this.setValue(this.initialValue);
        this._callOnFinishChange();
        return this;
    }

    /**
     * 销毁此控制器并将其从父 GUI 中删除。
     */
    destroy(){
        // this.listen(false)
        this.parent.children.splice(this.parent.children.indexOf(this),1);
        this.parent.controllers.splice(this.parent.controllers.indexOf(this), 1);
        this.parent.$children.removeChild(this.domElement);
    }
}