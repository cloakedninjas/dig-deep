import { Scene } from 'phaser';
import DigSite, { SITE_EVENTS } from '../entities/DigSite';
import * as config from '../config/config.json';

export class Game extends Scene {
  digSite: DigSite;
  remainingActions: number;
  mode: MODE;

  constructor() {
    super({
      key: 'GameScene',
    });
  }

  create() {
    this.remainingActions = config.startingActions;
    const base = new Phaser.GameObjects.Image(this, 0, 0, 'base');
    base.setOrigin(0, 0);
    this.add.existing(base);

    this.digSite = new DigSite(this, 73, 73);
    this.add.existing(this.digSite);

    this.digSite.events.on(SITE_EVENTS.DISCOVER, this.handleDiscovery, this);
    this.digSite.events.on(SITE_EVENTS.TAP, this.handleTap, this);

    this.switchMode(MODE.DIGGING);
  }

  private handleTap() {
    this.remainingActions--;

    if (this.remainingActions <= 0) {
      this.switchMode(MODE.INVENTORY);
    }
  }

  private switchMode(mode: MODE) {
    this.mode = mode;

    if (this.mode === MODE.INVENTORY) {
      // modal end of day
      // show inventory
    } else {
      // close inventory
    }
  }

  private handleDiscovery(treasure: any) {
    console.log('discovery', treasure);
  }
}

export enum MODE {
  DIGGING = 'dig',
  INVENTORY = 'inv'
};
