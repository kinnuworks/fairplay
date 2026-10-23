// Types for cases, clues, facts and reports. Originally shared with the Accomplice game.

export type Tone = 'classic' | 'cozy';
export type Phase = 'lobby' | 'briefing' | 'tutorial' | 'investigate' | 'accuse' | 'reveal' | 'results';
export type Role = 'detective' | 'accomplice';

// ---------- Case model (full, server-side only) ----------

export interface Room { id: string; name: string; x: number; y: number; w: number; h: number; adjacent: string[] }
export interface Slot { id: number; label: string } // e.g. { id: 0, label: '8:00 pm' }

export interface Suspect {
  id: string;
  name: string;
  shortName?: string;      // for tight spaces and speech: "Colonel Gage", "Dr Sen", "Freddie"
  role: string;            // "the cook"
  traits: string[];        // speaking style hints: ["clipped", "nervous laugh"]
  voiceId: string;         // TTS voice id
  portrait: string;        // asset key, e.g. "portraits/cook.webp"
  motive: string;          // one line shown on the board
  alibi: Record<number, string>; // what they CLAIM: slot -> roomId
}

export interface Item { id: string; name: string; homeRoom: string }

export type Fact =
  | { k: 'at'; s: string; room: string; slot: number }
  | { k: 'notAt'; s: string; room: string; slot: number }
  | { k: 'had'; s: string; item: string; slot: number }
  | { k: 'itemIn'; item: string; room: string; slot: number }
  | { k: 'saw'; a: string; b: string; room: string; slot: number };

export interface Clue {
  id: string;
  kind: 'physical' | 'document' | 'testimony';
  title: string;           // short card title
  short?: string;          // card face line, 12 words or fewer, readable at 3 m
  text: string;            // card text (player facing)
  visibility: 'board' | 'private';
  round: 1 | 2 | 3;
  fact: Fact;              // what the solver learns from it
  key?: boolean;           // necessary for a unique answer
  holderPlayerSlot?: number; // for private clues: which player seat receives it (0..5)
}

export interface Lie { s: string; slot: number; claimedRoom: string; trueRoom: string; reason: 'guilt' | 'embarrassment'; detail?: string } // detail: what they were really doing (embarrassment lies)

export interface Case {
  id: string;
  seed: number;
  tone: Tone;
  difficulty: 1 | 2 | 3;
  title: string;
  place: string;
  dateLine: string;
  intro: string;           // narrator paragraph
  scene?: string;          // scene art asset key, e.g. "scenes/ashby-hall.webp"
  briefing?: string[];     // 4 to 6 short narrator lines, one per briefing slide
  confession?: string[];   // 3 lines in the culprit's voice for the reveal: motive, method, parting shot
  headline?: { title: string; sub: string }; // newspaper front page; sub may contain {DETECTIVE}
  paperName?: string;      // e.g. "The Cotswold Gazette"
  clockChimes?: number[];  // hour chimes to play at the start of rounds 1, 2, 3
  victim: { name: string; description: string };
  crime: { room: string; slot: number; item: string; what: string }; // what: "was struck down" | "the cake vanished"
  rooms: Room[];
  slots: Slot[];
  suspects: Suspect[];
  items: Item[];
  truth: { position: Record<string, Record<number, string>>; culprit: string; holder: Record<number, string | null> };
  clues: Clue[];
  lies: Lie[];
}

export interface VerifyReport {
  ok: boolean;
  uniqueCulprit: boolean;
  culprit: string | null;
  keyClues: string[];
  solvableByRound: 1 | 2 | 3 | null;
  safeAccompliceLies: number;
  ms: number;
  notes: string[];
}

export interface SuspectSlice {
  suspect: Suspect;
  knows: string[];         // plain-language facts this suspect may state truthfully
  mustLie: string[];       // plain-language lies they must maintain
  mayNotReveal: string[];  // things they never say (e.g. the culprit if they don't know)
  otherSuspects: { id: string; name: string; role: string }[];
  setting: { title: string; place: string; dateLine: string; victim: string };
}

export interface Claim { kind: 'location'; s: string; room: string; slot: number } // extracted from a spoken reply
export interface ClaimCheck { ok: boolean; violations: string[] }

export interface Theory { culprit: string; item?: string }
export type TheoryVerdict = 'follows' | 'possible' | 'contradicted';

export interface ProofStep { clueId: string; says: string; therefore: string; eliminates?: string[] }

export interface AccompliceLie { text: string; fact: Fact }

/** Engine answer to an objection: a slip when the suspect was lying in that answer, else a retort. */
export interface ObjectionResult { wasLying: boolean; line: string; fact?: Fact; factText?: string }

export interface Newspaper {
  paperName: string; title: string; sub: string; date: string; culpritPortrait?: string;
  players: { id: string; name: string; score: number; role: Role | null; correct: boolean }[];
  imageUrl?: string;       // 1080x1350 PNG front page, shareable
}

// ---------- Public views (safe to send) ----------

export interface PublicCase {
  id: string; tone: Tone; title: string; place: string; dateLine: string; intro: string;
  scene?: string;
  briefing?: string[];
  paperName?: string;
  clockChimes?: number[];
  victim: { name: string; description: string };
  crime: { room: string; slot: number; what: string };
  rooms: Room[]; slots: Slot[];
  suspects: Omit<Suspect, 'alibi'>[] & { claimedAlibi?: Record<number, string> }[];
  items: Item[];
}

