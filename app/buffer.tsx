export const xml_filler: string = "# Quest Title \nsummary: Quest summary\nauthor: Your Name\nemail: email@example.com\nurl: yoursite.com\nminPlayers: 2\nmaxPlayers: 4\nminTimeMinutes: 20\nmaxTimeMinutes: 40\n\n_Roleplay Title_\n\nroleplay text\n\n**end**";

// Global text buffer for render-less updates of editor.
var buffer: string = xml_filler;

export function getBuffer(): string {
  return buffer;
}

export function setBuffer(text: string): void {
  buffer = text;
}