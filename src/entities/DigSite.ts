import { shuffle } from '../lib/helpers';
import Tile, { TILE_EVENTS } from '../entities/Tile';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';
import { Game, MODE } from '../scenes/game';

export default class DigSite extends Phaser.GameObjects.Container {
    scene: Game;
    layers: Tile[][][];
    tool: number;
    fragmentDistribution: number[][];
    events: Phaser.Events.EventEmitter;
    layerSize: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, null);
        this.layers = new Array(config.maxLayers);
        this.layerSize = config.layerWidth * config.layerHeight;
        this.fragmentDistribution = new Array(config.maxLayers);
        this.tool = 1;
        this.events = new Phaser.Events.EventEmitter();

        treasureConfig.forEach((treasure) => {
            const pieces = [];

            for (let f = 0; f < treasure.fragments; f++) {
                pieces.push(treasure.id);
            }

            pieces.forEach(piece => {
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

            // increase array to layer size
            this.fragmentDistribution[depth][this.layerSize - 1] = undefined;

            // shuffle the fragment distribution at this level
            this.fragmentDistribution[depth] = shuffle(this.fragmentDistribution[depth]);

            this.generateLayer(depth);
        }
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

                if (this.fragmentDistribution[depth][treasureIndex]) {
                    const text = this.fragmentDistribution[depth][treasureIndex].toString();
                    const style: Phaser.Types.GameObjects.Text.TextStyle = {
                        fontFamily: 'Arial'
                    };

                    this.add(new Phaser.GameObjects.Text(this.scene, tile.x, tile.y, text, style));
                }

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

        tile.receiveDamage(this.tool);
        this.events.emit(SITE_EVENTS.TAP);
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
            let nextTile = this.layers[i][grid.x][grid.y];

            if (nextTile) {
                nextTile.receiveDamage(damage);
                break;
            }
        }
    }
}

export enum SITE_EVENTS {
    DISCOVER = 'discover',
    TAP = 'tap'
};
