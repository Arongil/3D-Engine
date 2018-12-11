class Block {

  constructor(GC, pos, size, friction = 1, color = "0x00f000", texturePath = "", behavior = function(obj) { return; } ) {
    this.GC = GC;
    this.pos = pos;
    this.vel = new Vector3D(0, 0, 0);
    this.size = size;
    this.friction = friction;
    this.color = color;
    this.collisionBox = new CollisionBox(this);
    this.texturePath = texturePath; // a file path leading to a texture
    this.behavior = behavior;
  }
  
  setFriction(friction) {
      this.friction = friction;
  }

  display() {
      this.collisionBox.display();
  }
  
  physics() {
      this.pos.shift(this.vel.getScaled(this.GC.delta));
  }

  update() {
      this.physics();
      this.display();
      this.behavior(this);
  }

}
