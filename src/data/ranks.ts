export const ranks = [
  { name: "Z", kills: "50,000+", minimum: 50000, tone: "gold", title: "THE LEGEND", note: "LEGENDARY" },
  { name: "SSS", kills: "20,000+", minimum: 20000, tone: "red", title: "APEX", note: "ELITE" },
  { name: "SS", kills: "15,000+", minimum: 15000, tone: "red", title: "OVERLORD", note: "MASTER" },
  { name: "S", kills: "10,000+", minimum: 10000, tone: "red", title: "VANGUARD", note: "VETERAN" },
  { name: "A", kills: "7,500+", minimum: 7500, tone: "silver", title: "ELITE", note: "ADVANCED" },
  { name: "B", kills: "5,000+", minimum: 5000, tone: "silver", title: "WARRIOR", note: "SKILLED" },
  { name: "C", kills: "2,500+", minimum: 2500, tone: "silver", title: "FIGHTER", note: "RISING" },
  { name: "D", kills: "1,000+", minimum: 1000, tone: "silver", title: "RECRUIT", note: "ROOKIE" },
  { name: "E", kills: "0–999", minimum: 0, tone: "silver", title: "INITIATE", note: "ENTRY" },
] as const;
