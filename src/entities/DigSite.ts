import Tile from '../entities/Tile';
import * as config from '../config.json';

export default class DigSite extends Phaser.GameObjects.Container {
    layers: Tile[][][];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, null);
        this.layers = [];
        this.generateLayer(0);

    }

    private generateLayer(depth: number) {
        const layer: Tile[][] = [];
    
        for (let x = 0; x < config.layerWidth; x++) {
          layer[x] = [];
          
          for (let y = 0; y < config.layerHeight; y++) {
            const health = config.healthPerLayer[depth];
            const tile = new Tile(this.scene, x, y, depth, health);
            
            this.add(tile);
            layer[x][y] = tile;
          }
        }
    
        this.layers.push(layer);
      }
}
