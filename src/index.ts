// Only import necessary types and functions for the main handler
import { generateSvgResponse } from "./svg-generator";
import { generateHtmlResponse } from "./html-generator";
// Explicitly import caches if needed for typing, although it should be global
// import { caches } from "@cloudflare/workers-types"; // Usually global, try without explicit import first

// Define the binding type in the Env interface
// Exporting it here makes it accessible to svg-generator.ts
export interface Env {
  MY_BROWSER: Fetcher;
  // If you set another name in wrangler.toml bindings, change it here
  // MY_KV_NAMESPACE: KVNamespace;
}

// --- Helper HTML Page ---
// This HTML provides a UI for users to paste Markdown and generate the URL
const generatorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markmap URL Generator</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; background-color: #f8f9fa; color: #212529; }
        h1 { color: #343a40; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; }
        label { display: block; margin-top: 15px; font-weight: bold; color: #495057; }
        textarea { width: 100%; min-height: 200px; margin-top: 5px; border-radius: 4px; border: 1px solid #ced4da; padding: 10px; box-sizing: border-box; }
        input[type="text"], input[type="number"], select { width: 120px; margin-top: 5px; padding: 8px; border-radius: 4px; border: 1px solid #ced4da; box-sizing: border-box; }
        button { margin-top: 20px; padding: 10px 20px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px; font-size: 1em; }
        button:hover { background-color: #0056b3; }
        #outputUrl { margin-top: 15px; padding: 12px; background-color: #e9ecef; border: 1px solid #ced4da; border-radius: 4px; word-wrap: break-word; white-space: pre-wrap; font-family: monospace; }
        .options { display: flex; flex-wrap: wrap; gap: 25px; align-items: flex-end; margin-top: 15px; padding: 15px; background-color: #ffffff; border-radius: 4px; border: 1px solid #dee2e6;}
        .option-item { display: flex; flex-direction: column; }
        #copyButton { margin-left: 10px; background-color: #28a745; }
        #copyButton:hover { background-color: #218838; }
        #outputContainer { margin-top: 20px; }
        #outputContainer label { margin-bottom: 5px;}
    </style>
</head>
<body>
    <h1>Markmap URL Generator</h1>
    <p>Paste your Markdown content below, choose your options, and generate a URL for the Markmap service.</p>

    <label for="markdownInput">Markdown:</label>
    <textarea id="markdownInput" placeholder="Enter your Markdown here..."></textarea>

    <div class="options">
        <div class="option-item">
            <label for="outputFormat">Output Format:</label>
            <select id="outputFormat">
                <option value="html" selected>HTML</option>
                <option value="svg">SVG</option>
            </select>
        </div>
        <div class="option-item">
            <label for="widthInput">Width (SVG only):</label>
            <input type="number" id="widthInput" placeholder="e.g., 800">
        </div>
        <div class="option-item">
            <label for="heightInput">Height (SVG only):</label>
            <input type="number" id="heightInput" placeholder="e.g., 600">
        </div>
    </div>

    <button id="generateButton">Generate URL</button>

    <div id="outputContainer" style="display: none;">
        <label for="outputUrl">Generated URL:</label>
        <pre id="outputUrl"></pre>
        <button id="copyButton">Copy URL</button>
    </div>


    <script>
        const markdownInput = document.getElementById('markdownInput');
        const outputFormatSelect = document.getElementById('outputFormat');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const generateButton = document.getElementById('generateButton');
        const outputContainer = document.getElementById('outputContainer');
        const outputUrlDisplay = document.getElementById('outputUrl');
        const copyButton = document.getElementById('copyButton');

        function generateUrl() {
            const markdown = markdownInput.value; // Keep leading/trailing whitespace if user intended
            if (!markdown) {
                alert('Please enter some Markdown content.');
                return;
            }

            try {
                // Base64 encode the Markdown using UTF-8
                const utf8Bytes = new TextEncoder().encode(markdown);
                // Convert byte array to string before btoa
                const binaryString = String.fromCharCode(...utf8Bytes);
                const base64Markdown = btoa(binaryString);

                const outputFormat = outputFormatSelect.value;
                const width = widthInput.value.trim();
                const height = heightInput.value.trim();

                const params = new URLSearchParams();
                params.set('md', base64Markdown);
                params.set('output', outputFormat);

                if (outputFormat === 'svg') {
                     if (width) params.set('width', width);
                     if (height) params.set('height', height);
                }

                // Construct the URL using the current page's origin and pathname
                const baseUrl = window.location.origin + window.location.pathname;
                // Ensure trailing slash consistency - remove if present before adding query
                const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                const generatedUrl = \`\${cleanBaseUrl}?$\{params.toString()}\`;

                outputUrlDisplay.textContent = generatedUrl;
                outputContainer.style.display = 'block'; // Show the output area
                // copyButton.style.display = 'inline-block'; // Already visible when container is

            } catch (e) {
                console.error("Error generating URL:", e);
                alert(\`Error generating URL: $\{e.message\}. Check console for details.\`);
                outputContainer.style.display = 'none'; // Hide output on error
            }
        }

        function copyToClipboard() {
            const urlToCopy = outputUrlDisplay.textContent;
            if (!navigator.clipboard) {
                 alert('Clipboard API not available. Please copy manually.');
                 return;
            }
            navigator.clipboard.writeText(urlToCopy).then(() => {
                alert('URL copied to clipboard!');
            }, (err) => {
                console.error('Failed to copy URL: ', err);
                alert('Failed to copy URL. Please copy it manually.');
            });
        }

        generateButton.addEventListener('click', generateUrl);
        copyButton.addEventListener('click', copyToClipboard);

        // Enable/disable width/height based on format
        outputFormatSelect.addEventListener('change', () => {
            const isSvg = outputFormatSelect.value === 'svg';
            widthInput.disabled = !isSvg;
            heightInput.disabled = !isSvg;
            if (!isSvg) {
                 // Optionally clear or just leave values when disabled
                 // widthInput.value = '';
                 // heightInput.value = '';
            }
        });

        // Initial state setup
        (() => {
            const isSvg = outputFormatSelect.value === 'svg';
            widthInput.disabled = !isSvg;
            heightInput.disabled = !isSvg;
        })();

    </script>
</body>
</html>
`;


// --- Main Fetch Handler ---
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const mdBase64 = url.searchParams.get("md");

    // If 'md' parameter is missing, return the HTML generator page
    if (!mdBase64) {
        return new Response(generatorHtml, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    }

    // Continue with existing logic if 'md' is present
    const outputFormat =
      url.searchParams.get("output")?.toLowerCase() || "html"; // Default to html
    const widthParam = url.searchParams.get("width");
    const heightParam = url.searchParams.get("height");

    // --- Caching Logic Start ---
    // Use the default cache provided by Cloudflare Workers
    // Access the global 'caches' object provided by the Workers runtime
    // Cast to 'any' to bypass TypeScript error about 'default' property
    const cache = (caches as any).default;

    // For SVG requests, try to find a match in the cache first
    // We use the request object itself as the key, Cloudflare handles the matching
    if (outputFormat === "svg") {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log("Cache hit for SVG request:", request.url);
        // Add a custom header to indicate a cache hit (optional)
        const responseHeaders = new Headers(cachedResponse.headers);
        responseHeaders.set("X-Cache-Status", "HIT");
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: responseHeaders,
        });
      }
      console.log("Cache miss for SVG request:", request.url);
    }
    // --- Caching Logic End ---

    let markdown: string;
    try {
      // Decode Base64
      markdown = atob(mdBase64);
      // Further attempt to decode URI components which might be encoded within the base64
      // markdown = decodeURIComponent(escape(markdown)); // This might be needed if the source MD has % encoding, but test first. Often atob is enough.
    } catch (e) {
      if (e instanceof DOMException && e.name === "InvalidCharacterError") {
        return new Response('Invalid base64 encoding in "md" parameter', {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        });
      }
      // Handle other potential decoding errors
      console.error("Error decoding base64/URI component:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      return new Response(
        `Error decoding markdown parameter: ${errorMessage}`,
        { status: 400 }
      );
    }

    // Route based on output format
    if (outputFormat === "html") {
      return generateHtmlResponse(markdown); // Use imported function
    } else if (outputFormat === "svg") {
      // --- generateSvgResponse call modified for caching ---
      const response = await generateSvgResponse(
        markdown,
        env,
        widthParam,
        heightParam
      );

      // Check if the response is successful (status 2xx) before caching
      if (response.ok) {
        // Clone the response to put it in the cache
        // Use ctx.waitUntil to perform the cache operation without blocking the response
        const responseToCache = response.clone();
        // Add a cache status header for the original response too (optional)
        response.headers.set("X-Cache-Status", "MISS");

        // Set cache control headers for the browser/downstream caches (optional but recommended)
        // Cache for 1 hour (3600 seconds) in this example
        responseToCache.headers.set("Cache-Control", "public, max-age=3600");

        ctx.waitUntil(cache.put(request, responseToCache));
        console.log("Caching SVG response for:", request.url);
      } else {
        console.log(
          "Not caching unsuccessful SVG response (status:",
          response.status,
          ") for:",
          request.url
        );
        response.headers.set("X-Cache-Status", "BYPASS"); // Indicate bypass due to error
      }

      return response; // Return the original response (potentially with X-Cache-Status: MISS)
    } else {
      // Invalid output format requested
      return new Response(
        `Invalid "output" parameter value. Use "svg" or "html".`,
        {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>; // Use satisfies for better type checking
