import { Scene } from 'phaser';

export class Menu extends Scene {
    constructor() {
        super({
            key: 'MenuScene',
        });
    }

    init(...args) {
        console.info(args);
    }
}
