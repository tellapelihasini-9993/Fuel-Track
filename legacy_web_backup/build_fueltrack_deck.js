const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "FuelTrack Project Engineering Team";
pptx.subject = "FuelTrack smart fuel logistics and operations command center";
pptx.title = "FuelTrack — Zero-Hidden-Fee Doorstep Fuel Delivery";
pptx.company = "FuelTrack";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};
pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: "08111F" },
  objects: [],
  slideNumber: { x: 12.55, y: 7.12, color: "6D8298", fontFace: "Aptos", fontSize: 8 },
});

const C = {
  bg: "08111F",
  panel: "101E2E",
  panel2: "13283A",
  cyan: "35D7FF",
  cyan2: "84E9FF",
  orange: "FF9F5A",
  green: "49E0A3",
  yellow: "FFD166",
  red: "FF6B7A",
  white: "F7FBFF",
  text: "D7E5F1",
  muted: "9FB5C9",
  dim: "6D8298",
  line: "254259",
  dark: "06101A",
};

const W = 13.333, H = 7.5;
const M = 0.55;

function tx(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || "Aptos",
    fontSize: opts.fontSize || 14,
    color: opts.color || C.text,
    bold: opts.bold || false,
    italic: opts.italic || false,
    margin: opts.margin === undefined ? 0 : opts.margin,
    breakLine: false,
    fit: "shrink",
    valign: opts.valign || "mid",
    align: opts.align || "left",
    paraSpaceAfterPt: opts.paraSpaceAfterPt || 0,
    bullet: opts.bullet,
    transparency: opts.transparency,
    isTextBox: true,
  });
}

function box(slide, x, y, w, h, fill, radius = 0.12, line = fill) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: line, transparency: line === fill ? 100 : 0, width: 1 },
  });
}

function line(slide, x1, y1, x2, y2, color = C.line, width = 1.2, dash = "solid", begin = null, end = null) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width, dashType: dash, beginArrowType: begin, endArrowType: end },
  });
}

function circle(slide, x, y, d, fill, text = "", color = C.white, fontSize = 12) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: fill },
    line: { color: fill, transparency: 100 },
  });
  if (text) tx(slide, text, x, y + 0.01, d, d - 0.02, { align: "center", color, bold: true, fontSize });
}

function topRule(slide, label, section, number) {
  tx(slide, section.toUpperCase(), M, 0.28, 4.6, 0.18, { fontSize: 8, color: C.cyan, bold: true });
  tx(slide, label, M, 0.48, 11.5, 0.52, { fontSize: 25, color: C.white, bold: true, fontFace: "Aptos Display" });
  line(slide, M, 1.1, W - M, 1.1, C.line, 1);
  tx(slide, String(number).padStart(2, "0"), 11.92, 0.34, 0.78, 0.28, { fontSize: 10, color: C.cyan, bold: true, align: "right" });
}

function footer(slide, label = "FUELTRACK • SMART ENERGY LOGISTICS") {
  line(slide, M, 7.02, W - M, 7.02, C.line, 0.7);
  tx(slide, label, M, 7.11, 5.2, 0.16, { fontSize: 7.5, color: C.dim, bold: true });
}

function note(slide, text) {
  if (typeof slide.addNotes === "function") slide.addNotes(text);
}

function pill(slide, text, x, y, w, color = C.cyan, fill = "123448") {
  box(slide, x, y, w, 0.28, fill, 0.14, color);
  tx(slide, text, x + 0.06, y + 0.01, w - 0.12, 0.24, { fontSize: 8, color, bold: true, align: "center" });
}

function card(slide, x, y, w, h, title, body, accent = C.cyan, opts = {}) {
  box(slide, x, y, w, h, opts.fill || C.panel, 0.12, opts.line || C.line);
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.05, h, fill: { color: accent }, line: { color: accent, transparency: 100 } });
  tx(slide, title, x + 0.18, y + 0.14, w - 0.32, 0.24, { fontSize: opts.titleSize || 12, color: C.white, bold: true });
  tx(slide, body, x + 0.18, y + 0.48, w - 0.32, h - 0.58, { fontSize: opts.bodySize || 9.5, color: opts.bodyColor || C.text, valign: "top", breakLine: true });
}

function metric(slide, x, y, w, value, label, accent = C.cyan) {
  box(slide, x, y, w, 0.94, C.panel, 0.1, C.line);
  tx(slide, value, x + 0.14, y + 0.12, w - 0.28, 0.34, { fontSize: 22, color: accent, bold: true });
  tx(slide, label, x + 0.14, y + 0.55, w - 0.28, 0.20, { fontSize: 8.4, color: C.muted, bold: true });
}

function bullets(slide, items, x, y, w, lineH = 0.36, fontSize = 11, accent = C.cyan) {
  items.forEach((item, i) => {
    circle(slide, x, y + i * lineH + 0.05, 0.12, accent);
    tx(slide, item, x + 0.22, y + i * lineH, w - 0.22, lineH, { fontSize, color: C.text, valign: "top", breakLine: true });
  });
}

function arrow(slide, x1, y1, x2, y2, color = C.cyan) {
  line(slide, x1, y1, x2, y2, color, 1.4, "solid", null, "triangle");
}

