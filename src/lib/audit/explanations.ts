export type RuleExplanation = {
  description: string;
  whyItMatters: string;
};

const RULE_EXPLANATIONS: Record<string, RuleExplanation> = {
  "image-alt": {
    description:
      "An image is missing alternative text (alt attribute) that describes its content.",
    whyItMatters:
      "Screen readers rely on alt text to describe images to blind and low-vision users. Without it, they miss important visual information.",
  },
  "input-image-alt": {
    description:
      "An image used as a button or form control is missing alternative text.",
    whyItMatters:
      "Users who cannot see the image won't know what the button does, making the control unusable.",
  },
  label: {
    description:
      "A form field does not have an associated label that identifies its purpose.",
    whyItMatters:
      "Labels help everyone understand what to enter. Screen reader users depend on labels to know what each field is for.",
  },
  "form-field-multiple-labels": {
    description: "A form field has more than one label associated with it.",
    whyItMatters:
      "Multiple labels can confuse assistive technology and make forms harder to understand.",
  },
  "color-contrast": {
    description:
      "Text or icons don't have enough contrast against their background color.",
    whyItMatters:
      "Low contrast makes content hard to read for people with low vision, color blindness, or when viewing screens in bright sunlight.",
  },
  "link-name": {
    description:
      "A link has no visible text or accessible name describing where it goes.",
    whyItMatters:
      "Screen reader users hear a list of links — links without names are meaningless and impossible to use.",
  },
  "button-name": {
    description:
      "A button has no accessible name describing its action or purpose.",
    whyItMatters:
      "Users need to know what a button does before activating it. Unnamed buttons are confusing and unusable.",
  },
  "document-title": {
    description: "The page is missing a descriptive title element.",
    whyItMatters:
      "The page title helps users orient themselves in browser tabs and is the first thing screen readers announce.",
  },
  "html-has-lang": {
    description:
      "The page doesn't specify its language in the HTML element.",
    whyItMatters:
      "Screen readers use the language setting to pronounce words correctly. Wrong language settings make content unintelligible.",
  },
  "html-lang-valid": {
    description: "The page language attribute contains an invalid value.",
    whyItMatters:
      "An invalid language code prevents assistive technology from selecting the correct pronunciation rules.",
  },
  "frame-title": {
    description: "An iframe or frame is missing a descriptive title.",
    whyItMatters:
      "Frame titles help screen reader users understand embedded content and navigate between page sections.",
  },
  "bypass": {
    description:
      "The page lacks a way to skip repetitive navigation and jump to main content.",
    whyItMatters:
      "Keyboard and screen reader users must tab through every navigation link on every page without a skip link.",
  },
  "heading-order": {
    description: "Headings skip levels (e.g., h1 directly to h3).",
    whyItMatters:
      "Proper heading hierarchy creates a document outline that screen reader users rely on to navigate and understand page structure.",
  },
  "empty-heading": {
    description: "A heading element contains no text content.",
    whyItMatters:
      "Empty headings break the document outline and mislead users navigating by headings.",
  },
  "list": {
    description:
      "List markup is used incorrectly — content that should be a list isn't, or vice versa.",
    whyItMatters:
      "Screen readers announce list length and position. Incorrect markup removes useful navigation cues.",
  },
  "listitem": {
    description: "A list item exists outside of a proper list container.",
    whyItMatters:
      "Orphaned list items aren't announced as part of a list, losing helpful context for assistive technology users.",
  },
  "region": {
    description:
      "Page content is not organized into landmark regions (main, nav, etc.).",
    whyItMatters:
      "Landmarks let screen reader users jump directly to navigation, main content, or footer instead of reading everything.",
  },
  "landmark-one-main": {
    description: "The page doesn't have exactly one main content landmark.",
    whyItMatters:
      "The main landmark identifies primary content. Missing or duplicate main regions confuse navigation.",
  },
  "landmark-unique": {
    description: "Multiple landmarks of the same type aren't uniquely labeled.",
    whyItMatters:
      "When there are two navigation areas, users need distinct labels to tell them apart.",
  },
  "aria-allowed-attr": {
    description: "An element uses ARIA attributes that aren't allowed for its role.",
    whyItMatters:
      "Invalid ARIA can cause assistive technology to misinterpret or ignore elements entirely.",
  },
  "aria-required-attr": {
    description: "An element with an ARIA role is missing required ARIA attributes.",
    whyItMatters:
      "Required ARIA attributes provide essential state information. Missing them makes widgets unusable.",
  },
  "aria-valid-attr-value": {
    description: "An ARIA attribute has an invalid value.",
    whyItMatters:
      "Invalid ARIA values can cause screen readers to report wrong states, like saying a checkbox is checked when it isn't.",
  },
  "aria-hidden-focus": {
    description:
      "An element hidden from screen readers still contains focusable children.",
    whyItMatters:
      "Keyboard users can tab to invisible elements, creating confusion about where focus is on the page.",
  },
  "tabindex": {
    description:
      "A positive tabindex value disrupts the natural keyboard tab order.",
    whyItMatters:
      "Custom tab orders are disorienting. Keyboard users expect to move through the page in a logical, visual order.",
  },
  "focus-order-semantics": {
    description: "The focus order doesn't match the visual layout.",
    whyItMatters:
      "When tab order jumps unpredictably, keyboard users lose track of where they are on the page.",
  },
  "scrollable-region-focusable": {
    description:
      "A scrollable area cannot be reached or operated with the keyboard.",
    whyItMatters:
      "Keyboard-only users can't scroll through content in regions that aren't focusable.",
  },
  "duplicate-id": {
    description: "Multiple elements share the same ID attribute.",
    whyItMatters:
      "IDs must be unique. Duplicates break label associations, ARIA references, and scripting.",
  },
  "duplicate-id-active": {
    description: "Multiple interactive elements share the same ID.",
    whyItMatters:
      "Duplicate IDs on form controls break label associations, making forms unusable for assistive technology.",
  },
  "meta-viewport": {
    description:
      "The viewport meta tag prevents users from zooming the page.",
    whyItMatters:
      "Low-vision users need to zoom in to read content. Blocking zoom violates accessibility guidelines.",
  },
  "autocomplete-valid": {
    description: "A form field has an invalid autocomplete attribute value.",
    whyItMatters:
      "Correct autocomplete helps users fill forms faster and enables password managers and assistive tools.",
  },
  "select-name": {
    description: "A select dropdown has no accessible name.",
    whyItMatters:
      "Users need to know what a dropdown controls before making a selection.",
  },
  "aria-roles": {
    description: "An element uses an invalid or inappropriate ARIA role.",
    whyItMatters:
      "Wrong roles tell assistive technology to treat elements as the wrong type of control.",
  },
  "aria-required-children": {
    description:
      "A composite ARIA widget is missing required child elements.",
    whyItMatters:
      "Composite widgets like menus and tabs need specific child roles to work correctly with assistive technology.",
  },
  "aria-required-parent": {
    description: "An ARIA element is not contained within its required parent.",
    whyItMatters:
      "Certain roles only work when nested inside specific parent roles, like menu items inside menus.",
  },
};

