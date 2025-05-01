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

```
https://markmap-service.gine.workers.dev/?md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y
```

**Example (SVG Output):**

```
https://markmap-service.gine.workers.dev/?output=svg&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y
```

**Example (SVG Output with custom dimensions):**

```
https://markmap-service.gine.workers.dev/?output=svg&width=400&height=300&md=IyBIZWxsbyBNYXJrbWFwCgotIEl0ZW0gMQotIEl0ZW0gMgogIC0gU3ViaXRlbSAyLjEKICAtIFN1Yml0ZW0gMi4y
```