// 01 — Cover
{
  const s = pptx.addSlide("MASTER");
  s.background = { color: C.bg };
  s.addShape(pptx.ShapeType.arc, { x: 8.3, y: -1.25, w: 6.1, h: 6.1, adjustPoint: 0.25, line: { color: C.cyan, transparency: 65, width: 2 }, fill: { color: C.bg, transparency: 100 } });
  s.addShape(pptx.ShapeType.arc, { x: 9.05, y: -0.5, w: 4.5, h: 4.5, line: { color: C.orange, transparency: 45, width: 1.5 }, fill: { color: C.bg, transparency: 100 } });
  for (let i = 0; i < 14; i++) {
    const x = 7.55 + (i % 7) * 0.55, y = 2.3 + Math.floor(i / 7) * 0.55;
    circle(s, x, y, 0.05, i % 3 === 0 ? C.orange : C.cyan);
  }
  pill(s, "PROJECT ENGINEERING PRESENTATION", M, 0.62, 2.6, C.cyan);
  tx(s, "FUELTRACK", M, 1.45, 7.4, 0.7, { fontSize: 42, color: C.white, bold: true, fontFace: "Aptos Display" });
  tx(s, "Zero-hidden-fee doorstep fuel delivery\n& operations command center", M, 2.28, 7.0, 1.1, { fontSize: 24, color: C.cyan2, bold: true, fontFace: "Aptos Display", breakLine: true });
  tx(s, "An intelligent, PESO-certified energy logistics and mobile refuelling network", M, 3.72, 6.9, 0.42, { fontSize: 14, color: C.text });
  line(s, M, 4.52, 6.7, 4.52, C.line, 1);
  metric(s, M, 4.88, 1.75, "₹50", "FLAT DELIVERY FEE", C.orange);
  metric(s, M + 1.95, 4.88, 1.75, "±0.01%", "DISPENSE ACCURACY", C.green);
  metric(s, M + 3.9, 4.88, 1.75, "18ms", "TELEMATICS LATENCY", C.cyan);
  tx(s, "Smart Energy Logistics  •  IoT Dispensing  •  Fleet Telematics", M, 6.56, 7, 0.22, { fontSize: 9, color: C.muted, bold: true });
  footer(s, "FUELTRACK • PROJECT IDENTITY");
  note(s, "Good morning/afternoon everyone. Welcome to the presentation of FuelTrack—an on-demand doorstep fuel delivery and telematics command platform built to solve fuel queue congestion, prevent emergency vehicle strandings, and guarantee transparent, zero-markup pricing.");
}

// 02 — Executive summary
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Project vision & strategic objectives", "01 / Why FuelTrack", 2);
  tx(s, "FuelTrack turns fuel delivery into a visible, measurable, closed-loop logistics service.", M, 1.35, 9.3, 0.35, { fontSize: 16, color: C.cyan2, bold: true });
  const cols = [
    ["01", "REMOVE THE QUEUE", "Deliver petrol, diesel and CNG to vehicles, fleets and stationary generator sets—without sending the asset to a pump.", C.cyan],
    ["02", "PROTECT THE PRICE", "Use an explicit formula: litres × official tariff + flat ₹50 delivery. No emergency convenience markup.", C.orange],
    ["03", "SHOW THE LOOP", "Track order verification, tanker assignment, route progress, dispensing and invoice evidence in one operating surface.", C.green],
  ];
  cols.forEach((c, i) => {
    const x = M + i * 4.18;
    box(s, x, 2.05, 3.75, 2.65, C.panel, 0.14, C.line);
    circle(s, x + 0.22, 2.26, 0.48, c[3], c[0], C.bg, 11);
    tx(s, c[1], x + 0.22, 2.95, 3.1, 0.3, { fontSize: 12, color: C.white, bold: true });
    tx(s, c[2], x + 0.22, 3.42, 3.2, 0.9, { fontSize: 11, color: C.text, valign: "top", breakLine: true });
  });
  box(s, M, 5.18, 12.2, 1.25, "0D1A28", 0.1, C.line);
  tx(s, "THE OPERATING PROMISE", M + 0.22, 5.4, 2.2, 0.22, { fontSize: 9, color: C.orange, bold: true });
  tx(s, "From depot storage → certified tanker → live route → calibrated dispense → digital proof of delivery.", M + 0.22, 5.75, 11.4, 0.35, { fontSize: 16, color: C.white, bold: true });
  footer(s); note(s, "FuelTrack addresses the inefficiencies of stationary fuel infrastructure. We provide a closed-loop platform that connects customers, franchise station depots, and central administrators with complete transparency.");
}

// 03 — Problem
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Critical pain points in traditional fuel retail", "01 / Why FuelTrack", 3);
  const problems = [
    ["01", "TIME LOST IN QUEUES", "Urban petrol stations become bottlenecks during peak traffic. Commercial fleets can lose ~45 minutes per trip waiting to refuel.", C.cyan],
    ["02", "EMERGENCY PRICE SHOCK", "Roadside fuel assistance can add +20% to +50% convenience markups precisely when a customer has the least negotiating power.", C.orange],
    ["03", "UNSAFE LAST-MILE HANDLING", "Generators, towers, hospitals and construction assets cannot drive to a pump. Unapproved jerrycans create fire, spill and compliance exposure.", C.red],
  ];
  problems.forEach((p, i) => {
    const y = 1.55 + i * 1.7;
    box(s, M, y, 12.2, 1.35, C.panel, 0.12, C.line);
    circle(s, M + 0.28, y + 0.31, 0.62, p[3], p[0], C.bg, 13);
    tx(s, p[1], M + 1.16, y + 0.2, 3.1, 0.26, { fontSize: 13, color: C.white, bold: true });
    tx(s, p[2], M + 4.05, y + 0.2, 7.7, 0.72, { fontSize: 11, color: C.text, valign: "top", breakLine: true });
    tx(s, i === 0 ? "QUEUE" : i === 1 ? "TRUST" : "SAFETY", 10.85, y + 0.52, 1.0, 0.22, { fontSize: 8, color: p[3], bold: true, align: "right" });
  });
  box(s, M, 6.52, 12.2, 0.32, "0C2632", 0.08, C.cyan);
  tx(s, "Design implication: the platform must optimize time, price transparency and physical safety together—not as separate features.", M + 0.15, 6.58, 11.8, 0.17, { fontSize: 9.5, color: C.cyan2, bold: true });
  footer(s); note(s, "Traditional fuel supply has three major issues: wasted time in long queues, predatory surge pricing during emergencies, and dangerous handling of loose fuel canisters for standby generators.");
}

