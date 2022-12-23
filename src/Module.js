import M from '@superstructure.net/m';
import C from '@superstructure.net/c';
import { S } from '@superstructure.net/s';

/**
 * Module
 */
class Module extends M {
  constructor(mediaQuery) {
    super(mediaQuery);
  }

  onInit() {
    console.log('Module.onInit()');

    this.events = new C();

    this.bindEvents();
  }

  bindEvents() {}

  onResize() {}

  onDestroy() {}
}

export { Module };
