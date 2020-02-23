import * as config from '../config/config.json';

export default class Tool {
  actions: number;
  actionsLeft: number;
  power: number;
  upgradeLevel: number = 0;

  constructor(actions: number, power: number) {
    this.actions = actions;
    this.power = power;
    this.refresh();
  }

  refresh() {
    this.actionsLeft = this.actions;
  }

  getNextUpgrade(): string {
    const nextUpgrade = config.tool.upgrades[this.upgradeLevel];

    if (nextUpgrade) {
      if (nextUpgrade.actionIncrease) {
        return `+${nextUpgrade.actionIncrease} actions`;
      }

      if (nextUpgrade.strengthIncrease) {
        return `+${nextUpgrade.strengthIncrease} strength`;
      }
    }

    return '';
  }

  getNextUpradeCost(): number {
    const nextUpgrade = config.tool.upgrades[this.upgradeLevel];

    if (nextUpgrade) {
      return nextUpgrade.cost;
    }

    return 0;
  }

  upgrade() {
    const nextUpgrade = config.tool.upgrades[this.upgradeLevel];

    if (nextUpgrade) {
      if (nextUpgrade.actionIncrease) {
        this.actions += nextUpgrade.actionIncrease;
      }

      if (nextUpgrade.strengthIncrease) {
        this.power += nextUpgrade.strengthIncrease;
      }

      this.upgradeLevel++;
    }
  }
}
