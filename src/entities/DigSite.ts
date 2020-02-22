import Tile, { TILE_EVENTS } from '../entities/Tile';
import * as config from '../config/config.json';
import * as treasure from '../config/treasure.json';

export default class DigSite extends Phaser.GameObjects.Container {
    layers: Tile[][][];
    tool: number;
    treasureAllocation: number[];
    events: Phaser.Events.EventEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, null);
        this.layers = [];

        this.treasureAllocation = new Array(config.layerHeight * config.layerWidth * config.maxLayers);

        this.treasureAllocation[5] = 1;

        this.tool = 1;
        this.events = new Phaser.Events.EventEmitter();

        this.generateLayer(0);
        this.generateLayer(1);
    }

    private generateLayer(depth: number) {
        const layer: Tile[][] = [];
        const layerSize = config.layerWidth * config.layerHeight;
    
        for (let x = 0; x < config.layerWidth; x++) {
          layer[x] = [];
          
          for (let y = 0; y < config.layerHeight; y++) {
            const treasureIndex = (depth * layerSize) + (x * config.layerHeight) + y;

            //            

            if (this.treasureAllocation[treasureIndex]) {
                console.log(x, y, treasureIndex);
            }
            
            const health = config.healthPerLayer[depth];
            const tile = new Tile(this.scene, x, y, depth, health, this.treasureAllocation[treasureIndex]);
            
            this.add(tile);
            layer[x][y] = tile;
         
            tile.events.on(TILE_EVENTS.TAP, this.handleTileTap, this);
            tile.events.on(TILE_EVENTS.DISCOVER, this.handleDiscovery, this);
          }
        }
    
        this.layers.push(layer);
    }

    private handleTileTap(tile: Tile) {
        tile.receiveDamage(this.tool);
    }

    private handleDiscovery(treasure: any) {
        this.events.emit(SITE_EVENTS.DISCOVER, treasure);
    }
}

export enum SITE_EVENTS {
    DISCOVER = 'discover'
};