// 04 — Architecture
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Closed-loop smart fuel logistics ecosystem", "02 / System architecture", 4);
  tx(s, "Four operational nodes share one order, telemetry and evidence trail.", M, 1.31, 8.2, 0.28, { fontSize: 14, color: C.cyan2, bold: true });
  const nodes = [
    ["A", "CUSTOMER FUEL HUB", "Preset / volume\nCheckout / tracking", C.cyan],
    ["B", "DISPATCH & ROUTING", "Order validation\nTanker assignment", C.orange],
    ["C", "SMART MICRO-TANKER", "GPS / IoT nozzle\nSafe mobile dispense", C.green],
    ["D", "DEPOT STORAGE", "Ultrasonic levels\nStock replenishment", C.yellow],
  ];
  nodes.forEach((n, i) => {
    const x = 0.7 + i * 3.05;
    box(s, x, 2.0, 2.55, 1.32, C.panel, 0.12, n[3]);
    circle(s, x + 0.18, 2.18, 0.36, n[3], n[0], C.bg, 10);
    tx(s, n[1], x + 0.66, 2.18, 1.72, 0.25, { fontSize: 10.5, color: C.white, bold: true });
    tx(s, n[2], x + 0.2, 2.7, 2.0, 0.45, { fontSize: 9.5, color: C.text, valign: "top", breakLine: true });
    if (i < 3) arrow(s, x + 2.55, 2.66, x + 3.02, 2.66, C.cyan);
  });
  box(s, 0.7, 4.1, 11.9, 1.65, "0B1A29", 0.12, C.line);
  tx(s, "SHARED DIGITAL CONTROL PLANE", 0.92, 4.31, 3.4, 0.2, { fontSize: 9, color: C.orange, bold: true });
  const cp = [
    ["ORDER STATE", "verified → assigned → transit → dispensed"],
    ["TELEMETRY", "GPS, tank temperature, flow meter, route ETA"],
    ["EVIDENCE", "tariff snapshot, density seal, calibrated volume, tax invoice"],
    ["ALERTS", "low stock, unsafe temperature, route deviation, failed payment"],
  ];
  cp.forEach((r, i) => {
    const x = 0.95 + (i % 2) * 5.6, y = 4.7 + Math.floor(i / 2) * 0.42;
    tx(s, r[0], x, y, 1.05, 0.2, { fontSize: 8, color: C.cyan, bold: true });
    tx(s, r[1], x + 1.18, y, 4.1, 0.2, { fontSize: 9.2, color: C.text });
  });
  tx(s, "Target operating characteristics", 0.7, 6.1, 2.7, 0.2, { fontSize: 9, color: C.muted, bold: true });
  metric(s, 3.1, 5.93, 2.2, "±0.01%", "FLOW CALIBRATION", C.green);
  metric(s, 5.55, 5.93, 2.2, "18ms", "CLOUD TELEMATICS LATENCY", C.cyan);
  metric(s, 8.0, 5.93, 2.2, "<4 min", "DISPATCH TARGET", C.orange);
  footer(s); note(s, "FuelTrack connects four operational nodes into a unified loop: bulk depot storage, certified smart micro-tankers, the customer ordering app, and the centralized fleet dispatch radar.");
}

// 05 — Pricing
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Mathematical price formula & comparative breakdown", "03 / Trust by design", 5);
  box(s, M, 1.42, 12.2, 1.02, "0C2632", 0.12, C.cyan);
  tx(s, "TOTAL (₹)  =  (LITRES × OFFICIAL DAILY RATE)  +  FLAT ₹50 DELIVERY  +  ₹0 EXTRA", M + 0.28, 1.73, 11.6, 0.36, { fontSize: 17, color: C.white, bold: true, align: "center" });
  tx(s, "Illustrative sample bill • 35 litres petrol • Mumbai region", M, 2.82, 5.2, 0.25, { fontSize: 12, color: C.cyan2, bold: true });
  const rows = [
    ["Official petrol unit rate", "₹104.21 / L"],
    ["Fuel subtotal", "35 × 104.21 = ₹3,647.35"],
    ["PESO safety handling & delivery", "₹50.00"],
    ["Platform surcharge / surge markup", "₹0.00"],
    ["EXACT PAYABLE TOTAL", "₹3,697.35"],
  ];
  rows.forEach((r, i) => {
    const y = 3.23 + i * 0.49;
    line(s, M, y + 0.38, 6.15, y + 0.38, i === 4 ? C.orange : C.line, i === 4 ? 1.5 : 0.7);
    tx(s, r[0], M + 0.08, y, 3.1, 0.25, { fontSize: i === 4 ? 11 : 10, color: i === 4 ? C.white : C.text, bold: i === 4 });
    tx(s, r[1], 4.3, y, 1.72, 0.25, { fontSize: i === 4 ? 12 : 10, color: i === 4 ? C.orange : C.cyan2, bold: true, align: "right" });
  });
  card(s, 6.7, 2.82, 5.5, 1.42, "FUELTRACK", "Market rate + flat ₹50 + calibrated flow ±0.01% + digital density / purity evidence.", C.green, { titleSize: 13, bodySize: 11 });
  card(s, 6.7, 4.55, 5.5, 1.42, "THIRD-PARTY EMERGENCY MODEL", "+20% to +40% surge price + ₹250–₹500 delivery fee + manual canister uncertainty.", C.red, { titleSize: 13, bodySize: 11 });
  pill(s, "TRANSPARENT FORMULA", 6.7, 6.3, 1.65, C.green, "0F352D");
  pill(s, "NO SURGE", 8.5, 6.3, 1.2, C.orange, "382A1A");
  pill(s, "DIGITAL PROOF", 9.85, 6.3, 1.45, C.cyan, "123448");
  footer(s); note(s, "Our transparent formula guarantees customer trust: pay strictly for the fuel at official government rates plus a flat ₹50 safety delivery fee with zero surge charges.");
}

