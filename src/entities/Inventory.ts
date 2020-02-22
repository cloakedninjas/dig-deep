import { FoundFragments } from '../scenes/game';
import { Scene } from 'phaser';

export default class Inventory extends Phaser.GameObjects.Container {
    discoveries: FoundFragments[];

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);

        const bg = new Phaser.GameObjects.Image(scene, 0, 0, 'bag');
        bg.setOrigin(0, 0);

        this.add(bg)
    }
}
