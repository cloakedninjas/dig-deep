export default class Tile extends Phaser.GameObjects.Sprite {
    z: number;
    health: number;

    constructor(scene: Phaser.Scene, x: number, y: number, z: number, health: number) {
        super(scene, 0, 0, null);

        this.z = z;
        this.health = health;
        this.setOrigin(0, 0);

        // const textureFile = `dirt_${z}_${health}`;

        const textureFile = 'dirt_1';
        this.setTexture(textureFile);
        
        this.x = x * this.width;
        this.y = y * this.height;
        
        console.log(this.x, this.y);

        //this.setInteractive(new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.setInteractive();
        this.on('pointerup', this.handleClick, this);
        this.on('pointerover', this.handleOver, this);
        this.on('pointerout', this.handleOut, this);
    }

    handleClick() {
        //if ()
    }

    handleOver(pointer: Phaser.Input.Pointer) {
        this.setTint(0x44ff44);
    }

    handleOut() {
        this.clearTint();
    }
}
