export function generateFixSuggestion(ruleId: string, htmlSnippet: string): string | null {
  // Return a string with the suggested HTML or null if no generic fix is available.
  
  if (!htmlSnippet) return null;

  switch (ruleId) {
    case "image-alt":
      // Check if it's an img tag
      if (htmlSnippet.toLowerCase().startsWith("<img")) {
        // If it doesn't have an alt attribute, add one
        if (!htmlSnippet.toLowerCase().includes("alt=")) {
          return htmlSnippet.replace(/<img/i, '<img alt="[descriptive text or empty if decorative]"');
        }
      }
      return null;

    case "button-name":
      // If it's a button, it might be missing text or aria-label
      if (htmlSnippet.toLowerCase().startsWith("<button")) {
        return htmlSnippet.replace(
          /<button([\s\S]*?)>([\s\S]*?)<\/button>/i,
          '<button$1 aria-label="[describe button action]">$2</button>'
        );
      }
      return null;

    case "link-name":
      if (htmlSnippet.toLowerCase().startsWith("<a")) {
        return htmlSnippet.replace(
          /<a([\s\S]*?)>([\s\S]*?)<\/a>/i,
          '<a$1 aria-label="[describe link destination]">$2</a>'
        );
      }
      return null;

    case "color-contrast":
      // We can't generate a specific HTML fix for CSS contrast, so we provide guidance.
      return "/* CSS Update Needed */\nEnsure the text color and background color have a contrast ratio of at least 4.5:1 (or 3:1 for large text).";

    case "html-has-lang":
      if (htmlSnippet.toLowerCase().startsWith("<html")) {
        if (!htmlSnippet.toLowerCase().includes("lang=")) {
          return htmlSnippet.replace(/<html/i, '<html lang="en"');
        }
      }
      return null;
      
    case "label":
      // Form input missing label
      if (htmlSnippet.toLowerCase().startsWith("<input") || htmlSnippet.toLowerCase().startsWith("<select") || htmlSnippet.toLowerCase().startsWith("<textarea")) {
        const idMatch = htmlSnippet.match(/id=["']([^"']+)["']/i);
        const id = idMatch ? idMatch[1] : "[input-id]";
        return `<label for="${id}">[Label Text]</label>\n${htmlSnippet}`;
      }
      return null;
      
    case "aria-roles":
      return `${htmlSnippet.replace(/role=["'][^"']+["']/i, 'role="[valid-aria-role]"')}`;

    default:
      return null;
  }
}
