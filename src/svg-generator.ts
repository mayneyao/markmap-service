import puppeteer, {
  ElementHandle,
  BrowserWorker,
  ActiveSession,
} from "@cloudflare/puppeteer"; // Import BrowserWorker and ActiveSession
import { Env } from "."; // Import Env type from index.ts
import { generateHtml } from "./html-generator";

// Helper function to find a random available session
async function getRandomAvailableSession(
  endpoint: BrowserWorker
): Promise<string | undefined> {
  try {
    const sessions: ActiveSession[] = await puppeteer.sessions(endpoint);
    console.log(`Available sessions: ${JSON.stringify(sessions)}`);
    const availableSessionIds = sessions
      .filter((session) => !session.connectionId) // Find sessions without an active connection
      .map((session) => session.sessionId);

    if (availableSessionIds.length === 0) {
      console.log("No available sessions found.");
      return undefined;
    }

    // Pick a random session ID from the available ones
    const randomIndex = Math.floor(Math.random() * availableSessionIds.length);
    const sessionId = availableSessionIds[randomIndex];
    console.log(`Attempting to connect to session: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return undefined; // Return undefined if there's an error fetching sessions
  }
}

// --- SVG Generation Logic ---
export async function generateSvgResponse(
  markdown: string,
  env: Env,
  widthParam: string | null, // Add width parameter
  heightParam: string | null // Add height parameter
): Promise<Response> {
  let browser = null; // Define browser outside try block for finally
  let launchedNew = false; // Flag to track if we launched a new browser
  let connectedSessionId: string | null = null;

  try {
    // --- Browser Session Reuse Logic Start ---
    const existingSessionId = await getRandomAvailableSession(env.MY_BROWSER);
    if (existingSessionId) {
      try {
        console.log(
          `Connecting to existing browser session: ${existingSessionId}`
        );
        browser = await puppeteer.connect(env.MY_BROWSER, existingSessionId);
        connectedSessionId = existingSessionId;
        console.log(`Successfully connected to session: ${connectedSessionId}`);
      } catch (e) {
        console.warn(
          `Failed to connect to session ${existingSessionId}, maybe another worker connected first? Error: ${e}`
        );
        // If connection fails, proceed to launch a new browser
        browser = null; // Ensure browser is null if connect failed
      }
    }

    // If we couldn't connect to an existing session, launch a new one
    if (!browser) {
      console.log("Launching new browser session...");
      browser = await puppeteer.launch(env.MY_BROWSER);
      launchedNew = true;
      connectedSessionId = browser.sessionId(); // Get the session ID of the newly launched browser
      console.log(`Launched new browser session: ${connectedSessionId}`);
    }
    // --- Browser Session Reuse Logic End ---

    // Parse width and height, ensuring they are valid numbers if provided
    const requestedWidth = widthParam ? parseInt(widthParam, 10) : null;
    const requestedHeight = heightParam ? parseInt(heightParam, 10) : null;
    // Validate parsed numbers (optional, but good practice)
    const finalWidth =
      requestedWidth && !isNaN(requestedWidth) && requestedWidth > 0
        ? requestedWidth
        : null;
    const finalHeight =
      requestedHeight && !isNaN(requestedHeight) && requestedHeight > 0
        ? requestedHeight
        : null;

    // This HTML is generated specifically for Puppeteer rendering
    const fullHtml = generateHtml(markdown);
    const page = await browser.newPage();

    // Listen for console errors within the page
    page.on("pageerror", (err) => {
      console.error(`Page error: ${err.toString()}`);
    });

    // Using data URI to load local HTML content
    const dataUri = `data:text/html;base64,${btoa(
      unescape(encodeURIComponent(fullHtml))
    )}`; // Ensure correct encoding for btoa
    await page.goto(dataUri, { waitUntil: "networkidle0" }); // Wait for scripts to load/run

    // Wait specifically for the container element to be ready
    console.log("Waiting for selector #mindmap..."); // Wait for the container
    const elementHandle = await page.waitForSelector("#mindmap svg, #mindmap", {
      // Wait for SVG child or container itself
      timeout: 20000, // Increased timeout to 20 seconds
    });
    console.log("Selector found!");

    if (!elementHandle) {
      console.error(
        "Could not find markmap container element (#mindmap or #mindmap svg) in the page"
      );
      return new Response(
        "Error generating markmap screenshot: Container element not found",
        {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }
    console.log("Element handle found!");

    // Ensure we target the SVG element itself if found
    const svgElementHandle = await elementHandle.evaluateHandle((el) =>
      el.tagName === "svg" ? el : el.querySelector("svg")
    );

    if (!svgElementHandle || !svgElementHandle.asElement()) {
      console.error("Could not get handle to the SVG element inside #mindmap");
      return new Response(
        "Error generating markmap SVG: SVG element not found within container",
        { status: 500 }
      );
    }

    // Evaluate the element's properties more robustly
    const evaluateSvgData = (svgEl: SVGGraphicsElement) => {
      // Define the function separately
      // It's safer to work with the SVG element directly if possible
      const widthAttr = svgEl.getAttribute("width");
      const heightAttr = svgEl.getAttribute("height");
      // Use clientWidth/Height as fallback if attributes aren't set
      const width = widthAttr ? parseInt(widthAttr, 10) : svgEl.clientWidth;
      const height = heightAttr ? parseInt(heightAttr, 10) : svgEl.clientHeight;

      const outerHTML = svgEl.outerHTML;
      let viewBox = svgEl.getAttribute("viewBox"); // Prioritize existing attribute

      if (!viewBox) {
        // If viewBox attribute is not set, try calculating from getBBox()
        try {
          // Check if getBBox exists and the element is valid
          if (
            svgEl.isConnected &&
            typeof svgEl.getBBox === "function" &&
            svgEl.checkVisibility()
          ) {
            const bbox = svgEl.getBBox();
            // Use floor/ceil for safety, though decimals are valid in viewBox
            viewBox = `${Math.floor(bbox.x)} ${Math.floor(bbox.y)} ${Math.ceil(
              bbox.width
            )} ${Math.ceil(bbox.height)}`;
          } else {
            console.warn(
              "SVG element not visible, connected, or getBBox unavailable. Falling back to width/height."
            );
            // Fallback if not visible/connected or no getBBox
            viewBox = `0 0 ${width} ${height}`;
          }
        } catch (e) {
          console.error("Error calculating SVG BBox:", e);
          // Fallback if getBBox fails
          viewBox = `0 0 ${width} ${height}`;
        }
      }

      return { outerHTML, width, height, viewBox }; // Return the determined viewBox
    };

    // Now call evaluate with the function handle
    // Explicitly cast the handle to ElementHandle<SVGGraphicsElement> using the imported type
    const svgData = await (
      svgElementHandle as ElementHandle<SVGGraphicsElement>
    ).evaluate(evaluateSvgData);

    // console.log("SVG Data:", svgData);

    if (!svgData.outerHTML) {
      console.error("Could not get outerHTML from the SVG element.");
      return new Response(
        "Error generating markmap SVG: Could not extract SVG markup",
        { status: 500 }
      );
    }

    // Construct the final SVG string
    let finalSvgMarkup = svgData.outerHTML;
    const svgTagMatch = finalSvgMarkup.match(/<svg[^>]*>/);

    if (svgTagMatch) {
      let svgTag = svgTagMatch[0];

      // Determine final dimensions: Use requested values if valid, otherwise use detected values
      const widthToUse = finalWidth !== null ? finalWidth : svgData.width;
      const heightToUse = finalHeight !== null ? finalHeight : svgData.height;

      // 1. Ensure xmlns namespace is present
      if (!svgTag.includes(" xmlns=")) {
        svgTag = svgTag.replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      // 2. Add/Update width attribute using the determined value
      if (svgTag.includes(" width=")) {
        svgTag = svgTag.replace(/width="[^"]*"/, `width="${widthToUse}"`);
      } else {
        svgTag = svgTag.replace("<svg", `<svg width="${widthToUse}"`); // Add if missing
      }

      // 3. Add/Update height attribute using the determined value
      if (svgTag.includes(" height=")) {
        svgTag = svgTag.replace(/height="[^"]*"/, `height="${heightToUse}"`);
      } else {
        svgTag = svgTag.replace("<svg", `<svg height="${heightToUse}"`); // Add if missing
      }

      // 4. Add/Update viewBox attribute (using the robustly determined value)
      // Note: ViewBox might need adjustment if width/height are forced, but
      // keeping the original viewBox often works well for scaling.
      // Advanced logic could recalculate viewBox if needed.
      if (svgTag.includes(" viewBox=")) {
        svgTag = svgTag.replace(
          /viewBox="[^"]*"/,
          `viewBox="${svgData.viewBox}"`
        );
      } else {
        svgTag = svgTag.replace("<svg", `<svg viewBox="${svgData.viewBox}"`); // Add if missing
      }

      // Replace the original tag
      finalSvgMarkup = finalSvgMarkup.replace(svgTagMatch[0], svgTag);
    } else {
      console.warn("Could not find opening <svg> tag to add attributes.");
      // Add a basic SVG wrapper as a last resort if needed? Unlikely necessary.
    }

    // Return the SVG markup
    return new Response(finalSvgMarkup, {
      headers: { "Content-Type": "image/svg+xml" }, // Set Content-Type to SVG
    });
  } catch (e) {
    console.error("Error during browser rendering or SVG extraction:", e); // Updated error context
    // Handle potential Puppeteer/timeout errors
    // Type guard for error message access
    const errorMessage = e instanceof Error ? e.message : String(e);
    return new Response(
      `Error generating markmap SVG: ${errorMessage}`, // Updated error context
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  } finally {
    // Ensure the browser instance is disconnected (not closed) to allow reuse
    if (browser) {
      try {
        console.log(
          `Disconnecting from browser session: ${connectedSessionId}`
        );
        browser.disconnect(); // Use disconnect instead of close
        console.log(
          `Successfully disconnected from session: ${connectedSessionId}`
        );
      } catch (disconnectError) {
        console.error(
          `Error disconnecting from session ${connectedSessionId}:`,
          disconnectError
        );
        // Optionally, attempt to close if disconnect fails, though this might indicate a deeper issue
        // try {
        //   await browser.close();
        // } catch (closeError) {
        //   console.error(`Error closing browser after failed disconnect:`, closeError);
        // }
      }
    }
  }
}
