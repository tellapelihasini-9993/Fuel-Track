# ⛽ FuelTrack — Complete Beginner's Guide & Project Documentation

> **Zero-Hidden-Fee Doorstep Fuel Delivery & Operations Command Center**  
> Powered by **100% Pure Java SE** Multi-Page Architecture, Real-Time Satellite Telematics, and Separated Customer & Station Owner Dashboards.

[![Zero Hidden Fees](https://img.shields.io/badge/Platform%20Markup-%E2%82%B90.00-10b981.svg)](https://github.com)
[![PESO-Ready Workflow](https://img.shields.io/badge/PESO-Ready%20Workflow-ff6b00.svg)](https://github.com)
[![100% Pure Java SE](https://img.shields.io/badge/Backend-100%25%20Pure%20Java%20SE-f59e0b.svg)](https://github.com)
[![Separated Cockpits](https://img.shields.io/badge/Architecture-Separated%20Cockpits-0ea5e9.svg)](https://github.com)
[![Verified CSAT](https://img.shields.io/badge/CSAT-4.95%20%2F%205.0%20%E2%98%85-eab308.svg)](https://github.com)

---

## 📑 Table of Contents
1. [What is FuelTrack? (The Big Picture)](#1-what-is-fueltrack-the-big-picture)
2. [The Transparent Zero-Markup Pricing Model](#2-the-transparent-zero-markup-pricing-model)
3. [System Architecture (How It Works Under the Hood)](#3-system-architecture-how-it-works-under-the-hood)
4. [Step-by-Step: How to Run the Project (For Beginners)](#4-step-by-step-how-to-run-the-project-for-beginners)
5. [Demo Accounts & 1-Click Fast Login Cheatsheet](#5-demo-accounts--1-click-fast-login-cheatsheet)
6. [Detailed Walkthrough of Each Page](#6-detailed-walkthrough-of-each-page)
   - [A. Cyber-Glassmorphic Login Portal (`login.html`)](#a-cyber-glassmorphic-login-portal-loginhtml)
   - [B. Dedicated Customer Portal (`user-dashboard.html`)](#b-dedicated-customer-portal-user-dashboardhtml)
   - [C. Station Owner Master Operations Cockpit (`owner-dashboard.html`)](#c-station-owner-master-operations-cockpit-owner-dashboardhtml)
7. [Repository File Map (What Each File Does)](#7-repository-file-map-what-each-file-does)
8. [Beginner's Test Tour (8 Things to Try Right Now)](#8-beginners-test-tour-8-things-to-try-right-now)
9. [PowerPoint Presentation Deck Information](#9-powerpoint-presentation-deck-information)

---

## 1. 💡 What is FuelTrack? (The Big Picture)

**FuelTrack** is an IoT-enabled doorstep fuel delivery and petroleum depot management system. 

### ⛽ The Industry Problem
- **Time Lost in Queues**: Car owners, fleet drivers, and generator operators waste hours driving to and waiting in line at traditional petrol pumps.
- **Bulk Refueling Headaches**: Hospitals, luxury high-rises, and IT data centers rely on backup diesel generators (DG sets). Transporting fuel in jerry cans or barrels is illegal, unsafe, and leaks.
- **Hidden Aggregator Fees**: Existing delivery apps tack on surge pricing, hidden platform percentages, or distance markups.

### 🛡️ The FuelTrack Solution
- **Doorstep Convenience**: Certified mobile dispenser bowsers (mini-tankers) arrive directly at the customer's vehicle bay or generator room.
- **PESO Safety Standards**: 100% compliant with the Petroleum and Explosives Safety Organisation (PESO) — ATEX non-sparking flow-meters, static grounding clamps, and tamper-sealed hydrometer density tests.
- **Direct-to-Owner Feedback Loop**: Customers can raise grievance tickets directly to station owners and rate deliveries in real time.

---

## 2. 💎 The Transparent Zero-Markup Pricing Model

FuelTrack operates on a strictly transparent, deterministic pricing equation:

$$\mathbf{Total\ Payable} = (\mathbf{Litres} \times \mathbf{Official\ Govt\ Fuel\ Rate}) + \mathbf{₹50.00\ Flat\ Delivery\ Fee} + \mathbf{₹0.00\ Platform\ Markup}$$

### Real-World Example (35L Car Fill in Mumbai):
- $35\text{ Litres} \times ₹104.21\text{ (Official IOCL/BPCL Petrol Rate)} = ₹3,647.35$
- Flat Doorstep Delivery Fee = $₹50.00$
- Platform Markup / Surge = **$₹0.00$**
- **Total Amount Paid = $₹3,697.35$**

> **Rate Immutability Guarantee**: The exact government rate active at the millisecond an order is placed is frozen into the order ledger and tax invoice, immune to future rate fluctuations.

---

## 3. 🏛️ System Architecture (How It Works Under the Hood)

The entire backend and desktop application is written in **100% Pure Java SE (`FuelTrackApp.java`)**:

```
                       ┌──────────────────────────────────────────────┐
                       │          FuelTrackApp.jar (Java SE)          │
                       │  • Embedded HTTP Web Server (Port 5000)      │
                       │  • Native Java Swing Desktop Window          │
                       │  • In-Memory Relational State & Telemetry    │
                       └──────────────┬────────────────┬──────────────┘
                                      │                │
                     HTTP / JSON APIs │                │ Native GUI
                                      ▼                ▼
         ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
         │     Modern Multi-Page Web App    │   │      Desktop Swing Application   │
         │  • login.html                    │   │  • Login Card Preview            │
         │  • user-dashboard.html           │   │  • Customer Bay Window           │
         │  • owner-dashboard.html          │   │  • Owner Cockpit Window          │
         └──────────────────────────────────┘   └──────────────────────────────────┘
```

- **Zero Heavy Frameworks Required**: No complex Node.js or database server installations needed to run the core engine.
- **Embedded Web Engine**: Serves static pages and JSON APIs (`/api/complaints`, `/api/feedback`, `/api/orders`, `/api/tankers`, `/api/rates`) via Java's native `com.sun.net.httpserver.HttpServer`.
- **Dual Interface**: Use either the web browser interface or the native Java desktop window.

---

## 4. 🚀 Step-by-Step: How to Run the Project (For Beginners)

### Step 1: Verify Java Installation
Open your terminal (PowerShell or Command Prompt) and check if Java is installed:
```powershell
java -version
```
*(Requires Java 17 or higher. If not installed, download the free Oracle JDK or OpenJDK).*

### Step 2: Start FuelTrack
From the project folder, run the pre-packaged executable JAR:
```powershell
java -jar FuelTrackApp.jar
```
You will see the terminal banner:
```
============================================================================
  FUELTRACK MULTI-PAGE COMMAND ENGINE (PURE JAVA SE)
============================================================================
✓ FuelTrack Multi-Page Web Engine LIVE at: http://localhost:5000
✓ FuelTrack Multi-Page Desktop GUI Active!
```

### Step 3: Open in Your Web Browser
Open any modern web browser and go to:
- **Login Portal**: [http://localhost:5000/login.html](http://localhost:5000/login.html)
- **Customer Portal**: [http://localhost:5000/user-dashboard.html?demo=true](http://localhost:5000/user-dashboard.html?demo=true)
- **Station Owner Master Hub**: [http://localhost:5000/owner-dashboard.html?demo=true](http://localhost:5000/owner-dashboard.html?demo=true)

### Step 4 (Optional): Recompiling from Java Source Code
If you modify `FuelTrackApp.java`:
```powershell
# 1. Compile
javac -encoding UTF-8 FuelTrackApp.java

# 2. Package into JAR
powershell -Command "Set-Content -Path 'manifest.txt' -Value 'Main-Class: FuelTrackApp`r`n'; jar cfm FuelTrackApp.jar manifest.txt *.class"

# 3. Launch
java -jar FuelTrackApp.jar
```

---

## 5. 🔑 Demo Accounts & 1-Click Fast Login Cheatsheet

The project includes pre-populated demo credentials with rich mock data:

| Role | Name | Email | Password | What You Can See & Do |
| :--- | :--- | :--- | :--- | :--- |
| **⭐ VIP Demo Customer** | **Vikram Malhotra** | `demo@fueltrack.io` | `demo123` | • Active live GPS delivery (`TK-101` moving, Worli ETA 9 mins).<br>• Doorstep recurring subscription for Mercedes GLS 450.<br>• Fuel spend & net savings analytics.<br>• 4 order invoices with QR codes.<br>• Direct-to-owner grievance tickets.<br>• 5-star delivery reviews. |
| **👑 Master Owner Demo** | **Rajeshwar Singhania** | `demo.owner@fueltrack.io` | `demo123` | • Central Command HQ banner.<br>• 360° Fleet GPS radar & tanker telematics.<br>• 4 bulk storage tanks with ultrasonic level gauges.<br>• Customer grievance desk with retest/refund actions.<br>• CSAT wall with owner reply feature.<br>• Daily PESO compliance checklist & financial margins. |
| **Original Station Owner** | **Sanjay Mehta** | `owner@fueltrack.io` | `password123` | Standard station owner view for HPCL Central Terminal #402. |
| **Standard Customer** | **Ananya Deshmukh** | `customer@fueltrack.io` | `password123` | Standard customer account for Worli Sea Face with order booking slider. |

> **Pro Tip**: On `login.html`, simply click either gold button in the **⭐ VIP ALL-ACCESS DEMO ACCOUNTS** card at the bottom to jump right into the demo accounts with 1 click!

---

## 6. 🖥️ Detailed Walkthrough of Each Page

### A. 🎨 Cyber-Glassmorphic Login Portal (`login.html`)
- **Left Panel ("Dashboard Sneak Peek")**: An interactive preview window allowing users to toggle between `👤 Customer View` (showing live delivery speed, ETA, and tanker telemetry) and `👑 Owner Cockpit` (showing fleet status, storage reserves, and open tickets) before logging in.
- **Right Panel (Authentication Console)**:
  - Role switcher toggle between Customer Hub and Station Owner.
  - Floating inputs with password reveal eye button.
  - **1-Click VIP Demo Launchers** for instant one-touch entry.
- **Background**: Interactive HTML5 particle constellation canvas with ambient neon glow.

---

### B. 👤 Dedicated Customer Portal (`user-dashboard.html`)
- **Live In-Transit GPS Radar**:
  - Live animated SVG radar showing mobile tanker `TK-101` traveling to the customer bay.
  - Telemetry HUD: Speed (42.4 km/h), dynamic countdown ETA (11 mins), Pilot details (*Rajesh Kumar*), and delivery unlock PIN (`8 4 9 2`).
  - Emergency **Cancel Order** button.
- **Doorstep Recurring Fuel Subscription**:
  - *Executive Weekly Fill*: 40L Petrol delivered every Monday at 07:30 AM for vehicle `MH-01-VIP-7777`.
- **Fuel Spend & Net Savings Analytics**:
  - Summarizes total litres pumped (180L), money spent (₹17,842.50), and estimated net savings (₹1,250.00).
- **Multi-Order History & Tax Invoices**:
  - 4 complete orders across Petrol, Diesel, and CNG.
  - Click **View Tax Invoice** on any order to view an itemized GST invoice complete with digital QR verification code and density certificate reference.
- **🚨 Direct-to-Owner Grievance Redressal**:
  - Click **⚠️ Raise Open Grievance to Owner** to raise an issue regarding purity, meter auto-cutoff, or delays.
  - The ticket is immediately routed to the Station Owner's cockpit with tracking code (e.g. `FT-TKT-2026-8860`).
- **⭐ Verified Delivery Reviews**:
  - Rate completed deliveries (1–5 stars) and write comments that instantly publish to the owner's CSAT wall.

---

### C. 👑 Station Owner Master Operations Cockpit (`owner-dashboard.html`)
- **🛰️ Fleet GPS Radar Command**:
  - Real-time animated radar display tracking all 3 mobile tankers across Mumbai.
  - 1-Click transponder pinging, smart traffic re-routing, and **PESO Emergency Fleet E-STOP** shutoff.
- **🏭 Depot Bulk Storage Reserves**:
  - Ultrasonic liquid depth gauges for Petrol Tank 01, Diesel Tank 02, CNG Cascade, and Pune Reserve.
  - 1-Click **Bulk Pipeline Refill** decanting trigger.
- **📬 Customer Grievance Resolution Desk**:
  - Filter tabs: `All Tickets (5)`, `Open (1)`, `Investigating (2)`, `Resolved (2)` plus instant search bar.
  - **🔬 Retest**: Dispatches a mobile quality lab with a calibrated hydrometer to re-verify fuel density at 15°C.
  - **💳 Instant UPI Refund**: Issues a direct refund credit to customer UPI ID.
  - **📞 Call Customer**: Direct connection via owner telematics line.
  - **✅ Mark Resolved**: Enters official resolution notes sent to the customer.
- **⭐ Reviews & CSAT Intelligence Hub**:
  - Overall CSAT score: **4.95 / 5.0 ★** across 148 deliveries (5-Star: 94%, 4-Star: 5%, 3-Star: 1%, NPS: +88).
  - CSAT breakdown by product: Speed Petrol (4.96 ★), Diesel (4.94 ★), CNG (4.95 ★).
  - **💬 Interactive Owner Reply**: Click **"Add Station Owner Reply"** on any review to publish an official station response with an imperial gold crown badge (`👑 Official Station Owner Response`).
- **💰 Financial Margins & Daily PESO Safety Checklist**:
  - Accounting ledger: Gross Daily Sales (₹1,84,650.00), Wholesale Bulk Fuel Cost (-₹1,58,200.00), Delivery Fee Revenue (+₹14,200.00), Net Station Operating Margin (+₹26,450.00 / 14.3%).
  - Statutory daily safety inspection checklist with a **Sign & Certify Daily PESO Audit** button.
- **🏷️ Official Rates Management**:
  - Instant adjustments for government fuel rates and delivery fees.

---

## 7. 📁 Repository File Map (What Each File Does)

| File / Folder | Role & Description |
| :--- | :--- |
| [`FuelTrackApp.java`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrackApp.java) | **Core Pure Java SE Backend & GUI**: Single-file master application containing the embedded HTTP server, REST APIs, in-memory database, seed demo data, and Swing GUI. |
| [`FuelTrackApp.jar`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrackApp.jar) | **Compiled Executable JAR**: Runnable binary that serves the web portals and displays the desktop GUI window. |
| [`login.html`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/login.html) | **Login Web Portal**: Dual-column glassmorphic auth page with interactive sneak-peek dashboard preview and 1-click VIP demo launchers. |
| [`user-dashboard.html`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/user-dashboard.html) | **Customer Portal**: Dedicated standalone page for customers featuring live GPS radar, subscription cards, tax invoices, grievances, and feedback. |
| [`owner-dashboard.html`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/owner-dashboard.html) | **Station Owner Cockpit**: Dedicated standalone page for station owners featuring fleet radar, bulk storage, complaints desk, reviews with owner replies, and financials. |
| [`FuelTrack_Complete_Project_Presentation.pptx`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrack_Complete_Project_Presentation.pptx) | **PowerPoint Presentation**: 16-slide professional slide deck covering the business model, PESO safety compliance, architecture, and roadmap. |
| [`README.md`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/README.md) | **Master Documentation**: Complete beginner's guide and reference manual (this document). |
| [`.gitignore`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/.gitignore) | Git exclusion rules for clean repository state. |

---

## 8. 🧪 Beginner's Test Tour (8 Things to Try Right Now)

Follow these 8 steps to experience the complete functionality of FuelTrack:

1. **Launch the Demo Customer**:
   - Open [http://localhost:5000/login.html](http://localhost:5000/login.html).
   - Scroll to the gold card at the bottom and click **⭐ VIP Demo Customer (Vikram Malhotra)**.
2. **Observe the Moving Tanker**:
   - On the customer dashboard, watch tanker `TK-101` pulsing and moving toward the customer bay on the live radar.
3. **Inspect a Digital Invoice**:
   - Scroll down to the **Order History & Certified Invoices** table.
   - Click **View Invoice** on order `#FT-ORD-2026-9901` to see the itemized GST breakdown and verification QR code.
4. **Raise a Grievance Ticket**:
   - Click **⚠️ Raise Grievance to Owner** in the navbar.
   - Select *Density / Purity Suspicion*, enter a note, and click Submit. Note the generated ticket number.
5. **Switch to the Station Owner Cockpit**:
   - Open [http://localhost:5000/owner-dashboard.html?demo=true](http://localhost:5000/owner-dashboard.html?demo=true).
6. **Act on the Complaint**:
   - Click the **📬 Customer Grievance Desk** tab.
   - Click **Retest** to dispatch a quality inspector, or **Resolve** to enter owner resolution notes.
7. **Reply to a Customer Review**:
   - Click the **⭐ Reviews & CSAT Wall** tab.
   - On Vikram Malhotra's review, click **Add Station Owner Reply**, type a message, and click OK. Observe the official crown reply badge appear immediately.
8. **Inspect Financial Margins & Safety**:
   - Click the **💰 Revenue & Safety Audit** tab to review the daily operating profit margin (+₹26,450.00) and click **Sign & Certify Daily PESO Audit**.

---

## 9. 📊 PowerPoint Presentation Deck Information

The repository includes a ready-to-present PowerPoint deck:
- **File**: `FuelTrack_Complete_Project_Presentation.pptx`
- **Slide Count**: 16 professional slides.
- **Topics Covered**:
  1. Executive Summary & Vision
  2. Industry Problem (Pump queues & hazardous jerry cans)
  3. The Zero-Markup Pricing Model
  4. PESO Safety & Regulatory Compliance
  5. Multi-Page Architecture (Separated Portals)
  6. Live GPS Fleet Radar Telematics
  7. Bulk Depot Storage & Ultrasonic Gauging
  8. IoT Dispensing & ATEX Calibration
  9. Customer Grievance Redressal Pipeline
  10. Customer Satisfaction (CSAT) Intelligence
  11. Revenue & Financial Unit Economics
  12. Mobile Bowser Specifications (Tata, Ashok Leyland, BharatBenz)
  13. Security, Density Certificates & Digital Invoicing
  14. Target Customer Segments (Residential, Fleet, IT SEZ, Agriculture)
  15. Growth Roadmap & Scale Strategy
  16. Q&A and Demo Access URLs

---

## 💬 Summary & Need Help?
- **Backend Language**: 100% Pure Java SE (JDK 17+).
- **Default Port**: `5000` (e.g. `http://localhost:5000/login.html`).
- **Execution Command**: `java -jar FuelTrackApp.jar`.