// 06 — Customer portal
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Customer fuel hub experience", "04 / Product surfaces", 6);
  box(s, 0.7, 1.42, 4.0, 5.2, "0B1826", 0.14, C.line);
  pill(s, "CUSTOMER FUEL HUB", 0.96, 1.7, 1.55, C.cyan, "123448");
  tx(s, "Choose your asset", 0.96, 2.18, 2.2, 0.25, { fontSize: 16, color: C.white, bold: true });
  const presets = [["🚗", "Car", "~35 L"], ["🏍", "Bike", "~10 L"], ["🚚", "Fleet", "~80 L"], ["⚡", "Standby DG", "~50 L"], ["🚜", "Heavy agri", "~120 L"]];
  presets.forEach((p, i) => {
    const y = 2.65 + i * 0.58;
    box(s, 0.96, y, 3.45, 0.42, i === 0 ? "133044" : C.panel, 0.07, i === 0 ? C.cyan : C.line);
    tx(s, p[0], 1.1, y + 0.02, 0.3, 0.28, { fontSize: 15 });
    tx(s, p[1], 1.52, y + 0.05, 1.25, 0.2, { fontSize: 10.5, color: C.white, bold: i === 0 });
    tx(s, p[2], 3.3, y + 0.05, 0.82, 0.2, { fontSize: 10, color: C.cyan2, align: "right", bold: true });
  });
  tx(s, "VOLUME", 0.96, 5.72, 0.8, 0.18, { fontSize: 8, color: C.muted, bold: true });
  line(s, 1.0, 6.15, 4.05, 6.15, C.cyan, 3);
  circle(s, 2.7, 6.03, 0.25, C.cyan);
  tx(s, "35 L", 3.56, 5.86, 0.8, 0.3, { fontSize: 18, color: C.white, bold: true, align: "right" });
  const features = [
    ["01", "Dynamic volume slider", "5 L to 200 L with instant bill recalculation."],
    ["02", "LED dispenser view", "Rate, volume and total in a high-contrast digital readout."],
    ["03", "Multi-channel checkout", "UPI QR, cards and Pay on Delivery."],
    ["04", "Live delivery tracker", "Verified → assigned → in-transit → dispensed."],
    ["05", "Certified tax invoice", "Downloadable invoice with density / purity seal."],
  ];
  features.forEach((f, i) => {
    const y = 1.57 + i * 0.93;
    circle(s, 5.2, y + 0.12, 0.34, i === 0 ? C.cyan : C.panel2, f[0], i === 0 ? C.bg : C.cyan, 8);
    tx(s, f[1], 5.72, y, 3.4, 0.23, { fontSize: 12, color: C.white, bold: true });
    tx(s, f[2], 5.72, y + 0.29, 6.15, 0.28, { fontSize: 10, color: C.text });
  });
  footer(s); note(s, "The customer portal offers quick vehicle presets, an interactive digital LED pump display, instant multi-channel payments, and live GPS delivery tracking.");
}

// 07 — Radar
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Telematics HUD & micro-tanker tracking", "04 / Product surfaces", 7);
  box(s, 0.7, 1.45, 5.0, 5.25, "071522", 0.16, C.line);
  tx(s, "LIVE FLEET RADAR", 0.98, 1.72, 2.6, 0.2, { fontSize: 9, color: C.cyan, bold: true });
  // radar rings
  [0.75, 1.35, 1.95].forEach((d, i) => {
    s.addShape(pptx.ShapeType.ellipse, { x: 2.15 - d / 2, y: 4.15 - d / 2, w: d, h: d, fill: { color: C.bg, transparency: 100 }, line: { color: i === 2 ? C.cyan : C.line, transparency: i === 2 ? 35 : 10, width: 1 } });
  });
  line(s, 2.15, 2.18, 2.15, 6.12, C.line, 0.8);
  line(s, 0.18, 4.15, 4.12, 4.15, C.line, 0.8);
  line(s, 2.15, 4.15, 3.32, 3.14, C.cyan, 1.4);
  circle(s, 2.02, 4.02, 0.27, C.cyan, "•", C.bg, 14);
  circle(s, 1.2, 3.22, 0.18, C.orange, "•", C.bg, 10);
  circle(s, 3.22, 4.88, 0.18, C.green, "•", C.bg, 10);
  circle(s, 3.35, 3.48, 0.18, C.yellow, "•", C.bg, 10);
  tx(s, "TK-101", 0.95, 2.76, 0.72, 0.18, { fontSize: 8, color: C.orange, bold: true });
  tx(s, "TK-103", 3.58, 4.99, 0.72, 0.18, { fontSize: 8, color: C.green, bold: true });
  tx(s, "TK-102", 3.54, 3.22, 0.72, 0.18, { fontSize: 8, color: C.yellow, bold: true });
  tx(s, "TK-104", 0.78, 4.5, 0.72, 0.18, { fontSize: 8, color: C.cyan, bold: true });
  tx(s, "SWEEP ACTIVE  •  4 UNITS ONLINE", 1.1, 6.22, 2.8, 0.18, { fontSize: 8, color: C.green, bold: true, align: "center" });
  const units = [
    ["TK-101", "Mumbai Express", "In-Transit • 42 km/h • 4,000 L Diesel", C.orange],
    ["TK-102", "Pune Fleet", "En Route • 38 km/h • 3,500 L Petrol", C.yellow],
    ["TK-103", "Highway Unit", "Dispensing • 2,800 L Diesel", C.green],
    ["TK-104", "Depot HQ", "Returning to Base", C.cyan],
  ];
  units.forEach((u, i) => {
    const y = 1.52 + i * 1.2;
    box(s, 6.15, y, 6.05, 0.92, C.panel, 0.1, C.line);
    circle(s, 6.38, y + 0.25, 0.36, u[3], "●", C.bg, 8);
    tx(s, u[0], 6.9, y + 0.16, 0.72, 0.2, { fontSize: 10, color: u[3], bold: true });
    tx(s, u[1], 7.72, y + 0.16, 1.8, 0.2, { fontSize: 10.5, color: C.white, bold: true });
    tx(s, u[2], 6.9, y + 0.46, 4.9, 0.18, { fontSize: 9, color: C.text });
  });
  tx(s, "CLICK-TO-INSPECT HUD", 6.15, 6.36, 1.8, 0.18, { fontSize: 8.5, color: C.cyan, bold: true });
  tx(s, "Driver radio ping • 24.2°C tank temperature • ±0.01% nozzle • live ETA", 7.96, 6.36, 4.2, 0.18, { fontSize: 8.5, color: C.muted });
  footer(s); note(s, "The Admin Radar gives dispatchers a bird's-eye view of all mobile tankers across the metropolitan area, with instant click-to-inspect hardware telematics.");
}

