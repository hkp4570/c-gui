import Controller from './Controller.js';

export default class NumberController extends Controller {
    constructor(parent, object, property, min, max, step) {
        super(parent, object, property, 'number');
        this._initInput();
        this.min(min);
        this.max(max);

        const stepExplicit = step !== undefined;
        this.step(stepExplicit ? step : this._getImplicitStep(), stepExplicit);

        this.updateDisplay();
    }

    _initInput() {
        this.$input = document.createElement('input');
        this.$input.setAttribute('type', 'text');
        this.$input.setAttribute('aria-labelledby', this.$name.id);

        // 仅在触摸设备上，使用 input[type=number] 强制使用数字键盘。
        // 理想情况下，我们可以在任何地方使用一种输入类型，但是 [type=number] 有一些怪癖
        // 在桌面上，[inputmode=decimal] 在 iOS 上有怪癖。
        // See https://github.com/georgealways/lil-gui/pull/16
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) {
            this.$input.setAttribute('type', 'number');
            this.$input.setAttribute('step', 'any');
        }
        this.$widget.appendChild(this.$input);
        // ?
        this.$disable = this.$input;

        const onInput = () => {
            let value = parseFloat(this.$input.value);
            if (isNaN(value)) return;

            if (this._stepExplicit) {
                value = this._snap(value);
            }
            this.setValue(this._clamp(value));
        }
        const increment = delta => {
            const value = parseFloat(this.$input.value);
            if (isNaN(value)) return;
            this._snapClampSetValue(value + delta);
            this.$input.value = this.getValue();
        }
        const onKeydown = (e) => {
            if (e.key === 'Enter') {
                this.$input.blur();
            }
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                increment(this._step * this._arrowKeyMultiplier(e));
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                increment(this._step * this._arrowKeyMultiplier(e) * -1);
            }
        }
        const onwheel = e => {
            if (this._inputFocused) {
                e.preventDefault();
                increment(this._step * this._normalizeMouseWheel(e));
            }
        }
        const onFocus = () => {
            this._inputFocused = true;
        }
        const onBlur = () => {
            this._inputFocused = false;
            this.updateDisplay();
            this._callOnFinishChange();
        }

        this.$input.addEventListener('input', onInput);
        this.$input.addEventListener('keydown', onKeydown);
        this.$input.addEventListener('wheel', onwheel, {passive: false});
        this.$input.addEventListener('focus', onFocus);
        this.$input.addEventListener('blur', onBlur);
        // TODO: 鼠标移动事件
        // this.$input.addEventListener('mousedown', onMousedown);
    }

    _initSlider() {
        this._hasSlider = true;
        this.$slider = document.createElement('div');
        this.$slider.classList.add('slider');

        this.$fill = document.createElement('div');
        this.$fill.classList.add('fill');

        this.$slider.appendChild(this.$fill);
        this.$widget.insertBefore(this.$slider, this.$input);

        this.domElement.classList.add('hasSlider');

        const map = (v, a, b, c, d) => {
            return (v - a) / (b - a) * (d - c) + c;
        }
        const setValueFromX = (clientX) => {
            const rect = this.$slider.getBoundingClientRect();
            let value = map(clientX, rect.left, rect.right, this._min, this._max);
            this._snapClampSetValue(value);
        }

        const mousedown = e => {
            this._setDraggingStyle(true);
            setValueFromX(e.clientX);
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        }
        const mousemove = e => {
            setValueFromX(e.clientX);
        }
        const mouseup = () => {
            this._callOnFinishChange();
            this._setDraggingStyle(false);
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
        let wheelFinishChangeTimeout;
        const callOnFinishChange = this._callOnFinishChange.bind( this );
        const onWheel = e => {
            // 是否是垂直滚动 垂直滚动不做处理
            const isVertical = Math.abs(e.deltaX) < Math.abs(e.deltaY);
            if(isVertical && this._hasScrollBar) return;
            e.preventDefault();
            const delta = this._normalizeMouseWheel(e) * this._step;
            this._snapClampSetValue(this.getValue() + delta);
            this.$input.value = this.getValue();
            clearTimeout(wheelFinishChangeTimeout);
            wheelFinishChangeTimeout = setTimeout(callOnFinishChange, 400);
        }

        this.$slider.addEventListener('mousedown', mousedown);
        this.$slider.addEventListener('wheel', onWheel, {passive: false});
        // TODO: 手指事件
        // this.$slider.addEventListener('touchstart', touchstart);
    }

    min(min) {
        this._min = min;
        this._onUpdateMinMax();
        return this;
    }

    max(max) {
        this._max = max;
        this._onUpdateMinMax();
        return this;
    }

    step(step, explicit = true) {
        this._step = step;
        this._stepExplicit = explicit;
        return this;
    }

    _setDraggingStyle(active, axis = 'horizontal') {
        if (this.$slider) {
            this.$slider.classList.toggle('active', active);
        }
        document.body.classList.toggle('c-gui-dragging', active);
        document.body.classList.toggle(`c-gui-${axis}`, active);
    }

    updateDisplay() {
        const value = this.getValue();
        if (this._hasSlider) {
            let percent = (value - this._min) / (this._max - this._min);
            percent = Math.max(0, Math.min(1, percent));
            this.$fill.style.width = percent * 100 + '%';
        }
        if (!this._inputFocused) {
            this.$input.value = this._decimals === undefined ? value : value.toFixed(this._decimals);
        }
        return this;
    }

    _onUpdateMinMax() {
        if (!this._hasSlider && this._hasMin && this._hasMax) {
            // 如果没有传递step，则默认一个step
            if (!this._stepExplicit) {
                this.step(this._getImplicitStep(), false);
            }
            this._initSlider();
        }
    }

    _getImplicitStep() {
        if (this._hasMin && this._hasMax) {
            return (this._max - this._min) / 1000;
        }
        return 0.1;
    }

    _snap(value) {
        const r = Math.round(value / this._step) * this._step;
        return parseFloat(r.toPrecision(15));
    }

    _arrowKeyMultiplier(e) {
        let mult = this._stepExplicit ? 1 : 10;
        if (e.shiftKey) {
            mult *= 10;
        } else if (e.altKey) {
            mult /= 10;
        }
        return mult;
    }

    _normalizeMouseWheel(e) {
        let {deltaX, deltaY} = e;
        if (Math.floor(e.deltaY) !== e.deltaY && e.wheelDelta) {
            deltaX = 0;
            deltaY = -e.wheelDelta / 120;
            deltaY *= this._stepExplicit ? 1 : 10;
        }
        const wheel = deltaX + -deltaY;

        return wheel;
    }

    _clamp(value) {
        if (value < this._min) value = this._min;
        if (value > this._max) value = this._max;
        return value;
    }

    _snapClampSetValue(value) {
        this.setValue(this._clamp(this._snap(value)));
    }

    // 是否有滚动条
    get _hasScrollBar(){
        const root = this.parent.root.$children;
        return root.scrollHeight > root.clientHeight;
    }

    get _hasMin() {
        return this._min !== undefined;
    }

    get _hasMax() {
        return this._max !== undefined;
    }
}