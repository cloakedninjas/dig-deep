import { Scene } from 'phaser';
import DigSite, { SITE_EVENTS } from '../entities/DigSite';
import Inventory from '../entities/Inventory';
import Tool from '../entities/Tool';
import { shuffle } from '../lib/helpers';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';

export class Game extends Scene {
  digSite: DigSite;
  mode: MODE;
  foundFragments: FoundFragments[];
  daysLeft: number;
  tool: Tool;
  inventory: Inventory;
  money: number = 0;

  constructor() {
    super({
      key: 'GameScene',
    });

    this.foundFragments = [];
  }

  create() {
    this.daysLeft = config.workDays;
    this.tool = new Tool(config.tool.startingActions, config.tool.startingPower);

    const base = new Phaser.GameObjects.Image(this, 0, 0, 'base');
    base.setOrigin(0, 0);
    this.add.existing(base);

    this.digSite = new DigSite(this, 73, 73, this.tool);
    this.add.existing(this.digSite);

    this.digSite.events.on(SITE_EVENTS.DISCOVER, this.handleDiscovery, this);
    this.digSite.events.on(SITE_EVENTS.TAP, this.handleTap, this);

    //this.switchMode(MODE.DIGGING);

    const p = [];
    for (let i = 0; i < 13; i++) {

      p.push(i);
    }

    this.foundFragments[1] = {
      found: 0,
      pieces: p,
      piecesLeft: []
    };

    this.switchMode(MODE.INVENTORY);
  }

  private handleTap() {
    this.tool.actionsLeft--;

    if (this.tool.actionsLeft <= 0) {
      this.switchMode(MODE.INVENTORY);
    }
  }

  private switchMode(mode: MODE) {
    this.mode = mode;

    if (this.mode === MODE.INVENTORY) {
      if (!this.inventory) {
        this.inventory = new Inventory(this);
        this.inventory.discoveries = this.foundFragments;
        this.inventory.money = this.money;
        this.add.existing(this.inventory);
      }

      this.inventory.show();
      this.daysLeft--;

      if (this.daysLeft <= 0) {
        this.scene.start('ResultScene');
      } else {
        this.tool.refresh();

        // modal end of day
        // show inventory
      }
    } else {
      // close inventory
    }
  }

  private handleDiscovery(treasure: number) {
    console.log('discovery', treasure);

    const tc = treasureConfig.find((tc) => tc.id === treasure);

    if (!this.foundFragments[treasure]) {
      let piecesLeft = [];

      for (let i = 0; i < tc.fragments; i++) {
        piecesLeft.push(i);
      }

      piecesLeft = shuffle(piecesLeft);

      this.foundFragments[treasure] = {
        found: 0,
        pieces: [],
        piecesLeft
      };
    }

    this.foundFragments[treasure].found++;

    const foundPiece = this.foundFragments[treasure].piecesLeft.pop();
    this.foundFragments[treasure].pieces.push(foundPiece);

    console.log(this.foundFragments);
  }
}

export enum MODE {
  DIGGING = 'dig',
  INVENTORY = 'inv'
};

export interface Treasure {
  id: number;
  name: string;
  fragements: number;
  value: number;
  spawnsAt: number;
  trash?: boolean;
};

export interface FoundFragments {
  found: number;
  pieces: number[];
  piecesLeft: number[];
}
