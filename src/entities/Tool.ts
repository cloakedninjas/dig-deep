export default class Tool {
    actions: number;
    actionsLeft: number;
    power: number;

    constructor(actions: number, power: number) {
        this.actions = actions;
        this.power = power;
        this.refresh();
    }

    refresh() {
        this.actionsLeft = this.actions;
    }
}
