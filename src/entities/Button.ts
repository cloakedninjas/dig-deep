import { Scene } from "phaser";

export default class Button extends Phaser.GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number, texture: string, hoverFrame?: number, clickFrame?: number) {
        super(scene, x, y, texture);

        // const sfx = scene.sound.add('ui');

        this.setInteractive({
            useHandCursor: true
        });

        if (hoverFrame) {
            this.on(Phaser.Input.Events.POINTER_OVER, () => {
                this.setFrame(hoverFrame);
            });

            this.on(Phaser.Input.Events.POINTER_OUT, () => {
                this.setFrame(0);
            });
        }

        if (clickFrame) {
            this.on(Phaser.Input.Events.POINTER_DOWN, () => {
                this.setFrame(clickFrame);
                // sfx.play();
            });

            this.on(Phaser.Input.Events.POINTER_UP, () => {
                this.setFrame(0);
            });
        }
    }
}