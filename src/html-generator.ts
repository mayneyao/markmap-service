// Helper function to escape HTML characters
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// --- HTML Generation Logic ---
export function generateHtmlResponse(markdown: string): Response {
    const escapedMarkdown = escapeHtml(markdown);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markmap</title>
  <style>
    body { margin: 0; padding: 0; } /* Remove default body margin */
    .markmap {
      display: block; /* Use block display */
      position: relative;
      width: 100vw; /* Full viewport width */
      height: 100vh; /* Full viewport height */
    }
    .markmap > svg {
      width: 100%;
      height: 100%;
      display: block; /* Ensure SVG takes block space */
    }
  </style>
</head>
<body>
  <div class="markmap">
    <script type="text/template">${escapedMarkdown}</script>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@latest"></script>
</body>
</html>`;

    return new Response(htmlContent, {
        headers: { "Content-Type": "text/html;charset=utf-8" },
    });
} 