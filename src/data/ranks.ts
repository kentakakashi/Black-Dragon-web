export const ranks = [
  { name: "Z", kills: "50,000+", minimum: 50000, tone: "gold", note: "LEGENDARY" },
  { name: "SSS", kills: "20,000+", minimum: 20000, tone: "red", note: "ELITE" },
  { name: "SS", kills: "15,000+", minimum: 15000, tone: "red", note: "MASTER" },
  { name: "S", kills: "10,000+", minimum: 10000, tone: "red", note: "VETERAN" },
  { name: "A", kills: "7,500+", minimum: 7500, tone: "silver", note: "ADVANCED" },
  { name: "B", kills: "5,000+", minimum: 5000, tone: "silver", note: "SKILLED" },
  { name: "C", kills: "2,500+", minimum: 2500, tone: "silver", note: "RISING" },
  { name: "D", kills: "1,000+", minimum: 1000, tone: "silver", note: "ROOKIE" },
  { name: "E", kills: "0–999", minimum: 0, tone: "silver", note: "ENTRY" },
] as const;
