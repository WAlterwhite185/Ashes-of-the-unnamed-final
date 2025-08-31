// libs/PointerLockControls.js
// Minimal ES-module Pointer Lock controls.
// Works with: import { PointerLockControls } from "./libs/PointerLockControls.js";

export class PointerLockControls {
  constructor(camera, domElement = document.body) {
    this.camera = camera;
    this.domElement = domElement;
    this.isLocked = false;

    // simple event system
    this._handlers = { lock: [], unlock: [] };
    this.addEventListener = (t, fn) => this._handlers[t]?.push(fn);
    this.removeEventListener = (t, fn) =>
      (this._handlers[t] = (this._handlers[t] || []).filter(h => h !== fn));
    this.dispatchEvent = (t) => (this._handlers[t] || []).forEach(fn => fn());

    // internal state
    this._sensitivity = 0.002;
    this._pitch = this.camera.rotation.x;
    this._yaw = this.camera.rotation.y;

    // pointer lock change
    this._onLockChange = () => {
      const locked = document.pointerLockElement === this.domElement;
      this.isLocked = locked;
      this.dispatchEvent(locked ? 'lock' : 'unlock');
    };

    // mouse move
    this._onMouseMove = (e) => {
      if (!this.isLocked) return;
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this._yaw   -= movementX * this._sensitivity;
      this._pitch -= movementY * this._sensitivity;

      // clamp vertical look
      const PI_2 = Math.PI / 2;
      this._pitch = Math.max(-PI_2 + 0.001, Math.min(PI_2 - 0.001, this._pitch));

      this.camera.rotation.set(this._pitch, this._yaw, 0, 'YXZ');
    };

    // bindings
    document.addEventListener('pointerlockchange', this._onLockChange);
    this.domElement.addEventListener('mousemove', this._onMouseMove);
  }

  lock() {
    if (this.isLocked) return;
    this.domElement.requestPointerLock?.();
  }

  unlock() {
    if (!this.isLocked) return;
    document.exitPointerLock?.();
  }

  // helpers to match three.js API surface used by most samples
  connect() {}
  disconnect() {
    document.removeEventListener('pointerlockchange', this._onLockChange);
    this.domElement.removeEventListener('mousemove', this._onMouseMove);
  }

  dispose() { this.disconnect(); }
}
