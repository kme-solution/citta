export const groups = [
  { name: "sense-sphere unwholesome", summary: 12, detailed: 12 },
  { name: "sense-sphere rootless", summary: 18, detailed: 18 },
  { name: "sense-sphere beautiful", summary: 24, detailed: 24 },
  { name: "fine-material", summary: 15, detailed: 15 },
  { name: "immaterial", summary: 12, detailed: 12 },
  { name: "supramundane", summary: 8, detailed: 40 }
];
export function catalogView() {
  return { groups, summary: groups.reduce((n, g) => n + g.summary, 0),
    detailed: groups.reduce((n, g) => n + g.detailed, 0) };
}