// 08 — Storage
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Depot bulk storage telematics", "04 / Product surfaces", 8);
  tx(s, "Visualize capacity, drawdown and replenishment before service levels are affected.", M, 1.35, 9.8, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  const tanks = [
    ["TANK 01", "BULK PETROL / REGULAR", "10,000 L", 0.82, C.orange, "Normal"],
    ["TANK 02", "BULK DIESEL / HIGH SPEED", "15,000 L", 0.64, C.cyan, "Monitor"],
    ["TANK 03", "CNG PRESSURE UNIT", "8,000 kg", 0.91, C.green, "Healthy"],
  ];
  tanks.forEach((t, i) => {
    const x = 0.72 + i * 4.15;
    box(s, x, 1.92, 3.65, 3.4, C.panel, 0.14, C.line);
    tx(s, t[0], x + 0.25, 2.16, 1.0, 0.18, { fontSize: 8.5, color: t[4], bold: true });
    tx(s, t[1], x + 0.25, 2.42, 3.0, 0.23, { fontSize: 11, color: C.white, bold: true });
    tx(s, t[2], x + 0.25, 2.8, 1.35, 0.25, { fontSize: 18, color: C.cyan2, bold: true });
    // tank
    box(s, x + 2.48, 3.0, 0.78, 1.55, "08111F", 0.08, C.line);
    s.addShape(pptx.ShapeType.rect, { x: x + 2.49, y: 3.0 + 1.55 * (1 - t[3]), w: 0.76, h: 1.55 * t[3], fill: { color: t[4], transparency: 12 }, line: { color: t[4], transparency: 100 } });
    line(s, x + 2.62, 3.0 + 1.55 * (1 - t[3]), x + 3.1, 3.0 + 1.55 * (1 - t[3]), C.white, 1);
    tx(s, `${Math.round(t[3] * 100)}%`, x + 2.38, 4.72, 0.98, 0.22, { fontSize: 10, color: t[4], bold: true, align: "center" });
    tx(s, "Ultrasonic level sensor\n3D fluid wave state", x + 0.25, 3.45, 1.85, 0.48, { fontSize: 9.5, color: C.text, valign: "top", breakLine: true });
    pill(s, t[5].toUpperCase(), x + 0.25, 4.82, 0.95, t[4], "0B2630");
  });
  box(s, 0.72, 5.72, 12.05, 0.72, "0B1A29", 0.1, C.line);
  tx(s, "OPERATOR CONTROLS", 0.96, 5.96, 1.2, 0.18, { fontSize: 8, color: C.orange, bold: true });
  pill(s, "DISPENSE 500 L", 3.0, 5.87, 1.45, C.cyan, "123448");
  pill(s, "AUTO TOP-UP >95%", 4.72, 5.87, 1.65, C.green, "0F352D");
  tx(s, "Low-stock alerts fire below 25%; top-up simulation restores service headroom.", 6.75, 5.95, 5.6, 0.18, { fontSize: 9.2, color: C.text });
  footer(s); note(s, "Our 3D fluid storage visualizer uses dual-phase CSS wave dynamics to represent actual ultrasonic fuel levels across all bulk storage tanks.");
}

// 09 — IoT dispenser
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Hardware flow simulation & browser audio engine", "05 / Demonstrable intelligence", 9);
  box(s, 0.7, 1.48, 5.4, 5.15, "071522", 0.14, C.line);
  tx(s, "LIVE DISPENSE SIMULATOR", 0.98, 1.75, 2.4, 0.2, { fontSize: 9, color: C.cyan, bold: true });
  tx(s, "45.0", 1.0, 2.35, 2.2, 0.72, { fontSize: 48, color: C.cyan2, bold: true, fontFace: "Aptos Display" });
  tx(s, "L / MIN", 3.2, 2.74, 1.0, 0.22, { fontSize: 12, color: C.muted, bold: true });
  line(s, 1.0, 3.4, 5.72, 3.4, C.cyan, 2);
  for (let i = 0; i < 22; i++) line(s, 1.0 + i * 0.21, 3.34, 1.0 + i * 0.21, 3.46, i % 2 ? C.cyan : C.orange, 1.6);
  card(s, 0.98, 3.82, 2.12, 1.22, "VOLUME", "012.6 L", C.cyan, { titleSize: 9, bodySize: 22 });
  card(s, 3.38, 3.82, 2.12, 1.22, "VALUE", "₹1,314.85", C.orange, { titleSize: 9, bodySize: 18 });
  pill(s, "NOZZLE CALIBRATED ±0.01%", 1.0, 5.55, 2.1, C.green, "0F352D");
  pill(s, "EVENT STREAM: LIVE", 3.32, 5.55, 1.75, C.cyan, "123448");
  const audio = [
    ["RADAR PING", "800 Hz sine", C.cyan],
    ["MOTOR HUM", "120 Hz saw-tooth", C.orange],
    ["SUCCESS CHIME", "523–784 Hz major chord", C.green],
  ];
  tx(s, "NATIVE WEB AUDIO SYNTHESIZER", 6.7, 1.72, 4.8, 0.25, { fontSize: 14, color: C.white, bold: true });
  tx(s, "Procedural browser audio means zero external MP3 files and a lighter operational console.", 6.7, 2.08, 5.2, 0.46, { fontSize: 11, color: C.text, valign: "top", breakLine: true });
  audio.forEach((a, i) => {
    const y = 2.92 + i * 0.88;
    box(s, 6.7, y, 5.35, 0.64, C.panel, 0.08, C.line);
    circle(s, 6.94, y + 0.17, 0.28, a[2], "♪", C.bg, 12);
    tx(s, a[0], 7.42, y + 0.12, 1.7, 0.18, { fontSize: 10.5, color: C.white, bold: true });
    tx(s, a[1], 9.42, y + 0.12, 2.25, 0.18, { fontSize: 10, color: a[2], align: "right", bold: true });
  });
  box(s, 6.7, 5.72, 5.35, 0.72, "0C2632", 0.08, C.cyan);
  tx(s, "WHY IT MATTERS", 6.92, 5.92, 1.2, 0.17, { fontSize: 8, color: C.cyan, bold: true });
  tx(s, "Operators hear state changes while keeping eyes on the radar.", 8.2, 5.92, 3.55, 0.17, { fontSize: 9.3, color: C.white, bold: true });
  footer(s); note(s, "The built-in IoT dispenser simulator lets operators simulate live nozzle dispensing at 45 litres per minute, accompanied by procedural audio tones generated via the native browser Web Audio API.");
}

