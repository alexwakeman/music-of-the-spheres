export default class Animate {
    constructor() {

    }

    animationTick() {
        window.requestAnimationFrame(() => this.animationTick());
    }
}
