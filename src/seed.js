// Stable task template
const t = (o) => ({
  parentId: null, completed: false, completedDate: null,
  week: "", milestone: false, recurrence: "none", blockedBy: [], notes: "", ...o,
});

export const SEED_TASKS = [

  // ═══ ZETA (#M06) — Digital Sovereignty (G1 ongoing) ═══
  t({ id:"a01", name:"Define Proton primary vs alias decision criteria", goal:"G1", priority:"High", level:2, month:"M04", start:"2026-04-17", due:"2026-04-19", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"Architecture locked: @proton.me primary, SimpleLogin alias model for all accounts. Tier list built from KeePass audit." }),
  t({ id:"p01", name:"Set up SimpleLogin — create account, verify alias domain, test one alias end-to-end", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-03", due:"2026-06-07", status:"todo", section:"Digital Sovereignty", blockedBy:["a01"], notes:"Free tier tested and confirmed working end-to-end. Paid subscription to activate." }),
  t({ id:"p02", name:"Audit and export full account list from password manager", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-19", due:"2026-04-21", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"KeePass audit completed. ~130+ accounts catalogued across 11 screenshots." }),
  t({ id:"p03", name:"Categorize account list into Tier 1 / Tier 2 / Tier 3", goal:"G1", priority:"High", level:2, month:"M04", start:"2026-04-21", due:"2026-04-22", status:"done", section:"Digital Sovereignty", completed:true, completedDate:"2026-04-23", notes:"Tier list finalized. T1=identity/financial/medical/work, T2=core services/social/health apps, T3=food/entertainment/misc." }),

  // ─── Tier 1 parent ───
  t({ id:"p04", name:"Migrate Tier 1 accounts to SimpleLogin aliases (identity, financial, medical, career)", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-17", status:"backlog", section:"Digital Sovereignty", blockedBy:["p01"] }),

  // ─── Tier 1: Identity & Email ───
  t({ id:"t1_01", name:"Migrate: Apple ID", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_02", name:"Migrate: Google (primary)", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_03", name:"Migrate: Google - backup", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_04", name:"Migrate: Outlook", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_05", name:"Migrate: Outlook-Tesla", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_06", name:"Migrate: CSU Global", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_07", name:"Migrate: Id.me", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-07", due:"2026-06-10", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Financial ───
  t({ id:"t1_08", name:"Migrate: Axos Account / Axos Bank", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_09", name:"Migrate: Chase Bank", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_10", name:"Migrate: Varo Bank", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_11", name:"Migrate: Member's First Credit Union", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_12", name:"Migrate: Fidelity", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_13", name:"Migrate: PayPal", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_14", name:"Migrate: H&R Block / Intuit", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_15", name:"Migrate: State Farm", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Health & Medical ───
  t({ id:"t1_19", name:"Migrate: Anthem Insurance / Anthem Login", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-12", due:"2026-06-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_20", name:"Migrate: Delta Dental", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-12", due:"2026-06-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_21", name:"Migrate: Intermountain / Tanner Clinic / Quest Diagnostics", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-12", due:"2026-06-15", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 1: Work & Career ───
  t({ id:"t1_25", name:"Migrate: ADP / Northrop (attempt; IT-controlled)", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-14", due:"2026-06-17", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"], notes:"May be IT-controlled — attempt migration, escalate to IT if blocked." }),
  t({ id:"t1_27", name:"Migrate: LinkedIn", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-14", due:"2026-06-17", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),
  t({ id:"t1_28", name:"Migrate: GitHub / DocuSign / Fieldprint", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-14", due:"2026-06-17", status:"backlog", section:"Digital Sovereignty", parentId:"p04", blockedBy:["p01"] }),

  // ─── Tier 2 parent + groups (Eta) ───
  t({ id:"p05", name:"Migrate Tier 2 accounts to SimpleLogin aliases (core services, social, health apps)", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-17", due:"2026-07-10", status:"backlog", section:"Digital Sovereignty", blockedBy:["p04"] }),
  t({ id:"t2_01", name:"Migrate T2: Financial — Venmo, Robinhood, Webull, Public, YNAB, APMEX", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-17", due:"2026-06-21", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_02", name:"Migrate T2: Utilities — Conservice, Dominion Energy, Rocky Mountain Power, T-Mobile", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-17", due:"2026-06-21", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_03", name:"Migrate T2: Crypto — Gemini, Phantom Wallet, Brave Wallet, Photon, Axiom, Bullx", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-21", due:"2026-06-25", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_04", name:"Migrate T2: Health apps — Marek Health, Everlywell, Cronometer, EOS Fitness, Fitbod, MyFitnessPal", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-21", due:"2026-06-25", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_05", name:"Migrate T2: Work & productivity — Indeed, Nextcloud, OneDrive Personal Vault", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-25", due:"2026-06-29", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_06", name:"Migrate T2: Social & comms — Signal, Telegram, Discord, Reddit, Meetup", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-25", due:"2026-06-29", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_07", name:"Migrate T2: Shopping — Amazon, Walmart, iHerb, UtahGunExchange", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-29", due:"2026-07-03", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_08", name:"Migrate T2: Smart home — Arlo, August, Ring-Troy, Home Assistant, Tile Pro", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-06-29", due:"2026-07-03", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),
  t({ id:"t2_09", name:"Migrate T2: Entertainment — Netflix, Hulu, YouTube, Tidal, Claude, ChatGPT", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-07-03", due:"2026-07-07", status:"backlog", section:"Digital Sovereignty", parentId:"p05", blockedBy:["p04"] }),

  t({ id:"p06", name:"Migrate Tier 3 accounts to SimpleLogin aliases (low-stakes, shopping, misc)", goal:"G1", priority:"Mid", level:1, month:"M07", start:"2026-07-07", due:"2026-07-10", status:"backlog", section:"Digital Sovereignty", blockedBy:["p05"] }),
  t({ id:"p07", name:"Confirm Microsoft account fully detached — no Tier 1 accounts remaining", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-07-10", due:"2026-07-13", status:"backlog", section:"Digital Sovereignty", milestone:true, blockedBy:["p06"] }),

  // ═══ ZETA (#M06) — Longhouse & Tribe (G2) ═══
  t({ id:"a33", name:"Review Troy moving in / mortgage discussion", goal:"G2", priority:"High", level:2, month:"M04", start:"2026-04-10", due:"2026-04-18", status:"done", section:"Longhouse & Tribe", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a35", name:"Define personal vetting criteria", goal:"G2", priority:"High", level:3, month:"M04", start:"2026-04-13", due:"2026-04-15", status:"done", section:"Longhouse & Tribe", completed:true, completedDate:"2026-05-29", notes:"Values, traits, dealbreakers, Longhouse alignment" }),
  t({ id:"a36", name:"Research and join one intentional dating platform or community", goal:"G2", priority:"High", level:3, month:"M05", start:"2026-04-20", due:"2026-04-25", status:"done", section:"Longhouse & Tribe", completed:true, completedDate:"2026-05-29" }),
  t({ id:"a37", name:"Continue Phase 1 stealth incentives + score readiness checklist", goal:"G2", priority:"High", level:3, month:"M05", start:"2026-04-25", due:"2026-04-30", status:"done", section:"Longhouse & Tribe", completed:true, completedDate:"2026-05-29" }),
  t({ id:"b23", name:"Attend first social event with intention of meeting quality women", goal:"G2", priority:"High", level:3, month:"M05", start:"2026-05-03", due:"2026-05-07", status:"done", section:"Longhouse & Tribe", completed:true, completedDate:"2026-05-29" }),
  t({ id:"b24", name:"Consistent approach practice — minimum 2/week", goal:"G2", priority:"High", level:3, month:"M06", start:"2026-05-10", due:"2026-06-17", status:"in-progress", section:"Longhouse & Tribe", notes:"Ongoing through Zeta. Goal: 2+ approaches per week, track and log." }),
  t({ id:"b25", name:"Sign and print the Primal Longhouse Oath", goal:"G2", priority:"High", level:4, month:"M06", start:"2026-05-25", due:"2026-06-07", status:"todo", section:"Longhouse & Tribe" }),
  t({ id:"b26", name:"Schedule the first elevated ritual gathering (read oath aloud)", goal:"G2", priority:"High", level:4, month:"M06", start:"2026-06-05", due:"2026-06-14", status:"todo", section:"Longhouse & Tribe", blockedBy:["b25"] }),
  t({ id:"c01", name:"Review the protective order", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-01", due:"2026-06-03", status:"todo", section:"Longhouse & Tribe" }),
  t({ id:"c02", name:"Enforce the protective order if possible", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"todo", section:"Longhouse & Tribe", blockedBy:["c01"] }),
  t({ id:"c03", name:"Have Troy move in / confirm decision", goal:"G2", priority:"High", level:2, month:"M06", start:"2026-06-05", due:"2026-06-07", status:"todo", section:"Longhouse & Tribe" }),
  t({ id:"c04", name:"Discuss how much Troy's mortgage is", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-06", due:"2026-06-08", status:"todo", section:"Longhouse & Tribe" }),
  t({ id:"c08", name:"Research smart home devices compatible with setup", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Home & Smart Home" }),
  t({ id:"c09", name:"Choose and purchase priority smart home devices", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-10", due:"2026-06-12", status:"backlog", section:"Home & Smart Home", blockedBy:["c08"] }),
  t({ id:"c10", name:"Install and configure smart home devices", goal:"G2", priority:"Mid", level:2, month:"M06", start:"2026-06-14", due:"2026-06-17", status:"backlog", section:"Home & Smart Home", blockedBy:["c09"] }),
  t({ id:"c11", name:"Test and optimize smart home automation", goal:"G2", priority:"Mid", level:2, month:"M07", start:"2026-06-17", due:"2026-06-19", status:"backlog", section:"Home & Smart Home", blockedBy:["c10"] }),

  // ═══ ZETA (#M06) — Health & Body (G3) ═══
  t({ id:"a02", name:"Start consistent athletic body training block", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-07", due:"2026-04-07", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01", notes:"CRITICAL: longest-running incomplete task. Completed June 1 — training block locked." }),
  t({ id:"a09", name:"Track and log body composition baseline", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-05", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01", notes:"Weight, measurements, photos. Evolt 360: 9.9% BF / 121.3 lb LBM." }),
  t({ id:"a10", name:"Schedule and complete blood draw + EKG", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-10", due:"2026-04-15", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01", notes:"Blood draw attended Jun 1." }),
  t({ id:"a11", name:"InsideTracker EKG + glucose wearable setup", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-10", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-08" }),
  t({ id:"a12", name:"Microplastics avoidance plan + water filter", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-05", due:"2026-04-08", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-08" }),
  t({ id:"a13", name:"Eatwild.com + localharvest.com research for real food sources", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-02", due:"2026-04-05", status:"done", section:"Health & Body", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a14", name:"Research and choose structured gym training program", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-12", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01", notes:"Program chosen and locked. 90-day run before any switch." }),
  t({ id:"a15", name:"Add sleep tracking to habit tracker", goal:"G3", priority:"Mid", level:1, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),
  t({ id:"a16", name:"Research and establish sleep optimization protocol", goal:"G3", priority:"Mid", level:2, month:"M04", start:"2026-04-13", due:"2026-04-15", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),
  t({ id:"a18", name:"Replace all plastic food containers with glass or stainless", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-08", due:"2026-04-10", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),
  t({ id:"a19", name:"Replace plastic cutting boards and spatulas with wood or bamboo", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01" }),
  t({ id:"a22", name:"Switch to fresh and home-cooked meals", goal:"G3", priority:"High", level:1, month:"M04", start:"2026-04-15", due:"2026-04-20", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29", notes:"Ultra-processed eliminated." }),
  t({ id:"a23", name:"Build pre and post workout nutrition protocol", goal:"G3", priority:"High", level:2, month:"M04", start:"2026-04-18", due:"2026-04-22", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29", notes:"Keto-aligned protocol built." }),
  t({ id:"b04", name:"Order DNA test kit", goal:"G3", priority:"High", level:1, month:"M05", start:"2026-04-28", due:"2026-05-01", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-01" }),
  t({ id:"b05", name:"Complete and send DNA test sample", goal:"G3", priority:"High", level:1, month:"M06", start:"2026-06-01", due:"2026-06-10", status:"todo", section:"Health & Body", blockedBy:["b04"] }),
  t({ id:"b06", name:"Review DNA results when returned", goal:"G3", priority:"High", level:2, month:"M07", start:"2026-07-01", due:"2026-07-07", status:"backlog", section:"Health & Body", blockedBy:["b05"] }),
  t({ id:"b07", name:"Research supplements based on DNA results", goal:"G3", priority:"High", level:2, month:"M07", start:"2026-07-07", due:"2026-07-12", status:"backlog", section:"Health & Body", blockedBy:["b06"] }),
  t({ id:"b08", name:"Build custom supplements plan and order first batch", goal:"G3", priority:"High", level:2, month:"M07", start:"2026-07-12", due:"2026-07-15", status:"backlog", section:"Health & Body", completed:false, completedDate:null, blockedBy:["b07"] }),
  t({ id:"b09", name:"Complete first full month gym attendance review", goal:"G3", priority:"High", level:1, month:"M07", start:"2026-06-28", due:"2026-07-02", status:"backlog", section:"Health & Body", milestone:true, blockedBy:["a02"], notes:"Training block locked Jun 1. First full month = July 1 checkpoint." }),
  t({ id:"b14", name:"Check vacuum for HEPA filters — establish dusting routine", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-01", due:"2026-06-03", status:"done", section:"Health & Body", completed:true, completedDate:"2026-06-03" }),
  t({ id:"b15", name:"Research and purchase air purifier", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-05-22", due:"2026-05-25", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),
  t({ id:"b19", name:"Keto tryptophan in meats — deep cut mapping", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-14", due:"2026-05-16", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),
  t({ id:"b20", name:"Keto — what cuts of meat have what nutrients", goal:"G3", priority:"Mid", level:2, month:"M05", start:"2026-05-16", due:"2026-05-18", status:"done", section:"Health & Body", completed:true, completedDate:"2026-05-29" }),

  // ─── Microplastics chain (Zeta) ───
  t({ id:"c12", name:"Establish single-use plastic ban in home", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"todo", section:"Microplastics" }),
  t({ id:"c13", name:"Audit kitchen — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Microplastics" }),
  t({ id:"c14", name:"Audit bathroom — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Microplastics" }),
  t({ id:"c15", name:"Audit bedroom and living areas — remaining plastic items", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-10", due:"2026-06-12", status:"backlog", section:"Microplastics" }),
  t({ id:"c16", name:"Build complete replacement shopping list from audit", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-13", due:"2026-06-15", status:"backlog", section:"Microplastics", blockedBy:["c13","c14","c15"] }),
  t({ id:"c18", name:"Draft microplastics clan law", goal:"G3", priority:"Mid", level:3, month:"M07", start:"2026-06-17", due:"2026-06-20", status:"backlog", section:"Microplastics", notes:"Rules for tribe and future family" }),
  t({ id:"c19", name:"Complete all replacements from audit list", goal:"G3", priority:"Mid", level:1, month:"M07", start:"2026-06-22", due:"2026-06-25", status:"backlog", section:"Microplastics", blockedBy:["c16"] }),
  t({ id:"c20", name:"Full home microplastics audit — all major vectors eliminated", goal:"G3", priority:"Mid", level:1, month:"M07", start:"2026-06-27", due:"2026-06-30", status:"backlog", section:"Microplastics", milestone:true, blockedBy:["c19"] }),

  // ═══ ZETA (#M06) — Career & Financial (G4) ═══
  t({ id:"a28", name:"Research and choose Microsoft certification path", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-10", due:"2026-04-12", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a29", name:"Enroll and begin Microsoft certification Module 1", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-15", due:"2026-04-18", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a30", name:"Complete Microsoft certification Module 1", goal:"G4", priority:"High", level:2, month:"M05", start:"2026-04-20", due:"2026-04-25", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a31", name:"Research SAS learning resources and choose course", goal:"G4", priority:"High", level:2, month:"M04", start:"2026-04-15", due:"2026-04-18", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a32", name:"Complete SAS introductory module", goal:"G4", priority:"High", level:2, month:"M05", start:"2026-04-20", due:"2026-04-25", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-05-30", blockedBy:["a31"] }),
  t({ id:"a34", name:"Switch banks + best money storage plan", goal:"G4", priority:"Mid", level:2, month:"M04", start:"2026-04-15", due:"2026-04-22", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-04-02" }),
  t({ id:"a46", name:"Financial iron plan fully mapped and funded", goal:"G4", priority:"High", level:2, month:"M05", start:"2026-04-25", due:"2026-04-30", status:"done", section:"Career & Financial", completed:true, completedDate:"2026-04-02" }),
  t({ id:"b21", name:"Complete SAS intermediate module", goal:"G4", priority:"High", level:2, month:"M06", start:"2026-06-03", due:"2026-06-17", status:"todo", section:"Career & Financial", blockedBy:["a32"] }),
  t({ id:"c07", name:"When should I invest — draft investment thesis framework", goal:"G4", priority:"Mid", level:2, month:"M06", start:"2026-06-10", due:"2026-06-17", status:"backlog", section:"Career & Financial", notes:"Knowledge build only — no live deployment in 2026. Research yield platforms (BlockFi defunct — find current alternatives), index core, allocation logic." }),

  // ═══ ZETA (#M06) — Mindset (G1) ═══
  t({ id:"a05", name:"Add athletic training to habit tracker (3-4x/week)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"done", section:"Mindset", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a06", name:"Add 8pm routine to habit tracker (daily)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"done", section:"Mindset", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a07", name:"Add Stoicism Journal to habit tracker", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"done", section:"Mindset", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a08", name:"Add Rebellion Block tracking to habit tracker (weekly)", goal:"G1", priority:"High", level:1, month:"M04", start:"2026-04-03", due:"2026-04-03", status:"done", section:"Mindset", completed:true, completedDate:"2026-05-30" }),
  t({ id:"a44", name:"Become self-starter / break defeated mindset daily practice", goal:"G1", priority:"High", level:3, month:"M05", start:"2026-04-15", due:"2026-04-25", status:"done", section:"Mindset", completed:true, completedDate:"2026-04-02" }),
  t({ id:"c21", name:"Become the Ultimate man — daily practice review", goal:"G1", priority:"High", level:5, month:"M07", start:"2026-06-17", due:"2026-06-20", status:"backlog", section:"Mindset" }),
  t({ id:"c22", name:"Industry pays debts — financial discipline review", goal:"G1", priority:"Mid", level:4, month:"M07", start:"2026-06-22", due:"2026-06-25", status:"backlog", section:"Mindset" }),
  t({ id:"c23", name:"Diligence is the mother of good luck — habit audit", goal:"G1", priority:"Mid", level:4, month:"M07", start:"2026-06-25", due:"2026-06-27", status:"backlog", section:"Mindset" }),
  t({ id:"c24", name:"Make a list of ends — life priorities audit", goal:"G1", priority:"Mid", level:5, month:"M07", start:"2026-06-27", due:"2026-06-30", status:"backlog", section:"Mindset" }),

  // ═══ ETA (#M07) — Assessment & Financial ═══
  t({ id:"d01", name:"Athletic body — formal assessment vs June baseline", goal:"G3", priority:"High", level:1, month:"M07", start:"2026-07-25", due:"2026-07-31", status:"backlog", section:"Assessment", milestone:true, blockedBy:["a02","b09"], notes:"Evolt 360 re-scan (same conditions: morning, fasted), e1RM estimates on main lifts vs. starting numbers, training log consistency review, sleep/HRV trend pull, written conclusions paragraph." }),
  t({ id:"d02", name:"Cognition baseline test completed and documented", goal:"G3", priority:"Mid", level:2, month:"M07", start:"2026-07-03", due:"2026-07-05", status:"backlog", section:"Assessment" }),
  t({ id:"d03", name:"Nutrition standard defined — based on 3 months data", goal:"G3", priority:"Mid", level:2, month:"M07", start:"2026-07-12", due:"2026-07-15", status:"backlog", section:"Assessment" }),
  t({ id:"d04", name:"Q2 financial review — emergency fund %, certs progress, net worth", goal:"G4", priority:"Mid", level:2, month:"M07", start:"2026-07-06", due:"2026-07-07", status:"backlog", section:"Career & Financial" }),

  // ═══ THETA (#M08) — Back-Half Milestones ═══
  t({ id:"e01", name:"90-day training program review — continue or switch", goal:"G3", priority:"High", level:1, month:"M08", start:"2026-08-01", due:"2026-08-05", status:"backlog", section:"Assessment", notes:"First real evaluation point. Run e1RM + consistency data from July assessment. Bar to switch is high — needs clear evidence the program isn't working." }),
  t({ id:"e02", name:"Act on bloodwork + EKG findings from Dr. Kendell review", goal:"G3", priority:"High", level:1, month:"M08", start:"2026-08-08", due:"2026-08-12", status:"backlog", section:"Health & Body", notes:"Implement protocol changes, supplementation adjustments, follow-up items from lab review." }),
  t({ id:"e03", name:"Microsoft associate cert (AZ-104/SC-200/DP-203) — exam scheduled", goal:"G4", priority:"High", level:2, month:"M08", start:"2026-08-01", due:"2026-08-05", status:"backlog", section:"Career & Financial", notes:"Associate level after AZ-900 fundamentals. Schedule the exam to create the deadline." }),
  t({ id:"e04", name:"SAS advanced module started", goal:"G4", priority:"High", level:2, month:"M08", start:"2026-08-08", due:"2026-08-12", status:"backlog", section:"Career & Financial" }),
  t({ id:"e05", name:"G1 quarterly checkpoint — is the Rebellion Block holding?", goal:"G1", priority:"High", level:4, month:"M08", start:"2026-08-08", due:"2026-08-12", status:"backlog", section:"Mindset", notes:"Review 90%+ weekly completion rate for the quarter. How many Blocks earned vs Duty Resets? Honest read on discipline-as-identity." }),
  t({ id:"e06", name:"First elevated ritual gathering HELD — oath read aloud", goal:"G2", priority:"High", level:4, month:"M08", start:"2026-08-01", due:"2026-08-08", status:"backlog", section:"Longhouse & Tribe", notes:"Scheduling was May/June milestone. This is the actual holding of the first elevated gathering." }),
  t({ id:"e07", name:"Phase 1 → Phase 2 assessment — squad ready for first formal quorum?", goal:"G2", priority:"High", level:3, month:"M08", start:"2026-08-08", due:"2026-08-12", status:"backlog", section:"Longhouse & Tribe", notes:"Score squad against 7-item readiness checklist. Decision: convene Phase 2 quorum or extend Phase 1 stealth." }),

  // ═══ IOTA (#M09) — Back-Half Milestones ═══
  t({ id:"f01", name:"Body composition follow-up scan #2 (vs. June baseline)", goal:"G3", priority:"High", level:1, month:"M09", start:"2026-09-01", due:"2026-09-05", status:"backlog", section:"Assessment", milestone:true, notes:"Gate-required 'first follow-up scan.' Same conditions — morning, fasted. Compare to Evolt 360 Delta 2026 baseline." }),
  t({ id:"f02", name:"Supplementation v1 locked against DNA + lab results", goal:"G3", priority:"High", level:2, month:"M09", start:"2026-09-05", due:"2026-09-09", status:"backlog", section:"Health & Body", notes:"Gate criterion. Finalize the stack from DNA Complete Pro + bloodwork data." }),
  t({ id:"f03", name:"Emergency fund checkpoint — confirm pace toward 75% by Nov 30", goal:"G4", priority:"High", level:1, month:"M09", start:"2026-09-01", due:"2026-09-05", status:"backlog", section:"Career & Financial", notes:"EARLY WARNING for G3 Lambda environmental items. If pace is short, flag G3 Lambda tasks to shift to Mu or 2027." }),
  t({ id:"f04", name:"CS degree mid-year checkpoint — confirm Sept 2027 completion on track", goal:"G4", priority:"Mid", level:2, month:"M09", start:"2026-09-05", due:"2026-09-09", status:"backlog", section:"Career & Financial", notes:"Via EdAssist. Confirm credit pace; adjust load if needed." }),
  t({ id:"f05", name:"Wife search checkpoint — platform ~3 months, review and adjust", goal:"G2", priority:"High", level:3, month:"M09", start:"2026-09-01", due:"2026-09-05", status:"backlog", section:"Longhouse & Tribe", notes:"Platform active since ~May. What's working, what isn't? Adjust non-essential criteria only — never essential ones." }),
  t({ id:"f06", name:"Tribe at 4–6 members with vetting underway — confirm or push", goal:"G2", priority:"High", level:3, month:"M09", start:"2026-09-05", due:"2026-09-09", status:"backlog", section:"Longhouse & Tribe" }),

  // ═══ KAPPA (#M10) — Back-Half Milestones ═══
  t({ id:"g01", name:"Nutrition protocol decision LOCKED — keto continued or carnivore concluded", goal:"G3", priority:"High", level:2, month:"M10", start:"2026-09-25", due:"2026-10-01", status:"backlog", section:"Health & Body", notes:"Gate wants nutrition 'resolved' not still in trial. Run the data, make structural call. No more trial framing after Kappa." }),
  t({ id:"g02", name:"HRV + sleep protocol review — is optimization working under shift work?", goal:"G3", priority:"High", level:1, month:"M10", start:"2026-10-03", due:"2026-10-07", status:"backlog", section:"Assessment", notes:"Confirm HRV trending up and Sleep Score stable/improving. If floor chronically unreachable under shift constraints, escalate to cross-track G4 review." }),
  t({ id:"g03", name:"Microsoft associate cert exam PASSED (or rescheduled with plan)", goal:"G4", priority:"High", level:2, month:"M10", start:"2026-09-25", due:"2026-09-30", status:"backlog", section:"Career & Financial", notes:"Gate criterion: first associate-level cert achieved. Passing here sets up second cert comfortably before year-end." }),
  t({ id:"g04", name:"Investment thesis first draft complete", goal:"G4", priority:"Mid", level:2, month:"M10", start:"2026-10-03", due:"2026-10-07", status:"backlog", section:"Career & Financial", notes:"Research yield/lending platforms (BlockFi defunct — find live alternatives), low-cost index core, allocation logic, tax-efficient placement. Knowledge only — no live deployment 2026." }),
  t({ id:"g05", name:"G1 quarterly checkpoint — habit tracker + daily systems audit", goal:"G1", priority:"Mid", level:4, month:"M10", start:"2026-10-03", due:"2026-10-07", status:"backlog", section:"Mindset", notes:"Morning Check-in, 8pm routine, Stoicism Journal, Daily Recap — what's actually running daily vs. intended adherence?" }),
  t({ id:"g06", name:"⚠️ Explicit tribe conversation with Robbie + Andrew", goal:"G2", priority:"High", level:4, month:"M10", start:"2026-09-25", due:"2026-09-30", status:"backlog", section:"Longhouse & Tribe", notes:"PRE-MORTEM COUNTER-MEASURE: run early (2026), not 2028. Result is vetting data. If misalignment surfaces, recruit in parallel — don't force signing." }),
  t({ id:"g07", name:"Phase 2 first formal quorum convened (if Theta assessment cleared)", goal:"G2", priority:"High", level:3, month:"M10", start:"2026-10-03", due:"2026-10-07", status:"backlog", section:"Longhouse & Tribe", notes:"Conditional on Theta readiness assessment. Sequenced AFTER tribe conversation so alignment is confirmed first." }),

  // ═══ LAMBDA (#M11) — Back-Half Milestones ═══
  t({ id:"h01", name:"Deferred environmental items — bedding, air purifiers, clothing audit, rug replacement", goal:"G3", priority:"Mid", level:1, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Health & Body", notes:"GATED on G4 emergency fund hitting 75% (Nov 30). If fund slips at Iota checkpoint, these shift to Mu or 2027." }),
  t({ id:"h02", name:"Microplastics protocol moves to maintained standard", goal:"G3", priority:"Mid", level:1, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Microplastics", notes:"Full home audit + clan law cleared in Zeta/Eta. This confirms protocol is maintained standard, not active project." }),
  t({ id:"h03", name:"Emergency fund — final push toward 75%", goal:"G4", priority:"High", level:1, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Career & Financial", notes:"Closing gap to $17,662 ahead of Nov 30 milestone." }),
  t({ id:"h04", name:"Q4 benefits open enrollment review (Northrop window)", goal:"G4", priority:"High", level:2, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Career & Financial", notes:"Set next-year HSA election, confirm 401k Roth %, plan well-being incentive capture for 2027." }),
  t({ id:"h05", name:"⚠️ Oath signing push — all three men signed before year-end", goal:"G2", priority:"High", level:4, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Longhouse & Tribe", notes:"Single hardest 2026 gate item. Depends on Kappa tribe conversation going well. If Kappa surfaced misalignment, this becomes recruit-in-parallel per pre-mortem." }),
  t({ id:"h06", name:"War council / monthly gathering cadence confirmed as habit", goal:"G2", priority:"High", level:3, month:"M11", start:"2026-10-25", due:"2026-11-04", status:"backlog", section:"Longhouse & Tribe", notes:"Confirm monthly rhythm is established and self-sustaining heading into 2027 Growth (which needs 6+ consecutive months of war-council format)." }),

  // ═══ MU (#M12) — Pre-Gate Confirmations ═══
  t({ id:"i01", name:"Body composition scan #3 (pre-gate)", goal:"G3", priority:"High", level:1, month:"M12", start:"2026-11-20", due:"2026-11-25", status:"backlog", section:"Assessment", milestone:true, notes:"Final scan before year-end gate. Establishes full-year trend across three data points: April baseline → September → November." }),
  t({ id:"i02", name:"Confirm training block at 6+ months continuous", goal:"G3", priority:"High", level:1, month:"M12", start:"2026-11-25", due:"2026-11-30", status:"backlog", section:"Assessment", notes:"Gate criterion. April start → November = 7+ months. Confirm no >2-week unplanned gap." }),
  t({ id:"i03", name:"Prep annual bloodwork re-run for 2027 — schedule with Dr. Kendell", goal:"G3", priority:"Mid", level:1, month:"M12", start:"2026-11-28", due:"2026-12-02", status:"backlog", section:"Health & Body", notes:"Book for Delta/Epsilon 2027 timing (post-tax-season). 12-month interval from 2026 draw." }),
  t({ id:"i04", name:"Emergency fund hits 75% ($17,662) by Nov 30 — CONFIRM", goal:"G4", priority:"High", level:1, month:"M12", start:"2026-11-28", due:"2026-11-30", status:"backlog", section:"Career & Financial", milestone:true, notes:"The dated gate milestone AND the trigger for G3 Lambda environmental items. On track for 100% ($23,550) in Q2 2027." }),
  t({ id:"i05", name:"Investment thesis finalized — ready for 2027 deployment decision", goal:"G4", priority:"High", level:2, month:"M12", start:"2026-11-28", due:"2026-12-02", status:"backlog", section:"Career & Financial", notes:"Lock the thesis so the 2027 live-deployment decision is a go/no-go on a finished plan." }),
  t({ id:"i06", name:"Wife search 6-month review (gate criterion)", goal:"G2", priority:"High", level:3, month:"M12", start:"2026-11-15", due:"2026-11-20", status:"backlog", section:"Longhouse & Tribe", notes:"Gate wants 'dating platform active 6+ months.' Honest review: serious prospects, or does the search need structural change for 2027?" }),
  t({ id:"i07", name:"Confirm tribe foundation — entering 2027 with real Phase 2 squad?", goal:"G2", priority:"High", level:3, month:"M12", start:"2026-11-28", due:"2026-12-02", status:"backlog", section:"Longhouse & Tribe", notes:"Pre-gate confirmation. Is squad a genuine Phase 2 quorum or still Phase 1? Sets honest starting line for 2027 Growth year." }),

  // ═══ NU (#M13) — Year-End & Planning Day ═══
  t({ id:"j01", name:"Draft 2027 G3 execution chunk from 5-year plan (Build year)", goal:"G3", priority:"High", level:1, month:"M13", start:"2026-12-20", due:"2026-12-28", status:"backlog", section:"Assessment", notes:"After scoring 2026 gate, pull 2027 Build criteria from 5-year plan: 18+ months unbroken training, LBM gain ≥3-5 lb, bloodwork re-run, combat foundation." }),
  t({ id:"j02", name:"Draft 2027 G4 execution chunk from 5-year plan (Credentialing year)", goal:"G4", priority:"High", level:1, month:"M13", start:"2026-12-20", due:"2026-12-28", status:"backlog", section:"Career & Financial", notes:"Pull 2027 Credentialing criteria: associate cert, CS degree Sept 2027, fund to 100%, taxable brokerage live." }),
  t({ id:"j03", name:"Draft 2027 G2 execution chunk from 5-year plan (Growth year)", goal:"G2", priority:"High", level:1, month:"M13", start:"2026-12-20", due:"2026-12-28", status:"backlog", section:"Longhouse & Tribe", notes:"Pull 2027 Growth criteria: Phase 3 war council, 2+ crucibles, first serious relationship, combat foundation." }),
  t({ id:"j04", name:"G1 year-end self-assessment — sovereignty, equanimity, truth-seeking", goal:"G1", priority:"High", level:4, month:"M13", start:"2026-12-15", due:"2026-12-20", status:"backlog", section:"Mindset", notes:"Did stoic equanimity hold under pressure? Is action coming from internal values or external validation? Where did truth-seeking win or lose? Feeds first Maturity Assessment." }),

  // ═══ ZETA (#M06) — Self-Hosted Server (G1 Digital Sovereignty) ═══
  // Phase 1 — Hardware & OS
  t({ id:"srv01", name:"Inventory parts and confirm build readiness", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"todo", section:"Self-Hosted Server", notes:"Phase 1. Confirm all components: drives, RAM, case, PSU, CPU/motherboard. Nothing proceeds without clean inventory." }),
  t({ id:"srv02", name:"Install OS — Ubuntu Server or Debian", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-05", due:"2026-06-08", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv01"], notes:"Phase 1. Minimal install — no GUI. Boot to CLI confirmed." }),
  t({ id:"srv03", name:"Configure network — static IP + router port forwarding", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-08", due:"2026-06-10", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv02"], notes:"Phase 1. Static local IP via DHCP reservation. Forward ports 80/443/22." }),
  t({ id:"srv04", name:"SSH access confirmed and secured (key-only, password disabled)", goal:"G1", priority:"High", level:1, month:"M06", start:"2026-06-10", due:"2026-06-14", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv03"], notes:"Phase 1. SSH key-based auth only. Test from external network." }),

  // Phase 2 — Storage & Security (Eta)
  t({ id:"srv05", name:"Format and mount drives — ZFS pool or RAID configuration", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-18", due:"2026-06-21", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv04"], notes:"Phase 2. ZFS recommended for data integrity. RAID 1 minimum. Mount: /mnt/storage." }),
  t({ id:"srv06", name:"Configure firewall (UFW) — allow only required ports", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-21", due:"2026-06-24", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv05"], notes:"Phase 2. Default deny incoming. Allow: 22, 80, 443. Review after each service install." }),
  t({ id:"srv07", name:"Set up automated backups — drives + config files", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-24", due:"2026-06-28", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv06"], notes:"Phase 2. rsync or borgbackup. Test restore before declaring done." }),
  t({ id:"srv08", name:"SSL certificate via Let's Encrypt (Certbot) + auto-renewal", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-06-28", due:"2026-07-03", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv07"], notes:"Phase 2. Required before exposing any services externally. HTTPS only." }),

  // Phase 3 — Services (Eta/Theta)
  t({ id:"srv09", name:"Install and configure Nextcloud — files, calendar, contacts", goal:"G1", priority:"High", level:2, month:"M07", start:"2026-07-03", due:"2026-07-08", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv08"], notes:"Phase 3. Docker Compose recommended. Point storage to ZFS mount. Verify sync from one device first." }),
  t({ id:"srv10", name:"Install and configure Immich — photo library (Google Photos replacement)", goal:"G1", priority:"High", level:2, month:"M07", start:"2026-07-08", due:"2026-07-12", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv09"], notes:"Phase 3. Docker Compose. Point library at ZFS pool. Mobile app tested end-to-end before migration." }),
  t({ id:"srv11", name:"Migrate all photos from current storage to Immich", goal:"G1", priority:"High", level:1, month:"M07", start:"2026-07-12", due:"2026-07-20", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv10"], milestone:true, notes:"Phase 3. Bulk import. Verify metadata preserved. Do NOT delete originals until confirmed." }),
  t({ id:"srv12", name:"Domain pointed at server OR Tailscale VPN configured", goal:"G1", priority:"High", level:2, month:"M07", start:"2026-07-20", due:"2026-07-25", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv10"], notes:"Phase 3. Tailscale recommended for cleaner security (no exposed ports). Decision: public domain vs private VPN." }),

  // Phase 4 — Hardening (Theta)
  t({ id:"srv13", name:"Fail2ban configured — intrusion prevention active", goal:"G1", priority:"Mid", level:2, month:"M08", start:"2026-07-25", due:"2026-07-28", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv12"], notes:"Phase 4. Jails for SSH, Nextcloud, Nginx. Alert on ban." }),
  t({ id:"srv14", name:"Automatic security updates configured (unattended-upgrades)", goal:"G1", priority:"Mid", level:1, month:"M08", start:"2026-07-28", due:"2026-07-30", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv13"], notes:"Phase 4. Security patches only — not full dist-upgrades. Email alerts on failures." }),
  t({ id:"srv15", name:"Offsite backup strategy — encrypted remote copy (Backblaze B2 or physical)", goal:"G1", priority:"Mid", level:2, month:"M08", start:"2026-07-30", due:"2026-08-03", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv14"], notes:"Phase 4. Backblaze B2 ~$6/TB/yr. At minimum: photos + documents have offsite copy." }),
  t({ id:"srv16", name:"Document the build — full rebuild guide in Obsidian/Nextcloud", goal:"G1", priority:"Mid", level:2, month:"M08", start:"2026-08-03", due:"2026-08-10", status:"backlog", section:"Self-Hosted Server", blockedBy:["srv15"], milestone:true, notes:"Phase 4. Hardware specs, OS config, services, ports, backup locations. If hardware fails tomorrow, this gets you back online." }),

  // ═══ ZETA (#M06) — Other new items ═══
  t({ id:"x01", name:"Raise cleanliness standards — home environment audit", goal:"G3", priority:"Mid", level:1, month:"M06", start:"2026-06-03", due:"2026-06-05", status:"todo", section:"Health & Body", notes:"Home cleanliness as environmental health variable. Establish new baseline standard and weekly maintenance routine." }),
  t({ id:"x02", name:"Open Money Market Account — research and execute", goal:"G4", priority:"High", level:1, month:"M06", start:"2026-06-03", due:"2026-06-07", status:"todo", section:"Career & Financial", notes:"High-yield savings for emergency fund or surplus cash. Compare: Vanguard, Fidelity, Marcus, Ally. APY, liquidity, minimums. Feeds iron plan optimization." }),
  t({ id:"x03", name:"Plan for Midsommar — Longhouse ritual gathering", goal:"G2", priority:"Mid", level:3, month:"M06", start:"2026-06-03", due:"2026-06-17", status:"todo", section:"Longhouse & Tribe", notes:"Midsommar as first Longhouse-aligned seasonal gathering. Plan: location, attendees, ritual elements (fire, mead, intention-setting). Phase 1 stealth framing — elevated experience, not a hard pitch." }),

  // ═══ BACKLOG — Combat Readiness (G3) ═══
  t({ id:"z01", name:"Research local martial arts and self-defense disciplines", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness" }),
  t({ id:"z02", name:"Choose discipline and enroll in first class", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z01"] }),
  t({ id:"z03", name:"Complete first four training sessions", goal:"G3", priority:"Low", level:1, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z02"] }),
  t({ id:"z04", name:"Establish home drill routine — basics and movement daily", goal:"G3", priority:"Low", level:1, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z03"] }),
  t({ id:"z05", name:"Schedule first quarterly sparring or skills assessment", goal:"G3", priority:"Low", level:2, month:"M07", start:"", due:"", status:"backlog", section:"Combat Readiness", blockedBy:["z04"] }),

  // ═══ BACKLOG — Cybersecurity & Sovereignty (G1) ═══
  t({ id:"z08", name:"Pm Firewall — execute Phase 1 hardening block", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", notes:"32 tasks in security project archive; this is the entry gate" }),
  t({ id:"z09", name:"Guard Tower — resume laptop hardening & compartmentalization", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", notes:"Windows 11 daily driver hardening" }),
  t({ id:"z10", name:"Qubes OS — migrate to primary daily driver", goal:"G1", priority:"Low", level:3, month:"", start:"", due:"", status:"backlog", section:"Cybersecurity & Sovereignty", blockedBy:["z09"], notes:"End-state goal; dual-boot available now" }),
];

// ═══════════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════════
const m = (o) => ({
  completed: false, completedDate: null, taskIds: [], notes: "", msWeek: "", ...o,
});

export const SEED_MILESTONES = [
  // ═══ MARCH / APRIL 2026 (MS3/MS4) — historical ═══
  m({ id:"ms3_02", name:"Start consistent athletic body training block", goal:"G3", month:"M04", due:"2026-04-07", msTag:"MS4", msWeek:"MSW15", taskIds:["a02"], completed:true, completedDate:"2026-06-01", notes:"Locked June 1. Training block running." }),
  m({ id:"ms3_03", name:"Review & update emergency fund / financial iron plan", goal:"G4", month:"M04", due:"2026-03-31", msTag:"MS3", msWeek:"MSW13", taskIds:["a46"], completed:true, completedDate:"2026-04-02" }),
  m({ id:"ms4_01", name:"Eatwild + localharvest research for real food sources", goal:"G3", month:"M04", due:"2026-04-05", msTag:"MS4", msWeek:"MSW14", taskIds:["a13"], completed:true, completedDate:"2026-04-02" }),
  m({ id:"ms4_02", name:"Microplastics avoidance plan + water filter in place", goal:"G3", month:"M04", due:"2026-04-08", msTag:"MS4", msWeek:"MSW14", taskIds:["a12"], completed:true, completedDate:"2026-04-08" }),
  m({ id:"ms4_03", name:"Body composition baseline logged", goal:"G3", month:"M04", due:"2026-04-05", msTag:"MS4", msWeek:"MSW14", taskIds:["a09"], completed:true, completedDate:"2026-06-01" }),
  m({ id:"ms4_04", name:"Habit tracker fully configured with all core habits", goal:"G1", month:"M04", due:"2026-04-05", msTag:"MS4", msWeek:"MSW14", taskIds:["a05","a06","a07","a08"], completed:true, completedDate:"2026-05-30" }),
  m({ id:"ms4_05", name:"Kitchen plastic audit started", goal:"G3", month:"M04", due:"2026-04-15", msTag:"MS4", msWeek:"MSW14", taskIds:["a14"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_06", name:"Schedule and complete blood draw + EKG", goal:"G3", month:"M04", due:"2026-04-15", msTag:"MS4", msWeek:"MSW15", taskIds:["a10"], completed:true, completedDate:"2026-06-01" }),
  m({ id:"ms4_07", name:"InsideTracker EKG + glucose wearable setup", goal:"G3", month:"M04", due:"2026-04-12", msTag:"MS4", msWeek:"MSW15", taskIds:["a11"], completed:true, completedDate:"2026-04-08" }),
  m({ id:"ms4_08", name:"Structured gym training program chosen and in use", goal:"G3", month:"M04", due:"2026-04-12", msTag:"MS4", msWeek:"MSW15", taskIds:["a14"], completed:true, completedDate:"2026-06-01" }),
  m({ id:"ms4_09", name:"Microsoft certification path chosen and study started", goal:"G4", month:"M04", due:"2026-04-18", msTag:"MS4", msWeek:"MSW15", taskIds:["a28","a29"], completed:true, completedDate:"2026-05-30" }),
  m({ id:"ms4_10", name:"Replace all plastic food containers with glass or stainless steel", goal:"G3", month:"M04", due:"2026-04-15", msTag:"MS4", msWeek:"MSW15", taskIds:["a18"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_11", name:"Replace plastic cutting boards and spatulas with wood or bamboo", goal:"G3", month:"M04", due:"2026-04-12", msTag:"MS4", msWeek:"MSW15", taskIds:["a19"], completed:true, completedDate:"2026-06-01" }),
  m({ id:"ms4_12", name:"Sleep optimization protocol established", goal:"G3", month:"M04", due:"2026-04-15", msTag:"MS4", msWeek:"MSW16", taskIds:["a15","a16"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_13", name:"SAS learning started", goal:"G4", month:"M05", due:"2026-04-25", msTag:"MS4", msWeek:"MSW16", taskIds:["a31","a32"], completed:true, completedDate:"2026-05-30", notes:"Intro module complete. Intermediate (b21) in progress." }),
  m({ id:"ms4_14", name:"Review Troy moving in / mortgage discussion", goal:"G2", month:"M04", due:"2026-04-18", msTag:"MS4", msWeek:"MSW16", taskIds:["a33"], completed:true, completedDate:"2026-04-02" }),
  m({ id:"ms4_15", name:"Switch to fresh and home-cooked meals — reduce ultra-processed", goal:"G3", month:"M04", due:"2026-04-20", msTag:"MS4", msWeek:"MSW16", taskIds:["a22"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_16", name:"Personal vetting criteria defined for wife-seeking", goal:"G2", month:"M04", due:"2026-04-15", msTag:"MS4", msWeek:"MSW16", taskIds:["a35"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_17", name:"Pre and post workout nutrition protocol built", goal:"G3", month:"M04", due:"2026-04-22", msTag:"MS4", msWeek:"MSW17", taskIds:["a23"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_18", name:"Continue Phase 1 stealth incentives + score 7-item readiness checklist", goal:"G2", month:"M05", due:"2026-04-30", msTag:"MS4", msWeek:"MSW17", taskIds:["a37"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_19", name:"Dating platform or community joined", goal:"G2", month:"M05", due:"2026-04-25", msTag:"MS4", msWeek:"MSW17", taskIds:["a36"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms4_20", name:"Become self-starter / break defeated mindset daily practice started", goal:"G1", month:"M05", due:"2026-04-25", msTag:"MS4", msWeek:"MSW17", taskIds:["a44"], completed:true, completedDate:"2026-04-02" }),
  m({ id:"ms4_21", name:"Financial iron plan fully mapped and funded", goal:"G4", month:"M05", due:"2026-04-30", msTag:"MS4", msWeek:"MSW17", taskIds:["a46"], completed:true, completedDate:"2026-04-02" }),

  // ═══ MAY 2026 (MS5) — Epsilon ═══
  m({ id:"ms5_01", name:"Blood draw + EKG results reviewed and actioned", goal:"G3", month:"M05", due:"2026-05-07", msTag:"MS5", msWeek:"MSW18", taskIds:["a10"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms5_02", name:"DNA test kit ordered and sample sent", goal:"G3", month:"M05", due:"2026-05-03", msTag:"MS5", msWeek:"MSW18", taskIds:["b04","b05"], completed:false, completedDate:null, notes:"Kit ordered Jun 1. Sample send in progress (b05)." }),
  m({ id:"ms5_03", name:"Metabolic health re-test completed", goal:"G3", month:"M06", due:"2026-06-15", msTag:"MS5", msWeek:"MSW19", taskIds:[] }),
  m({ id:"ms5_04", name:"Keto meat nutrient mapping finished", goal:"G3", month:"M05", due:"2026-05-18", msTag:"MS5", msWeek:"MSW20", taskIds:["b19","b20"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms5_05", name:"Custom supplements plan built and ordered", goal:"G3", month:"M07", due:"2026-07-15", msTag:"MS5", msWeek:"MSW29", taskIds:["b06","b07","b08"], notes:"Blocked by DNA results. Timeline shifted to Eta once DNA returns." }),
  m({ id:"ms5_06", name:"Emergency fund at 75% target ($17,662)", goal:"G4", month:"M12", due:"2026-11-30", msTag:"MS5", msWeek:"MSW47", taskIds:[], notes:"Corrected date: Nov 30 (Lambda/Mu boundary). Currently at ~44%. Track via Monarch monthly review." }),
  m({ id:"ms5_07", name:"Kitchen fully converted to plastic-free storage, cooking, and prep", goal:"G3", month:"M06", due:"2026-06-17", msTag:"MS5", msWeek:"MSW24", taskIds:["a18","a19","c12","c13"] }),
  m({ id:"ms5_09", name:"Check vacuum for HEPA + establish dusting routine", goal:"G3", month:"M05", due:"2026-05-20", msTag:"MS5", msWeek:"MSW20", taskIds:["b14"], completed:true, completedDate:"2026-06-03" }),
  m({ id:"ms5_10", name:"Research and purchase air purifier", goal:"G3", month:"M06", due:"2026-05-25", msTag:"MS5", msWeek:"MSW21", taskIds:["b15"], completed:true, completedDate:"2026-05-29" }),
  m({ id:"ms5_11", name:"Sign and print the Primal Longhouse Oath — bring to next meetup", goal:"G2", month:"M06", due:"2026-06-07", msTag:"MS5", msWeek:"MSW23", taskIds:["b25"] }),
  m({ id:"ms5_12", name:"Schedule the first elevated ritual gathering (read oath aloud)", goal:"G2", month:"M06", due:"2026-06-14", msTag:"MS5", msWeek:"MSW24", taskIds:["b26"] }),
  m({ id:"ms5_13", name:"Consistent approach practice established — minimum 2 per week", goal:"G2", month:"M06", due:"2026-06-17", msTag:"MS5", msWeek:"MSW24", taskIds:["b24"] }),
  m({ id:"ms5_14", name:"Complete first full month gym attendance review", goal:"G3", month:"M07", due:"2026-07-02", msTag:"MS5", msWeek:"MSW27", taskIds:["b09"], notes:"Training started Jun 1 — first full month review target Jul 1." }),

  // ═══ JUNE 2026 (MS6) — Zeta ═══
  m({ id:"ms6_01", name:"Tribe at 4–6 members with vetting process started", goal:"G2", month:"M07", due:"2026-06-30", msTag:"MS6", msWeek:"MSW26", taskIds:[], notes:"Aggregate tribal milestone — manual checkpoint scored at meetup." }),
  m({ id:"ms6_02", name:"Troy moving in confirmed or decision made", goal:"G2", month:"M07", due:"2026-06-30", msTag:"MS6", msWeek:"MSW26", taskIds:["c03","c04"] }),
  m({ id:"ms6_03", name:"Protective order reviewed and enforcement steps taken", goal:"G2", month:"M06", due:"2026-06-05", msTag:"MS6", msWeek:"MSW23", taskIds:["c01","c02"] }),
  m({ id:"ms6_04", name:"Bank switch completed + best money storage plan active", goal:"G4", month:"M06", due:"2026-05-30", msTag:"MS6", msWeek:"MSW22", taskIds:["a34"], completed:true, completedDate:"2026-05-30" }),
  m({ id:"ms6_05", name:"Smart home fully installed and optimized", goal:"G2", month:"M07", due:"2026-06-30", msTag:"MS6", msWeek:"MSW26", taskIds:["c08","c09","c10","c11"] }),
  m({ id:"ms6_06", name:"Full home microplastics audit completed — all major vectors controlled", goal:"G3", month:"M07", due:"2026-06-30", msTag:"MS6", msWeek:"MSW26", taskIds:["c12","c13","c14","c15","c16","c19","c20"] }),
  m({ id:"ms6_07", name:"Microplastics clan law drafted", goal:"G3", month:"M07", due:"2026-06-20", msTag:"MS6", msWeek:"MSW25", taskIds:["c18"] }),

  // ═══ JULY 2026 (MS7) — Eta ═══
  m({ id:"ms7_01", name:"Athletic body training block — first formal assessment completed", goal:"G3", month:"M08", due:"2026-07-31", msTag:"MS7", msWeek:"MSW30", taskIds:["d01"], notes:"Evolt 360 re-scan, e1RM estimates, consistency review, HRV trend, written conclusions." }),
  m({ id:"ms7_02", name:"Cognition baseline test completed", goal:"G3", month:"M07", due:"2026-07-05", msTag:"MS7", msWeek:"MSW27", taskIds:["d02"] }),
  m({ id:"ms7_03", name:"Nutrition standard defined and being followed", goal:"G3", month:"M07", due:"2026-07-15", msTag:"MS7", msWeek:"MSW29", taskIds:["d03"] }),

  // ═══ THETA–NU 2026 (MS8–MS13) — Back-Half Gates ═══
  m({ id:"ms8_01", name:"90-day training review + bloodwork findings actioned", goal:"G3", month:"M08", due:"2026-08-12", msTag:"MS8", msWeek:"MSW32", taskIds:["e01","e02"] }),
  m({ id:"ms8_02", name:"Microsoft associate cert exam scheduled", goal:"G4", month:"M08", due:"2026-08-05", msTag:"MS8", msWeek:"MSW31", taskIds:["e03"] }),
  m({ id:"ms9_01", name:"Body composition scan #2 vs. baseline", goal:"G3", month:"M09", due:"2026-09-05", msTag:"MS9", msWeek:"MSW36", taskIds:["f01"], milestone:true }),
  m({ id:"ms9_02", name:"Supplementation v1 locked", goal:"G3", month:"M09", due:"2026-09-09", msTag:"MS9", msWeek:"MSW36", taskIds:["f02"] }),
  m({ id:"ms9_03", name:"Emergency fund pace confirmed / G3 Lambda items decision made", goal:"G4", month:"M09", due:"2026-09-05", msTag:"MS9", msWeek:"MSW36", taskIds:["f03"] }),
  m({ id:"ms10_01", name:"Nutrition protocol locked, HRV reviewed", goal:"G3", month:"M10", due:"2026-10-07", msTag:"MS10", msWeek:"MSW40", taskIds:["g01","g02"] }),
  m({ id:"ms10_02", name:"Microsoft associate cert exam passed", goal:"G4", month:"M10", due:"2026-09-30", msTag:"MS10", msWeek:"MSW39", taskIds:["g03"] }),
  m({ id:"ms10_03", name:"Explicit tribe conversation with Robbie + Andrew run", goal:"G2", month:"M10", due:"2026-09-30", msTag:"MS10", msWeek:"MSW39", taskIds:["g06"] }),
  m({ id:"ms11_01", name:"Oath signing push complete (or recruit-in-parallel triggered)", goal:"G2", month:"M11", due:"2026-11-04", msTag:"MS11", msWeek:"MSW44", taskIds:["h05"] }),
  m({ id:"ms11_02", name:"Q4 benefits enrollment done, Lambda environmental items actioned", goal:"G4", month:"M11", due:"2026-11-04", msTag:"MS11", msWeek:"MSW44", taskIds:["h03","h04"] }),
  m({ id:"ms12_01", name:"Emergency fund hits 75% ($17,662)", goal:"G4", month:"M12", due:"2026-11-30", msTag:"MS12", msWeek:"MSW47", taskIds:["i04"], milestone:true }),
  m({ id:"ms12_02", name:"Body composition scan #3 (pre-gate)", goal:"G3", month:"M12", due:"2026-11-25", msTag:"MS12", msWeek:"MSW47", taskIds:["i01"] }),
  m({ id:"ms12_03", name:"Wife search 6-month review", goal:"G2", month:"M12", due:"2026-11-20", msTag:"MS12", msWeek:"MSW47", taskIds:["i06"] }),
  m({ id:"ms13_01", name:"Investment thesis finalized", goal:"G4", month:"M13", due:"2026-12-02", msTag:"MS13", msWeek:"MSW48", taskIds:["i05"] }),
  m({ id:"ms13_02", name:"G1 year-end self-assessment complete", goal:"G1", month:"M13", due:"2026-12-20", msTag:"MS13", msWeek:"MSW51", taskIds:["j04"] }),
  // ═══ SERVER BUILD MILESTONES ═══
  m({ id:"srv_ms1", name:"Self-hosted server Phase 1 complete — SSH secured", goal:"G1", month:"M06", due:"2026-06-14", msTag:"MS6", msWeek:"MSW24", taskIds:["srv01","srv02","srv03","srv04"], notes:"Hardware assembled, OS installed, network configured, SSH secured." }),
  m({ id:"srv_ms2", name:"Self-hosted server Phase 2 complete — storage + security", goal:"G1", month:"M07", due:"2026-07-03", msTag:"MS7", msWeek:"MSW27", taskIds:["srv05","srv06","srv07","srv08"], notes:"ZFS mounted, UFW configured, backups running, SSL active." }),
  m({ id:"srv_ms3", name:"Immich live + photos migrated — full data sovereignty", goal:"G1", month:"M07", due:"2026-07-20", msTag:"MS7", msWeek:"MSW29", taskIds:["srv09","srv10","srv11","srv12"], milestone:true, notes:"Nextcloud + Immich running. All photos migrated. Zero reliance on third-party cloud storage." }),
  m({ id:"srv_ms4", name:"Server fully hardened and documented", goal:"G1", month:"M08", due:"2026-08-10", msTag:"MS8", msWeek:"MSW32", taskIds:["srv13","srv14","srv15","srv16"], notes:"Fail2ban, auto-updates, offsite backup, rebuild guide complete." }),

  m({ id:"ms13_03", name:"2027 execution chunks drafted for all goals", goal:"G1", month:"M13", due:"2026-12-28", msTag:"MS13", msWeek:"MSW52", taskIds:["j01","j02","j03"], notes:"Planning Day prep. G2, G3, G4 next-year execution chunks all drafted before Dec 31 gate review." }),
];