// 10 — Owner hub
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Local depot operations & dispatch log", "04 / Product surfaces", 10);
  tx(s, "The franchise owner hub turns a local station into a measurable service node.", M, 1.35, 9.4, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  metric(s, 0.72, 1.92, 2.65, "₹68,450+", "DAILY REVENUE SETTLEMENT", C.green);
  metric(s, 3.62, 1.92, 2.65, "12", "ORDERS IN TRANSIT", C.cyan);
  metric(s, 6.52, 1.92, 2.65, "48", "TOTAL DISPATCHES", C.orange);
  metric(s, 9.42, 1.92, 2.65, "<4 min", "DISPATCH TARGET", C.yellow);
  card(s, 0.72, 3.2, 5.85, 2.48, "STORAGE GAUGE WARNINGS", "Automated threshold monitoring\n\n• Alert when a tank falls below 25%\n• Raise replenishment request before service impact\n• Link the request to depot, fuel type and required volume", C.orange, { bodySize: 11 });
  card(s, 6.88, 3.2, 5.3, 2.48, "DISPATCH APPROVAL QUEUE", "Incoming orders are routed by geographic proximity.\n\n• Review destination and requested litres\n• Assign the nearest certified tanker\n• Start GPS tracking and customer progress state", C.cyan, { bodySize: 11 });
  box(s, 0.72, 5.98, 12.05, 0.64, "0B1A29", 0.1, C.line);
  tx(s, "OWNER CONTROL LOOP", 0.98, 6.2, 1.35, 0.17, { fontSize: 8, color: C.orange, bold: true });
  ["MONITOR", "APPROVE", "DISPATCH", "SETTLE"].forEach((v, i) => {
    pill(s, v, 2.65 + i * 1.55, 6.1, 1.2, i === 2 ? C.green : C.cyan, i === 2 ? "0F352D" : "123448");
    if (i < 3) arrow(s, 3.89 + i * 1.55, 6.24, 4.13 + i * 1.55, 6.24, C.line);
  });
  footer(s); note(s, "Station franchise owners have a dedicated hub to monitor their local depot tanks, handle incoming orders, and manage direct settlements.");
}

