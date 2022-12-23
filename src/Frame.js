import M from '@superstructure.net/m';
import C from '@superstructure.net/c';
import { S } from '@superstructure.net/s';

import { ACTIVE_INDEX, ORIGINAL_SIZE } from './Rows';
import { lerp } from './Math';

/**
 * Frame
 */
class Frame extends M {
  constructor(mediaQuery) {
    super(mediaQuery);
  }

  onInit() {
    console.log('Frame.onInit()');

    this.elements = {
      cornerTL: document.querySelector(this.selector('cornerTL')),
      cornerTR: document.querySelector(this.selector('cornerTR')),
      cornerBL: document.querySelector(this.selector('cornerBL')),
      cornerBR: document.querySelector(this.selector('cornerBR'))
    };

    this.top = 0;
    this.bottom = 0;

    this.events = new C();

    this.frame = null;

    this.bindEvents();
  }

  update() {
    if (!window.Rows || !ACTIVE_INDEX) return;

    // return;

    this.top = lerp(
      this.top,
      ACTIVE_INDEX.get() === null
        ? 0
        : window.Rows.getOffsets()[ACTIVE_INDEX.get()] -
            /*document.scrollingElement.scrollTop*/ window.Rows.scrollPosition -
            window.Rows.scrollOffset,
      0.1
    );

    this.bottom = lerp(
      this.bottom,
      ACTIVE_INDEX.get() === null
        ? window.innerHeight
        : window.Rows.getOffsets()[ACTIVE_INDEX.get()] +
            window.Rows.getScales()[ACTIVE_INDEX.get()] * ORIGINAL_SIZE.get() -
            /*document.scrollingElement.scrollTop*/
            window.Rows.scrollPosition -
            window.Rows.scrollOffset,
      0.1
    );

    if (
      !this.elements.cornerTL ||
      !this.elements.cornerTR ||
      !this.elements.cornerBL ||
      !this.elements.cornerBR
    )
      return;

    this.elements.cornerTL.style.transform = this.elements.cornerTR.style.transform = `translateY(${this.top}px)`;

    this.elements.cornerBL.style.transform = this.elements.cornerBR.style.transform = `translateY(${
      this.bottom - window.innerHeight
    }px)`;
  }

  bindEvents() {
    this.onFrame();

    this.onActiveIndexChange = this.onActiveIndexChange.bind(this);
    ACTIVE_INDEX.on(this.onActiveIndexChange);
  }

  onFrame() {
    this.update();

    this.frame = requestAnimationFrame(() => {
      this.onFrame();
    });
  }

  onResize() {}

  onActiveIndexChange() {
    if (ACTIVE_INDEX.get() === null) {
      this.elements.cornerTL.classList.remove('active');
      this.elements.cornerTR.classList.remove('active');
      this.elements.cornerBL.classList.remove('active');
      this.elements.cornerBR.classList.remove('active');
    } else {
      this.elements.cornerTL.classList.add('active');
      this.elements.cornerTR.classList.add('active');
      this.elements.cornerBL.classList.add('active');
      this.elements.cornerBR.classList.add('active');
    }
  }

  onDestroy() {
    cancelAnimationFrame(this.frame);

    ACTIVE_INDEX.off(this.onActiveIndexChange);
  }
}

export { Frame };
