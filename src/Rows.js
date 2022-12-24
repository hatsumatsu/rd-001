import M from '@superstructure.net/m';
import C from '@superstructure.net/c';
import { S, s } from '@superstructure.net/s';
import Scroller from '@superstructure.net/scroller';
import { lerp } from './Math';

const ORIGINAL_SIZE = new s(window.innerHeight * 1);
const VISUAL_SIZE = new s(window.innerHeight * 0.3);
const VISUAL_SIZE_HOVER = new s(window.innerHeight * 0.45);
const VISUAL_SIZE_DETAIL = new s(window.innerHeight * 0.8);

const SMOOTH_SCROLL = true;

const ACTIVE_INDEX = new s(null);
const MODE = new s(null);

const scroller = new Scroller();
scroller.scrollTo(1);

/**
 * Rows
 */
class Rows extends M {
  constructor(mediaQuery) {
    super(mediaQuery);
  }

  onInit() {
    console.log('Rows.onInit()');

    this.events = new C();

    this.wrapperElement = document.querySelector(this.selector('wrapper'));

    this.totalRows = 0;

    this.rows = [];

    this.targetScales = []; // target scales
    this.targetOffsets = []; // target offsets, not used

    this.scales = []; // realtime scales
    this.offsets = []; // realtime offsets

    this.totalHeight = 0; // real time total height
    this.scrollPosition = 0; // realtime scroll Position in px
    this.scrollOffset = 0; // realtime scroll offset for detail mode

    this.frame = null;

    this.build();

    this.bindEvents();

    document.documentElement.style.setProperty(
      '--SCALE',
      VISUAL_SIZE.get() / ORIGINAL_SIZE.get()
    );
    document.documentElement.style.setProperty(
      '--SCALE_HOVER',
      VISUAL_SIZE_HOVER.get() / ORIGINAL_SIZE.get()
    );
  }

  build() {
    this.unbuild();

    const elements = document.querySelectorAll(this.selector('row'));
    if (!elements) return;

    this.totalRows = elements.length;

    this.scales = Array(this.totalRows).fill(0);
    this.offsets = Array(this.totalRows).fill(0);

    elements.forEach((element, i) => {
      const row = new Row(element, i);

      this.rows.push(row);
    });

    this.update();

    scroller.setOption('scrollPositionMax', this.totalRows * VISUAL_SIZE.get());
  }

  unbuild() {
    if (this.rows) {
      this.rows.forEach((row) => {
        row.destroy();
      });

      this.rows = [];
    }
  }

  /** called when MODE or ACTIVE_INDEX changed */
  update() {
    this.updateTargetScales();
    this.updateClasses();
  }

  updateTargetScales() {
    if (!this.rows) return;

    for (let i = 0; i < this.totalRows; i++) {
      this.targetScales[i] =
        MODE.get() === 'detail'
          ? i === ACTIVE_INDEX.get()
            ? VISUAL_SIZE_DETAIL.get() / ORIGINAL_SIZE.get()
            : VISUAL_SIZE.get() / ORIGINAL_SIZE.get()
          : MODE.get() === 'hover'
          ? i === ACTIVE_INDEX.get()
            ? VISUAL_SIZE_HOVER.get() / ORIGINAL_SIZE.get()
            : VISUAL_SIZE.get() / ORIGINAL_SIZE.get()
          : VISUAL_SIZE.get() / ORIGINAL_SIZE.get();
    }

    console.log('targetScales', this.targetScales);
  }

  // not used
  updateOffsets() {
    if (!this.rows) return;

    let totalOffset = 0;
    for (let i = 0; i < this.totalRows; i++) {
      this.targetOffsets[i] = totalOffset;

      totalOffset += this.targetScales[i] * ORIGINAL_SIZE.get();
    }

    console.log('targetOffsets', this.targetOffsets);
  }

  updateClasses() {
    this.rows.forEach((row) => {
      if (MODE.get() === null) {
        row.element.classList.remove('dimmed');
        row.element.classList.remove('active');
      } else {
        if (ACTIVE_INDEX.get() === row.index) {
          row.element.classList.remove('dimmed');
          row.element.classList.add('active');
        } else {
          row.element.classList.add('dimmed');
          row.element.classList.remove('active');
        }
      }
    });
  }

  /** called every frame */
  updateRows() {
    if (!this.rows) return;

    this.rows.forEach((row, i) => {
      row.setScale(this.scales[i]);
      row.setY(this.offsets[i] - this.scrollPosition - this.scrollOffset);

      row.update();
    });
  }

  getScales() {
    return this.scales;
  }

  getOffsets() {
    return this.offsets;
  }

  bindEvents() {
    this.onChangeActiveIndex = this.onChangeActiveIndex.bind(this);
    this.onModeChange = this.onModeChange.bind(this);

    ACTIVE_INDEX.on(this.onChangeActiveIndex);
    MODE.on(this.onModeChange);

    this.onFrame();
  }