// 11 — Technology architecture
{
  const s = pptx.addSlide("MASTER"); topRule(s, "High-performance web architecture", "06 / Engineering foundation", 11);
  tx(s, "A lightweight browser-first stack keeps the prototype fast, inspectable and easy to extend.", M, 1.32, 10.4, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  const layers = [
    ["EXPERIENCE LAYER", "Customer portal • Admin radar • Station owner hub", "HTML5 / responsive UI / accessible controls", C.cyan],
    ["PRESENTATION LAYER", "Cyber-glass dark mode • CSS custom properties • 3D wave keyframes", "60fps animations / high-contrast operational states", C.orange],
    ["APPLICATION LAYER", "Vanilla JavaScript ES6+ • order state • tariff math • role routing", "Zero framework bloat / direct browser event model", C.green],
    ["SERVICE LAYER", "Lightweight Node.js server • MIME headers • path sanitization • SPA fallback", "Static delivery / safe endpoint boundary", C.yellow],
    ["PERSISTENCE & ANALYTICS", "Browser LocalStorage • states, cities, tariffs, stations, orders", "Chart.js revenue and volume trend analytics", C.red],
  ];
  layers.forEach((l, i) => {
    const y = 1.87 + i * 0.84;
    box(s, 0.72, y, 12.0, 0.62, C.panel, 0.08, l[3]);
    tx(s, l[0], 0.95, y + 0.12, 2.0, 0.17, { fontSize: 8.5, color: l[3], bold: true });
    tx(s, l[1], 3.02, y + 0.11, 5.6, 0.2, { fontSize: 10.5, color: C.white, bold: true });
    tx(s, l[2], 8.7, y + 0.11, 3.55, 0.24, { fontSize: 8.7, color: C.text, align: "right" });
  });
  box(s, 0.72, 6.28, 12.0, 0.42, "0C2632", 0.08, C.cyan);
  tx(s, "Design principle", 0.95, 6.4, 1.0, 0.16, { fontSize: 8, color: C.cyan, bold: true });
  tx(s, "Keep operational truth in explicit state transitions; keep visual effects separate from business logic.", 2.18, 6.4, 9.9, 0.16, { fontSize: 9.2, color: C.white, bold: true });
  footer(s); note(s, "The codebase is engineered for maximum performance: Vanilla HTML5/CSS3/JavaScript ensuring smooth 60fps animations with a lightweight Node.js backend.");
}

// 12 — Safety/security
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Regulatory standards, operational safety & data security", "07 / Trust & governance", 12);
  const pillars = [
    ["01", "PESO STATUTORY COMPLIANCE", "Mobile refuelling units, roll-over protection, emergency shut-off valves and certified handling procedures.", C.orange],
    ["02", "DIGITAL DENSITY TESTING", "Attach an automated purity / density certificate to each invoice so the delivery has an auditable evidence layer.", C.green],
    ["03", "SECURE APPLICATION BOUNDARY", "Sanitized server paths, encrypted transactions and secure authentication tokens protect the digital control plane.", C.cyan],
  ];
  pillars.forEach((p, i) => {
    const x = 0.72 + i * 4.12;
    box(s, x, 1.55, 3.7, 2.66, C.panel, 0.13, p[3]);
    circle(s, x + 0.25, 1.83, 0.46, p[3], p[0], C.bg, 10);
    tx(s, p[1], x + 0.25, 2.52, 3.1, 0.44, { fontSize: 12, color: C.white, bold: true, valign: "top", breakLine: true });
    tx(s, p[2], x + 0.25, 3.18, 3.1, 0.7, { fontSize: 10.5, color: C.text, valign: "top", breakLine: true });
  });
  tx(s, "SAFETY-CENTRIC ORDER CHECKPOINTS", 0.72, 4.7, 3.3, 0.2, { fontSize: 9, color: C.cyan, bold: true });
  const checkpoints = [
    ["01", "Vehicle / asset eligibility", "Confirm delivery type, volume envelope and destination."],
    ["02", "Tanker readiness", "Confirm GPS heartbeat, temperature and nozzle calibration."],
    ["03", "Dispense evidence", "Capture volume, rate, time, density seal and recipient proof."],
    ["04", "Exception response", "Escalate spills, temperature anomalies or route deviations."],
  ];
  checkpoints.forEach((p, i) => {
    const x = 0.72 + i * 3.02;
    box(s, x, 5.1, 2.75, 1.15, "0B1A29", 0.09, C.line);
    tx(s, p[0], x + 0.18, 5.3, 0.32, 0.2, { fontSize: 9, color: C.orange, bold: true });
    tx(s, p[1], x + 0.62, 5.28, 1.85, 0.2, { fontSize: 9.5, color: C.white, bold: true });
    tx(s, p[2], x + 0.18, 5.67, 2.35, 0.38, { fontSize: 8.5, color: C.text, valign: "top", breakLine: true });
  });
  footer(s); note(s, "Safety and compliance are at the foundation of FuelTrack, adhering strictly to PESO mobile refuelling regulations and certified density testing.");
}

// 13 — Market
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Market segments & scaling model", "08 / Commercial opportunity", 13);
  tx(s, "One logistics backbone serves four demand patterns with different service-level needs.", M, 1.35, 10.4, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  const segs = [
    ["RETAIL CONSUMERS", "Apartment complexes, offices and residential doorstep top-ups.", "Fast booking • small volume • convenience", C.cyan],
    ["COMMERCIAL FLEETS", "Scheduled overnight bulk refuelling for vans, trucks and buses.", "Recurring demand • route density • settlement", C.orange],
    ["STANDBY GENERATORS", "Hospitals, data centres, telecom towers and high-rise facilities.", "Critical service • reliability • compliance", C.red],
    ["AGRI & CONSTRUCTION", "Tractors, earthmovers and site generators refuelled on location.", "Remote sites • larger volume • planned dispatch", C.green],
  ];
  segs.forEach((g, i) => {
    const x = 0.72 + (i % 2) * 6.08, y = 1.95 + Math.floor(i / 2) * 1.68;
    box(s, x, y, 5.55, 1.32, C.panel, 0.12, g[3]);
    tx(s, g[0], x + 0.22, y + 0.2, 2.7, 0.2, { fontSize: 12, color: C.white, bold: true });
    tx(s, g[1], x + 0.22, y + 0.52, 5.0, 0.25, { fontSize: 10.3, color: C.text });
    pill(s, g[2], x + 0.22, y + 0.91, 2.7, g[3], "0B2630");
  });
  box(s, 0.72, 5.55, 12.0, 0.95, "0C2632", 0.12, C.cyan);
  tx(s, "SCALING LOGIC", 0.98, 5.8, 1.2, 0.18, { fontSize: 8.5, color: C.cyan, bold: true });
  tx(s, "Increase density before geography: more orders per route → better tanker utilization → stronger unit economics.", 2.52, 5.77, 9.7, 0.26, { fontSize: 13, color: C.white, bold: true });
  tx(s, "Expansion follows the same control plane: depot → certified fleet → local dispatch → evidence-backed settlement.", 2.52, 6.13, 9.6, 0.18, { fontSize: 9.3, color: C.text });
  footer(s); note(s, "Our addressable market spans retail consumers, enterprise transport fleets, critical hospital generators, and heavy agricultural equipment.");
}

