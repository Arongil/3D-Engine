class Player extends NPC {

    constructor(GC, pos, size, color = "0x000000", texturePath = "", controls) {
        super(GC, pos, size, color, texturePath);
        this.controls = controls;
        this.speed = controls.speed;
        this.jumpSpeed = controls.jumpSpeed;
        this.lookSpeed = controls.lookSpeed;
        this.lat = 0;
        this.lon = 90; // The player starts looking horizontally.
        this.theta = 0;
        this.phi = 0;
        this.maxCraneAngle = 89; // The highest degree the player can look up at.
        this.spawnPoint = pos.clone(); // Where the player will respawn if they fall out of the world.
    }

    updateControls() {
        // Update position.
        if (this.justCollided) { // The player can't move if they aren't touching ground.
            if (Keys.space) this.vel.y += this.jumpSpeed * GC.delta;
            if (Keys.w) this.vel.shift( Vector3D.FromSpherical(PI/2, this.phi, this.speed * this.GC.delta) );
            if (Keys.s) this.vel.shift( Vector3D.FromSpherical(PI/2, this.phi, -this.speed * this.GC.delta) ); 
            if (Keys.a) this.vel.shift( Vector3D.FromSpherical(PI/2, this.phi, this.speed * this.GC.delta).getRotated(PI/2, UP) );
            if (Keys.d) this.vel.shift( Vector3D.FromSpherical(PI/2, this.phi, -this.speed * this.GC.delta).getRotated(PI/2, UP) ); 
        }
        // Update orientation.
        this.lat -= (Mouse.x - Mouse.px) * this.lookSpeed * GC.delta;
        this.lon += (Mouse.y - Mouse.py) * this.lookSpeed * GC.delta;
        this.lon = Math.min( Math.max(this.lon, 90 - this.maxCraneAngle), 90 + this.maxCraneAngle);
        this.phi = (90 - this.lat) * PI/180;
        this.theta = this.lon * PI/180;
    }

    updateCamera() {
        var camera = this.GC.ThreeCamera;
        // Update position.
        camera.position.set(this.pos.x, this.pos.y, this.pos.z);
        // Update orientation.
        var target = this.pos.getShifted(Vector3D.FromSpherical(this.theta, this.phi, 1));
        camera.lookAt(target.x, target.y, target.z);
        // Update FOV.
        camera.fov = 90 * (0.7 + 0.10 / (1 + Math.exp(-0.1 * (this.vel.x**2 + this.vel.z**2) - 1)));
        camera.updateProjectionMatrix();
    }
    
    physics() {
        this.updateControls();

        super.physics();
        if (this.pos.y < PHYSICS.OUT_OF_WORLD) {
            this.pos = this.spawnPoint.clone();
        }

        this.updateCamera();
    }

    update() {
        this.physics();
    }

}
