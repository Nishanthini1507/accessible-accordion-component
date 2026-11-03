/**
 * Accessible Accordion
 * --------------------
 * Reusable vanilla-JS component. Every element with [data-accordion]
 * becomes its own independent accordion.
 *
 * Features
 *  - Click, Enter and Space toggle a panel (triggers are real <button>s)
 *  - Arrow Up/Down, Home and End move focus between triggers
 *  - Keeps aria-expanded in sync with the visual state
 *  - Optional multi-open mode via data-allow-multiple="true"
 *  - Fires a bubbling "accordion:toggle" event for other code to use
 *  - Error handling: bad markup is skipped with a console warning, and
 *    if setup fails the page stays fully readable (no-JS fallback)
 */
(function () {
  'use strict';

  class Accordion {
    /**
     * @param {HTMLElement} root     The element with [data-accordion]
     * @param {Object}      options  { allowMultiple: boolean }
     */
    constructor(root, options = {}) {
      this.root = root;
      this.options = {
        allowMultiple: root.dataset.allowMultiple === 'true',
        ...options
      };
      this.items = [];          // [{ trigger, panel }]
      this.init();
    }

    /** Find trigger/panel pairs, validate them and attach listeners. */
    init() {
      this.root.querySelectorAll('.accordion__trigger').forEach((trigger) => {
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!panel) {
          // Error handling: report the problem but keep the other items working
          console.warn('Accordion: no panel found for trigger', trigger);
          return;
        }
        this.items.push({ trigger, panel });
      });

      // Nothing valid to enhance: leave the content visible (fallback)
      if (this.items.length === 0) return;

      this.root.classList.add('is-enhanced');

      // Apply the initial state written in the HTML (aria-expanded)
      this.items.forEach(({ trigger, panel }) => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        panel.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
      });

      // Event delegation: two listeners handle every item
      this.root.addEventListener('click', (e) => this.onClick(e));
      this.root.addEventListener('keydown', (e) => this.onKeydown(e));
    }

    indexOfTrigger(el) {
      return this.items.findIndex((item) => item.trigger === el);
    }

    onClick(e) {
      const trigger = e.target.closest('.accordion__trigger');
      const index = trigger ? this.indexOfTrigger(trigger) : -1;
      if (index !== -1) this.toggle(index);
    }

    /** Arrow keys, Home and End move focus between headers. */
    onKeydown(e) {
      const index = this.indexOfTrigger(e.target);
      if (index === -1) return;

      const last = this.items.length - 1;
      let next;
      switch (e.key) {
        case 'ArrowDown': next = index === last ? 0 : index + 1; break;   // wraps around
        case 'ArrowUp':   next = index === 0 ? last : index - 1; break;
        case 'Home':      next = 0; break;
        case 'End':       next = last; break;
        default: return;  // let all other keys behave normally
      }
      e.preventDefault();
      this.items[next].trigger.focus();
    }

    /** Public API: open / close / toggle by index */
    open(index)   { this.setState(index, true); }
    close(index)  { this.setState(index, false); }
    toggle(index) {
      const item = this.items[index];
      if (item) this.setState(index, item.trigger.getAttribute('aria-expanded') !== 'true');
    }

    setState(index, open) {
      const item = this.items[index];
      if (!item) return;                               // ignore invalid index

      // Single-open mode: close the others first
      if (open && !this.options.allowMultiple) {
        this.items.forEach((other, i) => { if (i !== index) this.apply(other, false); });
      }
      this.apply(item, open);

      // Let the rest of the page know what happened
      this.root.dispatchEvent(new CustomEvent('accordion:toggle', {
        bubbles: true,
        detail: { index, open, trigger: item.trigger }
      }));
    }

    /** Update the DOM for one item. */
    apply({ trigger, panel }, open) {
      trigger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    }

    /** Create an Accordion for every matching element on the page. */
    static initAll(selector = '[data-accordion]') {
      return Array.from(document.querySelectorAll(selector)).map((el) => {
        try {
          return new Accordion(el);
        } catch (err) {
          console.error('Accordion: setup failed, content left visible', err);
          return null;
        }
      });
    }
  }

  // Expose for developers who want to control accordions from their own code
  window.Accordion = Accordion;

  // Start once the page structure is ready (script is deferred anyway)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Accordion.initAll());
  } else {
    Accordion.initAll();
  }
})();
