export const xml_filler = '<quest title="Quest Title" author="Your Name" email="email@example.com" summary="Quest summary" url="yoursite.com" recommended-min-players="2" recommended-max-players="4" min-time-minutes="20" max-time-minutes="40">\n  <roleplay title="Roleplay Title">\n    <p>roleplay text</p>\n  </roleplay>\n  <trigger>end</trigger>\n</quest>';

// Global text buffer for render-less updates of editor.
var buffer = xml_filler;
export function getBuffer() {
  return buffer;
}
export function setBuffer(text) {
  buffer = text;
}