export function getExplanation(
  ruleId: string,
  fallbackHelp: string,
  fallbackDescription: string
): RuleExplanation {
  const known = RULE_EXPLANATIONS[ruleId];
  if (known) return known;

  return {
    description: fallbackDescription || fallbackHelp,
    whyItMatters:
      "This issue can make your site harder or impossible to use for people with disabilities, including those using screen readers or keyboard-only navigation.",
  };
}

export function formatWcagTag(tag: string): string {
  const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
  if (!match) return tag;

  const [, major, minor, sub] = match;
  const criteria: Record<string, string> = {
    "111": "1.1.1 Non-text Content",
    "121": "1.2.1 Audio-only and Video-only",
    "131": "1.3.1 Info and Relationships",
    "141": "1.4.1 Use of Color",
    "143": "1.4.3 Contrast (Minimum)",
    "144": "1.4.4 Resize Text",
    "211": "2.1.1 Keyboard",
    "212": "2.1.2 No Keyboard Trap",
    "221": "2.2.1 Timing Adjustable",
    "241": "2.4.1 Bypass Blocks",
    "242": "2.4.2 Page Titled",
    "243": "2.4.3 Focus Order",
    "244": "2.4.4 Link Purpose",
    "245": "2.4.5 Multiple Ways",
    "246": "2.4.6 Headings and Labels",
    "247": "2.4.7 Focus Visible",
    "311": "3.1.1 Language of Page",
    "321": "3.2.1 On Focus",
    "322": "3.2.2 On Input",
    "331": "3.3.1 Error Identification",
    "332": "3.3.2 Labels or Instructions",
    "411": "4.1.1 Parsing",
    "412": "4.1.2 Name, Role, Value",
  };

  const key = `${major}${minor}${sub}`;
  return criteria[key] ? `WCAG ${criteria[key]}` : `WCAG ${major}.${minor}.${sub}`;
}
