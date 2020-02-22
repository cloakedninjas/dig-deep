import {Scene} from 'phaser';
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
    this.digSite = new DigSite(this, 100, 100);
    this.add.existing(this.digSite);

    this.digSite.events.on(SITE_EVENTS.DISCOVER, this.handleDiscovery, this);

  }

  private handleDiscovery(treasure: any) {
    console.log('discovery', treasure);

    this.events.emit(SITE_EVENTS.DISCOVER, treasure);
}
    
}
