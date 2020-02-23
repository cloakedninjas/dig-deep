import { Game, MODE } from '../scenes/game';

const TILE_LAST_FRAME: number = 5;

export default class Tile extends Phaser.GameObjects.Sprite {
    scene: Game;
    grid: {
        x: number;
        y: number;
        z: number;
    };
    health: number;
    events: Phaser.Events.EventEmitter;
    treasure: number;

    constructor(scene: Phaser.Scene, x: number, y: number, z: number, health: number, treasure?: number) {
        super(scene, 0, 0, null);

        this.grid = {
            x,
            y,
            z,
        };
        this.health = health;
        this.treasure = treasure;

        this.setOrigin(0, 0);

        const textureFile = 'dirt_' + (z + 1);
        this.setTexture(textureFile);

        this.x = x * this.width;
        this.y = y * this.height;

        this.setInteractive();
        this.on('pointerup', this.handleClick, this);
        this.on('pointerover', this.handleOver, this);
        this.on('pointerout', this.handleOut, this);

        this.events = new Phaser.Events.EventEmitter();
    }

    receiveDamage(damage: number) {
        this.health -= damage;

        if (this.health <= 0) {
            if (this.treasure) {
                this.events.emit(TILE_EVENTS.DISCOVER, this.treasure);
            }

            if (this.health < 0) {
                this.events.emit(TILE_EVENTS.EXTRA_DMG, this, Math.abs(this.health));
            }

            this.destroy();
        } else {
            // S 1 2 3 4 5 T
            let frameIndex = TILE_LAST_FRAME + 1 - this.health;

            if (this.treasure && frameIndex === TILE_LAST_FRAME) {
                frameIndex++;
            }
            this.setFrame(frameIndex);
        }
    }

    private handleClick() {
        if (this.scene.mode !== MODE.DIGGING) {
            return;
        }

        this.events.emit(TILE_EVENTS.TAP, this);
    }

    private handleOver(pointer: Phaser.Input.Pointer) {
        if (this.scene.mode !== MODE.DIGGING) {
            return;
        }
        this.setTint(0x44ff44);
    }

    private handleOut() {
        if (this.scene.mode !== MODE.DIGGING) {
            return;
        }
        this.clearTint();
    }
}

export enum TILE_EVENTS {
    TAP = 'tap',
    DISCOVER = 'discover',
    EXTRA_DMG = 'extra_dmg'
};
