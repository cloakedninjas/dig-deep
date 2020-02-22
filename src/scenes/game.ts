import {Scene} from 'phaser';
import Tile from '../entities/Tile';
import DigSite from '../entities/DigSite';
import * as config from '../config.json';

export class Game extends Scene {
  digSite: DigSite;
  layersDirty: boolean = true;

  constructor() {
    super({
      key: 'GameScene',
    });
  }

  preload() {
    console.log('preload...');
  }

  create() {
    this.digSite = new DigSite(this, 100, 100);
    this.add.existing(this.digSite);    
  }

    
}
