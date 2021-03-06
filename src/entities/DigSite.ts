import { shuffle } from '../lib/helpers';
import Tile, { TILE_EVENTS } from '../entities/Tile';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';
import { Game, MODE } from '../scenes/game';
import Tool from './Tool';

export default class DigSite extends Phaser.GameObjects.Container {
  scene: Game;
  layers: Tile[][][];
  cursor: Phaser.GameObjects.Image;
  tilesDestroyed: number = 0;
  tool: Tool;
  fragmentDistribution: number[][];
  events: Phaser.Events.EventEmitter;
  layerSize: number;
  sfx: Record<string, Phaser.Sound.BaseSound>;

  constructor(scene: Phaser.Scene, x: number, y: number, tool: Tool) {
    super(scene, x, y, null);
    this.layers = new Array(config.maxLayers);
    this.layerSize = config.layerWidth * config.layerHeight;
    this.fragmentDistribution = new Array(config.maxLayers);
    this.tool = tool;
    this.events = new Phaser.Events.EventEmitter();
    this.cursor = new Phaser.GameObjects.Image(scene, 0, 0, 'crosshair');
    this.cursor.setOrigin(0, 0);

    treasureConfig.forEach((treasure) => {
      const pieces = [];

      for (let f = 0; f < treasure.fragments; f++) {
        pieces.push(treasure.id);
      }

      pieces.forEach((piece) => {
        // get random spawn-limited depth value
        const depth = Phaser.Math.Between(treasure.spawnsAt, config.maxLayers - 1);

        if (!this.fragmentDistribution[depth]) {
          this.fragmentDistribution[depth] = [];
        }

        this.fragmentDistribution[depth].push(piece);
      });
    });

    for (let i = config.maxLayers; i > 0; i--) {
      const depth = i - 1;

      if (!this.fragmentDistribution[depth]) {
        // potentially no fragments at this level
        continue;
      }

      // increase array to layer size
      this.fragmentDistribution[depth][this.layerSize - 1] = undefined;

      // shuffle the fragment distribution at this level
      this.fragmentDistribution[depth] = shuffle(this.fragmentDistribution[depth]);

      this.generateLayer(depth);

      this.sfx = {
        'trash_1': this.scene.sound.add('trash_1'),
        'trash_2': this.scene.sound.add('trash_2')
      };
    }

    this.add(this.cursor);
  }

  private generateLayer(depth: number) {
    const layer: Tile[][] = [];

    for (let x = 0; x < config.layerWidth; x++) {
      layer[x] = [];

      for (let y = 0; y < config.layerHeight; y++) {
        const treasureIndex = (x * config.layerHeight) + y;

        const health = config.healthPerLayer[depth];
        const tile = new Tile(this.scene, x, y, depth, health, this.fragmentDistribution[depth][treasureIndex]);

        this.add(tile);
        layer[x][y] = tile;

        tile.on('destroy', this.handleTileDestroy, this);
        tile.events.on(TILE_EVENTS.HOVER, this.handleTileHover, this);
        tile.events.on(TILE_EVENTS.HOVER_OUT, this.handleTileOut, this);
        tile.events.on(TILE_EVENTS.TAP, this.handleTileTap, this);
        tile.events.on(TILE_EVENTS.DISCOVER, this.handleDiscovery, this);
        tile.events.on(TILE_EVENTS.EXTRA_DMG, this.handleExtraDamage, this);
      }
    }

    this.layers[depth] = layer;
  }

  private handleTileTap(tile: Tile) {
    if (this.scene.mode !== MODE.DIGGING) {
      return;
    }

    tile.receiveDamage(this.tool.power);
    this.events.emit(SITE_EVENTS.TAP);
  }

  private handleTileHover(tile: Tile) {
    if (this.scene.mode !== MODE.DIGGING) {
      return;
    }

    this.cursor.visible = true;
    this.cursor.x = tile.x + 8;
    this.cursor.y = tile.y + 8;
  }

  private handleTileOut() {
    this.cursor.visible = false;
  }

  private handleTileDestroy(tile: Tile) {
    this.tilesDestroyed++;

    if (this.tilesDestroyed >= config.maxLayers * config.layerWidth * config.layerHeight) {
      this.events.emit(SITE_EVENTS.EMPTIED);
    }

    this.layers[tile.grid.z][tile.grid.x][tile.grid.y] = null;
  }

  private handleDiscovery(treasure: any) {
    this.events.emit(SITE_EVENTS.DISCOVER, treasure);
  }

  private handleExtraDamage(tile: Tile, damage: number) {
    // find tile underneath, apply extra damage
    const grid = tile.grid;

    // mark current tile as destroyed
    this.layers[grid.z][grid.x][grid.y] = null;

    for (let i = grid.z; i < this.layers.length; i++) {
      const nextTile = this.layers[i][grid.x][grid.y];

      if (nextTile) {
        nextTile.receiveDamage(damage);
        break;
      }
    }
  }
}

export enum SITE_EVENTS {
  DISCOVER = 'discover',
  TAP = 'tap',
  EMPTIED = 'empty'
};
