import Controller from "./Controller";

export default class FunctionController extends Controller {
    constructor(parent, object, property) {
        super(parent,object,property,'function');

        this.$button = document.createElement('button');
        this.$button.appendChild(this.$name);
        this.$widget.appendChild(this.$button);

        this.$button.addEventListener('click',e => {
            e.preventDefault();
            this.getValue().call(this.object);
            this._callOnChange();
        })
        this.$disable = this.$button;

        // ?
        // this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );
    }
}