# Modernism in Motion

A small gallery of modernist paintings, recreated as clean geometry and brought to life as short intro animations.

Each painting was traced and animated by Claude, then directed by Brett Rowley. Every correction became a rule in a shared Rulebook, so each new painting started from everything learned on the last. The site lets you walk along the wall, inspect each painting's timeline, retime its shapes, and read a visitor's edition of the Rulebook.

## Running it locally

The site is plain HTML, CSS and JavaScript modules, with no build step. Browsers only load modules over HTTP, so serve the folder rather than opening the file directly:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Any static host (GitHub Pages, Netlify and so on) can serve it as it is.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The page: the gallery wall, each painting close up, and the Rulebook guide |
| `site/` | The site's own code and styles, the painting details, and `guide.md`, the visitor's Rulebook |
| `engine/` | The renderer and motion engine shared by every painting |
| `scenes/` | One file per painting: its traced shapes and how each one enters |

## Outside dependencies

- Fonts (Jost and Source Serif 4) from Google Fonts.
- [marked](https://github.com/markedjs/marked), loaded from jsDelivr when the Rulebook is first opened, to render `site/guide.md`.

## The paintings

The animations are interpretations of works by László Moholy-Nagy, Kazimir Malevich, Herbert Bayer, Josef Albers and Wassily Kandinsky. The original works, and any rights in them, belong to the artists and their estates.
