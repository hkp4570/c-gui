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

            this.setValue(this._clamp(value));
        }

        this.$input.addEventListener('input', onInput);
    }

    _initSlider(){
        this._hasSlider = true;
        this.$slider = document.createElement('div');
        this.$slider.classList.add('slider');

        this.$fill = document.createElement('div');
        this.$fill.classList.add('fill');

        this.$slider.appendChild(this.$fill);
        this.$widget.insertBefore(this.$slider, this.$input);

        this.domElement.classList.add('hasSlider');
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

    step(step, explicit = true){
        this._step = step;
        this._stepExplicit = explicit;
        return this;
    }

    updateDisplay(){
        const value = this.getValue();
        if(this._hasSlider){
            let percent = (value - this._min) / (this._max - this._min);
            percent = Math.max(0, Math.min(1, percent));
            this.$fill.style.width = percent * 100 + '%';
        }
        if(!this._inputFocused){
            this.$input.value = this._decimals === undefined ? value : value.toFixed( this._decimals );
        }
        return this;
    }

    _onUpdateMinMax(){
        if(!this._hasSlider && this._hasMin && this._hasMax){
            // 如果没有传递step，则默认一个step
            if(!this._stepExplicit){
                this.step(this._getImplicitStep(), false);
            }
            this._initSlider();
        }
    }

    _getImplicitStep(){
        if(this._hasMin && this._hasMax){
            return (this._max - this._min) / 1000;
        }
        return 0.1;
    }

    _clamp(value) {
        if (value < this._min) value = this._min;
        if (value > this._max) value = this._max;
        return value;
    }

    get _hasMin(){
        return this._min !== undefined;
    }
    get _hasMax(){
        return this._max !== undefined;
    }
}