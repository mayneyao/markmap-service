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

// --- Main Fetch Handler ---
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const mdBase64 = url.searchParams.get("md");
    const outputFormat =
      url.searchParams.get("output")?.toLowerCase() || "html"; // Default to html
    const widthParam = url.searchParams.get("width");
    const heightParam = url.searchParams.get("height");

    if (!mdBase64) {
      return new Response('Missing "md" query parameter', { status: 400 });
    }

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
