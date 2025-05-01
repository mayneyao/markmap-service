# Markmap Service

A Cloudflare Worker service to render Markdown as interactive Markmap visualizations (HTML or SVG).

## Features

- Renders Markdown to interactive HTML mind maps using Markmap.js.
- Renders Markdown to static SVG mind maps using Markmap.js and Puppeteer via Cloudflare Browser Rendering.
- Deployed as a Cloudflare Worker for serverless execution.
- Accepts Base64 encoded Markdown via a URL query parameter.

## Usage

Send a GET request to the deployed worker URL with the following query parameters:

- `md`: Base64 encoded string of the Markdown content.
- `output` (optional): The desired output format.
  - `html` (default): Returns an HTML page with the interactive Markmap.
  - `svg`: Returns an SVG image of the Markmap.
- `width` (optional, SVG only): The desired width of the SVG output in pixels.
- `height` (optional, SVG only): The desired height of the SVG output in pixels.

**Example (HTML Output):**

https://markmap-service.gine.workers.dev/?md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y

**Example (SVG Output):**

https://markmap-service.gine.workers.dev/?output=svg&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y


complete example
```markdown
---
title: markmap
markmap:
  colorFreezeLevel: 2
---

## Links

- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- `inline code`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on `maxWidth` option
- Ordered list
  1. item 1
  2. item 2

### Blocks

```js
console.log('hello, JavaScript')
```

https://markmap-service.gine.workers.dev/render?md=LS0tCnRpdGxlOiBtYXJrbWFwCm1hcmttYXA6CiAgY29sb3JGcmVlemVMZXZlbDogMgotLS0KCiMjIExpbmtzCgotIFtXZWJzaXRlXShodHRwczovL21hcmttYXAuanMub3JnLykKLSBbR2l0SHViXShodHRwczovL2dpdGh1Yi5jb20vZ2VyYTJsZC9tYXJrbWFwKQoKIyMgUmVsYXRlZCBQcm9qZWN0cwoKLSBbY29jLW1hcmttYXBdKGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhMmxkL2NvYy1tYXJrbWFwKSBmb3IgTmVvdmltCi0gW21hcmttYXAtdnNjb2RlXShodHRwczovL21hcmtldHBsYWNlLnZpc3VhbHN0dWRpby5jb20vaXRlbXM%2FaXRlbU5hbWU9Z2VyYTJsZC5tYXJrbWFwLXZzY29kZSkgZm9yIFZTQ29kZQotIFtlYWYtbWFya21hcF0oaHR0cHM6Ly9naXRodWIuY29tL2VtYWNzLWVhZi9lYWYtbWFya21hcCkgZm9yIEVtYWNzCgojIyBGZWF0dXJlcwoKTm90ZSB0aGF0IGlmIGJsb2NrcyBhbmQgbGlzdHMgYXBwZWFyIGF0IHRoZSBzYW1lIGxldmVsLCB0aGUgbGlzdHMgd2lsbCBiZSBpZ25vcmVkLgoKIyMjIExpc3RzCgotICoqc3Ryb25nKiogfn5kZWx%2BfiAqaXRhbGljKiA9PWhpZ2hsaWdodD09Ci0gYGlubGluZSBjb2RlYAotIFt4XSBjaGVja2JveAotIEthdGV4OiAkeCA9IHstYiBccG0gXHNxcnR7Yl4yLTRhY30gXG92ZXIgMmF9JCA8IS0tIG1hcmttYXA6IGZvbGQgLS0%2BCiAgLSBbTW9yZSBLYXRleCBFeGFtcGxlc10oIz9kPWdpc3Q6YWY3NmE0YzI0NWIzMDIyMDZiMTZhZWM1MDNkYmUwN2I6a2F0ZXgubWQpCi0gTm93IHdlIGNhbiB3cmFwIHZlcnkgdmVyeSB2ZXJ5IHZlcnkgbG9uZyB0ZXh0IGJhc2VkIG9uIGBtYXhXaWR0aGAgb3B0aW9uCi0gT3JkZXJlZCBsaXN0CiAgMS4gaXRlbSAxCiAgMi4gaXRlbSAyCgojIyMgQmxvY2tzCgpgYGBqcwpjb25zb2xlLmxvZygnaGVsbG8sIEphdmFTY3JpcHQnKQpgYGAKCnwgUHJvZHVjdHMgfCBQcmljZSB8CnwtfC18CnwgQXBwbGUgfCA0IHwKfCBCYW5hbmEgfCAyIHwKCiFbXShodHRwczovL21hcmttYXAuanMub3JnL2Zhdmljb24ucG5nKQ%3D%3D&output=svg

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |

![](https://markmap.js.org/favicon.png)
```

**Example (SVG Output with custom dimensions):**

https://markmap-service.gine.workers.dev/?output=svg&width=400&height=300&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y