// 14 — Roadmap
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Product evolution roadmap • 2026–2027", "09 / Future state", 14);
  tx(s, "The roadmap extends the same promise—less waiting, more certainty—into routing, EV rescue and automation.", M, 1.34, 11.3, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  line(s, 1.05, 3.54, 12.05, 3.54, C.line, 2);
  const roadmap = [
    ["Q3 2026", "ROUTE INTELLIGENCE", "ML clustering for localized tanker route optimization.", "Target: 35% travel reduction", C.cyan],
    ["Q4 2026", "EMERGENCY EV RESCUE", "Mobile 150 kW DC fast-charging battery packs.", "Extend rescue coverage beyond liquid fuel", C.orange],
    ["2027", "ZERO-TOUCH DISPENSING", "Smart RFID fuel tank caps for automated identity and dispense.", "Reduce manual confirmation at the nozzle", C.green],
  ];
  roadmap.forEach((r, i) => {
    const x = 1.0 + i * 3.82;
    circle(s, x + 0.98, 3.23, 0.62, r[4], String(i + 1), C.bg, 14);
    box(s, x, 1.95, 3.05, 1.02, C.panel, 0.1, r[4]);
    tx(s, r[0], x + 0.2, 2.16, 1.1, 0.18, { fontSize: 9, color: r[4], bold: true });
    tx(s, r[1], x + 0.2, 2.48, 2.6, 0.2, { fontSize: 12, color: C.white, bold: true });
    tx(s, r[2], x, 4.18, 3.05, 0.42, { fontSize: 10.5, color: C.text, align: "center", valign: "top", breakLine: true });
    pill(s, r[3], x + 0.18, 5.0, 2.65, r[4], "0B2630");
  });
  box(s, 0.72, 5.95, 12.0, 0.67, "0B1A29", 0.1, C.line);
  tx(s, "North star", 0.98, 6.18, 0.9, 0.18, { fontSize: 8.5, color: C.orange, bold: true });
  tx(s, "Every dispatch becomes a predictable, auditable energy event—regardless of fuel type or asset location.", 2.06, 6.14, 10.1, 0.22, { fontSize: 11.5, color: C.white, bold: true });
  footer(s); note(s, "Looking ahead, we are expanding our smart routing algorithms, adding mobile rapid EV charging pods, and testing automated RFID vehicle fuel caps.");
}

// 15 — Demo
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Live application endpoints & verification", "10 / Demonstration", 15);
  tx(s, "Use the running application to walk through one order from booking to proof of delivery.", M, 1.35, 10.4, 0.25, { fontSize: 14, color: C.cyan2, bold: true });
  const links = [
    ["01", "MAIN PORTAL", "http://localhost:8080", "Start here: choose a role and open the system shell.", C.cyan],
    ["02", "CUSTOMER FUEL HUB", "http://localhost:8080/index.html?role=user", "Create a transparent zero-markup fuel order.", C.green],
    ["03", "ADMIN OPERATIONS COMMAND", "http://localhost:8080/index.html?role=admin", "Inspect the fleet radar, route state and telematics HUD.", C.orange],
    ["04", "STATION OWNER HUB", "http://localhost:8080/index.html?role=owner", "Review depot levels, approvals and settlements.", C.yellow],
    ["05", "PRESENTATION DECK", "http://localhost:8080/presentation.html", "Open the interactive system narrative.", C.cyan2],
  ];
  links.forEach((l, i) => {
    const y = 1.86 + i * 0.84;
    box(s, M, y, 12.2, 0.62, C.panel, 0.08, C.line);
    circle(s, M + 0.2, y + 0.14, 0.34, l[4], l[0], C.bg, 8);
    tx(s, l[1], 1.25, y + 0.12, 2.55, 0.18, { fontSize: 10.5, color: C.white, bold: true });
    tx(s, l[2], 3.95, y + 0.12, 4.15, 0.18, { fontSize: 9.5, color: l[4], bold: true });
    tx(s, l[3], 8.35, y + 0.12, 3.55, 0.22, { fontSize: 9, color: C.text, align: "right" });
  });
  box(s, M, 6.28, 12.2, 0.38, "0C2632", 0.08, C.cyan);
  tx(s, "DEMO SCRIPT", M + 0.15, 6.38, 0.9, 0.16, { fontSize: 8, color: C.cyan, bold: true });
  tx(s, "Book → verify price → assign tanker → watch radar → dispense → download invoice.", M + 1.3, 6.37, 10.4, 0.17, { fontSize: 10, color: C.white, bold: true });
  footer(s); note(s, "We are now demonstrating the live system: placing a zero-markup fuel order as a customer, reviewing the live GPS tracker, and switching to the Admin radar command center.");
}

// 16 — Summary
{
  const s = pptx.addSlide("MASTER"); topRule(s, "Key takeaways & questions", "11 / Close", 16);
  tx(s, "FuelTrack is not only a delivery interface—it is an operating system for trusted mobile refuelling.", M, 1.42, 11.2, 0.38, { fontSize: 19, color: C.cyan2, bold: true, fontFace: "Aptos Display" });
  const takeaways = [
    ["TRANSPARENT ECONOMICS", "Official tariff + flat ₹50 delivery + ₹0 extra", C.orange],
    ["CERTIFIED OPERATIONS", "PESO-ready mobile units + calibrated IoT flow", C.green],
    ["VISIBLE EXECUTION", "GPS fleet radar + depot telemetry + digital proof", C.cyan],
  ];
  takeaways.forEach((t, i) => {
    const y = 2.36 + i * 0.88;
    circle(s, 0.9, y + 0.05, 0.4, t[2], "✓", C.bg, 15);
    tx(s, t[0], 1.55, y, 3.0, 0.22, { fontSize: 12, color: C.white, bold: true });
    tx(s, t[1], 4.75, y, 5.1, 0.22, { fontSize: 12, color: C.text });
  });
  box(s, 0.72, 5.35, 12.0, 1.15, "0C2632", 0.14, C.cyan);
  tx(s, "QUESTIONS", 1.02, 5.67, 1.45, 0.3, { fontSize: 24, color: C.white, bold: true, fontFace: "Aptos Display" });
  tx(s, "Thank you for your time.", 8.0, 5.74, 4.2, 0.25, { fontSize: 14, color: C.cyan2, bold: true, align: "right" });
  tx(s, "FuelTrack • Smart Energy Logistics • IoT Dispensing • Fleet Telematics", M, 6.78, 8.5, 0.18, { fontSize: 9, color: C.muted, bold: true });
  footer(s, "FUELTRACK • SUMMARY & Q&A");
  note(s, "Thank you for your time. We are now open for Questions & Answers.");
}

pptx.writeFile({ fileName: "FuelTrack_Complete_Project_Presentation.pptx" });