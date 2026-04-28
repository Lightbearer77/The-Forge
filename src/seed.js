// Stable task template
const t = (o) => ({
  parentId: null, completed: false, completedDate: null,
  week: "", milestone: false, recurrence: "none", blockedBy: [], notes: "", ...o,
});

export const SEED_TASKS = [
  // ═══ APRIL (#M04) — Digital Sovereignty ═══
  t({ id:"a01", name:"Define Proton primary vs alias decision criteria", goal:"G1", priority:"High", level:2, month:"M04", start:"2026-04-17", due:"2026-04-19", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"Architecture locked: @proton.me primary, SimpleLogin alias model for all accounts. Tier list built from KeePass audit." }),
  t({ id:"p01", name:"Set up SimpleLogin — create account, verify alias domain, test one alias end-to-end", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-23", due:"2026-04-27", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-27", blockedBy:["a01"], notes:"Free tier tested and confirmed working end-to-end. Paid subscription to activate May 2026." }),
  t({ id:"p02", name:"Audit and export full account list from password manager", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-19", due:"2026-04-21", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"KeePass audit completed. ~130+ accounts catalogued across 11 screenshots." }),
  t({ id:"p03", name:"Categorize account list into Tier 1 / Tier 2 / Tier 3", goal:"G1", priority:"High", level:2, month:"M04", start:"2026-04-21", due:"2026-04-22", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"Tier list finalized and saved. T1=identity/financial/medical/work, T2=core services/social/health apps, T3=food/entertainment/misc." }),

  // ─── Tier 1 parent (moved to May — SimpleLogin subscription starts May) ───
  t({ id:"p04", name:"Migrate Tier 1 accounts to SimpleLogin aliases (identity, financial, medical, career)", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", blockedBy:["p01","p03"] }),

  // ─── Tier 1: Identity & Email Infrastructure ───
  t({ id:"t1_01", name:"Migrate: Apple ID", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_02", name:"Migrate: Google (primary)", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_03", name:"Migrate: Google - backup", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_04", name:"Migrate: Outlook", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_05", name:"Migrate: Outlook-Tesla", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_06", name:"Migrate: CSU Global", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_07", name:"Migrate: Id.me", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-07", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Financial ───
  t({ id:"t1_08", name:"Migrate: Axos Account / Axos Bank", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_09", name:"Migrate: Chase Bank", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_10", name:"Migrate: Varo Bank", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_11", name:"Migrate: Member's First Credit Union", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_12", name:"Migrate: Zions Bank", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_13", name:"Migrate: Fidelity", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_14", name:"Migrate: PayPal", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_15", name:"Migrate: Card Center Direct", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_16", name:"Migrate: H&R Block", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_17", name:"Migrate: Intuit Account", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_18", name:"Migrate: State Farm", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-05", due:"2026-05-12", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Health & Medical ───
  t({ id:"t1_19", name:"Migrate: Anthem Insurance / Anthem Login", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_20", name:"Migrate: Delta Dental", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_21", name:"Migrate: Quantum Health", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_22", name:"Migrate: Intermountain Healthcare", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_23", name:"Migrate: Quest Diagnostics / Patient Portal", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_24", name:"Migrate: Tanner Clinic Patient Portal", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-08", due:"2026-05-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Work & Career ───
  t({ id:"t1_25", name:"Migrate: ADP", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"], notes:"May be IT-controlled — attempt migration, escalate to IT if blocked." }),
  t({ id:"t1_26", name:"Migrate: Northgrum", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"], notes:"May be IT-controlled — attempt migration, escalate to IT if blocked." }),
  t({ id:"t1_27", name:"Migrate: LinkedIn", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_28", name:"Migrate: DocuSign", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_29", name:"Migrate: Fieldprint", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_30", name:"Migrate: GitHub", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_31", name:"Migrate: My Group Life @ Aflac", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 2 parent + grouped sub-tasks (May) ───
  t({ id:"p05", name:"Migrate Tier 2 accounts to SimpleLogin aliases (core services, social, health apps)", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-15", due:"2026-05-28", status:"backlog", section:"Digital Sovereignty", blockedBy:["p04"] }),
  t({ id:"t2_01", name:"Migrate T2: Financial — Venmo, Robinhood, Webull, Public, YNAB, Mint, Pocketguard, APMEX, Money Metals Exchange", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-15", due:"2026-05-18", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_02", name:"Migrate T2: Utilities — Conservice, Dominion Energy, Rocky Mountain Power, Enbridge Gas, T-Mobile, Intermountain Billpay", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-15", due:"2026-05-18", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_03", name:"Migrate T2: Crypto — Gemini, Phantom Wallet, Brave Wallet, Photon, Axiom, Bullx, Banana Gun, Cielo, Sol Sniper", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-18", due:"2026-05-21", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_04", name:"Migrate T2: Health apps — Marek Health, Biolife, Grifols, Everlywell, Peptide Sciences, CVS Specialty, Cronometer, EOS Fitness, Fitbod, Fitbit, FITINDEX, Elite HRV, Keto-Mojo, MyFitnessPal, Polar Flow", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-18", due:"2026-05-22", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_05", name:"Migrate T2: Work & productivity — Indeed, Mega.nz, Nextcloud, Todoist, Toggl, Wrike, OneDrive Personal Vault, Make.com, Monday", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-21", due:"2026-05-24", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_06", name:"Migrate T2: Social & comms — Signal, Telegram, Discord, Reddit, Snapchat, Instagram, USPS Informed Delivery, Meetup", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-21", due:"2026-05-24", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_07", name:"Migrate T2: Shopping — Amazon, Walmart, eBay, Costco, iHerb, Chemyo, Swisschems, UtahGunExchange", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-24", due:"2026-05-26", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_08", name:"Migrate T2: Smart home — Arlo, August, Ring-Troy, Home Assistant, Bad-Blink, Brivo, Tile Pro, Samsung-Google", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-24", due:"2026-05-26", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_09", name:"Migrate T2: Entertainment — Netflix, Hulu, YouTube, Tidal, Ground News, ChatGPT, Claude, Stability AI", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-26", due:"2026-05-28", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),

  t({ id:"p06", name:"Migrate Tier 3 accounts to SimpleLogin aliases (low-stakes, shopping, misc)", goal:"G1", priority:"Mid", level:1, month:"M05", start:"2026-05-28", due:"2026-05-31", status:"backlog", section:"Digital Sovereignty", blockedBy:["p05"] }),
  t({ id:"p07", name:"Confirm Microsoft account fully detached — no Tier 1 accounts remaining", goal:"G1", priority:"High", level:1, month:"M05", start:"2026-05-28", due:"2026-05-31", status:"backlog", section:"Digital Sovereignty", milestone:true, blockedBy:["p06"] }),

  // ═══ APRIL (#M04) — Q1 Carryovers ═══
  t({ id:"a02", name:"Start consistent athletic body training block", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-07", due:"2026-04-07", status:"todo", section:"Q1 Carryovers", notes:"CRITICAL: longest-running incomplete task. Carried from Q1/Gamma and MS3. Single highest-leverage task in the system." }),
  t({ id:"a03", name:"Install Perpetual calendar", goal:"G1", priority:"Mid", level:1, month:"M04", start:"2026-04-07", due:"2026-04-07", status:"todo", section:"Q1 Carryovers", notes:"Carried from Q1/Gamma" }),
  t({ id:"a04", name:"Find Father's journal", goal:"G1", priority:"Mid", level:4, month:"M04", start:"2026-04-07", due:"2026-04-07", status:"backlog", section:"Q1 Carryovers", notes:"Carried from Q1/Gamma" }),

  // ═══ APRIL — Habit Tracker Setup ═══
  t({ id:"a05", name:"Add athletic body training block to habit tracker (3-4x/week)", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"todo", section:"Habit Tracker Setup" }),
  t({ id:"a06", name:"Add 8pm routine to habit tracker (daily)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"todo", section:"Habit Tracker Setup" }),
  t({ id:"a07", name:"Add Stoicism Journal to habit tracker (Duty Reset trigger)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"todo", section:"Habit Tracker Setup" }),
  t({ id:"a08", name:"Add Rebellion Block tracking to habit tracker (weekly)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"todo", section:"Habit Tracker Setup" }),

  // ═══ APRIL — Health & Body ═══
  t({ id:"a09", name:"Track and log body composition baseline", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-05", status:"todo", section:"Health & Body", notes:"Weight, measurements, photos" }),
  t({ id:"a10", name:"Schedule and complete blood draw + EKG", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-10", due:"2026-04-15", status:"todo", section:"Health & Body", notes:"Once doctor approves order" }),
  t({ id:"a11", name:"InsideTracker EKG + glucose wearable setup", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-10", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-08" }),
  t({ id:"a12", name:"Microplastics avoidance plan + water filter", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-05", due:"2026-04-08", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-08" }),
  t({ id:"a13", name:"Eatwild.com + localharvest.com research for real food sources", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-02", due:"2026-04-05", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a14", name:"Research and choose structured gym training program", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-12", status:"todo", section:"Health & Body", notes:"Aligned with athletic body goal" }),
  t({ id:"a15", name:"Add sleep tracking to habit tracker", goal:"G3", priority:"Mid", level:1, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"todo", section:"Health & Body" }),
  t({ id:"a16", name:"Research and establish sleep optimization protocol", goal:"G3", priority:"Mid", level:2, month:"M04", start:"2026-04-13", due:"2026-04-15", status:"todo", section:"Health & Body" }),
  t({ id:"a17", name:"Research cold exposure and recovery protocols", goal:"G3", priority:"Mid", level:2, month:"M04", start:"2026-04-15", due:"2026-04-18", status:"todo", section:"Health & Body" }),
  t({ id:"a18", name:"Replace all plastic food containers with glass or stainless", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-10", status:"todo", section:"Health & Body" }),
  t({ id:"a19", name:"Replace plastic cutting boards and spatulas with wood or bamboo", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"todo", section:"Health & Body" }),
  t({ id:"a20", name:"Audit kitchen for all plastic utensils and wrap", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-12", due:"2026-04-15", status:"todo", section:"Health & Body" }),
  t({ id:"a21", name:"Establish rule: never microwave or heat food in plastic", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-12", due:"2026-04-15", status:"todo", section:"Health & Body" }),
  t({ id:"a22", name:"Switch to fresh and home-cooked meals", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-15", due:"2026-04-20", status:"todo", section:"Health & Body", notes:"Reduce ultra-processed packaged foods" }),
  t({ id:"a23", name:"Build pre and post workout nutrition protocol", goal:"G3", priority:"High", level:2, month:"M04", start:"2026-04-18", due:"2026-04-22", status:"todo", section:"Health & Body", blockedBy:["a14"], notes:"Based on keto research. Blocked by gym program selection." }),
  t({ id:"a24", name:"Research and choose creatine and foundational supplement stack", goal:"G3", priority:"Mid", level:2, month:"M04", start:"2026-04-22", due:"2026-04-25", status:"todo", section:"Health & Body", blockedBy:["a10"], notes:"Blocked by bloodwork results" }),
  t({ id:"a25", name:"Eliminate canned foods — switch to fresh or glass jarred", goal:"G3", priority:"Mid", level:1, month:"M04", start:"2026-04-18", due:"2026-04-22", status:"todo", section:"Health & Body" }),
  t({ id:"a26", name:"Switch to plastic-free tea bags or loose leaf tea", goal:"G3", priority:"Mid", level:1, month:"M04", start:"2026-04-22", due:"2026-04-25", status:"todo", section:"Health & Body" }),
  t({ id:"a27", name:"How to measure, optimize and enhance cognition", goal:"G3", priority:"Mid", level:2, month:"M04", start:"2026-04-25", due:"2026-04-28", status:"todo", section:"Health & Body" }),

  // ═══ APRIL — Career & Financial ═══
  t({ id:"a28", name:"Research and choose Microsoft certification path", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"todo", section:"Career & Financial" }),
  t({ id:"a29", name:"Enroll and begin Microsoft certification Module 1", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-15", due:"2026-04-18", status:"todo", section:"Career & Financial", blockedBy:["a28"] }),
  t({ id:"a30", name:"Complete Microsoft certification Module 1", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Career & Financial", blockedBy:["a29"] }),
  t({ id:"a31", name:"Research SAS learning resources and choose course", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-15", due:"2026-04-18", status:"todo", section:"Career & Financial" }),
  t({ id:"a32", name:"Complete SAS introductory module", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Career & Financial", blockedBy:["a31"] }),
  t({ id:"a33", name:"Review Troy moving in / mortgage discussion", goal:"G2", priority:"High", level:2, month:"M04", start:"2026-04-10", due:"2026-04-18", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a34", name:"Switch banks + best money storage plan", goal:"G4", priority:"Mid", level:2, month:"M04", start:"2026-04-15", due:"2026-04-22", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-04-02" }),

  // ═══ APRIL — Longhouse & Tribe ═══
  t({ id:"a35", name:"Define personal vetting criteria", goal:"G2", priority:"High", level:3, month:"M04", start:"2026-04-13", due:"2026-04-15", status:"todo", section:"Longhouse & Tribe", notes:"Values, traits, dealbreakers, Longhouse alignment" }),
  t({ id:"a36", name:"Research and join one intentional dating platform or community", goal:"G2", priority:"High", level:3, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe" }),
  t({ id:"a37", name:"Continue Phase 1 stealth incentives at next meetup + score readiness checklist", goal:"G2", priority:"High", level:3, month:"M04", start:"2026-04-25", due:"2026-04-30", status:"todo", section:"Longhouse & Tribe" }),

  // ═══ APRIL — Hinge Setup ═══
  t({ id:"a38", name:"Download Hinge and create account", goal:"G2", priority:"High", level:1, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe", parentId:"a36", notes:"Platform selected based on Utah pool density and values-signal prompts" }),
  t({ id:"a39", name:"Write profile prompt #1 — signal you are building something, not just existing", goal:"G2", priority:"High", level:2, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe", parentId:"a36", blockedBy:["a38"] }),
  t({ id:"a40", name:"Write profile prompt #2 — show physical standards and discipline", goal:"G2", priority:"High", level:2, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe", parentId:"a36", blockedBy:["a38"] }),
  t({ id:"a41", name:"Write profile prompt #3 — hint at legacy and family orientation without spelling it out", goal:"G2", priority:"High", level:2, month:"M04", start:"2026-04-20", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe", parentId:"a36", blockedBy:["a38"] }),
  t({ id:"a42", name:"Set daily rule: 10 minutes maximum per session — passive mode only", goal:"G2", priority:"Mid", level:1, month:"M04", start:"2026-04-25", due:"2026-04-25", status:"todo", section:"Longhouse & Tribe", parentId:"a36", blockedBy:["a39","a40","a41"], notes:"No premium features. No volume swiping. Screen Tier 1 criteria from profile before any contact." }),
  t({ id:"a43", name:"First session: review matches, run conquest filter, send one meaningful opener or skip", goal:"G2", priority:"Mid", level:1, month:"M04", start:"2026-04-25", due:"2026-04-30", status:"todo", section:"Longhouse & Tribe", parentId:"a36", blockedBy:["a42"], notes:"Conquest filter: frame check, Longhouse man test, net gain test. If any answer is shaky — skip." }),

  // ═══ APRIL — Mindset ═══
  t({ id:"a44", name:"Become self-starter / break defeated mindset daily practice", goal:"G1", priority:"High", level:3, month:"M04", start:"2026-04-15", due:"2026-04-25", status:"done", section:"Mindset", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a45", name:"Are you following your Father's counsel?", goal:"G1", priority:"Mid", level:4, month:"M04", start:"2026-04-25", due:"2026-04-28", status:"backlog", section:"Mindset" }),
  t({ id:"a46", name:"Financial iron plan fully mapped and funded", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-25", due:"2026-04-30", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-04-02" }),

  // ═══ MAY (#M05) — Health & Body ═══
  t({ id:"b01", name:"What is metabolic health + treat acid reflux without antacids", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-04-28", due:"2026-05-01", status:"backlog", section:"Health & Body" }),
  t({ id:"b02", name:"Blood glucose wearable + health wearable monitors", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-01", due:"2026-05-03", status:"backlog", section:"Health & Body" }),
  t({ id:"b03", name:"CRP inflammation + Cortisol + Lactate measurement", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-03", due:"2026-05-05", status:"backlog", section:"Health & Body" }),
  t({ id:"b04", name:"Order DNA test kit", goal:"G3", priority:"High", level:1, month:"M05", start:"2026-04-28", due:"2026-05-01", status:"backlog", section:"Health & Body" }),
  t({ id:"b05", name:"Complete and send DNA test sample", goal:"G3", priority:"High", level:1, month:"M05", start:"2026-05-01", due:"2026-05-03", status:"backlog", section:"Health & Body", blockedBy:["b04"] }),
  t({ id:"b06", name:"Review DNA results when returned", goal:"G3", priority:"High", level:2, month:"M05", start:"2026-05-18", due:"2026-05-22", status:"backlog", section:"Health & Body", blockedBy:["b05"] }),
  t({ id:"b07", name:"Research supplements based on DNA results", goal:"G3", priority:"High", level:2, month:"M05", start:"2026-05-22", due:"2026-05-24", status:"backlog", section:"Health & Body", blockedBy:["b06"] }),
  t({ id:"b08", name:"Build custom supplements plan and order first batch", goal:"G3", priority:"High", level:2, month:"M05", start:"2026-05-25", due:"2026-05-28", status:"backlog", section:"Health & Body", blockedBy:["b07"] }),
  t({ id:"b09", name:"Complete first full month gym attendance review", goal:"G3", priority:"High", level:1, month:"M05", start:"2026-05-28", due:"2026-05-31", status:"backlog", section:"Health & Body", milestone:true, blockedBy:["a02"], notes:"Blocked by training block start" }),
  t({ id:"b10", name:"Audit wardrobe — identify synthetic fiber clothing", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-01", due:"2026-05-03", status:"backlog", section:"Health & Body" }),
  t({ id:"b11", name:"Purchase microfiber-catching laundry bag or filter", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-03", due:"2026-05-05", status:"backlog", section:"Health & Body" }),
  t({ id:"b12", name:"Replace synthetic bedding with natural fiber alternatives", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-07", due:"2026-05-10", status:"backlog", section:"Health & Body" }),
  t({ id:"b13", name:"Switch household cleaners to natural alternatives", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-12", due:"2026-05-15", status:"backlog", section:"Health & Body" }),
  t({ id:"b14", name:"Purchase HEPA vacuum and establish dusting routine", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-17", due:"2026-05-20", status:"backlog", section:"Health & Body" }),
  t({ id:"b15", name:"Research and purchase air purifier", goal:"G3", priority:"Mid", level:1, month:"M05", start:"2026-05-22", due:"2026-05-25", status:"backlog", section:"Health & Body" }),
  t({ id:"b16", name:"Custom supplements for your specific body", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-05", due:"2026-05-07", status:"backlog", section:"Health & Body" }),
  t({ id:"b17", name:"LDL and HDL — where should they be?", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-07", due:"2026-05-10", status:"backlog", section:"Health & Body" }),
  t({ id:"b18", name:"FMT vs probiotics", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-12", due:"2026-05-14", status:"backlog", section:"Health & Body" }),
  t({ id:"b19", name:"Keto tryptophan in meats — deep cut mapping", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-14", due:"2026-05-16", status:"backlog", section:"Health & Body" }),
  t({ id:"b20", name:"Keto — what cuts of meat have what nutrients", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-16", due:"2026-05-18", status:"backlog", section:"Health & Body" }),

  // ═══ MAY — Career & Financial ═══
  t({ id:"b21", name:"Complete SAS intermediate module", goal:"G4", priority:"High", level:2, month:"M05", start:"2026-05-10", due:"2026-05-15", status:"backlog", section:"Career & Financial", blockedBy:["a32"] }),
  t({ id:"b22", name:"Check out BlockFi", goal:"G4", priority:"Mid", level:2, month:"M05", start:"2026-05-14", due:"2026-05-17", status:"backlog", section:"Career & Financial" }),

  // ═══ MAY — Longhouse & Tribe ═══
  t({ id:"b23", name:"Attend first social event with intention of meeting quality women", goal:"G2", priority:"High", level:3, month:"M05", start:"2026-05-03", due:"2026-05-07", status:"backlog", section:"Longhouse & Tribe" }),
  t({ id:"b24", name:"Begin consistent approach practice — minimum 2/week", goal:"G2", priority:"High", level:3, month:"M05", start:"2026-05-10", due:"2026-05-14", status:"backlog", section:"Longhouse & Tribe" }),
  t({ id:"b25", name:"Sign and print the Primal Longhouse Oath", goal:"G2", priority:"High", level:4, month:"M05", start:"2026-05-25", due:"2026-05-31", status:"backlog", section:"Longhouse & Tribe" }),
  t({ id:"b26", name:"Schedule the first elevated ritual gathering (read oath aloud)", goal:"G2", priority:"High", level:4, month:"M05", start:"2026-05-28", due:"2026-05-31", status:"backlog", section:"Longhouse & Tribe", blockedBy:["b25"] }),

  // ═══ JUNE (#M06) — Financial & Legal ═══
  t({ id:"c01", name:"Review the protective order", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-01", due:"2026-06-03", status:"backlog", section:"Financial & Legal" }),
  t({ id:"c02", name:"Enforce the protective order if possible", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"backlog", section:"Financial & Legal", blockedBy:["c01"] }),
  t({ id:"c03", name:"Have Troy move in", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-05", due:"2026-06-07", status:"backlog", section:"Financial & Legal" }),
  t({ id:"c04", name:"Discuss how much her mortgage is", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-06", due:"2026-06-08", status:"backlog", section:"Financial & Legal" }),
  t({ id:"c05", name:"Should I switch banks?", goal:"G4", priority:"Mid", level:2, month:"M06", start:"2026-06-10", due:"2026-06-12", status:"backlog", section:"Financial & Legal" }),
  t({ id:"c06", name:"How to store my money best", goal:"G4", priority:"Mid", level:2, month:"M06", start:"2026-06-12", due:"2026-06-15", status:"backlog", section:"Financial & Legal" }),
  t({ id:"c07", name:"When should I invest", goal:"G4", priority:"Mid", level:2, month:"M06", start:"2026-06-15", due:"2026-06-17", status:"backlog", section:"Financial & Legal" }),

  // ═══ JUNE — Home & Smart Home ═══
  t({ id:"c08", name:"Research smart home devices compatible with setup", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Home & Smart Home" }),
  t({ id:"c09", name:"Choose and purchase priority smart home devices", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-10", due:"2026-06-12", status:"backlog", section:"Home & Smart Home", blockedBy:["c08"] }),
  t({ id:"c10", name:"Install and configure smart home devices", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-14", due:"2026-06-17", status:"backlog", section:"Home & Smart Home", blockedBy:["c09"] }),
  t({ id:"c11", name:"Test and optimize smart home automation", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-17", due:"2026-06-19", status:"backlog", section:"Home & Smart Home", blockedBy:["c10"] }),

  // ═══ JUNE — Microplastics ═══
  t({ id:"c12", name:"Establish single-use plastic ban in home", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"backlog", section:"Microplastics" }),
  t({ id:"c13", name:"Audit kitchen — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Microplastics" }),
  t({ id:"c14", name:"Audit bathroom — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Microplastics" }),
  t({ id:"c15", name:"Audit bedroom and living areas — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-10", due:"2026-06-12", status:"backlog", section:"Microplastics" }),
  t({ id:"c16", name:"Build complete replacement shopping list from audit", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-13", due:"2026-06-15", status:"backlog", section:"Microplastics", blockedBy:["c13","c14","c15"] }),
  t({ id:"c17", name:"Replace remaining synthetic carpets or rugs with natural", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-15", due:"2026-06-17", status:"backlog", section:"Microplastics" }),
  t({ id:"c18", name:"Draft microplastics clan law", goal:"G3", priority:"Mid", level:3, month:"M06", start:"2026-06-17", due:"2026-06-20", status:"backlog", section:"Microplastics", notes:"Rules for tribe and future family" }),
  t({ id:"c19", name:"Complete all replacements from audit list", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-22", due:"2026-06-25", status:"backlog", section:"Microplastics", blockedBy:["c16"] }),
  t({ id:"c20", name:"Full home microplastics audit — all major vectors eliminated", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-27", due:"2026-06-30", status:"backlog", section:"Microplastics", milestone:true, blockedBy:["c19"] }),

  // ═══ JUNE — Mindset ═══
  t({ id:"c21", name:"Become the Ultimate man — daily practice review", goal:"G1", priority:"High", level:5, month:"M06", start:"2026-06-17", due:"2026-06-20", status:"backlog", section:"Mindset" }),
  t({ id:"c22", name:"Industry pays debts — financial discipline review", goal:"G1", priority:"Mid", level:4, month:"M06", start:"2026-06-22", due:"2026-06-25", status:"backlog", section:"Mindset" }),
  t({ id:"c23", name:"Diligence is the mother of good luck — habit audit", goal:"G1", priority:"Mid", level:4, month:"M06", start:"2026-06-25", due:"2026-06-27", status:"backlog", section:"Mindset" }),
  t({ id:"c24", name:"Make a list of ends — life priorities audit", goal:"G1", priority:"Mid", level:5, month:"M06", start:"2026-06-27", due:"2026-06-30", status:"backlog", section:"Mindset" }),

  // ═══ JULY (#M07) ═══
  t({ id:"d01", name:"Athletic body — formal assessment vs April baseline", goal:"G3", priority:"High", level:1, month:"M07", start:"2026-07-01", due:"2026-07-02", status:"backlog", section:"Assessment", milestone:true, blockedBy:["a02","b09"], notes:"Strength, measurements, photos" }),
  t({ id:"d02", name:"Cognition baseline test completed and documented", goal:"G3", priority:"Mid", level:2, month:"M07", start:"2026-07-03", due:"2026-07-05", status:"backlog", section:"Assessment" }),
  t({ id:"d03", name:"Nutrition standard defined — based on 3 months data", goal:"G3", priority:"Mid", level:2, month:"M07", start:"2026-07-12", due:"2026-07-15", status:"backlog", section:"Assessment" }),
  t({ id:"d04", name:"Q2 financial review — emergency fund %, debt, certs, net worth", goal:"G4", priority:"Mid", level:2, month:"M07", start:"2026-07-06", due:"2026-07-07", status:"backlog", section:"Career & Financial" }),

  // ═══ BACKLOG ═══
  t({ id:"z01", name:"Research local martial arts and self-defense disciplines", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness" }),
  t({ id:"z02", name:"Choose discipline and enroll in first class", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z01"] }),
  t({ id:"z03", name:"Complete first four training sessions", goal:"G3", priority:"Low", level:1, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z02"] }),
  t({ id:"z04", name:"Establish home drill routine — basics and movement daily", goal:"G3", priority:"Low", level:1, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z03"] }),
  t({ id:"z05", name:"Schedule first quarterly sparring or skills assessment", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z04"] }),

  // ═══ BACKLOG — Cybersecurity & Sovereignty ═══
  t({ id:"z08", name:"Pm Firewall — execute Phase 1 hardening block", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", notes:"32 tasks in security project archive; this is the entry gate" }),
  t({ id:"z09", name:"Guard Tower (1) — resume laptop hardening & compartmentalization", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", notes:"Project 2 stalled since Nov 2025; Windows 11 daily driver hardening" }),
  t({ id:"z10", name:"Qubes OS — migrate to primary daily driver", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", blockedBy:["z09"], notes:"End-state goal; dual-boot available now" }),
];
