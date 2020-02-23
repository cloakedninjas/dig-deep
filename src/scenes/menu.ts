import { Scene } from 'phaser';

export class Menu extends Scene {
    constructor() {
        super({
            key: 'MenuScene',
        });
    }

    create() {
        const bg = this.add.image(0, 0, 'start_screen');
        bg.setOrigin(0, 0);

        const rect = new Phaser.Geom.Rectangle(531, 275, 66, 70);

        const box1 = [140, 52];
        const box2 = [106, 39];

        const credits = {
            dj: [220, 211, 'cloakedninjas'],
            jk: [375, 254, 'thedorkulon'],
            al: [537, 217, 'treslapin'],
            al2: [238, 327],
            va: [359, 345]
        };

        Object.keys(credits).forEach(name => {
            const data = credits[name];
            let box;

            if (data[2]) {
                box = box1;
            } else {
                box = box2;
            }

            const rect = new Phaser.Geom.Rectangle(data[0], data[1], box[0], box[1]);

            var graphics = this.add.graphics();

            graphics.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
            graphics.on(Phaser.Input.Events.POINTER_DOWN, () => {
                if (data[2]) {
                    window.open('https://twitter.com/' + data[2]);
                }
            });
        });

        var graphics = this.add.graphics();

        graphics.setInteractive(new Phaser.Geom.Rectangle(492, 351, 300, 220), Phaser.Geom.Rectangle.Contains);
        graphics.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.scene.start('GameScene');
        });
    }
}
