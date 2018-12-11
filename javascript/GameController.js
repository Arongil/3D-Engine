class GameController {
  
  constructor(ThreeScene, ThreeCamera) {
    this.ThreeScene = ThreeScene; // The scene object from Three.js
    this.ThreeCamera = ThreeCamera; // The camara object from Three.js
    this.player = new Player(this, new Vector3D(5, 10, 5), new Vector3D(0.5, 2, 0.5), "0x00ff00", "", {
        "speed": 20, // Original was 10
        "jumpSpeed": 520,
        "lookSpeed": 15
    });
    this.scenes = [
      {
        "title": "Introduction",
        "objects": [
          new Block(this, new Vector3D(0, 0, 0), new Vector3D(100, 0.1, 0.1), 0.9, "0xff0000"), // x axis
          new Block(this, new Vector3D(0, 0, 0), new Vector3D(0.1, 100, 0.1), 0.9, "0x00ff00"), // y axis
          new Block(this, new Vector3D(0, 0, 0), new Vector3D(0.1, 0.1, 100), 0.9, "0x0000ff"), // z axis
          new Block(this, new Vector3D(0, 0, 0), new Vector3D(20, 0.5, 20), 0.9, "0xaaaaaa", "textures/wood_texture.jpg"),
          new Block(this, new Vector3D(0, -0.5, 0), new Vector3D(80, 0.5, 80), 0.9, "0xaaaaaa", "textures/iron_texture.jpg"),
          new Block(this, new Vector3D(0, 10, 8), new Vector3D(20, 20, 0.5), 0.9, "0xaaaaaa", "textures/wood_texture.jpg"),
          new Block(this, new Vector3D(0, 10, -8), new Vector3D(20, 20, 0.5), 0.9, "0xaaaaaa", "textures/wood_texture.jpg"),
          new Block(this, new Vector3D(8, 10, 0), new Vector3D(0.5, 20, 20), 0.9, "0xaaaaaa", "textures/wood_texture.jpg"),
          new Block(this, new Vector3D(5, 20, 5), new Vector3D(12, 0.5, 5), 0.9, "0xaaaaaa", "textures/wood_texture.jpg"),
          new Block(this, new Vector3D(2, 10.3, 2), new Vector3D(2, 0.4, 2), 0.9, "0xaaaaaa", "textures/iron_texture.jpg", (obj) => { obj.vel.y = 10/5 * Math.cos(performance.now() / 5000 + 3); } ),
          new Block(this, new Vector3D(-20, 0.5, 2), new Vector3D(10, 1, 0.1), 0.9, "0xaaaaaa", "textures/wood_texture.jpg", (obj) => { obj.vel.z = 20/2 * Math.cos(performance.now() / 2000 + 3); } ),
          new Block(this, new Vector3D(-12, 0.5, 2), new Vector3D(2, 0.2, 30), 0.9, "0xaaaaaa", "textures/wood_texture.jpg", (obj) => { obj.vel.z = 20/2 * Math.cos(performance.now() / 2000 + 3); } ),
          new Block(this, new Vector3D(2, 0.5, -20), new Vector3D(18, 0.2, 18), 0.95, "0xaaaaaa", "textures/ice_texture.jpg"),
        ],
        "npcs": [
          this.player,
          new NPC(this, new Vector3D(4, 8, 1), new Vector3D(1, 2, 1), ""),
          new NPC(this, new Vector3D(-3, 2, 1.2), new Vector3D(0.5, 2.4, 0.5), "", "", (obj) => { obj.pos.x = 5*Math.sin(performance.now()/2000); obj.pos.z = 5*Math.cos(performance.now()/2587); obj.vel.x = 5/2*Math.cos(performance.now()/2000); obj.vel.z = -5/2.587*Math.sin(performance.now()/2587);} ),
          new NPC(this, new Vector3D(0, 2, 0.7), new Vector3D(1, 1.4, 1), ""),
        ]
      },
      {
        "title": "Nihilism",
        "objects": [
          new Block(this, new Vector3D(0, 0, 10), new Vector3D(10, 10, 1)),
          new Block(this, new Vector3D(-1, 2, -4), new Vector3D(1, 2, 2))
        ],
        "npcs": [
          this.player,
          new NPC(this, new Vector3D(-1, 2, -2), new Vector3D(1, 1, 2), "")
        ]
      }
    ];
    this.sceneNum = 0;
    ( () => {
        for (var i = 0; i < 10; i++) { 
            this.scenes[this.sceneNum].objects.push(new Block(
                this, new Vector3D(3*i, i + 20, 14), new Vector3D(2, 1, 2), 0.9, "", "textures/iron_texture.jpg", (obj) => { obj.vel.y = 10 * Math.sin(performance.now() / (1000 + 100*obj.pos.x/3) + 200*obj.pos.x/3); }
            ));
            this.scenes[this.sceneNum].objects.push(new Block(
                this, new Vector3D(2*i, 0.5*i, 16), new Vector3D(2, 0.5, 2), 0.9, "", "textures/wood_texture.jpg"
            ));
        }
    } )();
    
    // Store a clock for physics calculations.
    this.clock = new THREE.Clock();
    this.delta;
  }
  
  get scene() {
    return this.scenes[this.sceneNum];
  }

  checkCollision(object) {
    var collides = false;
    var npc;
    for (var i in this.scene.npcs) {
      npc = this.scene.npcs[i];
      if (npc !== object) { // Ensure we don't collide the object with itself.
        if (object.collisionBox.collideWith(npc)) {
            collides = true;
        }
      }
    }
    var obj;
    for (var i in this.scene.objects) {
      obj = this.scene.objects[i];
      if (obj !== object) { // Ensure we don't collide the object with itself.
        if (object.collisionBox.collideWith(obj)) {
            collides = true;
        }
      }
    }
    return collides;
  }
  
  init() {
    var npc;
    for (var i in this.scene.npcs) {
      npc = this.scene.npcs[i];
      if (npc !== this.player) {
          npc.collisionBox.initRender();
      }
    }
    var obj;
    for (var i in this.scene.objects) {
      obj = this.scene.objects[i];
      obj.collisionBox.initRender();
    }
  }

  update() {
    this.delta = this.clock.getDelta();

    var npc;
    for (var i in this.scene.npcs) {
      npc = this.scene.npcs[i];
      npc.update();
    }
    var obj;
    for (var i in this.scene.objects) {
      obj = this.scene.objects[i];
      obj.update();
    }
  }
  
}
