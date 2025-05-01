# Markmap Service

A Cloudflare Worker service to render Markdown as interactive Markmap visualizations (HTML or SVG).

![Markmap Service](https://markmap-service.gine.workers.dev/render?md=IyBNYXJrbWFwIFNlcnZpY2UKCkEgQ2xvdWRmbGFyZSBXb3JrZXIgc2VydmljZSB0byByZW5kZXIgTWFya2Rvd24gYXMgaW50ZXJhY3RpdmUgTWFya21hcCB2aXN1YWxpemF0aW9ucyAoSFRNTCBvciBTVkcpLgoKIyMgRmVhdHVyZXMKCi0gUmVuZGVycyBNYXJrZG93biB0byBpbnRlcmFjdGl2ZSBIVE1MIG1pbmQgbWFwcyB1c2luZyBNYXJrbWFwLmpzLgotIFJlbmRlcnMgTWFya2Rvd24gdG8gc3RhdGljIFNWRyBtaW5kIG1hcHMgdXNpbmcgTWFya21hcC5qcyBhbmQgUHVwcGV0ZWVyIHZpYSBDbG91ZGZsYXJlIEJyb3dzZXIgUmVuZGVyaW5nLgotIERlcGxveWVkIGFzIGEgQ2xvdWRmbGFyZSBXb3JrZXIgZm9yIHNlcnZlcmxlc3MgZXhlY3V0aW9uLgotIEFjY2VwdHMgQmFzZTY0IGVuY29kZWQgTWFya2Rvd24gdmlhIGEgVVJMIHF1ZXJ5IHBhcmFtZXRlci4KCiMjIFVzYWdlCgpTZW5kIGEgR0VUIHJlcXVlc3QgdG8gdGhlIGRlcGxveWVkIHdvcmtlciBVUkwgd2l0aCB0aGUgZm9sbG93aW5nIHF1ZXJ5IHBhcmFtZXRlcnM6CgotIGBtZGA6IEJhc2U2NCBlbmNvZGVkIHN0cmluZyBvZiB0aGUgTWFya2Rvd24gY29udGVudC4KLSBgb3V0cHV0YCAob3B0aW9uYWwpOiBUaGUgZGVzaXJlZCBvdXRwdXQgZm9ybWF0LgogIC0gYGh0bWxgIChkZWZhdWx0KTogUmV0dXJucyBhbiBIVE1MIHBhZ2Ugd2l0aCB0aGUgaW50ZXJhY3RpdmUgTWFya21hcC4KICAtIGBzdmdgOiBSZXR1cm5zIGFuIFNWRyBpbWFnZSBvZiB0aGUgTWFya21hcC4gSXQncyB1c2VmdWwgZm9yIGVtYmVkZGluZyBpbiBHaXRodWIgUmVhZG1lIGZpbGVzIGp1c3QgbGlrZSB0aGUgYmFkZ2UuCi0gYHdpZHRoYCAob3B0aW9uYWwsIFNWRyBvbmx5KTogVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIFNWRyBvdXRwdXQgaW4gcGl4ZWxzLgotIGBoZWlnaHRgIChvcHRpb25hbCwgU1ZHIG9ubHkpOiBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIFNWRyBvdXRwdXQgaW4gcGl4ZWxzLgo%3D&output=svg&width=1920&height=1080)
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
  - `svg`: Returns an SVG image of the Markmap. It's useful for embedding in Github Readme files just like the badge.
- `width` (optional, SVG only): The desired width of the SVG output in pixels.
- `height` (optional, SVG only): The desired height of the SVG output in pixels.

**Example (HTML Output):**

https://markmap-service.gine.workers.dev/?md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y

**Example (SVG Output):**

https://markmap-service.gine.workers.dev/?output=svg&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y

complete example

````markdown
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

- **strong** ~~del~~ _italic_ ==highlight==
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
console.log("hello, JavaScript");
```

| Products | Price |
| -------- | ----- |
| Apple    | 4     |
| Banana   | 2     |

![](https://markmap.js.org/favicon.png)
````

https://markmap-service.gine.workers.dev/?md=LS0tCnRpdGxlOiBtYXJrbWFwCm1hcmttYXA6CiAgY29sb3JGcmVlemVMZXZlbDogMgotLS0KCiMjIExpbmtzCgotIFtXZWJzaXRlXShodHRwczovL21hcmttYXAuanMub3JnLykKLSBbR2l0SHViXShodHRwczovL2dpdGh1Yi5jb20vZ2VyYTJsZC9tYXJrbWFwKQoKIyMgUmVsYXRlZCBQcm9qZWN0cwoKLSBbY29jLW1hcmttYXBdKGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhMmxkL2NvYy1tYXJrbWFwKSBmb3IgTmVvdmltCi0gW21hcmttYXAtdnNjb2RlXShodHRwczovL21hcmtldHBsYWNlLnZpc3VhbHN0dWRpby5jb20vaXRlbXM%2FaXRlbU5hbWU9Z2VyYTJsZC5tYXJrbWFwLXZzY29kZSkgZm9yIFZTQ29kZQotIFtlYWYtbWFya21hcF0oaHR0cHM6Ly9naXRodWIuY29tL2VtYWNzLWVhZi9lYWYtbWFya21hcCkgZm9yIEVtYWNzCgojIyBGZWF0dXJlcwoKTm90ZSB0aGF0IGlmIGJsb2NrcyBhbmQgbGlzdHMgYXBwZWFyIGF0IHRoZSBzYW1lIGxldmVsLCB0aGUgbGlzdHMgd2lsbCBiZSBpZ25vcmVkLgoKIyMjIExpc3RzCgotICoqc3Ryb25nKiogfn5kZWx%2BfiAqaXRhbGljKiA9PWhpZ2hsaWdodD09Ci0gYGlubGluZSBjb2RlYAotIFt4XSBjaGVja2JveAotIEthdGV4OiAkeCA9IHstYiBccG0gXHNxcnR7Yl4yLTRhY30gXG92ZXIgMmF9JCA8IS0tIG1hcmttYXA6IGZvbGQgLS0%2BCiAgLSBbTW9yZSBLYXRleCBFeGFtcGxlc10oIz9kPWdpc3Q6YWY3NmE0YzI0NWIzMDIyMDZiMTZhZWM1MDNkYmUwN2I6a2F0ZXgubWQpCi0gTm93IHdlIGNhbiB3cmFwIHZlcnkgdmVyeSB2ZXJ5IHZlcnkgbG9uZyB0ZXh0IGJhc2VkIG9uIGBtYXhXaWR0aGAgb3B0aW9uCi0gT3JkZXJlZCBsaXN0CiAgMS4gaXRlbSAxCiAgMi4gaXRlbSAyCgojIyMgQmxvY2tzCgpgYGBqcwpjb25zb2xlLmxvZygnaGVsbG8sIEphdmFTY3JpcHQnKQpgYGAKCnwgUHJvZHVjdHMgfCBQcmljZSB8CnwtfC18CnwgQXBwbGUgfCA0IHwKfCBCYW5hbmEgfCAyIHwKCiFbXShodHRwczovL21hcmttYXAuanMub3JnL2Zhdmljb24ucG5nKQ%3D%3D&output=svg

**Example (SVG Output with custom dimensions):**

https://markmap-service.gine.workers.dev/?output=svg&width=400&height=300&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y
