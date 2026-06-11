export interface TeamData {
  code: string;
  name: string;
  flag: string;
  group: string;
}

export const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
export const STICKER_COUNT = 20;

// Dados extraídos do álbum oficial Panini FIFA World Cup 2026
// Número ao lado = página inicial das figurinhas desse time no álbum
export const TEAMS: TeamData[] = [
  // Group A
  { code: "MEX", name: "Mexico",             flag: "🇲🇽", group: "A" },
  { code: "RSA", name: "South Africa",        flag: "🇿🇦", group: "A" },
  { code: "KOR", name: "Korea Republic",      flag: "🇰🇷", group: "A" },
  { code: "CZE", name: "Czechia",             flag: "🇨🇿", group: "A" },
  // Group B
  { code: "CAN", name: "Canada",              flag: "🇨🇦", group: "B" },
  { code: "BIH", name: "Bosnia-Herzegovina",  flag: "🇧🇦", group: "B" },
  { code: "QAT", name: "Qatar",               flag: "🇶🇦", group: "B" },
  { code: "SUI", name: "Switzerland",         flag: "🇨🇭", group: "B" },
  // Group C
  { code: "BRA", name: "Brazil",              flag: "🇧🇷", group: "C" },
  { code: "MAR", name: "Morocco",             flag: "🇲🇦", group: "C" },
  { code: "HAI", name: "Haiti",               flag: "🇭🇹", group: "C" },
  { code: "SCO", name: "Scotland",            flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },
  // Group D
  { code: "USA", name: "USA",                 flag: "🇺🇸", group: "D" },
  { code: "PAR", name: "Paraguay",            flag: "🇵🇾", group: "D" },
  { code: "AUS", name: "Australia",           flag: "🇦🇺", group: "D" },
  { code: "TUR", name: "Türkiye",             flag: "🇹🇷", group: "D" },
  // Group E
  { code: "GER", name: "Germany",             flag: "🇩🇪", group: "E" },
  { code: "CUW", name: "Curaçao",             flag: "🇨🇼", group: "E" },
  { code: "CIV", name: "Côte d'Ivoire",       flag: "🇨🇮", group: "E" },
  { code: "ECU", name: "Ecuador",             flag: "🇪🇨", group: "E" },
  // Group F
  { code: "NED", name: "Netherlands",         flag: "🇳🇱", group: "F" },
  { code: "JPN", name: "Japan",               flag: "🇯🇵", group: "F" },
  { code: "SWE", name: "Sweden",              flag: "🇸🇪", group: "F" },
  { code: "TUN", name: "Tunisia",             flag: "🇹🇳", group: "F" },
  // Group G
  { code: "BEL", name: "Belgium",             flag: "🇧🇪", group: "G" },
  { code: "EGY", name: "Egypt",               flag: "🇪🇬", group: "G" },
  { code: "IRN", name: "IR Iran",             flag: "🇮🇷", group: "G" },
  { code: "NZL", name: "New Zealand",         flag: "🇳🇿", group: "G" },
  // Group H
  { code: "ESP", name: "Spain",               flag: "🇪🇸", group: "H" },
  { code: "CPV", name: "Cabo Verde",          flag: "🇨🇻", group: "H" },
  { code: "KSA", name: "Saudi Arabia",        flag: "🇸🇦", group: "H" },
  { code: "URU", name: "Uruguay",             flag: "🇺🇾", group: "H" },
  // Group I
  { code: "FRA", name: "France",              flag: "🇫🇷", group: "I" },
  { code: "SEN", name: "Senegal",             flag: "🇸🇳", group: "I" },
  { code: "IRQ", name: "Iraq",                flag: "🇮🇶", group: "I" },
  { code: "NOR", name: "Norway",              flag: "🇳🇴", group: "I" },
  // Group J
  { code: "ARG", name: "Argentina",           flag: "🇦🇷", group: "J" },
  { code: "ALG", name: "Algeria",             flag: "🇩🇿", group: "J" },
  { code: "AUT", name: "Austria",             flag: "🇦🇹", group: "J" },
  { code: "JOR", name: "Jordan",              flag: "🇯🇴", group: "J" },
  // Group K
  { code: "POR", name: "Portugal",            flag: "🇵🇹", group: "K" },
  { code: "COD", name: "Congo DR",            flag: "🇨🇩", group: "K" },
  { code: "UZB", name: "Uzbekistan",          flag: "🇺🇿", group: "K" },
  { code: "COL", name: "Colombia",            flag: "🇨🇴", group: "K" },
  // Group L
  { code: "ENG", name: "England",             flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { code: "CRO", name: "Croatia",             flag: "🇭🇷", group: "L" },
  { code: "GHA", name: "Ghana",               flag: "🇬🇭", group: "L" },
  { code: "PAN", name: "Panama",              flag: "🇵🇦", group: "L" },
];

export function getStickerCode(teamCode: string, index: number): string {
  if (teamCode === "FWC") {
    // FWC00–FWC19 (zero-padded, zero-based)
    return `${teamCode}${String(index).padStart(2, "0")}`;
  }
  // BRA1–BRA20 (no padding, 1-based)
  return `${teamCode}${index + 1}`;
}

export const TOTAL_STICKERS = (1 + TEAMS.length) * STICKER_COUNT; // 49 × 20 = 980
