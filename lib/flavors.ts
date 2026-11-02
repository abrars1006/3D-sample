export type Flavor = {
  name: string;
  shortName: string;
  note: string;
  color: string;
  accent: string;
  fruit: string;
  number: string;
};

export const flavors: Flavor[] = [
  { name: "Blood Orange", shortName: "Blood Orange", note: "Citrus, with a little sunset.", color: "#f06443", accent: "#ffbd72", fruit: "🍊", number: "01" },
  { name: "Pink Grapefruit", shortName: "Pink Grapefruit", note: "Bright, tart, wildly refreshing.", color: "#e8889e", accent: "#ffc5b4", fruit: "🍑", number: "02" },
  { name: "Yuzu Lime", shortName: "Yuzu Lime", note: "A crisp little citrus daydream.", color: "#b1bd59", accent: "#e4d978", fruit: "🍋", number: "03" },
  { name: "Mango Guava", shortName: "Mango Guava", note: "A one-way ticket to golden hour.", color: "#e7a12d", accent: "#f6d574", fruit: "🥭", number: "04" },
  { name: "Wild Berry", shortName: "Wild Berry", note: "Soft berry, big main-character energy.", color: "#9772af", accent: "#d5a5c1", fruit: "🫐", number: "05" },
  { name: "Peach Hibiscus", shortName: "Peach Hibiscus", note: "Floral, fuzzy, and full of feeling.", color: "#e87961", accent: "#f5b39a", fruit: "🌺", number: "06" },
];
