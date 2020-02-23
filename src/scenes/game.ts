import { Scene } from 'phaser';
import DigSite, { SITE_EVENTS } from '../entities/DigSite';
import Inventory, { INV_EVENTS } from '../entities/Inventory';
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
  actionsLabel: Phaser.GameObjects.Text;

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

    this.actionsLabel = new Phaser.GameObjects.Text(this, 694, 420, '', {
      fontFamily: config.fonts.cursive,
      fontSize: '48px',
      color: config.fonts.colour,
    });
    this.actionsLabel.setOrigin(0.5, 0);
    this.add.existing(this.actionsLabel);

    // this.switchMode(MODE.DIGGING);

    const p = [];
    for (let i = 0; i < 5; i++) {

      p.push(i);
    }

    this.foundFragments[7] = {
      found: 0,
      pieces: p,
      piecesLeft: []
    };

    this.switchMode(MODE.INVENTORY);
  }

  private handleTap() {
    this.tool.actionsLeft--;
    this.updateToolCounter();

    if (this.tool.actionsLeft <= 0) {
      this.switchMode(MODE.INVENTORY);
    }
  }

  private switchMode(mode: MODE) {
    this.mode = mode;

    if (this.mode === MODE.INVENTORY) {
      this.daysLeft--;

      if (!this.inventory) {
        this.inventory = new Inventory(this);
        this.inventory.discoveries = this.foundFragments;
        this.inventory.tool = this.tool;
        this.inventory.events.on(INV_EVENTS.NEXT_DAY, this.switchMode.bind(this, MODE.DIGGING));
        this.add.existing(this.inventory);
      }

      this.inventory.money = this.money;
      this.children.bringToTop(this.inventory);

      if (this.daysLeft <= 0) {
        this.scene.start('ResultScene', {
          foo: 'bar'
        });
      } else {


        // modal end of day
        this.inventory.show();
      }
    } else {
      this.refreshTool();
      this.money = this.inventory.money;

      if (this.daysLeft !== config.workDays) {
        this.dayChange();
      }
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

  private dayChange() {
    const x = 598 + ((config.workDays - this.daysLeft) * 22);
    const cross = new Phaser.GameObjects.Image(this, x, 220, 'cross');
    this.add.existing(cross);
  }

  private refreshTool() {
    this.tool.refresh();
    this.updateToolCounter();
  }

  private updateToolCounter() {
    this.actionsLabel.text = this.tool.actionsLeft + ' / ' + this.tool.actions;
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
