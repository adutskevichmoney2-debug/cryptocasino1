/**
 * Demo game studios. Every name here is invented for this project — any
 * resemblance to a real gaming supplier is unintentional.
 *
 * `id` is the stable kebab-case key referenced by GameFixture.provider.
 */

export interface ProviderFixture {
  /** kebab-case, e.g. "novaplay" */
  id: string;
  /** display name, e.g. "NovaPlay" */
  name: string;
}

export const PROVIDERS: ProviderFixture[] = [
  { id: "novaplay", name: "NovaPlay" },
  { id: "aurora-gaming", name: "Aurora Gaming" },
  { id: "pixelsoft", name: "PixelSoft" },
  { id: "vertex-studios", name: "Vertex Studios" },
  { id: "lumen-play", name: "Lumen Play" },
  { id: "ironclad-games", name: "Ironclad Games" },
  { id: "saffron-studio", name: "Saffron Studio" },
  { id: "kestrel-interactive", name: "Kestrel Interactive" },
  { id: "obsidian-reels", name: "Obsidian Reels" },
  { id: "hexline-gaming", name: "Hexline Gaming" },
  { id: "driftwood-labs", name: "Driftwood Labs" },
  { id: "zenith-originals", name: "Zenith Originals" },
];
