import { Game, MODE } from '../scenes/game';
import * as treasureConfig from '../config/treasure.json';

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
    sfx: Record<string, Phaser.Sound.BaseSound>;

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
        this.sfx = {
            'pick_1': scene.sound.add('pick_1'),
            'pick_0': scene.sound.add('pick_2'),
            'ground_break_1': this.scene.sound.add('ground_break_1'),
            'ground_break_0': this.scene.sound.add('ground_break_2'),
            'trash_1': this.scene.sound.add('trash_1'),
            'trash_0': this.scene.sound.add('trash_2'),
            'relic': this.scene.sound.add('relic'),
        };
    }

    receiveDamage(damage: number) {
        this.health -= damage;

        if (this.health <= 0) {
            if (this.treasure) {
                this.events.emit(TILE_EVENTS.DISCOVER, this.treasure);

                const itemDef = treasureConfig.find(tc => tc.id === this.treasure);

                if (itemDef.trash) {
                    this.sfx['trash_' + Math.round(Math.random())].play();
                } else {
                    this.sfx.relic.play();
                }
            }

            if (this.health < 0) {
                this.events.emit(TILE_EVENTS.EXTRA_DMG, this, Math.abs(this.health));
            }

            this.sfx['ground_break_' + Math.round(Math.random())].play();
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

        this.sfx['pick_' + Math.round(Math.random())].play();
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
