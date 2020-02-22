import { Scene } from 'phaser';
import DigSite, { SITE_EVENTS } from '../entities/DigSite';

export class Game extends Scene {
  digSite: DigSite;
  layersDirty: boolean = true;

  constructor() {
    super({
      key: 'GameScene',
    });
  }

  preload() {
    // console.log('preload...');
  }

  create() {
    const base = new Phaser.GameObjects.Image(this, 0, 0, 'base');
    base.setOrigin(0, 0);
    this.add.existing(base);

    this.digSite = new DigSite(this, 73, 73);
    this.add.existing(this.digSite);

    this.digSite.events.on(SITE_EVENTS.DISCOVER, this.handleDiscovery, this);

  }

  private handleDiscovery(treasure: any) {
    console.log('discovery', treasure);

    this.events.emit(SITE_EVENTS.DISCOVER, treasure);
  }

}