  onFrame() {
    // SCALES
    // OFFSETS
    let totalOffset = 0;
    for (let i = 0; i < this.totalRows; i++) {
      // LERP scale
      this.scales[i] = lerp(this.scales[i], this.targetScales[i], 0.1);
      // offset follows lerped scale
      this.offsets[i] = totalOffset;

      totalOffset += this.scales[i] * ORIGINAL_SIZE.get();
    }

    // SCROLL POSITION
    this.totalHeight = totalOffset;

    if (SMOOTH_SCROLL) {
      this.scrollPosition = lerp(
        this.scrollPosition,
        scroller.getScrollProgress() * (this.totalHeight - window.innerHeight),
        0.05
      );
    } else {
      this.scrollPosition =
        scroller.getScrollProgress() * (this.totalHeight - window.innerHeight);
    }

    /**
     * manual infinite scroll loop
    if (this.totalHeight > window.innerHeight) {
      if (this.scrollPosition > 2000) {
        scroller.scrollTo(1);
      } else if (this.scrollPosition <= 0) {
        scroller.scrollTo(2000);
      }
    }
     */

    // SCROLL OFFSET
    // needs to be calculated each frame
    const scrollOffset =
      MODE.get() === 'detail'
        ? this.offsets[ACTIVE_INDEX.get()] - this.scrollPosition
        : 0;
    this.scrollOffset = lerp(this.scrollOffset, scrollOffset, 0.1);

    this.updateRows();

    this.frame = requestAnimationFrame(() => {
      this.onFrame();
    });
  }

  onChangeActiveIndex() {
    console.log('Rows.onChangeActiveIndex()', ACTIVE_INDEX.get());

    this.update();
  }

  onModeChange() {
    console.log('Rows.onModeChange()', MODE.get());

    this.update();

    if (MODE.get() === 'detail') {
      scroller.deactivate();
    } else {
      scroller.activate();
    }
  }

  onResize() {
    ORIGINAL_SIZE.set(window.innerHeight * 1);
    VISUAL_SIZE.set(window.innerHeight * 0.3);
    VISUAL_SIZE_HOVER.set(window.innerHeight * 0.4);
    VISUAL_SIZE_DETAIL.set(window.innerHeight * 0.8);
  }

  onDestroy() {
    cancelAnimationFrame(this.frame);

    ACTIVE_INDEX.off();
    MODE.off();

    this.unbuild();
  }
}

class Row {
  constructor(element, index = 0) {
    this.element = element;
    if (!this.element) return;

    this.element.setAttribute('data-index', index);

    this.index = index;

    this.events = new C(this.element);
    this.observer = null;

    this.scale = 1;
    this.y = 0;
    this.visibility = false;

    this.items = null;
    if (this.element.querySelector('[data-Items-role="wrapper"]')) {
      this.items = new Items(
        this.element.querySelector('[data-Items-role="wrapper"]')
      );
    }

    this.bindEvents();
    this.observe();
  }

  observe() {
    this.unobserve();

    this.observer = new IntersectionObserver(([entry]) => {
      console.log(entry.isIntersecting, this.index);
      if (entry.isIntersecting) {
        this.setVisibility(true);
      } else {
        this.setVisibility(false);
      }
    }, {});

    this.observer.observe(this.element);
  }

  unobserve() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setScale(scale) {
    this.scale = scale;

    if (this.items) {
      this.items.setScale(this.scale);
    }
  }

  setY(y) {
    this.y = y;
  }

  setVisibility(visibility) {
    if (visibility === this.visiblity || !this.element) return;

    this.visibility = visibility;

    this.element.classList[this.visibility ? 'add' : 'remove']('visible');
  }

  update() {
    if (!this.element) return;

    this.element.style.transform = `translateY(${this.y}px) scale(${this.scale})`;

    if (this.items) {
      this.items.update();
    }
  }

  destroy() {
    this.element.style.transform = ``;

    this.events.off();
    this.unobserve();
  }

  bindEvents() {
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);

    this.events
      .on('mouseenter', null, this.onMouseEnter)
      .on('mouseleave', null, this.onMouseLeave)
      .on('click', null, this.onClick);

    this.unobserve();
  }

  onMouseEnter() {
    console.log('Row.onMouseEnter()', this.index);

    if (MODE.get() !== 'detail') {
      MODE.set('hover');
      ACTIVE_INDEX.set(this.index);
    }
  }

  onMouseLeave() {
    console.log('Row.onMouseLeave()', this.index);

    if (MODE.get() !== 'detail') {
      MODE.set(null);
      ACTIVE_INDEX.set(null);
    }
  }

  onClick() {
    console.log('Row.onClick()', this.index);
    if (MODE.get() !== 'detail') {
      MODE.set('detail');
      ACTIVE_INDEX.set(this.index);
    } else {
      MODE.set(null);
    }
  }
}

class Items {
  constructor(element) {
    this.element = element;
    if (!this.element) return;

    this.scale = 1;
  }

  setScale(scale) {
    this.scale = scale;
  }

  update() {
    if (!this.element) return;

    this.element.style.transform = `translateX( ${
      (window.innerWidth * 0.5) / this.scale - 1
    }px)`;
  }
}

export { Rows, ACTIVE_INDEX, ORIGINAL_SIZE };
