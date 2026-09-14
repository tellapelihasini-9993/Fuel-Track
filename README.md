# ⛽ FuelTrack — Complete 100% Pure Java Project

> **Zero-Hidden-Fee Doorstep Fuel Delivery & Operations Command Center**  
> Built entirely in **100% Pure Java SE** with Native Swing Desktop GUI, In-Memory Telematics Engine, and Embedded HTTP Command Server.

[![Language: Java](https://img.shields.io/badge/Language-Java%20100%25-b07219.svg)](https://github.com/tellapelihasini-9993/Fuel-Track)
[![Zero Hidden Fees](https://img.shields.io/badge/Platform%20Markup-%E2%82%B90.00-10b981.svg)](https://github.com/tellapelihasini-9993/Fuel-Track)
[![PESO-Ready Workflow](https://img.shields.io/badge/PESO-Ready%20Workflow-ff6b00.svg)](https://github.com/tellapelihasini-9993/Fuel-Track)
[![Desktop GUI](https://img.shields.io/badge/GUI-Java%20Swing%20%28CardLayout%29-0ea5e9.svg)](https://github.com/tellapelihasini-9993/Fuel-Track)
[![Verified CSAT](https://img.shields.io/badge/CSAT-4.95%20%2F%205.0%20%E2%98%85-eab308.svg)](https://github.com/tellapelihasini-9993/Fuel-Track)

---

## 📑 Table of Contents
1. [Overview & Project Goal](#1-overview--project-goal)
2. [The Transparent Zero-Markup Pricing Model](#2-the-transparent-zero-markup-pricing-model)
3. [Architecture: 100% Pure Java SE](#3-architecture-100-pure-java-se)
4. [How to Run the Project (Step-by-Step)](#4-how-to-run-the-project-step-by-step)
5. [Native Desktop GUI Features (Swing)](#5-native-desktop-gui-features-swing)
6. [Embedded Java HTTP & REST APIs](#6-embedded-java-http--rest-apis)
7. [Repository File Map](#7-repository-file-map)
8. [PowerPoint Presentation & Documentation](#8-powerpoint-presentation--documentation)

---

## 1. 💡 Overview & Project Goal

**FuelTrack** is an IoT-enabled doorstep fuel delivery and petroleum depot management system developed exclusively in the **Java programming language**.

### ⛽ The Industry Problem
- **Time Lost in Pump Queues**: Millions of commuters and commercial drivers waste productive hours waiting at traditional filling stations.
- **Dangerous Jerry Cans**: Residential societies, hospitals, and IT SEZs transport diesel for backup generators in hazard-prone barrels and jerry cans.
- **Hidden Surge Charges**: Existing delivery aggregators inflate retail prices or add opaque convenience markups.

### 🛡️ The FuelTrack Solution
- **Doorstep Dispensing**: Specially certified mobile dispensers (mini-tankers) deliver certified fuel directly to customer vehicle bays.
- **PESO Regulatory Compliance**: Compliant with Petroleum and Explosives Safety Organisation (PESO) safety guidelines: ATEX non-sparking flow meters, static earthing clamps, and digital density verification at 15°C.
- **100% Pure Java Architecture**: Contains the desktop GUI, business logic, relational mock database, telematics simulator, and embedded server inside pure Java.

---

## 2. 💎 The Transparent Zero-Markup Pricing Model

FuelTrack calculates pricing using a deterministic, transparent formula:

$$\mathbf{Total\ Payable} = (\mathbf{Litres} \times \mathbf{Official\ Govt\ Fuel\ Rate}) + \mathbf{₹50.00\ Flat\ Delivery\ Fee} + \mathbf{₹0.00\ Platform\ Markup}$$

### Real-World Example (35L Car Fill in Mumbai):
- $35\text{ Litres} \times ₹104.21\text{ (Official IOCL/BPCL Petrol Rate)} = ₹3,647.35$
- Flat Doorstep Delivery Fee = $₹50.00$
- Platform Markup / Surge = **$₹0.00$**
- **Total Amount Paid = $₹3,697.35$**

---

## 3. 🏛️ Architecture: 100% Pure Java SE

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FuelTrackApp (100% Pure Java SE)                  │
│                                                                        │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │   Native Java Swing GUI        │  │ Embedded Java HTTP Server  │   │
│   │   • CardLayout Navigation      │  │ • Port 5000 / 8080         │   │
│   │   • Dedicated Login Screen     │  │ • Self-Contained Dashboard │   │
│   │   • Customer Portal            │  │ • REST JSON Endpoints      │   │
│   │   • Station Owner Cockpit      │  │ • Zero External Frameworks │   │
│   └───────────────┬────────────────┘  └─────────────┬──────────────┘   │
│                   │                                 │                  │
│                   ▼                                 ▼                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │         In-Memory Relational State & Telematics Engine         │   │
│   │  • Fleet Bowsers (TK-101, TK-102, TK-103)                      │   │
│   │  • Orders, Invoices, Fuel Tanks, Rates, Grievances, Feedback   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Zero Heavy Frameworks**: No Node.js, npm, Python, or external database server required.
- **Self-Contained Executable**: Runs on any operating system with Java 17+ via `FuelTrackApp.jar` or `FuelTrackApp.java`.

---

## 4. 🚀 How to Run the Project (Step-by-Step)

### Prerequisites
Make sure you have **Java 17 or higher** installed:
```bash
java -version
```

### Option A: Run the Pre-compiled Executable JAR (Easiest)
Double-click `FuelTrackApp.jar` or run in terminal:
```bash
java -jar FuelTrackApp.jar
```

### Option B: Compile and Run from Java Source
```bash
# 1. Compile Java source
javac -encoding UTF-8 FuelTrackApp.java

# 2. Run the Java application
java FuelTrackApp
```

### Option C: Windows 1-Click Launchers
Double-click [`start-localhost.bat`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/start-localhost.bat) or run [`start-localhost.ps1`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/start-localhost.ps1) in PowerShell.

---

## 5. 🖥️ Native Desktop GUI Features (Swing)

When launched, FuelTrack displays a high-DPI Java Swing Desktop application styled with an Obsidian Dark theme:

1. **Card 1: Dedicated Login Window**:
   - Customer and Station Owner login tabs.
   - 1-Click VIP Demo launchers (Vikram Malhotra / Station Owner).
2. **Card 2: Customer Delivery Portal**:
   - Order placement with fuel volume slider and live price calculation.
   - Interactive SVG GPS Telematics Radar tracking tanker `TK-101`.
   - Order history with itemized GST invoices and QR density verification.
   - Customer grievance submission desk and driver rating stars.
3. **Card 3: Station Owner Master Cockpit**:
   - Real-time fleet tracking table (speed, tank temperature, ATEX nozzle calibration).
   - Depot bulk storage liquid level gauges (Ultrasonic telemetry).
   - Customer grievance redressal desk with re-test and resolution actions.
   - CSAT reviews with official station owner reply badges.
   - Daily financial operating margin ledger and PESO safety compliance check.

---

## 6. ⚡ Embedded Java HTTP & REST APIs

While running, FuelTrack also hosts a native Java HTTP server on `http://localhost:5000/`:

- **Web Status Dashboard**: [http://localhost:5000/](http://localhost:5000/)
- **Tankers Telematics API**: [http://localhost:5000/api/tankers](http://localhost:5000/api/tankers)
- **Live Fuel Rates API**: [http://localhost:5000/api/rates](http://localhost:5000/api/rates)
- **Orders Ledger API**: [http://localhost:5000/api/orders](http://localhost:5000/api/orders)
- **Depot Tanks API**: [http://localhost:5000/api/tanks](http://localhost:5000/api/tanks)
- **Grievance Redressal API**: [http://localhost:5000/api/complaints](http://localhost:5000/api/complaints)
- **Customer Feedback API**: [http://localhost:5000/api/feedback](http://localhost:5000/api/feedback)

---

## 7. 📁 Repository File Map

| File | Role & Description |
| :--- | :--- |
| [`FuelTrackApp.java`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrackApp.java) | **Core Java Application**: Standalone master Java program containing Desktop GUI, In-Memory Models, and Embedded Server. |
| [`FuelTrackApp.jar`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrackApp.jar) | **Executable Binary**: Compiled JAR package ready to run on any machine with Java. |
| [`FuelTrack_Complete_Project_Presentation.pptx`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/FuelTrack_Complete_Project_Presentation.pptx) | **Project Presentation**: 16-slide PowerPoint presentation deck for evaluations and project viva. |
| [`Java_Mini_Project_Plan.pdf`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/Java_Mini_Project_Plan.pdf) | **Project Documentation PDF**: Formal academic project report and plan. |
| [`PPT_SLIDES.md`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/PPT_SLIDES.md) | Slide-by-slide speaker notes and content guide. |
| [`README.md`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/README.md) | Master repository documentation. |
| [`.gitattributes`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/.gitattributes) | Configures GitHub Linguist to detect repository as **100% Java**. |
| [`start-localhost.bat`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/start-localhost.bat) | Windows 1-click batch launcher. |
| [`start-localhost.ps1`](file:///c:/Users/udayk/OneDrive/Documents/Fuleproject/start-localhost.ps1) | Windows PowerShell launcher script. |

---

## 8. 📊 PowerPoint Presentation & Documentation

The project includes an evaluation-ready presentation and documentation:
- **Presentation**: `FuelTrack_Complete_Project_Presentation.pptx` (16 professional slides)
- **Topics**: Zero-Markup economics, PESO statutory compliance, Java Swing Architecture, IoT dispensing, and fleet telematics.
