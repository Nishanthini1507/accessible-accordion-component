# Accessible Accordion (Week 2 Task)

A reusable accordion component built with semantic HTML, CSS and vanilla JavaScript. No libraries needed.

## Files
| File | Purpose |
|---|---|
| `index.html` | Demo page with two accordions (single-open and multi-open) |
| `accordion.css` | Component styles, animation and responsive rules |
| `accordion.js` | `Accordion` class: DOM manipulation, events, keyboard support |

## How to run
1. Unzip the folder.
2. Double-click `index.html` to open it in any modern browser. No server is needed.

## How to use in your own page
1. Link the files:
   ```html
   <link rel="stylesheet" href="accordion.css">
   <script src="accordion.js" defer></script>
   ```
2. Add the markup. Each trigger's `aria-controls` must match its panel's `id`:
   ```html
   <div class="accordion" data-accordion>
     <h3 class="accordion__heading">
       <button class="accordion__trigger" id="t1" aria-expanded="false" aria-controls="p1">
         Question <span class="accordion__icon" aria-hidden="true"></span>
       </button>
     </h3>
     <div class="accordion__panel" id="p1" role="region" aria-labelledby="t1">
       <div class="accordion__inner"><p>Answer text</p></div>
     </div>
   </div>
   ```
3. Every `[data-accordion]` element is set up automatically.

## Options
| Option | How | Default |
|---|---|---|
| Allow several panels open | `data-allow-multiple="true"` on the container | `false` |
| Start with a panel open | `aria-expanded="true"` on its trigger | closed |

## JavaScript API
```js
const [faq] = Accordion.initAll();   // returns an array of instances
faq.open(1);      // open the second item
faq.close(1);
faq.toggle(0);

// Listen for changes
document.addEventListener('accordion:toggle', (e) => {
  console.log(e.detail.index, e.detail.open);
});
```

## Keyboard support
| Key | Action |
|---|---|
| Tab / Shift+Tab | Move between interactive elements |
| Enter or Space | Open or close the focused panel |
| Arrow Down / Up | Move focus to the next / previous header (wraps around) |
| Home / End | Move focus to the first / last header |

## Accessibility features
- Triggers are real `<button>` elements inside headings, so screen readers announce structure and state.
- `aria-expanded`, `aria-controls`, `role="region"` and `aria-labelledby` link each header to its panel.
- Closed panels use `visibility: hidden`, so hidden content cannot be tabbed to or read aloud.
- Visible focus ring, 52px touch targets and high-contrast colours.
- Animation is turned off for users with `prefers-reduced-motion`.

## Error handling and fallbacks
- If a trigger points to a missing panel, it is skipped and a warning is logged; the rest still works.
- If the script fails or JavaScript is disabled, the `is-enhanced` class is never added, so **all content stays visible**.
- Browsers without `grid-template-rows: 0fr` support use simple show/hide instead of the sliding animation.

## Manual test checklist
1. Click each header: the panel opens and the icon changes from + to -.
2. In the first accordion, open a second panel: the first closes. In the second accordion, several can stay open.
3. Use only the keyboard: Tab to a header, press Enter or Space, then try Arrow keys, Home and End.
4. Resize the window below 480px: spacing tightens and nothing scrolls sideways.
5. Turn off JavaScript in browser settings: all answers are visible.
6. Run Lighthouse (Accessibility) in Chrome DevTools and confirm no errors.
