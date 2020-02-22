import { FoundFragments } from '../scenes/game';
import Button from './Button';
import { Scene } from 'phaser';

const TWEEN_DURATION: number = 1000;

export default class Inventory extends Phaser.GameObjects.Container {
    discoveries: FoundFragments[];
    itemsContainer: Phaser.GameObjects.Container;
    totalPages: number;
    currentPage: number;
    cols: number = 3;
    rows: number = 3;
    pageSize: number;

    constructor(scene: Scene) {
        super(scene, 0, 0);

        this.pageSize = this.rows * this.cols;

        const bg = new Phaser.GameObjects.Image(scene, 0, 0, 'bag');
        bg.setOrigin(0, 0);

        // start offscreen
        this.x = -bg.width;

        this.add(bg);

        this.itemsContainer = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.itemsContainer);

        const prevButton = new Button(scene, 100, 400, 'arrow');
        prevButton.setOrigin(0, 0);
        prevButton.on(Phaser.Input.Events.POINTER_DOWN, this.pagePrev, this);
        this.add(prevButton);

        const nextButton = new Button(scene, 300, 400, 'arrow');
        nextButton.setOrigin(0, 0);
        nextButton.flipX = true;
        nextButton.on(Phaser.Input.Events.POINTER_DOWN, this.pageNext, this);
        this.add(nextButton);
    }

    show() {
        this.currentPage = 0;

        const totalEntries = this.discoveries.reduce((sum, discovery) => {
            return sum + discovery.sprites.length;
        }, 0);

        this.totalPages = Math.ceil(totalEntries / this.pageSize);

        this.createPage(0);

        this.scene.tweens.add({
            targets: [this],
            props: {
                x: 0
            },
            ease: Phaser.Math.Easing.Circular.Out,
            duration: TWEEN_DURATION
        });
    }

    createPage(page: number) {
        let i = 0;
        const startX = 95;
        const startY = 50;
        const spriteW = 100;
        const spriteH = 120;

        const startI = page * this.pageSize;
        const endI = startI + this.pageSize;

        this.itemsContainer.removeAll();

        this.discoveries.forEach(discovery => {
            discovery.sprites.forEach(sprite => {
                if (i >= startI && i < endI) {
                    this.itemsContainer.add(sprite);
                    sprite.scale = 0.6;
                    sprite.x = (spriteW * (i % this.cols)) + startX;
                    sprite.y = (spriteH * Math.floor((i - startI) / this.rows)) + startY;
                    sprite.tint = 200000;
                }

                i++;
            });
        });
    }

    private pagePrev() {
        if (this.currentPage > 0) {
            this.createPage(this.currentPage - 1);
            this.currentPage--;
        }
    }

    private pageNext() {
        if (this.currentPage < this.totalPages - 1) {
            this.createPage(this.currentPage + 1);
            this.currentPage++;
        }
    }
}
