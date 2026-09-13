import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import java.awt.*;
import java.awt.geom.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ============================================================================
 * FuelTrack — Zero-Hidden-Fee Doorstep Fuel Delivery & Operations Center
 * 100% Pure Java Desktop Application & Multi-Page Web Engine
 * Dedicated Pages: Login Page • Customer Portal • Station Owner Master Hub
 * Persistent Settings At Any Time • Full Owner Master Access
 * ============================================================================
 */
public class FuelTrackApp extends JFrame {

    public static final String APP_NAME = "FuelTrack Multi-Page Command Engine";
    public static final String APP_VERSION = "2.2.0 (Pure Java SE)";
    public static final int DEFAULT_PORT = 5000;
    public static final int FALLBACK_PORT = 8080;
    private static int activePort = DEFAULT_PORT;
    private static HttpServer httpServer;

    // CardLayout page identifiers for the Desktop GUI
    private static final String PAGE_LOGIN = "PAGE_LOGIN";
    private static final String PAGE_CUSTOMER = "PAGE_CUSTOMER";
    private static final String PAGE_OWNER = "PAGE_OWNER";

    // Modern Deep Obsidian & Neon Accent Color Palette
    public static final Color COLOR_BG = new Color(8, 12, 20);
    public static final Color COLOR_SURFACE = new Color(18, 25, 38);
    public static final Color COLOR_SURFACE_ALT = new Color(24, 34, 52);
    public static final Color COLOR_BORDER = new Color(45, 55, 72);
    public static final Color COLOR_PRIMARY = new Color(14, 165, 233);      // Sky Blue
    public static final Color COLOR_PRIMARY_HOVER = new Color(56, 189, 248);
    public static final Color COLOR_ACCENT = new Color(249, 115, 22);       // Flame Orange
    public static final Color COLOR_GOLD = new Color(245, 158, 11);         // Owner Amber Gold
    public static final Color COLOR_SUCCESS = new Color(16, 185, 129);      // Emerald Green
    public static final Color COLOR_DANGER = new Color(239, 68, 68);        // Crimson
    public static final Color COLOR_TEXT_PRIMARY = new Color(248, 250, 252);
    public static final Color COLOR_TEXT_SECONDARY = new Color(148, 163, 184);

    // ========================================================================
    // 1. DATA MODELS
    // ========================================================================
    public static class User {
        public String id, name, email, password, role, phone, address, defaultVehicle;
        public User(String id, String name, String email, String password, String role, String phone, String address, String veh) {
            this.id = id; this.name = name; this.email = email; this.password = password; this.role = role;
            this.phone = phone; this.address = address; this.defaultVehicle = veh;
        }
    }

    public static class Depot {
        public String id, name, code, city, address;
        public double latitude, longitude;
        public Depot(String id, String name, String code, String city, double lat, double lon, String address) {
            this.id = id; this.name = name; this.code = code; this.city = city; this.latitude = lat; this.longitude = lon; this.address = address;
        }
    }

    public static class Tanker {
        public String id, code, name, fuelType, status, destination, driverId, depotId;
        public double capacityLitres, currentLitres, speedKmh, latitude, longitude, tankTempC, nozzleCalibrationPct;
        public int etaMinutes;

        public Tanker(String id, String code, String name, String fuelType, double capacity, double current,
                      String status, double speed, double lat, double lon, String dest, int eta,
                      double temp, double calib, String driverId, String depotId) {
            this.id = id; this.code = code; this.name = name; this.fuelType = fuelType;
            this.capacityLitres = capacity; this.currentLitres = current; this.status = status;
            this.speedKmh = speed; this.latitude = lat; this.longitude = lon; this.destination = dest;
            this.etaMinutes = eta; this.tankTempC = temp; this.nozzleCalibrationPct = calib;
            this.driverId = driverId; this.depotId = depotId;
        }
    }

    public static class FuelTank {
        public String id, depotId, fuelType, sensorStatus, lastRefillAt;
        public double maxCapacityLitres, currentQuantityLitres, minSafetyThresholdPct, lastSensorReading;

        public FuelTank(String id, String depotId, String fuelType, double maxCap, double curQty,
                        double threshold, double reading, String status, String lastRefill) {
            this.id = id; this.depotId = depotId; this.fuelType = fuelType; this.maxCapacityLitres = maxCap;
            this.currentQuantityLitres = curQty; this.minSafetyThresholdPct = threshold;
            this.lastSensorReading = reading; this.sensorStatus = status; this.lastRefillAt = lastRefill;
        }
    }

    public static class FuelRate {
        public String id, city, fuelType, effectiveDate;
        public double ratePerLitre, deliveryFee, platformMarkup;

        public FuelRate(String id, String city, String fuelType, double rate, double fee, double markup, String date) {
            this.id = id; this.city = city; this.fuelType = fuelType; this.ratePerLitre = rate;
            this.deliveryFee = fee; this.platformMarkup = markup; this.effectiveDate = date;
        }
    }

    public static class Order {
        public String id, orderNumber, customerId, depotId, tankerId, driverId, fuelType, status;
        public String deliveryAddress, vehiclePreset, vehicleRegNumber, paymentMethod, paymentStatus;
        public double quantityLitres, fuelRateAtOrder, fuelSubtotal, deliveryFee, platformMarkup, totalAmount;
        public int estimatedDeliveryMinutes;
        public String createdAt, updatedAt;
    }

    public static class Invoice {
        public String id, invoiceNumber, orderId, customerName, customerAddress, customerPhone, fuelType;
        public String tankerCode, densityCertificateRef, qrCodePayload, status, deliveryTimestamp, createdAt;
        public double quantityRequested, quantityDelivered, ratePerLitre, fuelSubtotal, deliveryFee, platformMarkup, totalAmount;
    }

    public static class AuditLog {
        public String id, userId, action, entityType, entityId, details, ipAddress, createdAt;
        public AuditLog(String id, String userId, String action, String entityType, String entityId, String details, String ip, String at) {
            this.id = id; this.userId = userId; this.action = action; this.entityType = entityType;
            this.entityId = entityId; this.details = details; this.ipAddress = ip; this.createdAt = at;
        }
    }

    public static class Complaint {
        public String id, ticketNumber, customerId, customerName, customerPhone, category, description, priority, status, resolutionNotes, createdAt;
        public Complaint(String id, String ticketNumber, String customerId, String customerName, String customerPhone, String category, String description, String priority, String status, String resolutionNotes, String createdAt) {
            this.id = id; this.ticketNumber = ticketNumber; this.customerId = customerId; this.customerName = customerName;
            this.customerPhone = customerPhone; this.category = category; this.description = description; this.priority = priority;
            this.status = status; this.resolutionNotes = resolutionNotes; this.createdAt = createdAt;
        }
    }

    public static class DeliveryFeedback {
        public String id, orderNumber, customerName, driverName, comment, createdAt;
        public int rating;
        public DeliveryFeedback(String id, String orderNumber, String customerName, int rating, String driverName, String comment, String createdAt) {
            this.id = id; this.orderNumber = orderNumber; this.customerName = customerName; this.rating = rating;
            this.driverName = driverName; this.comment = comment; this.createdAt = createdAt;
        }
    }

    // ========================================================================
    // 2. REPOSITORY & IN-MEMORY STATE
    // ========================================================================
    public static final Map<String, User> USERS = new ConcurrentHashMap<>();
    public static final Map<String, Depot> DEPOTS = new ConcurrentHashMap<>();
    public static final Map<String, Tanker> TANKERS = new ConcurrentHashMap<>();
    public static final Map<String, FuelTank> FUEL_TANKS = new ConcurrentHashMap<>();
    public static final Map<String, FuelRate> FUEL_RATES = new ConcurrentHashMap<>();
    public static final Map<String, Order> ORDERS = new ConcurrentHashMap<>();
    public static final Map<String, Invoice> INVOICES = new ConcurrentHashMap<>();
    public static final Map<String, Complaint> COMPLAINTS = new ConcurrentHashMap<>();
    public static final Map<String, DeliveryFeedback> FEEDBACKS = new ConcurrentHashMap<>();
    public static final List<AuditLog> AUDIT_LOGS = new CopyOnWriteArrayList<>();

    private static final AtomicLong orderCounter = new AtomicLong(1001);
    private static final AtomicLong invoiceCounter = new AtomicLong(1);
    private static final AtomicLong auditCounter = new AtomicLong(1);
    private static final AtomicLong ticketCounter = new AtomicLong(8830);

    private static void seedDatabase() {
        USERS.put("usr-cust-01", new User("usr-cust-01", "Ananya Deshmukh", "customer@fueltrack.io", "password123", "customer", "+91 98201 12345", "Flat 402, Sea Green Apts, Worli Sea Face, Mumbai", "MH-01-AB-4020"));
        USERS.put("usr-stat-01", new User("usr-stat-01", "Sanjay Mehta", "owner@fueltrack.io", "password123", "owner", "+91 98203 34567", "Depot Headquarters, Sion Petro Zone, Mumbai", "MH-01-OWNER-01"));

        // Official VIP Demo Accounts (Pre-loaded with maximum data & features)
        USERS.put("usr-demo-cust", new User("usr-demo-cust", "Vikram Malhotra (VIP Demo)", "demo@fueltrack.io", "demo123", "customer", "+91 98200 99999", "Penthouse 12B, Lodha Bellissimo, Mahalaxmi, Mumbai", "MH-01-VIP-7777 (Mercedes GLS 450)"));
        USERS.put("usr-demo-owner", new User("usr-demo-owner", "Rajeshwar Singhania (Master Owner Demo)", "demo.owner@fueltrack.io", "demo123", "owner", "+91 98201 88888", "Central Command Terminal HQ, Sion Petro Complex, Mumbai", "MH-01-CMD-001"));

        COMPLAINTS.put("tkt-8812", new Complaint("tkt-8812", "FT-TKT-2026-8812", "usr-cust-01", "Ananya Deshmukh", "+91 98201 12345", "Density Verification", "Requested secondary density retest on Flat 402 delivery to cross-verify temperature compensation.", "HIGH", "INVESTIGATING", "Inspector Rajesh Kumar assigned with portable hydrometer.", "2026-09-12 14:30"));
        COMPLAINTS.put("tkt-8824", new Complaint("tkt-8824", "FT-TKT-2026-8824", "usr-cust-01", "Rahul Sharma", "+91 98200 88219", "Meter Dispute", "Nozzle auto-cutoff occurred early at 34.2L instead of 35L. Inquired about ₹83.36 refund credit.", "MEDIUM", "OPEN", "Awaiting owner resolution.", "2026-09-12 15:10"));
        COMPLAINTS.put("tkt-8830", new Complaint("tkt-8830", "FT-TKT-2026-8830", "usr-demo-cust", "Vikram Malhotra (VIP Demo)", "+91 98200 99999", "Density Verification", "Requested secondary hydrometer density audit on 45L Petrol delivery.", "HIGH", "RESOLVED", "PESO mobile quality lab retested density at 742.8 kg/m³. 100% compliant.", "2026-09-12 11:15"));
        COMPLAINTS.put("tkt-8845", new Complaint("tkt-8845", "FT-TKT-2026-8845", "usr-demo-cust", "Vikram Malhotra (VIP Demo)", "+91 98200 99999", "Meter Dispute", "Inquired about 0.8L auto cutoff differential on backup diesel generator.", "MEDIUM", "RESOLVED", "Instant UPI refund of ₹83.36 credited to customer UPI ID. Ref: UPI-REF-9921.", "2026-09-12 13:40"));
        COMPLAINTS.put("tkt-8860", new Complaint("tkt-8860", "FT-TKT-2026-8860", "usr-demo-cust", "Vikram Malhotra (VIP Demo)", "+91 98200 99999", "Express Routing Priority", "Urgent fuel fill needed before airport departure; requested emergency siren routing.", "HIGH", "INVESTIGATING", "Tanker TK-101 diverted via Senapati Bapat Marg. ETA reduced to 8 minutes.", "2026-09-12 15:45"));

        FEEDBACKS.put("fb-01", new DeliveryFeedback("fb-01", "FT-ORD-2026-1001", "Ananya Deshmukh", 5, "Rajesh Kumar (TK-101)", "Super fast doorstep delivery! Rajesh showed me the PESO seal before opening the nozzle. Exactly 35.0 Litres dispensed with zero odor.", "2026-09-12 15:20"));
        FEEDBACKS.put("fb-02", new DeliveryFeedback("fb-02", "FT-ORD-2026-0994", "Vikramaditya Rao", 5, "Amit Patel (TK-102)", "Filled our backup diesel generator seamlessly. Meter was digital and computerized. No platform markup paid!", "2026-09-12 13:45"));
        FEEDBACKS.put("fb-03", new DeliveryFeedback("fb-03", "FT-ORD-2026-1002", "Vikram Malhotra (VIP Demo)", 5, "Rajesh Kumar (TK-101)", "World-class doorstep refueling experience! Driver arrived in certified fire-retardant gear, verified the tamper seal on his tablet, and computerized nozzle flowed at exactly 45 L/min.", "2026-09-12 14:10"));
        FEEDBACKS.put("fb-04", new DeliveryFeedback("fb-04", "FT-ORD-2026-1003", "Vikram Malhotra (VIP Demo)", 5, "Amit Patel (TK-102)", "Filled our Penthouse diesel generator with zero odor and zero mess. Official pump rate applied with zero platform surcharge.", "2026-09-12 12:25"));

        DEPOTS.put("depot-01", new Depot("depot-01", "Mumbai Central Hub", "DEP-MUM-01", "Mumbai", 19.0760, 72.8777, "Plot 42, Sion Petro Zone, Mumbai 400022"));
        DEPOTS.put("depot-02", new Depot("depot-02", "Pune Fleet Terminal", "DEP-PUN-01", "Pune", 18.5204, 73.8567, "Sector 18, Hadapsar Industrial Area, Pune 411028"));

        TANKERS.put("tnk-101", new Tanker("tnk-101", "TK-101", "TK-101 Mumbai Express", "DIESEL", 4000.0, 3450.0, "AVAILABLE", 0.0, 19.0820, 72.8830, "BKC Standby", 0, 24.2, 99.99, "usr-driv-01", "depot-01"));
        TANKERS.put("tnk-102", new Tanker("tnk-102", "TK-102", "TK-102 Pune Fleet", "PETROL", 3500.0, 2800.0, "IN_TRANSIT", 42.5, 18.5310, 73.8640, "Viman Nagar", 14, 23.8, 99.98, "usr-driv-01", "depot-02"));
        TANKERS.put("tnk-103", new Tanker("tnk-103", "TK-103", "TK-103 Highway Unit", "DIESEL", 5000.0, 4200.0, "AVAILABLE", 0.0, 19.1100, 72.9100, "Eastern Express", 0, 24.5, 100.00, null, "depot-01"));

        FUEL_TANKS.put("tank-mum-petrol", new FuelTank("tank-mum-petrol", "depot-01", "PETROL", 10000.0, 8450.0, 25.0, 8450.0, "ONLINE", "2026-09-12 10:00"));
        FUEL_TANKS.put("tank-mum-diesel", new FuelTank("tank-mum-diesel", "depot-01", "DIESEL", 15000.0, 12800.0, 25.0, 12800.0, "ONLINE", "2026-09-12 11:30"));
        FUEL_TANKS.put("tank-mum-cng", new FuelTank("tank-mum-cng", "depot-01", "CNG", 8000.0, 6200.0, 25.0, 6200.0, "ONLINE", "2026-09-12 09:15"));
        FUEL_TANKS.put("tank-pun-diesel", new FuelTank("tank-pun-diesel", "depot-02", "DIESEL", 15000.0, 11400.0, 25.0, 11400.0, "ONLINE", "2026-09-12 14:00"));

        String today = LocalDate.now().toString();
        FUEL_RATES.put("rate-mum-petrol", new FuelRate("rate-mum-petrol", "Mumbai", "PETROL", 104.21, 50.00, 0.00, today));
        FUEL_RATES.put("rate-mum-diesel", new FuelRate("rate-mum-diesel", "Mumbai", "DIESEL", 92.15, 50.00, 0.00, today));
        FUEL_RATES.put("rate-mum-cng", new FuelRate("rate-mum-cng", "Mumbai", "CNG", 86.50, 50.00, 0.00, today));
        FUEL_RATES.put("rate-pun-petrol", new FuelRate("rate-pun-petrol", "Pune", "PETROL", 103.95, 50.00, 0.00, today));
        FUEL_RATES.put("rate-pun-diesel", new FuelRate("rate-pun-diesel", "Pune", "DIESEL", 91.80, 50.00, 0.00, today));
        FUEL_RATES.put("rate-pun-cng", new FuelRate("rate-pun-cng", "Pune", "CNG", 85.90, 50.00, 0.00, today));

        createOrderAndInvoice("usr-cust-01", "PETROL", "Mumbai", 35.0, "Flat 402, Palms Residency, Bandra West, Mumbai", "MH-02-DZ-4040", "CAR");
        // VIP Demo Account Orders
        createOrderAndInvoice("usr-demo-cust", "PETROL", "Mumbai", 45.0, "Penthouse 12B, Lodha Bellissimo, Mahalaxmi, Mumbai", "MH-01-VIP-7777", "LUXURY_CAR");
        createOrderAndInvoice("usr-demo-cust", "DIESEL", "Mumbai", 60.0, "Penthouse 12B, Generator Bay 3, Mahalaxmi, Mumbai", "GEN-MH-01", "GENERATOR");
        createOrderAndInvoice("usr-demo-cust", "PETROL", "Mumbai", 25.0, "Penthouse 12B, Bay 1, Mahalaxmi, Mumbai", "MH-01-VIP-8888", "SUV");
        createOrderAndInvoice("usr-demo-cust", "CNG", "Mumbai", 18.0, "Commercial Bay 4, Lower Parel, Mumbai", "MH-01-CNG-1010", "FLEET_VAN");

        AUDIT_LOGS.add(new AuditLog("aud-" + auditCounter.getAndIncrement(), "system", "SYSTEM_STARTUP", "engine", "all", "Multi-page engine initialized with User, Owner & VIP Demo accounts", "127.0.0.1", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
    }

    public static synchronized Order createOrderAndInvoice(String customerId, String fuelType, String city, double litres, String address, String regNumber, String vehiclePreset) {
        String rateKey = "rate-" + city.toLowerCase().substring(0, 3) + "-" + fuelType.toLowerCase();
        FuelRate rate = FUEL_RATES.get(rateKey);
        double ratePerLitre = rate != null ? rate.ratePerLitre : 104.21;
        double deliveryFee = 50.00;
        double platformMarkup = 0.00;
        double fuelSubtotal = litres * ratePerLitre;
        double totalAmount = fuelSubtotal + deliveryFee + platformMarkup;

        Order ord = new Order();
        ord.id = "ord-" + UUID.randomUUID().toString().substring(0, 8);
        ord.orderNumber = "FT-ORD-2026-" + orderCounter.getAndIncrement();
        ord.customerId = customerId;
        ord.depotId = city.equalsIgnoreCase("Mumbai") ? "depot-01" : "depot-02";
        ord.tankerId = fuelType.equalsIgnoreCase("PETROL") ? "tnk-102" : "tnk-101";
        ord.driverId = "usr-driv-01";
        ord.fuelType = fuelType.toUpperCase();
        ord.quantityLitres = litres;
        ord.fuelRateAtOrder = ratePerLitre;
        ord.fuelSubtotal = fuelSubtotal;
        ord.deliveryFee = deliveryFee;
        ord.platformMarkup = platformMarkup;
        ord.totalAmount = totalAmount;
        ord.status = "DISPATCHED";
        ord.deliveryAddress = address;
        ord.vehiclePreset = vehiclePreset;
        ord.vehicleRegNumber = regNumber;
        ord.estimatedDeliveryMinutes = 15;
        ord.paymentMethod = "UPI";
        ord.paymentStatus = "PAID";
        ord.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        ord.updatedAt = ord.createdAt;
        ORDERS.put(ord.id, ord);

        Invoice inv = new Invoice();
        inv.id = "inv-" + UUID.randomUUID().toString().substring(0, 8);
        inv.invoiceNumber = "FT-INV-2026-00" + invoiceCounter.getAndIncrement();
        inv.orderId = ord.id;
        User cust = USERS.get(customerId);
        inv.customerName = cust != null ? cust.name : "Customer";
        inv.customerAddress = ord.deliveryAddress;
        inv.customerPhone = cust != null ? cust.phone : "+91 98201 12345";
        inv.fuelType = ord.fuelType;
        inv.quantityRequested = ord.quantityLitres;
        inv.quantityDelivered = ord.quantityLitres;
        inv.ratePerLitre = ord.fuelRateAtOrder;
        inv.fuelSubtotal = ord.fuelSubtotal;
        inv.deliveryFee = ord.deliveryFee;
        inv.platformMarkup = ord.platformMarkup;
        inv.totalAmount = ord.totalAmount;
        inv.tankerCode = ord.tankerId.equals("tnk-102") ? "TK-102" : "TK-101";
        inv.densityCertificateRef = "PESO-CERT-MUM-2026-8831 (742.8 kg/m³ @ 15°C)";
        inv.qrCodePayload = "FT-QR-VERIFY:" + ord.orderNumber + ":TOTAL" + ord.totalAmount;
        inv.status = "PAID";
        inv.deliveryTimestamp = ord.createdAt;
        inv.createdAt = ord.createdAt;
        INVOICES.put(inv.id, inv);

        AUDIT_LOGS.add(new AuditLog("aud-" + auditCounter.getAndIncrement(), customerId, "ORDER_CREATED", "order", ord.id,
                String.format(Locale.US, "Order %s placed: %.1fL %s @ ₹%.2f/L + ₹50 fee. Total: ₹%.2f", ord.orderNumber, litres, fuelType, ratePerLitre, totalAmount),
                "127.0.0.1", ord.createdAt));

        return ord;
    }

    // ========================================================================
    // 3. BACKGROUND TELEMATICS SIMULATOR
    // ========================================================================
    private static void startTelematicsEngine(Runnable onUpdateUi) {
        ScheduledExecutorService s = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "FuelTrack-Telematics");
            t.setDaemon(true);
            return t;
        });

        s.scheduleAtFixedRate(() -> {
            try {
                for (Tanker t : TANKERS.values()) {
                    if ("IN_TRANSIT".equalsIgnoreCase(t.status)) {
                        t.speedKmh = 35.0 + Math.random() * 12.0;
                        if (t.etaMinutes > 1) t.etaMinutes--;
                    } else {
                        t.speedKmh = 0.0;
                    }
                    t.tankTempC = Math.round((24.0 + (Math.random() * 1.0)) * 10.0) / 10.0;
                }
                if (onUpdateUi != null) SwingUtilities.invokeLater(onUpdateUi);
            } catch (Exception ignored) {}
        }, 2, 2, TimeUnit.SECONDS);
    }

    // ========================================================================
    // 4. EMBEDDED PURE JAVA HTTP SERVER (Multi-Page Web Views)
    // ========================================================================
    private static void startEmbeddedHttpServer() {
        try {
            activePort = DEFAULT_PORT;
            httpServer = HttpServer.create(new InetSocketAddress(activePort), 0);
        } catch (IOException e) {
            try {
                activePort = FALLBACK_PORT;
                httpServer = HttpServer.create(new InetSocketAddress(activePort), 0);
            } catch (IOException e2) {
                return;
            }
        }

        httpServer.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // Multi-page routing
        httpServer.createContext("/", exchange -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String path = exchange.getRequestURI().getPath();

            if (path.equals("/") || path.isEmpty()) {
                exchange.getResponseHeaders().set("Location", "/login.html");
                exchange.sendResponseHeaders(302, -1);
                return;
            }
            if (path.equals("/index.html") || path.equals("/project1.html") || path.equals("/landing")) {
                serveDiskFile(exchange, new File("index.html"), "text/html; charset=utf-8");
                return;
            }
            if (path.equals("/user") || path.equals("/user-dashboard.html") || path.equals("/customer") || path.equals("/tracker")) {
                serveDiskFile(exchange, new File("user-dashboard.html"), "text/html; charset=utf-8");
                return;
            }
            if (path.equals("/owner") || path.equals("/owner-dashboard.html") || path.equals("/master")) {
                serveDiskFile(exchange, new File("owner-dashboard.html"), "text/html; charset=utf-8");
                return;
            }
            if (path.equals("/login") || path.equals("/login.html")) {
                serveDiskFile(exchange, new File("login.html"), "text/html; charset=utf-8");
                return;
            }

            File f = new File("." + path);
            if (f.exists() && !f.isDirectory()) {
                String mime = "text/plain";
                if (path.endsWith(".html")) mime = "text/html; charset=utf-8";
                else if (path.endsWith(".css")) mime = "text/css; charset=utf-8";
                else if (path.endsWith(".js")) mime = "application/javascript; charset=utf-8";
                else if (path.endsWith(".json")) mime = "application/json; charset=utf-8";
                else if (path.endsWith(".svg")) mime = "image/svg+xml";
                else if (path.endsWith(".png")) mime = "image/png";
                else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) mime = "image/jpeg";
                serveDiskFile(exchange, f, mime);
                return;
            }

            serveDiskFile(exchange, new File("login.html"), "text/html; charset=utf-8");
        });

        // API Context
        httpServer.createContext("/api/", exchange -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String path = exchange.getRequestURI().getPath();
            if (path.endsWith("/") && path.length() > 5) {
                path = path.substring(0, path.length() - 1);
            }
            if (path.equals("/api/fuel-rates") || path.equals("/api/rates")) sendJson(exchange, 200, toJsonList(FUEL_RATES.values()));
            else if (path.equals("/api/tankers")) sendJson(exchange, 200, toJsonList(TANKERS.values()));
            else if (path.equals("/api/orders")) sendJson(exchange, 200, toJsonList(ORDERS.values()));
            else if (path.equals("/api/invoices")) sendJson(exchange, 200, toJsonList(INVOICES.values()));
            else if (path.equals("/api/complaints")) sendJson(exchange, 200, toJsonList(COMPLAINTS.values()));
            else if (path.equals("/api/feedback")) sendJson(exchange, 200, toJsonList(FEEDBACKS.values()));
            else if (path.equals("/api/audit-logs")) sendJson(exchange, 200, toJsonList(AUDIT_LOGS));
            else if (path.equals("/api/fuel-tanks") || path.equals("/api/tanks")) sendJson(exchange, 200, toJsonList(FUEL_TANKS.values()));
            else if (path.equals("/api/depots")) sendJson(exchange, 200, toJsonList(DEPOTS.values()));
            else sendJson(exchange, 200, "{\"status\":\"healthy\",\"server\":\"FuelTrack Pure Java Multi-Page Engine\"}");
        });

        httpServer.start();
        System.out.println("============================================================================");
        System.out.println("  FuelTrack Multi-Page Localhost Web Engine LIVE at: http://localhost:" + activePort);
        System.out.println("============================================================================");
        System.out.println("  [1] Login Portal:       http://localhost:" + activePort + "/login.html");
        System.out.println("  [2] Customer Portal:    http://localhost:" + activePort + "/user-dashboard.html?demo=true");
        System.out.println("  [3] Station Owner Hub:  http://localhost:" + activePort + "/owner-dashboard.html?demo=true");
        System.out.println("  [4] Main Landing Page:  http://localhost:" + activePort + "/index.html");
        System.out.println("============================================================================");
        System.out.println("  >> Opening your default browser to http://localhost:" + activePort + "/login.html ...");
        System.out.println("============================================================================");

        // Automatically open the browser to the login portal
        openBrowser("http://localhost:" + activePort + "/login.html");
    }

    public static void openBrowser(String url) {
        new Thread(() -> {
            try {
                Thread.sleep(400);
            } catch (InterruptedException ignored) {}

            String os = System.getProperty("os.name", "").toLowerCase();
            boolean launched = false;
            if (os.contains("win")) {
                try {
                    new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url).start();
                    launched = true;
                } catch (Exception ignored) {}
                if (!launched) {
                    try {
                        new ProcessBuilder("powershell.exe", "-NoProfile", "-Command", "Start-Process '" + url + "'").start();
                        launched = true;
                    } catch (Exception ignored) {}
                }
                if (!launched) {
                    try {
                        new ProcessBuilder("cmd.exe", "/c", "start", "", url).start();
                        launched = true;
                    } catch (Exception ignored) {}
                }
            } else if (os.contains("mac")) {
                try {
                    new ProcessBuilder("open", url).start();
                    launched = true;
                } catch (Exception ignored) {}
            } else {
                try {
                    new ProcessBuilder("xdg-open", url).start();
                    launched = true;
                } catch (Exception ignored) {}
            }

            if (!launched) {
                try {
                    if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                        Desktop.getDesktop().browse(new URI(url));
                    }
                } catch (Exception ignored) {}
            }
        }).start();
    }

    private static void addCorsHeaders(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJson(HttpExchange ex, int code, String json) throws IOException {
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        if ("HEAD".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.getResponseHeaders().set("Content-Length", String.valueOf(b.length));
            ex.sendResponseHeaders(code, -1);
            return;
        }
        ex.sendResponseHeaders(code, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }

    private static void serveDiskFile(HttpExchange ex, File f, String mime) throws IOException {
        if (!f.exists()) {
            sendJson(ex, 404, "{\"error\":\"File not found\"}");
            return;
        }
        byte[] b = Files.readAllBytes(f.toPath());
        ex.getResponseHeaders().set("Content-Type", mime);
        if ("HEAD".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.getResponseHeaders().set("Content-Length", String.valueOf(b.length));
            ex.sendResponseHeaders(200, -1);
            return;
        }
        ex.sendResponseHeaders(200, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String toJsonList(Collection<?> items) {
        StringBuilder sb = new StringBuilder("[");
        int i = 0;
        for (Object o : items) {
            if (i > 0) sb.append(",");
            if (o instanceof FuelRate r) {
                sb.append(String.format(Locale.US, "{\"id\":\"%s\",\"city\":\"%s\",\"fuelType\":\"%s\",\"ratePerLitre\":%.2f}", escapeJson(r.id), escapeJson(r.city), escapeJson(r.fuelType), r.ratePerLitre));
            } else if (o instanceof Tanker t) {
                sb.append(String.format(Locale.US, "{\"code\":\"%s\",\"name\":\"%s\",\"fuelType\":\"%s\",\"currentLitres\":%.1f,\"capacityLitres\":%.1f,\"status\":\"%s\"}", escapeJson(t.code), escapeJson(t.name), escapeJson(t.fuelType), t.currentLitres, t.capacityLitres, escapeJson(t.status)));
            } else if (o instanceof Order ord) {
                sb.append(String.format(Locale.US, "{\"orderNumber\":\"%s\",\"fuelType\":\"%s\",\"litres\":%.1f,\"total\":%.2f,\"status\":\"%s\"}", escapeJson(ord.orderNumber), escapeJson(ord.fuelType), ord.quantityLitres, ord.totalAmount, escapeJson(ord.status)));
            } else if (o instanceof Invoice inv) {
                sb.append(String.format(Locale.US, "{\"invoiceNumber\":\"%s\",\"total\":%.2f}", escapeJson(inv.invoiceNumber), inv.totalAmount));
            } else if (o instanceof Complaint c) {
                sb.append(String.format("{\"ticketNumber\":\"%s\",\"customerName\":\"%s\",\"category\":\"%s\",\"priority\":\"%s\",\"status\":\"%s\",\"desc\":\"%s\"}", escapeJson(c.ticketNumber), escapeJson(c.customerName), escapeJson(c.category), escapeJson(c.priority), escapeJson(c.status), escapeJson(c.description)));
            } else if (o instanceof DeliveryFeedback fb) {
                sb.append(String.format("{\"orderNumber\":\"%s\",\"customerName\":\"%s\",\"rating\":%d,\"driver\":\"%s\",\"comment\":\"%s\"}", escapeJson(fb.orderNumber), escapeJson(fb.customerName), fb.rating, escapeJson(fb.driverName), escapeJson(fb.comment)));
            } else if (o instanceof AuditLog a) {
                sb.append(String.format("{\"action\":\"%s\",\"time\":\"%s\"}", escapeJson(a.action), escapeJson(a.createdAt)));
            } else if (o instanceof FuelTank ft) {
                sb.append(String.format(Locale.US, "{\"id\":\"%s\",\"depotId\":\"%s\",\"fuelType\":\"%s\",\"currentLitres\":%.1f,\"maxCapacityLitres\":%.1f,\"sensorStatus\":\"%s\",\"lastRefillAt\":\"%s\"}",
                        escapeJson(ft.id), escapeJson(ft.depotId), escapeJson(ft.fuelType), ft.currentQuantityLitres, ft.maxCapacityLitres, escapeJson(ft.sensorStatus), escapeJson(ft.lastRefillAt)));
            } else if (o instanceof Depot d) {
                sb.append(String.format(Locale.US, "{\"id\":\"%s\",\"name\":\"%s\",\"code\":\"%s\",\"city\":\"%s\",\"address\":\"%s\",\"latitude\":%.4f,\"longitude\":%.4f}",
                        escapeJson(d.id), escapeJson(d.name), escapeJson(d.code), escapeJson(d.city), escapeJson(d.address), d.latitude, d.longitude));
            }
            i++;
        }
        return sb.append("]").toString();
    }

    // ========================================================================
    // 5. NATIVE DESKTOP MULTI-PAGE SWING GUI (CardLayout Navigation)
    // ========================================================================
    private CardLayout cardLayout;
    private JPanel mainContainer;
    private User currentUser;

    // Customer Form Inputs
    private JComboBox<String> userFuelCombo;
    private JSlider userVolumeSlider;
    private JLabel userVolDisplay;
    private JLabel userTotalDisplay;
    private JTextField userAddressField;
    private DefaultTableModel userOrdersTableModel;
    private DefaultTableModel userFeedbackTableModel;
    private DefaultTableModel userComplaintsTableModel;

    // Owner Tables & Gauges
    private DefaultTableModel ownerFleetTableModel;
    private DefaultTableModel ownerOrdersTableModel;
    private DefaultTableModel ownerRatesTableModel;
    private DefaultTableModel ownerComplaintsTableModel;
    private DefaultTableModel ownerFeedbackTableModel;
    private JPanel ownerTanksPanel;

    public FuelTrackApp() {
        super(APP_NAME + " • " + APP_VERSION);
        currentUser = USERS.get("usr-cust-01");
        initMultiPageGui();
    }

    private void initMultiPageGui() {
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(1360, 880);
        setMinimumSize(new Dimension(1120, 740));
        setLocationRelativeTo(null);
        getContentPane().setBackground(COLOR_BG);

        cardLayout = new CardLayout();
        mainContainer = new JPanel(cardLayout);
        mainContainer.setBackground(COLOR_BG);

        // Build the 3 Dedicated Pages
        mainContainer.add(createLoginPage(), PAGE_LOGIN);
        mainContainer.add(createCustomerPortalPage(), PAGE_CUSTOMER);
        mainContainer.add(createOwnerMasterPage(), PAGE_OWNER);

        getContentPane().setLayout(new BorderLayout());
        getContentPane().add(createWebLauncherBar(), BorderLayout.NORTH);
        getContentPane().add(mainContainer, BorderLayout.CENTER);

        // Start at the Dedicated Login Page
        cardLayout.show(mainContainer, PAGE_LOGIN);

        // Start telematics engine
        startTelematicsEngine(this::refreshData);
    }

    private JPanel createWebLauncherBar() {
        JPanel bar = new JPanel(new BorderLayout(12, 0));
        bar.setBackground(new Color(15, 23, 42));
        bar.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(new Color(30, 41, 59), 1),
                new EmptyBorder(8, 16, 8, 16)
        ));

        JLabel title = new JLabel("<html><span style='color:#38bdf8; font-weight:bold;'>🌐 EMBEDDED LOCALHOST WEB SERVER:</span> <span style='color:#f8fafc; font-weight:bold;'>http://localhost:" + activePort + "/login.html</span></html>");
        title.setFont(new Font("Segoe UI", Font.PLAIN, 12));

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        btnPanel.setOpaque(false);

        JButton openWebBtn = new JButton("🚀 Open Web Login in Browser");
        openWebBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        openWebBtn.setBackground(COLOR_PRIMARY);
        openWebBtn.setForeground(Color.WHITE);
        openWebBtn.setFocusPainted(false);
        openWebBtn.addActionListener(e -> openBrowser("http://localhost:" + activePort + "/login.html"));

        JButton openCustBtn = new JButton("👤 Customer Web Portal");
        openCustBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        openCustBtn.setBackground(COLOR_SURFACE_ALT);
        openCustBtn.setForeground(COLOR_TEXT_PRIMARY);
        openCustBtn.setFocusPainted(false);
        openCustBtn.addActionListener(e -> openBrowser("http://localhost:" + activePort + "/user-dashboard.html?demo=true"));

        JButton openOwnerBtn = new JButton("👑 Owner Master Cockpit");
        openOwnerBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        openOwnerBtn.setBackground(COLOR_SURFACE_ALT);
        openOwnerBtn.setForeground(COLOR_GOLD);
        openOwnerBtn.setFocusPainted(false);
        openOwnerBtn.addActionListener(e -> openBrowser("http://localhost:" + activePort + "/owner-dashboard.html?demo=true"));

        JButton openLandingBtn = new JButton("🏠 Landing Page");
        openLandingBtn.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        openLandingBtn.setBackground(COLOR_SURFACE_ALT);
        openLandingBtn.setForeground(COLOR_TEXT_SECONDARY);
        openLandingBtn.setFocusPainted(false);
        openLandingBtn.addActionListener(e -> openBrowser("http://localhost:" + activePort + "/index.html"));

        btnPanel.add(openWebBtn);
        btnPanel.add(openCustBtn);
        btnPanel.add(openOwnerBtn);
        btnPanel.add(openLandingBtn);

        bar.add(title, BorderLayout.WEST);
        bar.add(btnPanel, BorderLayout.EAST);
        return bar;
    }

    // ------------------------------------------------------------------------
    // PAGE 1: DEDICATED LOGIN PAGE
    // ------------------------------------------------------------------------
    private JPanel createLoginPage() {
        JPanel page = new JPanel(new GridBagLayout());
        page.setBackground(COLOR_BG);

        // Wide Two-Column Container (960 x 580)
        JPanel mainCard = new JPanel(new GridLayout(1, 2, 24, 0)) {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(new Color(11, 17, 32, 240));
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 28, 28);
                g2.setColor(new Color(255, 255, 255, 25));
                g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 28, 28);
                // Top accent glow line
                GradientPaint gp = new GradientPaint(0, 0, COLOR_PRIMARY, getWidth(), 0, COLOR_GOLD);
                g2.setPaint(gp);
                g2.fillRoundRect(0, 0, getWidth(), 4, 4, 4);
                g2.dispose();
            }
        };
        mainCard.setOpaque(false);
        mainCard.setPreferredSize(new Dimension(980, 590));
        mainCard.setBorder(new EmptyBorder(32, 34, 32, 34));

        // ==================== LEFT SHOWCASE PANEL (DASHBOARD PREVIEW) ====================
        JPanel leftShowcase = new JPanel();
        leftShowcase.setLayout(new BoxLayout(leftShowcase, BoxLayout.Y_AXIS));
        leftShowcase.setOpaque(false);

        JLabel tagLbl = new JLabel("⚡ 100% PURE JAVA ENGINE • LIVE IOT TELEMATICS");
        tagLbl.setFont(new Font("Segoe UI", Font.BOLD, 10));
        tagLbl.setForeground(COLOR_PRIMARY_HOVER);
        leftShowcase.add(tagLbl);
        leftShowcase.add(Box.createVerticalStrut(10));

        JLabel heroTitle = new JLabel("<html><div style='font-size:22px; font-weight:900; color:#f8fafc; line-height:1.2;'>Doorstep Refueling &amp;<br><span style='color:#38bdf8;'>Live GPS Fleet Radar</span></div></html>");
        leftShowcase.add(heroTitle);
        leftShowcase.add(Box.createVerticalStrut(10));

        JLabel heroSub = new JLabel("<html><div style='font-size:11px; color:#94a3b8; line-height:1.5;'>Zero-hidden-fee doorstep fuel delivered at official state pump rates. Live satellite GPS telemetry for customers &amp; complete master operations control for station owners.</div></html>");
        leftShowcase.add(heroSub);
        leftShowcase.add(Box.createVerticalStrut(20));

        // Live Dashboard Sneak Peek Box
        JPanel peekBox = new JPanel();
        peekBox.setLayout(new BoxLayout(peekBox, BoxLayout.Y_AXIS));
        peekBox.setBackground(new Color(17, 24, 39, 220));
        peekBox.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(14, 16, 14, 16)
        ));

        JLabel peekTitle = new JLabel("🛰️ LIVE SATELLITE RADAR SNEAK PEEK");
        peekTitle.setFont(new Font("Segoe UI", Font.BOLD, 11));
        peekTitle.setForeground(COLOR_PRIMARY_HOVER);
        peekBox.add(peekTitle);
        peekBox.add(Box.createVerticalStrut(10));

        // 3 Telemetry Metrics
        JPanel teleGrid = new JPanel(new GridLayout(1, 3, 8, 0));
        teleGrid.setOpaque(false);
        teleGrid.add(createHudStatCard("Speed", "42.4 km/h", COLOR_PRIMARY_HOVER));
        teleGrid.add(createHudStatCard("Worli ETA", "09m 40s", COLOR_SUCCESS));
        teleGrid.add(createHudStatCard("PESO Seal", "100% OK", COLOR_GOLD));
        peekBox.add(teleGrid);
        peekBox.add(Box.createVerticalStrut(10));

        JLabel bowserStatus = new JLabel("● Tanker TK-101 (Tata 2KL) en route • Pilot Rajesh Kumar");
        bowserStatus.setFont(new Font("Segoe UI", Font.BOLD, 10));
        bowserStatus.setForeground(COLOR_SUCCESS);
        peekBox.add(bowserStatus);

        leftShowcase.add(peekBox);
        leftShowcase.add(Box.createVerticalStrut(20));

        // Trust Stats Row
        JPanel trustStats = new JPanel(new GridLayout(1, 3, 10, 0));
        trustStats.setOpaque(false);
        trustStats.add(createHudStatCard("Platform Fee", "₹0.00", COLOR_PRIMARY_HOVER));
        trustStats.add(createHudStatCard("CSAT Rating", "4.95 ★", COLOR_GOLD));
        trustStats.add(createHudStatCard("Fast Dispatch", "< 15 min", COLOR_SUCCESS));
        leftShowcase.add(trustStats);

        // ==================== RIGHT AUTH CONSOLE PANEL ====================
        JPanel rightAuth = new JPanel();
        rightAuth.setLayout(new BoxLayout(rightAuth, BoxLayout.Y_AXIS));
        rightAuth.setOpaque(false);
        rightAuth.setBorder(new EmptyBorder(0, 14, 0, 0));

        JLabel authLogo = new JLabel("⛽", SwingConstants.CENTER);
        authLogo.setFont(new Font("Segoe UI Emoji", Font.PLAIN, 36));
        authLogo.setAlignmentX(Component.CENTER_ALIGNMENT);
        rightAuth.add(authLogo);
        rightAuth.add(Box.createVerticalStrut(6));

        JLabel authTitle = new JLabel("FuelTrack Secure Sign-In");
        authTitle.setFont(new Font("Segoe UI", Font.BOLD, 18));
        authTitle.setForeground(COLOR_TEXT_PRIMARY);
        authTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        rightAuth.add(authTitle);

        JLabel authSub = new JLabel("Select your dedicated portal to proceed");
        authSub.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        authSub.setForeground(COLOR_TEXT_SECONDARY);
        authSub.setAlignmentX(Component.CENTER_ALIGNMENT);
        rightAuth.add(authSub);
        rightAuth.add(Box.createVerticalStrut(16));

        JTextField emailField = new JTextField("customer@fueltrack.io");
        emailField.setBackground(COLOR_SURFACE_ALT);
        emailField.setForeground(COLOR_TEXT_PRIMARY);
        emailField.setCaretColor(COLOR_PRIMARY);

        JPasswordField pwdField = new JPasswordField("password123");
        pwdField.setBackground(COLOR_SURFACE_ALT);
        pwdField.setForeground(COLOR_TEXT_PRIMARY);

        rightAuth.add(createLabeledBox("Account Email / Mobile:", emailField));
        rightAuth.add(Box.createVerticalStrut(10));
        rightAuth.add(createLabeledBox("Password / Access PIN:", pwdField));
        rightAuth.add(Box.createVerticalStrut(16));

        // 1-Click Instant Demo Portals
        JLabel quickLbl = new JLabel("⭐ VIP ALL-ACCESS DEMO ACCOUNTS (ALL DATA LOADED):");
        quickLbl.setFont(new Font("Segoe UI", Font.BOLD, 10));
        quickLbl.setForeground(COLOR_GOLD);
        quickLbl.setAlignmentX(Component.CENTER_ALIGNMENT);
        rightAuth.add(quickLbl);
        rightAuth.add(Box.createVerticalStrut(10));

        JButton btnDemoUser = new JButton("⭐ Launch VIP Demo Customer (Everything Loaded)");
        btnDemoUser.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnDemoUser.setBackground(new Color(14, 165, 233));
        btnDemoUser.setForeground(Color.WHITE);
        btnDemoUser.setOpaque(true);
        btnDemoUser.setContentAreaFilled(true);
        btnDemoUser.setBorderPainted(false);
        btnDemoUser.setMaximumSize(new Dimension(Integer.MAX_VALUE, 42));
        btnDemoUser.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnDemoUser.addActionListener(e -> {
            currentUser = USERS.get("usr-demo-cust");
            refreshData();
            cardLayout.show(mainContainer, PAGE_CUSTOMER);
        });

        JButton btnDemoOwner = new JButton("👑 Launch Master Owner Demo (Full Operations Cockpit)");
        btnDemoOwner.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnDemoOwner.setBackground(COLOR_GOLD);
        btnDemoOwner.setForeground(Color.BLACK);
        btnDemoOwner.setOpaque(true);
        btnDemoOwner.setContentAreaFilled(true);
        btnDemoOwner.setBorderPainted(false);
        btnDemoOwner.setMaximumSize(new Dimension(Integer.MAX_VALUE, 42));
        btnDemoOwner.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnDemoOwner.addActionListener(e -> {
            currentUser = USERS.get("usr-demo-owner");
            refreshData();
            cardLayout.show(mainContainer, PAGE_OWNER);
        });

        rightAuth.add(btnDemoUser);
        rightAuth.add(Box.createVerticalStrut(8));
        rightAuth.add(btnDemoOwner);
        rightAuth.add(Box.createVerticalStrut(14));

        JButton btnLoginUser = new JButton("👤 Standard Customer Login");
        btnLoginUser.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnLoginUser.setBackground(COLOR_SURFACE_ALT);
        btnLoginUser.setForeground(COLOR_TEXT_PRIMARY);
        btnLoginUser.setOpaque(true);
        btnLoginUser.setContentAreaFilled(true);
        btnLoginUser.setBorderPainted(false);
        btnLoginUser.setMaximumSize(new Dimension(Integer.MAX_VALUE, 34));
        btnLoginUser.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnLoginUser.addActionListener(e -> {
            currentUser = USERS.get("usr-cust-01");
            refreshData();
            cardLayout.show(mainContainer, PAGE_CUSTOMER);
        });

        rightAuth.add(btnLoginUser);
        rightAuth.add(Box.createVerticalStrut(14));

        // Compliance Seals
        JLabel seals = new JLabel("🛡️ PESO Certified  •  🔒 100% Zero Markup  •  🛰️ GPS Active", SwingConstants.CENTER);
        seals.setFont(new Font("Segoe UI", Font.PLAIN, 10));
        seals.setForeground(COLOR_TEXT_SECONDARY);
        seals.setAlignmentX(Component.CENTER_ALIGNMENT);
        rightAuth.add(seals);

        mainCard.add(leftShowcase);
        mainCard.add(rightAuth);

        page.add(mainCard);
        return page;
    }

    // ------------------------------------------------------------------------
    // PAGE 2: DEDICATED CUSTOMER PORTAL (With Settings & Live Ordering)
    // ------------------------------------------------------------------------
    private JPanel createCustomerPortalPage() {
        JPanel page = new JPanel(new BorderLayout(0, 16));
        page.setBackground(COLOR_BG);

        // Header
        JPanel nav = new JPanel(new BorderLayout());
        nav.setBackground(COLOR_SURFACE);
        nav.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER),
                new EmptyBorder(12, 24, 12, 24)
        ));

        JLabel brand = new JLabel("⛽ FuelTrack — Customer Fuel Portal");
        brand.setFont(new Font("Segoe UI", Font.BOLD, 17));
        brand.setForeground(COLOR_TEXT_PRIMARY);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        right.setOpaque(false);

        JLabel userBadge = new JLabel("Rahul Sharma (Customer)");
        userBadge.setFont(new Font("Segoe UI", Font.BOLD, 12));
        userBadge.setForeground(COLOR_PRIMARY_HOVER);

        // Emergency 1-Tap SOS Button
        JButton sosBtn = new JButton("🚨 1-Tap Roadside SOS");
        sosBtn.setBackground(new Color(220, 38, 38));
        sosBtn.setForeground(Color.WHITE);
        sosBtn.setOpaque(true);
        sosBtn.setContentAreaFilled(true);
        sosBtn.setBorderPainted(false);
        sosBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        sosBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this,
                "🚨 EMERGENCY ROADSIDE SOS DISPATCHED!\n\nClosest mobile tanker TK-101 has been prioritized with emergency siren routing.\nGuaranteed Emergency ETA: 12 Minutes.\nDriver: Vikram Singh (+91 98202 23456)\nPurity: 100% PESO Certified Density.",
                "Emergency SOS Dispatched", JOptionPane.WARNING_MESSAGE);
        });

        // PESO Purity Lab Checker
        JButton purityBtn = new JButton("🔬 Purity Check");
        purityBtn.setBackground(COLOR_SURFACE_ALT);
        purityBtn.setForeground(COLOR_SUCCESS);
        purityBtn.setOpaque(true);
        purityBtn.setContentAreaFilled(true);
        purityBtn.setBorderPainted(false);
        purityBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        purityBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this,
                "STATUTORY PESO DENSITY CERTIFICATE\n--------------------------------------------\nDensity @ 15°C:    742.8 kg/m³ (Passed BIS)\nFlash Point:       38.5°C (Safe)\nSulphur Level:     < 10 ppm (BS-VI Ultra-Clean)\nAnti-Adulteration: 100% Verified\nCertificate Ref:   PESO-CERT-MUM-2026-8831",
                "PESO Quality Hydrometer Check", JOptionPane.INFORMATION_MESSAGE);
        });

        // Persistent Settings Button
        JButton settingsBtn = new JButton("⚙ Settings");
        settingsBtn.setBackground(COLOR_SURFACE_ALT);
        settingsBtn.setForeground(COLOR_TEXT_PRIMARY);
        settingsBtn.setOpaque(true);
        settingsBtn.setContentAreaFilled(true);
        settingsBtn.setBorderPainted(false);
        settingsBtn.addActionListener(e -> showSettingsDialog("Customer"));

        JButton logoutBtn = new JButton("🚪 Log Out");
        logoutBtn.setBackground(new Color(239, 68, 68, 40));
        logoutBtn.setForeground(COLOR_DANGER);
        logoutBtn.setOpaque(true);
        logoutBtn.setContentAreaFilled(true);
        logoutBtn.setBorderPainted(false);
        logoutBtn.addActionListener(e -> cardLayout.show(mainContainer, PAGE_LOGIN));

        right.add(userBadge);
        right.add(sosBtn);
        right.add(purityBtn);
        right.add(settingsBtn);
        right.add(logoutBtn);

        nav.add(brand, BorderLayout.WEST);
        nav.add(right, BorderLayout.EAST);
        page.add(nav, BorderLayout.NORTH);

        // Workspace: Multi-Tab Hub (Live GPS Tracker default, skipping any starting dashboard)
        JTabbedPane userTabs = new JTabbedPane();
        userTabs.setBackground(COLOR_SURFACE);
        userTabs.setForeground(COLOR_TEXT_PRIMARY);
        userTabs.setFont(new Font("Segoe UI", Font.BOLD, 13));

        // Tab 1: Live GPS Delivery Tracker & Radar (DEFAULT ACTIVE TAB)
        userTabs.addTab("🛰️ Live GPS Delivery Tracker", createCustomerGpsTrackerTab());

        // Tab 2: Book Doorstep Delivery
        userTabs.addTab("🚀 Book Doorstep Fuel", createCustomerBookingTab());

        // Tab 3: My Orders & Digital Invoices
        userTabs.addTab("📄 Orders & Tax Invoices", createCustomerInvoicesTab());

        // Tab 4: Delivery Feedback & Ratings
        userTabs.addTab("⭐ Delivery Feedback", createCustomerFeedbackTab());

        // Tab 5: Raise Complaint Directly To Owner
        userTabs.addTab("⚠️ Raise Grievance (To Owner)", createCustomerComplaintsTab());

        page.add(userTabs, BorderLayout.CENTER);
        return page;
    }

    private JPanel createCustomerGpsTrackerTab() {
        JPanel tab = new JPanel(new BorderLayout(0, 14));
        tab.setBackground(COLOR_BG);
        tab.setBorder(new EmptyBorder(14, 18, 16, 18));

        // Top Guarantee Banner
        JPanel topBanner = new JPanel(new BorderLayout(12, 0));
        topBanner.setBackground(new Color(16, 185, 129, 30));
        topBanner.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_SUCCESS, 1, true),
                new EmptyBorder(8, 14, 8, 14)
        ));
        JLabel b1 = new JLabel("🛡️ ZERO-MARKUP GUARANTEE: Paid Only For Fuel (₹3,647.35) + Flat ₹50 Delivery Fee | Verified State Pump Rate");
        b1.setFont(new Font("Segoe UI", Font.BOLD, 12));
        b1.setForeground(COLOR_SUCCESS);
        JLabel b2 = new JLabel("● LIVE GPS SATELLITE TELEMETRY ACTIVE");
        b2.setFont(new Font("Segoe UI", Font.BOLD, 11));
        b2.setForeground(COLOR_PRIMARY_HOVER);
        topBanner.add(b1, BorderLayout.WEST);
        topBanner.add(b2, BorderLayout.EAST);
        tab.add(topBanner, BorderLayout.NORTH);

        // Center Split: Left Animated Radar Canvas + Right Telemetry HUD
        JPanel center = new JPanel(new GridLayout(1, 2, 16, 0));
        center.setOpaque(false);

        // Left: 2D Animated Radar Canvas
        final double[] sweepAngle = {0.0};
        final double[] tankerProgress = {0.52};
        final double[] tankerSpeed = {42.4};
        final int[] etaSeconds = {580};
        final int[] tripMilestone = {2};

        JPanel radarCanvas = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

                int w = getWidth(), h = getHeight();
                // Obsidian radar background
                g2.setColor(new Color(6, 11, 20));
                g2.fillRoundRect(0, 0, w, h, 20, 20);

                // Coordinate Grid
                g2.setColor(new Color(14, 165, 233, 22));
                for (int x = 0; x < w; x += 32) g2.drawLine(x, 0, x, h);
                for (int y = 0; y < h; y += 32) g2.drawLine(0, y, w, y);

                // Concentric Radar Rings
                int cx = w / 2, cy = h / 2;
                int maxR = Math.min(w, h) / 2 - 24;
                g2.setColor(new Color(14, 165, 233, 45));
                for (int r = maxR / 3; r <= maxR; r += maxR / 3) {
                    g2.drawOval(cx - r, cy - r, r * 2, r * 2);
                }
                g2.drawLine(cx - maxR, cy, cx + maxR, cy);
                g2.drawLine(cx, cy - maxR, cx, cy + maxR);

                // Rotating radar beam
                g2.setPaint(new GradientPaint(cx, cy, new Color(14, 165, 233, 140),
                        (float)(cx + maxR * Math.cos(Math.toRadians(sweepAngle[0]))),
                        (float)(cy + maxR * Math.sin(Math.toRadians(sweepAngle[0]))),
                        new Color(14, 165, 233, 0)));
                g2.fillArc(cx - maxR, cy - maxR, maxR * 2, maxR * 2, (int) sweepAngle[0], 45);

                // Real-World Route: Origin (15% w, 55% h) to Destination (85% w, 45% h)
                int ox = (int)(w * 0.15), oy = (int)(h * 0.55);
                int dx = (int)(w * 0.85), dy = (int)(h * 0.45);
                int ctrlX = (int)(w * 0.50), ctrlY = (int)(h * 0.15);

                // Path background curve
                g2.setColor(new Color(255, 255, 255, 45));
                g2.setStroke(new BasicStroke(4f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                QuadCurve2D q = new QuadCurve2D.Float(ox, oy, ctrlX, ctrlY, dx, dy);
                g2.draw(q);

                // Animated dash pulse line
                g2.setColor(new Color(16, 185, 129, 220));
                g2.setStroke(new BasicStroke(4f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 10f, new float[]{8f, 6f}, (float)(sweepAngle[0] % 14)));
                g2.draw(q);

                // Tanker position along quad curve
                double t = tankerProgress[0];
                double tx = (1 - t) * (1 - t) * ox + 2 * (1 - t) * t * ctrlX + t * t * dx;
                double ty = (1 - t) * (1 - t) * oy + 2 * (1 - t) * t * ctrlY + t * t * dy;

                // Origin Depot Marker (HP Central Depot)
                g2.setColor(new Color(249, 115, 22));
                g2.fillRoundRect(ox - 14, oy - 14, 28, 28, 8, 8);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.drawString("DEPOT", ox - 18, oy + 26);

                // Destination Marker (Worli Flat 402)
                g2.setColor(new Color(16, 185, 129));
                g2.fillRoundRect(dx - 14, dy - 14, 28, 28, 8, 8);
                g2.setColor(Color.WHITE);
                g2.drawString("WORLI (FLAT 402)", dx - 44, dy + 26);

                // Moving Tanker Blip with pulsing beacon
                int pulse = 16 + (int)(6 * Math.sin(Math.toRadians(sweepAngle[0] * 4)));
                g2.setColor(new Color(14, 165, 233, 80));
                g2.fillOval((int)tx - pulse, (int)ty - pulse, pulse * 2, pulse * 2);

                g2.setColor(new Color(14, 165, 233));
                g2.fillRoundRect((int)tx - 15, (int)ty - 15, 30, 30, 8, 8);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 11));
                g2.drawString("TK-101", (int)tx - 18, (int)ty - 20);

                // Top Header Overlay
                g2.setColor(new Color(8, 12, 20, 220));
                g2.fillRoundRect(16, 16, 320, 56, 12, 12);
                g2.setColor(COLOR_PRIMARY_HOVER);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 12));
                g2.drawString("📍 ROUTE: Mumbai Central ➔ Worli Sea Face", 26, 36);
                g2.setColor(COLOR_TEXT_SECONDARY);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                g2.drawString("Dr. Annie Besant Rd corridor (Traffic: Clear)", 26, 54);

                g2.dispose();
            }
        };
        radarCanvas.setBackground(COLOR_SURFACE);
        radarCanvas.setBorder(new LineBorder(COLOR_BORDER, 1, true));

        // Right: Telemetry & Pilot HUD Card
        JPanel hudPanel = new JPanel();
        hudPanel.setLayout(new BoxLayout(hudPanel, BoxLayout.Y_AXIS));
        hudPanel.setBackground(COLOR_SURFACE);
        hudPanel.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(16, 20, 16, 20)
        ));

        JLabel hudTitle = new JLabel("Live Dispatch Telemetry & Security");
        hudTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));
        hudTitle.setForeground(COLOR_TEXT_PRIMARY);
        hudPanel.add(hudTitle);
        hudPanel.add(Box.createVerticalStrut(12));

        // Metric Cards Grid
        JPanel grid = new JPanel(new GridLayout(2, 2, 10, 10));
        grid.setOpaque(false);

        JLabel spdLbl = new JLabel("Speed: 42.4 km/h", SwingConstants.CENTER);
        spdLbl.setFont(new Font("Segoe UI", Font.BOLD, 13));
        spdLbl.setForeground(COLOR_PRIMARY_HOVER);
        spdLbl.setBackground(COLOR_SURFACE_ALT);
        spdLbl.setOpaque(true);
        spdLbl.setBorder(new EmptyBorder(8, 8, 8, 8));

        JLabel etaLbl = new JLabel("ETA: 9m 40s", SwingConstants.CENTER);
        etaLbl.setFont(new Font("Segoe UI", Font.BOLD, 13));
        etaLbl.setForeground(COLOR_ACCENT);
        etaLbl.setBackground(COLOR_SURFACE_ALT);
        etaLbl.setOpaque(true);
        etaLbl.setBorder(new EmptyBorder(8, 8, 8, 8));

        JLabel distLbl = new JLabel("Distance: 2.8 km", SwingConstants.CENTER);
        distLbl.setFont(new Font("Segoe UI", Font.BOLD, 13));
        distLbl.setForeground(COLOR_TEXT_PRIMARY);
        distLbl.setBackground(COLOR_SURFACE_ALT);
        distLbl.setOpaque(true);
        distLbl.setBorder(new EmptyBorder(8, 8, 8, 8));

        JLabel pesoLbl = new JLabel("PESO Seal: LOCKED", SwingConstants.CENTER);
        pesoLbl.setFont(new Font("Segoe UI", Font.BOLD, 12));
        pesoLbl.setForeground(COLOR_SUCCESS);
        pesoLbl.setBackground(COLOR_SURFACE_ALT);
        pesoLbl.setOpaque(true);
        pesoLbl.setBorder(new EmptyBorder(8, 8, 8, 8));

        grid.add(spdLbl); grid.add(etaLbl); grid.add(distLbl); grid.add(pesoLbl);
        hudPanel.add(grid);
        hudPanel.add(Box.createVerticalStrut(14));

        // Delivery PIN Box
        JPanel pinBox = new JPanel(new BorderLayout());
        pinBox.setBackground(new Color(245, 158, 11, 25));
        pinBox.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_GOLD, 1, true),
                new EmptyBorder(8, 14, 8, 14)
        ));
        JLabel pinTitle = new JLabel("🔒 YOUR DELIVERY NOZZLE UNLOCK PIN: ");
        pinTitle.setFont(new Font("Segoe UI", Font.BOLD, 11));
        pinTitle.setForeground(COLOR_GOLD);
        JLabel pinVal = new JLabel("8 4 9 2", SwingConstants.RIGHT);
        pinVal.setFont(new Font("Segoe UI", Font.BOLD, 20));
        pinVal.setForeground(COLOR_GOLD);
        pinBox.add(pinTitle, BorderLayout.WEST);
        pinBox.add(pinVal, BorderLayout.EAST);
        hudPanel.add(pinBox);
        hudPanel.add(Box.createVerticalStrut(14));

        // Pilot Details Card
        JPanel pilotBox = new JPanel(new GridLayout(3, 1, 4, 4));
        pilotBox.setBackground(COLOR_SURFACE_ALT);
        pilotBox.setBorder(new EmptyBorder(10, 12, 10, 12));
        JLabel p1 = new JLabel("👤 Pilot: Rajesh Kumar (Govt Hazmat L3 Certified • 4.95 ★)");
        p1.setFont(new Font("Segoe UI", Font.BOLD, 12));
        p1.setForeground(COLOR_TEXT_PRIMARY);
        JLabel p2 = new JLabel("🚚 Vehicle: Tata Micro-Dispenser (MH-01-TK-101 • 2,000L)");
        p2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        p2.setForeground(COLOR_TEXT_SECONDARY);
        JLabel p3 = new JLabel("🔬 Quality Hydrometer: 742.8 kg/m³ @ 15°C (100% Pure BS-VI)");
        p3.setFont(new Font("Segoe UI", Font.BOLD, 11));
        p3.setForeground(COLOR_SUCCESS);
        pilotBox.add(p1); pilotBox.add(p2); pilotBox.add(p3);
        hudPanel.add(pilotBox);
        hudPanel.add(Box.createVerticalStrut(14));

        // Real-time Nozzle Flow Simulator
        JPanel flowBox = new JPanel(new BorderLayout(8, 6));
        flowBox.setOpaque(false);
        JLabel flowStatusLabel = new JLabel("Dispenser Status: Ready for Nozzle Flow (0.0 / 35.0 Litres)");
        flowStatusLabel.setFont(new Font("Segoe UI", Font.BOLD, 11));
        flowStatusLabel.setForeground(COLOR_TEXT_PRIMARY);

        JProgressBar flowProgressBar = new JProgressBar(0, 35);
        flowProgressBar.setValue(0);
        flowProgressBar.setStringPainted(true);
        flowProgressBar.setString("0.0 Litres Dispensed (Flow: 0.0 L/min)");
        flowProgressBar.setForeground(COLOR_SUCCESS);
        flowProgressBar.setBackground(COLOR_SURFACE_ALT);

        flowBox.add(flowStatusLabel, BorderLayout.NORTH);
        flowBox.add(flowProgressBar, BorderLayout.CENTER);
        hudPanel.add(flowBox);
        hudPanel.add(Box.createVerticalStrut(14));

        // Control Buttons
        JPanel btnRow = new JPanel(new GridLayout(1, 2, 8, 0));
        btnRow.setOpaque(false);

        JButton advanceBtn = new JButton("🚀 Advance Milestone");
        advanceBtn.setBackground(COLOR_PRIMARY);
        advanceBtn.setForeground(Color.WHITE);
        advanceBtn.setOpaque(true);
        advanceBtn.setContentAreaFilled(true);
        advanceBtn.setBorderPainted(false);
        advanceBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        advanceBtn.addActionListener(e -> {
            tripMilestone[0] = (tripMilestone[0] + 1) % 5;
            String[] msgs = {"Order Placed", "Station Sealed", "In-Transit", "At Customer Bay", "Delivered"};
            JOptionPane.showMessageDialog(this, "Milestone advanced to: " + msgs[tripMilestone[0]] + "!", "Delivery Journey Milestone", JOptionPane.INFORMATION_MESSAGE);
        });

        JButton testFlowBtn = new JButton("⚡ Simulate IoT Dispense (35L)");
        testFlowBtn.setBackground(COLOR_ACCENT);
        testFlowBtn.setForeground(Color.WHITE);
        testFlowBtn.setOpaque(true);
        testFlowBtn.setContentAreaFilled(true);
        testFlowBtn.setBorderPainted(false);
        testFlowBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        testFlowBtn.addActionListener(e -> {
            final int[] flowLitres = {0};
            testFlowBtn.setEnabled(false);
            javax.swing.Timer t = new javax.swing.Timer(100, null);
            t.addActionListener(ev -> {
                flowLitres[0] += 2;
                if (flowLitres[0] >= 35) {
                    flowLitres[0] = 35;
                    flowProgressBar.setValue(35);
                    flowProgressBar.setString("35.0 / 35.0 L Dispensed (Completed!)");
                    flowStatusLabel.setText("Dispenser Status: 100% COMPLETE • Tax Receipt Generated");
                    t.stop();
                    testFlowBtn.setEnabled(true);
                    JOptionPane.showMessageDialog(this, "✅ 35.0 Litres dispensed successfully with zero leakage!\nDigital tax invoice verified.", "Dispense Complete", JOptionPane.INFORMATION_MESSAGE);
                } else {
                    flowProgressBar.setValue(flowLitres[0]);
                    flowProgressBar.setString(flowLitres[0] + ".0 L (Flow: 45.0 L/min)");
                    flowStatusLabel.setText("Dispensing in Progress: " + flowLitres[0] + " L @ 45 L/min");
                }
            });
            t.start();
        });

        btnRow.add(advanceBtn);
        btnRow.add(testFlowBtn);
        hudPanel.add(btnRow);

        center.add(radarCanvas);
        center.add(hudPanel);
        tab.add(center, BorderLayout.CENTER);

        // Animation Timer for Radar
        javax.swing.Timer radarTimer = new javax.swing.Timer(40, e -> {
            sweepAngle[0] = (sweepAngle[0] + 2.5) % 360;
            if (tripMilestone[0] == 2) {
                tankerSpeed[0] = 41.5 + (Math.random() * 2.5);
                spdLbl.setText(String.format(Locale.US, "Speed: %.1f km/h", tankerSpeed[0]));
                if (etaSeconds[0] > 1) {
                    etaSeconds[0]--;
                    int m = etaSeconds[0] / 60, s = etaSeconds[0] % 60;
                    etaLbl.setText(String.format("ETA: %dm %02ds", m, s));
                }
            } else if (tripMilestone[0] >= 3) {
                spdLbl.setText("Speed: 0.0 km/h");
                etaLbl.setText("ETA: AT PREMISE");
            }
            radarCanvas.repaint();
        });
        radarTimer.start();
        return tab;
    }

    private JPanel createCustomerBookingTab() {
        JPanel formCard = new JPanel();
        formCard.setLayout(new BoxLayout(formCard, BoxLayout.Y_AXIS));
        formCard.setBackground(COLOR_SURFACE);
        formCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(20, 24, 20, 24)
        ));

        JLabel fTitle = new JLabel("Order Doorstep Delivery (Zero-Markup Guarantee)");
        fTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));
        fTitle.setForeground(COLOR_TEXT_PRIMARY);
        formCard.add(fTitle);
        formCard.add(Box.createVerticalStrut(16));

        userFuelCombo = new JComboBox<>(new String[]{"PETROL (₹104.21/L)", "DIESEL (₹92.15/L)", "CNG (₹86.50/L)"});
        userFuelCombo.setBackground(COLOR_SURFACE_ALT);
        userFuelCombo.setForeground(COLOR_TEXT_PRIMARY);
        userFuelCombo.addActionListener(e -> recalculateUserPrice());

        formCard.add(createLabeledBox("Select Fuel:", userFuelCombo));
        formCard.add(Box.createVerticalStrut(14));

        userVolDisplay = new JLabel("Quantity: 35 Litres");
        userVolDisplay.setFont(new Font("Segoe UI", Font.BOLD, 13));
        userVolDisplay.setForeground(COLOR_ACCENT);

        userVolumeSlider = new JSlider(5, 120, 35);
        userVolumeSlider.setOpaque(false);
        userVolumeSlider.setForeground(COLOR_PRIMARY);
        userVolumeSlider.addChangeListener(e -> {
            userVolDisplay.setText("Quantity: " + userVolumeSlider.getValue() + " Litres");
            recalculateUserPrice();
        });

        formCard.add(userVolDisplay);
        formCard.add(userVolumeSlider);
        formCard.add(Box.createVerticalStrut(14));

        userAddressField = new JTextField("Flat 402, Sea Green Apts, Worli Sea Face, Mumbai");
        userAddressField.setBackground(COLOR_SURFACE_ALT);
        userAddressField.setForeground(COLOR_TEXT_PRIMARY);
        formCard.add(createLabeledBox("Delivery Address:", userAddressField));
        formCard.add(Box.createVerticalStrut(14));

        // Price Breakdown
        JPanel priceBox = new JPanel(new GridLayout(4, 2, 8, 6));
        priceBox.setBackground(COLOR_SURFACE_ALT);
        priceBox.setBorder(new EmptyBorder(12, 14, 12, 14));
        userTotalDisplay = new JLabel("₹3,697.35", SwingConstants.RIGHT);
        userTotalDisplay.setFont(new Font("Segoe UI", Font.BOLD, 18));
        userTotalDisplay.setForeground(COLOR_PRIMARY_HOVER);

        priceBox.add(new JLabel("Govt Approved Fuel Rate:")); priceBox.add(new JLabel("Official State Price", SwingConstants.RIGHT));
        priceBox.add(new JLabel("Doorstep Delivery Fee:")); priceBox.add(new JLabel("₹50.00 (Flat)", SwingConstants.RIGHT));
        priceBox.add(new JLabel("Platform Markup:")); priceBox.add(new JLabel("₹0.00 (Zero Fee)", SwingConstants.RIGHT));
        priceBox.add(new JLabel("TOTAL PAYABLE:")); priceBox.add(userTotalDisplay);

        formCard.add(priceBox);
        formCard.add(Box.createVerticalStrut(18));

        JButton orderBtn = new JButton("🚀 Confirm Order & Dispatch Tanker");
        orderBtn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        orderBtn.setBackground(COLOR_PRIMARY);
        orderBtn.setForeground(Color.WHITE);
        orderBtn.setOpaque(true);
        orderBtn.setContentAreaFilled(true);
        orderBtn.setBorderPainted(false);
        orderBtn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 44));
        orderBtn.addActionListener(e -> {
            String fuel = userFuelCombo.getSelectedIndex() == 0 ? "PETROL" : (userFuelCombo.getSelectedIndex() == 1 ? "DIESEL" : "CNG");
            createOrderAndInvoice(currentUser.id, fuel, "Mumbai", userVolumeSlider.getValue(), userAddressField.getText(), "MH-01-TK-101", "CAR");
            refreshData();
            JOptionPane.showMessageDialog(this, "🎉 Doorstep delivery en route! Tanker assigned with PESO density certification.", "Order Dispatched", JOptionPane.INFORMATION_MESSAGE);
        });
        formCard.add(orderBtn);
        return formCard;
    }

    private JPanel createCustomerInvoicesTab() {
        JPanel rightCard = new JPanel(new BorderLayout(0, 10));
        rightCard.setBackground(COLOR_SURFACE);
        rightCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(20, 20, 20, 20)
        ));

        JLabel oTitle = new JLabel("My Orders & Digital Invoices");
        oTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));
        oTitle.setForeground(COLOR_TEXT_PRIMARY);
        rightCard.add(oTitle, BorderLayout.NORTH);

        userOrdersTableModel = new DefaultTableModel(new String[]{"Order #", "Fuel", "Litres", "Total", "Status", "ETA"}, 0);
        JTable table = createDarkTable(userOrdersTableModel);
        rightCard.add(new JScrollPane(table), BorderLayout.CENTER);
        return rightCard;
    }

    private JPanel createCustomerFeedbackTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 12));
        panel.setBackground(COLOR_BG);
        panel.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel title = new JLabel("⭐ Verified Delivery Experience & Pilot Ratings");
        title.setFont(new Font("Segoe UI", Font.BOLD, 16));
        title.setForeground(COLOR_TEXT_PRIMARY);

        JButton rateBtn = new JButton("✍️ Submit Delivery Feedback");
        rateBtn.setBackground(COLOR_PRIMARY);
        rateBtn.setForeground(Color.WHITE);
        rateBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        rateBtn.setOpaque(true);
        rateBtn.setContentAreaFilled(true);
        rateBtn.setBorderPainted(false);
        rateBtn.addActionListener(e -> {
            JComboBox<String> ordCombo = new JComboBox<>(new String[]{"FT-ORD-2026-1001", "FT-ORD-2026-0994", "FT-ORD-2026-0988"});
            JComboBox<String> pilotCombo = new JComboBox<>(new String[]{"Rajesh Kumar (TK-101)", "Amit Patel (TK-102)", "Suresh Shinde (TK-103)"});
            JComboBox<String> starCombo = new JComboBox<>(new String[]{"⭐⭐⭐⭐⭐ (5 Stars - Exceptional)", "⭐⭐⭐⭐ (4 Stars - Good)", "⭐⭐⭐ (3 Stars - Average)", "⭐⭐ (2 Stars - Poor)", "⭐ (1 Star - Terrible)"});
            JTextArea commentArea = new JTextArea(4, 25);
            commentArea.setText("Prompt arrival, verified PESO seal, computerized meter flow.");
            commentArea.setLineWrap(true);
            commentArea.setWrapStyleWord(true);

            JPanel form = new JPanel(new GridLayout(4, 2, 8, 8));
            form.add(new JLabel("Select Order:")); form.add(ordCombo);
            form.add(new JLabel("Delivery Pilot:")); form.add(pilotCombo);
            form.add(new JLabel("Rating:")); form.add(starCombo);
            form.add(new JLabel("Comments:")); form.add(new JScrollPane(commentArea));

            int res = JOptionPane.showConfirmDialog(this, form, "Submit Verified Delivery Feedback", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
            if (res == JOptionPane.OK_OPTION) {
                int stars = 5 - starCombo.getSelectedIndex();
                String id = "fb-" + System.currentTimeMillis();
                String ord = (String) ordCombo.getSelectedItem();
                String pilot = (String) pilotCombo.getSelectedItem();
                String cmt = commentArea.getText().trim();
                DeliveryFeedback fb = new DeliveryFeedback(id, ord, currentUser.name, stars, pilot, cmt, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                FEEDBACKS.put(id, fb);
                refreshData();
                JOptionPane.showMessageDialog(this, "Thank you! Your feedback has been published to the Owner's CSAT wall.", "Feedback Recorded", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        topBar.add(title, BorderLayout.WEST);
        topBar.add(rateBtn, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        userFeedbackTableModel = new DefaultTableModel(new String[]{"Order #", "Customer", "Rating", "Pilot / Tanker", "Feedback Comment", "Date / Time"}, 0);
        JTable table = createDarkTable(userFeedbackTableModel);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createCustomerComplaintsTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 12));
        panel.setBackground(COLOR_BG);
        panel.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel title = new JLabel("📢 Open Customer Grievance Center (Direct to Station Owner)");
        title.setFont(new Font("Segoe UI", Font.BOLD, 16));
        title.setForeground(COLOR_ACCENT);

        JButton raiseBtn = new JButton("⚠️ Raise Open Grievance to Owner");
        raiseBtn.setBackground(COLOR_DANGER);
        raiseBtn.setForeground(Color.WHITE);
        raiseBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        raiseBtn.setOpaque(true);
        raiseBtn.setContentAreaFilled(true);
        raiseBtn.setBorderPainted(false);
        raiseBtn.addActionListener(e -> {
            JComboBox<String> catCombo = new JComboBox<>(new String[]{
                "Density / Purity Suspicion", "Delivery Delay / ETA Lag", "Dispenser Meter Calibration Dispute",
                "Pilot / Driver Conduct", "Billing / Extra Fee Discrepancy"
            });
            JComboBox<String> sevCombo = new JComboBox<>(new String[]{"HIGH (Urgent Resolution)", "MEDIUM (Standard Review)", "LOW (General Inquiry)"});
            JTextArea descArea = new JTextArea(4, 25);
            descArea.setLineWrap(true);
            descArea.setWrapStyleWord(true);
            descArea.setText("Need secondary hydrometer calibration check on recent fuel delivery.");

            JPanel form = new JPanel(new GridLayout(3, 2, 8, 8));
            form.add(new JLabel("Grievance Category:")); form.add(catCombo);
            form.add(new JLabel("Severity Level:")); form.add(sevCombo);
            form.add(new JLabel("Detailed Description:")); form.add(new JScrollPane(descArea));

            int res = JOptionPane.showConfirmDialog(this, form, "Raise Open Grievance Directly to Owner", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
            if (res == JOptionPane.OK_OPTION) {
                long num = ticketCounter.incrementAndGet();
                String tktCode = "FT-TKT-2026-" + num;
                String id = "tkt-" + num;
                String cat = (String) catCombo.getSelectedItem();
                String sev = ((String) sevCombo.getSelectedItem()).split(" ")[0];
                String desc = descArea.getText().trim();
                Complaint c = new Complaint(id, tktCode, currentUser.id, currentUser.name, currentUser.phone, cat, desc, sev, "OPEN", "Directly forwarded to Station Owner desk.", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                COMPLAINTS.put(id, c);
                refreshData();
                JOptionPane.showMessageDialog(this, "✅ Ticket " + tktCode + " created successfully!\n\nThis grievance was sent directly to Station Owner Sanjay Mehta's cockpit.\nTurnaround time: Under 15 minutes.", "Ticket Dispatched", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        topBar.add(title, BorderLayout.WEST);
        topBar.add(raiseBtn, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        userComplaintsTableModel = new DefaultTableModel(new String[]{"Ticket #", "Category", "Description", "Severity", "Status", "Owner Resolution Note", "Date / Time"}, 0);
        JTable table = createDarkTable(userComplaintsTableModel);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);
        return panel;
    }

    private void recalculateUserPrice() {
        if (userFuelCombo == null || userVolumeSlider == null || userTotalDisplay == null) return;
        double rate = userFuelCombo.getSelectedIndex() == 0 ? 104.21 : (userFuelCombo.getSelectedIndex() == 1 ? 92.15 : 86.50);
        double total = (userVolumeSlider.getValue() * rate) + 50.00;
        userTotalDisplay.setText(String.format(Locale.US, "₹%.2f", total));
    }

    // ------------------------------------------------------------------------
    // PAGE 3: DEDICATED STATION OWNER MASTER COCKPIT (Full Master Access)
    // ------------------------------------------------------------------------
    private JPanel createOwnerMasterPage() {
        JPanel page = new JPanel(new BorderLayout(0, 14));
        page.setBackground(COLOR_BG);

        // Header
        JPanel nav = new JPanel(new BorderLayout());
        nav.setBackground(COLOR_SURFACE);
        nav.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER),
                new EmptyBorder(12, 24, 12, 24)
        ));

        JLabel brand = new JLabel("👑 FuelTrack Station Owner — Master Operations Cockpit");
        brand.setFont(new Font("Segoe UI", Font.BOLD, 17));
        brand.setForeground(COLOR_GOLD);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        right.setOpaque(false);

        JLabel roleBadge = new JLabel("Full Master Access Granted");
        roleBadge.setFont(new Font("Segoe UI", Font.BOLD, 12));
        roleBadge.setForeground(COLOR_SUCCESS);

        // Persistent Settings Button
        JButton settingsBtn = new JButton("⚙ Owner Settings");
        settingsBtn.setBackground(COLOR_SURFACE_ALT);
        settingsBtn.setForeground(COLOR_GOLD);
        settingsBtn.setOpaque(true);
        settingsBtn.setContentAreaFilled(true);
        settingsBtn.setBorderPainted(false);
        settingsBtn.addActionListener(e -> showSettingsDialog("Station Owner"));

        JButton logoutBtn = new JButton("🚪 Log Out");
        logoutBtn.setBackground(new Color(239, 68, 68, 40));
        logoutBtn.setForeground(COLOR_DANGER);
        logoutBtn.setOpaque(true);
        logoutBtn.setContentAreaFilled(true);
        logoutBtn.setBorderPainted(false);
        logoutBtn.addActionListener(e -> cardLayout.show(mainContainer, PAGE_LOGIN));

        right.add(roleBadge);
        right.add(settingsBtn);
        right.add(logoutBtn);

        nav.add(brand, BorderLayout.WEST);
        nav.add(right, BorderLayout.EAST);
        page.add(nav, BorderLayout.NORTH);

        // Tabbed Owner Cockpits - DEFAULT TAB 1 IS FLEET GPS RADAR (NO STARTING DASHBOARD)
        JTabbedPane ownerTabs = new JTabbedPane();
        ownerTabs.setBackground(COLOR_SURFACE);
        ownerTabs.setForeground(COLOR_TEXT_PRIMARY);
        ownerTabs.setFont(new Font("Segoe UI", Font.BOLD, 13));

        // Tab 1: Live Fleet GPS Radar & Operations Control (DEFAULT ACTIVE)
        ownerTabs.addTab("🛰️ Fleet GPS Radar & Telematics", createOwnerFleetRadarTab());

        // Tab 2: Bulk Storage Reserves
        JPanel tanksTab = new JPanel(new BorderLayout(0, 12));
        tanksTab.setBackground(COLOR_BG);
        tanksTab.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel tTop = new JPanel(new BorderLayout());
        tTop.setOpaque(false);
        JLabel tLbl = new JLabel("Depot Storage Reserves & Ultrasonic Sensors");
        tLbl.setFont(new Font("Segoe UI", Font.BOLD, 15));
        tLbl.setForeground(COLOR_TEXT_PRIMARY);

        JButton refillBtn = new JButton("⚡ Bulk Pipeline Refill (Decant Tanks)");
        refillBtn.setBackground(COLOR_SUCCESS);
        refillBtn.setForeground(Color.WHITE);
        refillBtn.setOpaque(true);
        refillBtn.setContentAreaFilled(true);
        refillBtn.setBorderPainted(false);
        refillBtn.addActionListener(e -> {
            for (FuelTank ft : FUEL_TANKS.values()) ft.currentQuantityLitres = ft.maxCapacityLitres * 0.95;
            refreshData();
            JOptionPane.showMessageDialog(this, "Depot storage tanks topped up to 95% safety capacity!", "Bulk Decanting Complete", JOptionPane.INFORMATION_MESSAGE);
        });

        tTop.add(tLbl, BorderLayout.WEST);
        tTop.add(refillBtn, BorderLayout.EAST);
        tanksTab.add(tTop, BorderLayout.NORTH);

        ownerTanksPanel = new JPanel(new GridLayout(2, 2, 16, 16));
        ownerTanksPanel.setOpaque(false);
        tanksTab.add(ownerTanksPanel, BorderLayout.CENTER);
        ownerTabs.addTab("🏭 Bulk Storage Reserves", tanksTab);

        // Tab 3: Fleet Telematics Table
        JPanel fleetTab = new JPanel(new BorderLayout(0, 10));
        fleetTab.setBackground(COLOR_BG);
        fleetTab.setBorder(new EmptyBorder(16, 20, 16, 20));
        ownerFleetTableModel = new DefaultTableModel(new String[]{"Code", "Name", "Product", "Volume", "Status", "Speed", "Temp", "Calibration"}, 0);
        fleetTab.add(new JScrollPane(createDarkTable(ownerFleetTableModel)), BorderLayout.CENTER);
        ownerTabs.addTab("🚚 Fleet Bowsers Table", fleetTab);

        // Tab 4: Customer Orders Stream (Full Owner Control)
        JPanel ordersTab = new JPanel(new BorderLayout(0, 10));
        ordersTab.setBackground(COLOR_BG);
        ordersTab.setBorder(new EmptyBorder(16, 20, 16, 20));
        ownerOrdersTableModel = new DefaultTableModel(new String[]{"Order #", "Product", "Litres", "Rate", "Total", "Status", "Address"}, 0);
        ordersTab.add(new JScrollPane(createDarkTable(ownerOrdersTableModel)), BorderLayout.CENTER);
        ownerTabs.addTab("📋 Orders Stream & Override", ordersTab);

        // Tab 5: Official Rates Management
        JPanel ratesTab = new JPanel(new BorderLayout(0, 10));
        ratesTab.setBackground(COLOR_BG);
        ratesTab.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel rTop = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        rTop.setOpaque(false);
        JButton editRateBtn = new JButton("✏️ Edit Rate");
        editRateBtn.setBackground(COLOR_GOLD);
        editRateBtn.setForeground(Color.BLACK);
        editRateBtn.setOpaque(true);
        editRateBtn.setContentAreaFilled(true);
        editRateBtn.setBorderPainted(false);
        editRateBtn.addActionListener(e -> {
            String input = JOptionPane.showInputDialog(this, "Enter new Mumbai Petrol rate (₹/L):", "104.21");
            if (input != null && !input.trim().isEmpty()) {
                FuelRate fr = FUEL_RATES.get("rate-mum-petrol");
                if (fr != null) fr.ratePerLitre = Double.parseDouble(input.trim());
                refreshData();
                JOptionPane.showMessageDialog(this, "Fuel rate updated to ₹" + input + " / L", "Rate Updated", JOptionPane.INFORMATION_MESSAGE);
            }
        });
        rTop.add(editRateBtn);
        ratesTab.add(rTop, BorderLayout.NORTH);

        ownerRatesTableModel = new DefaultTableModel(new String[]{"City", "Fuel Type", "Govt Rate / L", "Flat Fee", "Markup"}, 0);
        ratesTab.add(new JScrollPane(createDarkTable(ownerRatesTableModel)), BorderLayout.CENTER);
        ownerTabs.addTab("🏷️ Official Fuel Rates", ratesTab);

        // Tab 6: Customer Grievance Desk
        ownerTabs.addTab("📬 Customer Grievance Desk", createOwnerComplaintsTab());

        // Tab 7: Customer Reviews & CSAT Wall
        ownerTabs.addTab("⭐ Customer Reviews & CSAT", createOwnerFeedbackTab());

        // Tab 8: Financial Margins & PESO Safety Audit
        ownerTabs.addTab("💰 Financials & PESO Safety", createOwnerFinancialsTab());

        page.add(ownerTabs, BorderLayout.CENTER);
        return page;
    }

    private JPanel createOwnerFinancialsTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 16));
        panel.setBackground(COLOR_BG);
        panel.setBorder(new EmptyBorder(16, 20, 16, 20));

        JLabel title = new JLabel("💰 Station Financial Accounting & PESO Safety Compliance");
        title.setFont(new Font("Segoe UI", Font.BOLD, 16));
        title.setForeground(COLOR_GOLD);
        panel.add(title, BorderLayout.NORTH);

        JPanel grid = new JPanel(new GridLayout(1, 2, 20, 0));
        grid.setOpaque(false);

        // Left: Financial Breakdown
        JPanel finCard = new JPanel(new GridLayout(6, 1, 8, 8));
        finCard.setBackground(COLOR_SURFACE);
        finCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(16, 18, 16, 18)
        ));
        JLabel f1 = new JLabel("Gross Daily Fuel Sales: ₹1,84,650.00");
        f1.setFont(new Font("Segoe UI", Font.BOLD, 13));
        f1.setForeground(COLOR_TEXT_PRIMARY);

        JLabel f2 = new JLabel("IOCL/BPCL Bulk Wholesale Cost: - ₹1,58,200.00");
        f2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        f2.setForeground(COLOR_DANGER);

        JLabel f3 = new JLabel("Doorstep Delivery Fee Revenue: + ₹14,200.00");
        f3.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        f3.setForeground(COLOR_PRIMARY_HOVER);

        JLabel f4 = new JLabel("Net Station Operating Margin: + ₹26,450.00 (14.3%)");
        f4.setFont(new Font("Segoe UI", Font.BOLD, 14));
        f4.setForeground(COLOR_SUCCESS);

        JLabel f5 = new JLabel("• Speed Petrol Margin: ₹4.80/L  • Diesel: ₹3.90/L  • CNG: ₹5.20/L");
        f5.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        f5.setForeground(COLOR_TEXT_SECONDARY);

        JLabel f6 = new JLabel("Zero Platform Markup Policy Verified (100% PESO Mandate)");
        f6.setFont(new Font("Segoe UI", Font.BOLD, 11));
        f6.setForeground(COLOR_GOLD);

        finCard.add(f1); finCard.add(f2); finCard.add(f3); finCard.add(f4); finCard.add(f5); finCard.add(f6);

        // Right: PESO Safety Checklist & Certification
        JPanel pesoCard = new JPanel(new GridLayout(6, 1, 8, 8));
        pesoCard.setBackground(COLOR_SURFACE);
        pesoCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(16, 18, 16, 18)
        ));

        JLabel p1 = new JLabel("✅ Vapor Recovery Unit (VRU) Pressure Sealed");
        p1.setFont(new Font("Segoe UI", Font.BOLD, 11)); p1.setForeground(COLOR_SUCCESS);
        JLabel p2 = new JLabel("✅ Static Earthing Clamp Resistance: 8.4 Ω (< 10 Ω Limit)");
        p2.setFont(new Font("Segoe UI", Font.BOLD, 11)); p2.setForeground(COLOR_SUCCESS);
        JLabel p3 = new JLabel("✅ Class-B Dry Chemical Fire Extinguishers Charged");
        p3.setFont(new Font("Segoe UI", Font.BOLD, 11)); p3.setForeground(COLOR_SUCCESS);
        JLabel p4 = new JLabel("✅ ATEX Digital Flow-Meter Calibrated (±0.01% Standard)");
        p4.setFont(new Font("Segoe UI", Font.BOLD, 11)); p4.setForeground(COLOR_SUCCESS);
        JLabel p5 = new JLabel("✅ Pilots Breathalyzer & Non-Sparking Boots Verified");
        p5.setFont(new Font("Segoe UI", Font.BOLD, 11)); p5.setForeground(COLOR_SUCCESS);

        JButton signPesoBtn = new JButton("✍️ Sign & Submit Daily PESO Safety Log");
        signPesoBtn.setBackground(COLOR_GOLD);
        signPesoBtn.setForeground(Color.BLACK);
        signPesoBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        signPesoBtn.setOpaque(true);
        signPesoBtn.setContentAreaFilled(true);
        signPesoBtn.setBorderPainted(false);
        signPesoBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this, "✅ Daily PESO Compliance Audit digitally signed & transmitted!\nCertificate Hash: PESO-CERT-" + System.currentTimeMillis(), "PESO Audit Certified", JOptionPane.INFORMATION_MESSAGE);
        });

        pesoCard.add(p1); pesoCard.add(p2); pesoCard.add(p3); pesoCard.add(p4); pesoCard.add(p5); pesoCard.add(signPesoBtn);

        grid.add(finCard);
        grid.add(pesoCard);
        panel.add(grid, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createOwnerComplaintsTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 12));
        panel.setBackground(COLOR_BG);
        panel.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel title = new JLabel("📬 Customer Grievance Desk (Direct Dispatch from Customer Dashboards)");
        title.setFont(new Font("Segoe UI", Font.BOLD, 16));
        title.setForeground(COLOR_GOLD);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        actions.setOpaque(false);

        JButton callBtn = new JButton("📞 Call Customer");
        callBtn.setBackground(COLOR_SURFACE_ALT);
        callBtn.setForeground(Color.WHITE);
        callBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        callBtn.setOpaque(true);
        callBtn.setContentAreaFilled(true);
        callBtn.setBorderPainted(false);
        callBtn.addActionListener(e -> {
            int row = ownerComplaintsTable != null ? ownerComplaintsTable.getSelectedRow() : -1;
            if (row >= 0) {
                String cust = (String) ownerComplaintsTableModel.getValueAt(row, 1);
                String phone = (String) ownerComplaintsTableModel.getValueAt(row, 2);
                JOptionPane.showMessageDialog(this, "📞 Dialing " + cust + " at " + phone + " via Station Owner Telematics Line...", "Outbound Call", JOptionPane.INFORMATION_MESSAGE);
            } else {
                JOptionPane.showMessageDialog(this, "Please select a complaint row first to call the customer.", "Select Complaint", JOptionPane.WARNING_MESSAGE);
            }
        });

        JButton retestBtn = new JButton("🔬 Dispatch Retest");
        retestBtn.setBackground(COLOR_PRIMARY);
        retestBtn.setForeground(Color.WHITE);
        retestBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        retestBtn.setOpaque(true);
        retestBtn.setContentAreaFilled(true);
        retestBtn.setBorderPainted(false);
        retestBtn.addActionListener(e -> {
            for (Complaint c : COMPLAINTS.values()) {
                if ("OPEN".equalsIgnoreCase(c.status) || c.category.toLowerCase().contains("density")) {
                    c.status = "INVESTIGATING";
                    c.resolutionNotes = "PESO Mobile Quality Inspector assigned with hydrometer.";
                    break;
                }
            }
            refreshData();
            JOptionPane.showMessageDialog(this, "🔬 Mobile Quality Inspector assigned with hydrometer.\nCustomer notified via SMS status update.", "Retest Dispatched", JOptionPane.INFORMATION_MESSAGE);
        });

        JButton refundBtn = new JButton("💳 Instant UPI Refund");
        refundBtn.setBackground(COLOR_ACCENT);
        refundBtn.setForeground(Color.WHITE);
        refundBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        refundBtn.setOpaque(true);
        refundBtn.setContentAreaFilled(true);
        refundBtn.setBorderPainted(false);
        refundBtn.addActionListener(e -> {
            String input = JOptionPane.showInputDialog(this, "Enter refund amount in ₹ to credit customer UPI:", "83.36");
            if (input != null && !input.trim().isEmpty()) {
                for (Complaint c : COMPLAINTS.values()) {
                    if ("OPEN".equalsIgnoreCase(c.status) || c.category.toLowerCase().contains("meter") || c.category.toLowerCase().contains("billing")) {
                        c.status = "RESOLVED";
                        c.resolutionNotes = "Instant UPI refund of ₹" + input.trim() + " processed. Ref: UPI-REF-" + System.currentTimeMillis();
                        break;
                    }
                }
                refreshData();
                JOptionPane.showMessageDialog(this, "✅ Instant UPI refund of ₹" + input.trim() + " credited to customer account!\nTicket marked as RESOLVED.", "Refund Dispatched", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        JButton resolveBtn = new JButton("✅ Mark Resolved");
        resolveBtn.setBackground(COLOR_SUCCESS);
        resolveBtn.setForeground(Color.WHITE);
        resolveBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        resolveBtn.setOpaque(true);
        resolveBtn.setContentAreaFilled(true);
        resolveBtn.setBorderPainted(false);
        resolveBtn.addActionListener(e -> {
            String note = JOptionPane.showInputDialog(this, "Enter Owner Resolution Note:", "Issue investigated and resolved to customer satisfaction.");
            if (note != null && !note.trim().isEmpty()) {
                for (Complaint c : COMPLAINTS.values()) {
                    if (!"RESOLVED".equalsIgnoreCase(c.status)) {
                        c.status = "RESOLVED";
                        c.resolutionNotes = note.trim();
                        break;
                    }
                }
                refreshData();
                JOptionPane.showMessageDialog(this, "Ticket marked as RESOLVED with owner remarks.", "Grievance Resolved", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        actions.add(callBtn);
        actions.add(retestBtn);
        actions.add(refundBtn);
        actions.add(resolveBtn);

        topBar.add(title, BorderLayout.WEST);
        topBar.add(actions, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        ownerComplaintsTableModel = new DefaultTableModel(new String[]{"Ticket #", "Customer", "Phone", "Category", "Severity", "Status", "Grievance Description", "Owner Resolution Note"}, 0);
        ownerComplaintsTable = createDarkTable(ownerComplaintsTableModel);
        panel.add(new JScrollPane(ownerComplaintsTable), BorderLayout.CENTER);
        return panel;
    }

    private JTable ownerComplaintsTable;
    private JTable ownerFeedbackTable;

    private JPanel createOwnerFeedbackTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 12));
        panel.setBackground(COLOR_BG);
        panel.setBorder(new EmptyBorder(16, 20, 16, 20));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setOpaque(false);
        JLabel title = new JLabel("⭐ Customer Reviews & CSAT Operations Wall (Overall: 4.95 / 5.0 ★)");
        title.setFont(new Font("Segoe UI", Font.BOLD, 16));
        title.setForeground(COLOR_GOLD);

        JPanel rActions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        rActions.setOpaque(false);

        JButton replyBtn = new JButton("💬 Reply as Station Owner");
        replyBtn.setBackground(COLOR_GOLD);
        replyBtn.setForeground(Color.BLACK);
        replyBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        replyBtn.setOpaque(true);
        replyBtn.setContentAreaFilled(true);
        replyBtn.setBorderPainted(false);
        replyBtn.addActionListener(e -> {
            int row = ownerFeedbackTable != null ? ownerFeedbackTable.getSelectedRow() : -1;
            String targetCust = row >= 0 ? (String) ownerFeedbackTableModel.getValueAt(row, 1) : "Customer";
            String reply = JOptionPane.showInputDialog(this, "Enter official Station Owner reply to " + targetCust + ":", "Thank you for trusting FuelTrack! We are committed to uncompromised BS-VI purity.");
            if (reply != null && !reply.trim().isEmpty()) {
                JOptionPane.showMessageDialog(this, "✅ Official Station Owner Response published for " + targetCust + "!\nNow live on the Customer Portal.", "Reply Published", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        JLabel badge = new JLabel("99.2% Positive • 100% Zero-Markup Verified");
        badge.setFont(new Font("Segoe UI", Font.BOLD, 12));
        badge.setForeground(COLOR_SUCCESS);

        rActions.add(badge);
        rActions.add(replyBtn);

        topBar.add(title, BorderLayout.WEST);
        topBar.add(rActions, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        ownerFeedbackTableModel = new DefaultTableModel(new String[]{"Order #", "Customer Name", "Rating", "Pilot / Tanker", "Customer Review", "Delivery Date / Time"}, 0);
        ownerFeedbackTable = createDarkTable(ownerFeedbackTableModel);
        panel.add(new JScrollPane(ownerFeedbackTable), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createOwnerFleetRadarTab() {
        JPanel tab = new JPanel(new BorderLayout(0, 14));
        tab.setBackground(COLOR_BG);
        tab.setBorder(new EmptyBorder(14, 18, 16, 18));

        // Top Status Strip
        JPanel topBanner = new JPanel(new BorderLayout(12, 0));
        topBanner.setBackground(new Color(245, 158, 11, 20));
        topBanner.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_GOLD, 1, true),
                new EmptyBorder(8, 14, 8, 14)
        ));
        JLabel b1 = new JLabel("🛰️ STATION OWNER MASTER RADAR: 3 Mobile Dispenser Bowsers Active Across Greater Mumbai | Satellite Telemetry Locked");
        b1.setFont(new Font("Segoe UI", Font.BOLD, 12));
        b1.setForeground(COLOR_GOLD);
        JLabel b2 = new JLabel("● 100% PESO COMPLIANT & ATEX ZONE-0 SEALED");
        b2.setFont(new Font("Segoe UI", Font.BOLD, 11));
        b2.setForeground(COLOR_SUCCESS);
        topBanner.add(b1, BorderLayout.WEST);
        topBanner.add(b2, BorderLayout.EAST);
        tab.add(topBanner, BorderLayout.NORTH);

        // Center Split: Left Animated Multi-Tanker Radar Canvas + Right Fleet Telematics HUD
        JPanel center = new JPanel(new GridLayout(1, 2, 16, 0));
        center.setOpaque(false);

        final double[] sweepAngle = {0.0};
        final boolean[] estopActive = {false};

        // Left 2D Radar Canvas
        JPanel radarCanvas = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                int w = getWidth();
                int h = getHeight();

                // Background
                if (estopActive[0]) {
                    g2.setColor(new Color(40, 10, 15));
                } else {
                    g2.setColor(new Color(6, 13, 23));
                }
                g2.fillRect(0, 0, w, h);

                int cx = w / 2;
                int cy = h / 2;
                int maxR = Math.min(cx, cy) - 25;

                // Range rings
                g2.setColor(new Color(14, 165, 233, 45));
                g2.setStroke(new BasicStroke(1.2f));
                for (int r = 1; r <= 4; r++) {
                    int rad = maxR * r / 4;
                    g2.drawOval(cx - rad, cy - rad, rad * 2, rad * 2);
                    g2.setFont(new Font("Consolas", Font.PLAIN, 10));
                    g2.setColor(new Color(148, 163, 184, 140));
                    g2.drawString((r * 5) + "km", cx + 4, cy - rad + 12);
                    g2.setColor(new Color(14, 165, 233, 45));
                }

                // Crosshairs
                g2.setColor(new Color(14, 165, 233, 50));
                g2.drawLine(cx - maxR, cy, cx + maxR, cy);
                g2.drawLine(cx, cy - maxR, cx, cy + maxR);

                // Sweep Beam
                if (!estopActive[0]) {
                    float radSweep = (float) Math.toRadians(sweepAngle[0]);
                    int sweepX = (int) (cx + maxR * Math.cos(radSweep));
                    int sweepY = (int) (cy + maxR * Math.sin(radSweep));

                    g2.setColor(new Color(16, 185, 129, 210));
                    g2.setStroke(new BasicStroke(2.2f));
                    g2.drawLine(cx, cy, sweepX, sweepY);

                    // Sector glow
                    Color cStart = new Color(16, 185, 129, 65);
                    Color cEnd = new Color(16, 185, 129, 0);
                    GradientPaint gp = new GradientPaint(cx, cy, cStart, sweepX, sweepY, cEnd);
                    g2.setPaint(gp);
                    g2.fillArc(cx - maxR, cy - maxR, maxR * 2, maxR * 2, (int) -sweepAngle[0], 45);
                }

                // Landmark 1: Mumbai Central Depot (HQ) at center
                g2.setColor(new Color(245, 158, 11));
                g2.fillOval(cx - 9, cy - 9, 18, 18);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.drawString("HPCL CENTRAL DEPOT (HQ)", cx - 72, cy + 22);

                // Landmark 2: Worli Sea Face (Zone A)
                int wx = cx - (int)(maxR * 0.55), wy = cy - (int)(maxR * 0.35);
                g2.setColor(new Color(148, 163, 184, 120));
                g2.drawString("WORLI SEA FACE", wx - 42, wy - 8);

                // Landmark 3: Powai Tech SEZ (Zone B)
                int px = cx + (int)(maxR * 0.65), py = cy - (int)(maxR * 0.50);
                g2.setColor(new Color(148, 163, 184, 120));
                g2.drawString("POWAI TECH SEZ", px - 40, py - 8);

                // Landmark 4: BKC Financial Park
                int bx = cx + (int)(maxR * 0.25), by = cy + (int)(maxR * 0.45);
                g2.setColor(new Color(148, 163, 184, 120));
                g2.drawString("BKC FINANCIAL PARK", bx - 50, by + 16);

                // --- TANKER 1: MH-01-TK-101 (Worli Sea Face delivery) ---
                int t1x = wx + (int)(25 * Math.sin(Math.toRadians(sweepAngle[0] * 1.5)));
                int t1y = wy + (int)(15 * Math.cos(Math.toRadians(sweepAngle[0] * 1.5)));
                int pulse1 = 14 + (int)(5 * Math.sin(Math.toRadians(sweepAngle[0] * 4)));
                g2.setColor(new Color(14, 165, 233, 80));
                g2.fillOval(t1x - pulse1, t1y - pulse1, pulse1 * 2, pulse1 * 2);
                g2.setColor(new Color(14, 165, 233));
                g2.fillRoundRect(t1x - 11, t1y - 11, 22, 22, 6, 6);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.drawString("TK-101 (42 km/h)", t1x + 15, t1y + 4);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 9));
                g2.setColor(new Color(148, 163, 184));
                g2.drawString("Rajesh K. • Petrol 1,480L", t1x + 15, t1y + 16);

                // --- TANKER 2: MH-02-TK-102 (Powai Hiranandani IT Park) ---
                int t2x = px - (int)(30 * Math.cos(Math.toRadians(sweepAngle[0] * 1.2)));
                int t2y = py + (int)(20 * Math.sin(Math.toRadians(sweepAngle[0] * 1.2)));
                int pulse2 = 14 + (int)(5 * Math.cos(Math.toRadians(sweepAngle[0] * 4)));
                g2.setColor(new Color(16, 185, 129, 80));
                g2.fillOval(t2x - pulse2, t2y - pulse2, pulse2 * 2, pulse2 * 2);
                g2.setColor(new Color(16, 185, 129));
                g2.fillRoundRect(t2x - 11, t2y - 11, 22, 22, 6, 6);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.drawString("TK-102 (38 km/h)", t2x + 15, t2y + 4);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 9));
                g2.setColor(new Color(148, 163, 184));
                g2.drawString("Amit P. • Diesel 3,200L", t2x + 15, t2y + 16);

                // --- TANKER 3: MH-03-TK-103 (Decanting at Central Depot) ---
                int t3x = cx + 28, t3y = cy + 32;
                g2.setColor(new Color(245, 158, 11));
                g2.fillRoundRect(t3x - 10, t3y - 10, 20, 20, 6, 6);
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.drawString("TK-103 (0 km/h)", t3x + 14, t3y + 4);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 9));
                g2.setColor(new Color(148, 163, 184));
                g2.drawString("Suresh S. • CNG Loading", t3x + 14, t3y + 16);

                // E-STOP Alarm Overlay Banner
                if (estopActive[0]) {
                    g2.setColor(new Color(239, 68, 68, 220));
                    g2.fillRect(0, h / 2 - 35, w, 70);
                    g2.setColor(Color.WHITE);
                    g2.setFont(new Font("Segoe UI", Font.BOLD, 18));
                    g2.drawString("⚠️ EMERGENCY FLEET CUTOFF ACTIVATED", w / 2 - 195, h / 2 - 4);
                    g2.setFont(new Font("Segoe UI", Font.PLAIN, 12));
                    g2.drawString("ALL ATEX PUMP NOZZLES AND DISCHARGE VALVES LOCKED SHUT", w / 2 - 200, h / 2 + 18);
                }

                g2.dispose();
            }
        };
        radarCanvas.setBorder(new LineBorder(COLOR_BORDER, 1, true));

        // Right Fleet Telematics HUD
        JPanel hudPanel = new JPanel();
        hudPanel.setLayout(new BoxLayout(hudPanel, BoxLayout.Y_AXIS));
        hudPanel.setBackground(COLOR_SURFACE);
        hudPanel.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(16, 18, 16, 18)
        ));

        JLabel hudTitle = new JLabel("🎮 Fleet Operations Command Console");
        hudTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));
        hudTitle.setForeground(COLOR_TEXT_PRIMARY);
        hudPanel.add(hudTitle);
        hudPanel.add(Box.createVerticalStrut(14));

        // Live Metric Counters Box
        JPanel metricsGrid = new JPanel(new GridLayout(2, 2, 10, 10));
        metricsGrid.setOpaque(false);
        metricsGrid.add(createHudStatCard("Active Mobile Bowsers", "3 En Route", COLOR_PRIMARY_HOVER));
        metricsGrid.add(createHudStatCard("Total Mobile Fuel", "10,480 Litres", COLOR_SUCCESS));
        metricsGrid.add(createHudStatCard("IoT Transponder Ping", "14 ms (99.98%)", COLOR_GOLD));
        metricsGrid.add(createHudStatCard("PESO Valve Status", "Zero Tamper", COLOR_PRIMARY_HOVER));
        hudPanel.add(metricsGrid);
        hudPanel.add(Box.createVerticalStrut(16));

        // Driver Hazmat Performance Leaderboard
        JLabel dTitle = new JLabel("🏆 Pilot Hazmat & Driving Safety Leaderboard");
        dTitle.setFont(new Font("Segoe UI", Font.BOLD, 13));
        dTitle.setForeground(COLOR_TEXT_PRIMARY);
        hudPanel.add(dTitle);
        hudPanel.add(Box.createVerticalStrut(8));

        JPanel driverList = new JPanel(new GridLayout(3, 1, 6, 6));
        driverList.setOpaque(false);
        driverList.add(createDriverItem("🥇 Rajesh Kumar (TK-101)", "Score: 98.4% • 0 Harsh Brakes • En route Worli", COLOR_SUCCESS));
        driverList.add(createDriverItem("🥈 Amit Patel (TK-102)", "Score: 96.1% • 1 Harsh Brake • En route Powai", COLOR_PRIMARY_HOVER));
        driverList.add(createDriverItem("🥉 Suresh Shinde (TK-103)", "Score: 94.8% • Decanting at Mumbai Depot", COLOR_GOLD));
        hudPanel.add(driverList);
        hudPanel.add(Box.createVerticalStrut(18));

        // Interactive Master Command Buttons
        JPanel actionRow = new JPanel(new GridLayout(3, 1, 8, 8));
        actionRow.setOpaque(false);

        JButton pingBtn = new JButton("📡 Ping All Tanker IoT Transponders");
        pingBtn.setBackground(COLOR_PRIMARY);
        pingBtn.setForeground(Color.WHITE);
        pingBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        pingBtn.setOpaque(true);
        pingBtn.setContentAreaFilled(true);
        pingBtn.setBorderPainted(false);
        pingBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this,
                    "📡 SATELLITE BEACON DIAGNOSTIC REPORT\n" +
                    "--------------------------------------------------\n" +
                    "• Tanker MH-01-TK-101: Lat 18.9986, Lon 72.8174 | 14ms | GPS Locked | Flowmeter OK\n" +
                    "• Tanker MH-02-TK-102: Lat 19.1176, Lon 72.9060 | 18ms | GPS Locked | Flowmeter OK\n" +
                    "• Tanker MH-03-TK-103: Lat 18.9712, Lon 72.8197 | 11ms | Docked at Central Depot\n" +
                    "All 3 IoT micro-transponders communicating with Zero packet drop.",
                    "IoT Transponder Ping Diagnostics", JOptionPane.INFORMATION_MESSAGE);
        });

        JButton rerouteBtn = new JButton("🔄 Auto-Reroute Around WEH Traffic");
        rerouteBtn.setBackground(COLOR_SURFACE_ALT);
        rerouteBtn.setForeground(COLOR_TEXT_PRIMARY);
        rerouteBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        rerouteBtn.setOpaque(true);
        rerouteBtn.setContentAreaFilled(true);
        rerouteBtn.setBorderPainted(false);
        rerouteBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this,
                    "🚦 Traffic Telemetry Recalculated:\n" +
                    "TK-101 diverted via Senapati Bapat Marg.\n" +
                    "Saved 14 minutes in delivery ETA to Worli Sea Face!",
                    "Smart Reroute Executed", JOptionPane.INFORMATION_MESSAGE);
        });

        JButton estopBtn = new JButton("🛑 PESO EMERGENCY FLEET E-STOP");
        estopBtn.setBackground(COLOR_DANGER);
        estopBtn.setForeground(Color.WHITE);
        estopBtn.setFont(new Font("Segoe UI", Font.BOLD, 13));
        estopBtn.setOpaque(true);
        estopBtn.setContentAreaFilled(true);
        estopBtn.setBorderPainted(false);
        estopBtn.addActionListener(e -> {
            estopActive[0] = !estopActive[0];
            if (estopActive[0]) {
                estopBtn.setText("✅ RESET EMERGENCY SHUTOFF");
                JOptionPane.showMessageDialog(this,
                        "🚨 EMERGENCY FLEET SHUTDOWN COMMAND TRANSMITTED!\n" +
                        "All ATEX Solenoid safety valves locked.\n" +
                        "Pumps disengaged across all 3 bowsers.",
                        "EMERGENCY ACTIVE", JOptionPane.WARNING_MESSAGE);
            } else {
                estopBtn.setText("🛑 PESO EMERGENCY FLEET E-STOP");
                JOptionPane.showMessageDialog(this,
                        "System restored to normal operating conditions.",
                        "Normal Ops Restored", JOptionPane.INFORMATION_MESSAGE);
            }
            radarCanvas.repaint();
        });

        actionRow.add(pingBtn);
        actionRow.add(rerouteBtn);
        actionRow.add(estopBtn);
        hudPanel.add(actionRow);

        center.add(radarCanvas);
        center.add(hudPanel);
        tab.add(center, BorderLayout.CENTER);

        // Animation Timer for Radar Sweep
        javax.swing.Timer ownerRadarTimer = new javax.swing.Timer(40, e -> {
            sweepAngle[0] = (sweepAngle[0] + 2.5) % 360;
            radarCanvas.repaint();
        });
        ownerRadarTimer.start();
        return tab;
    }

    private JPanel createHudStatCard(String label, String value, Color col) {
        JPanel card = new JPanel(new GridLayout(2, 1, 2, 2));
        card.setBackground(COLOR_SURFACE_ALT);
        card.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(8, 10, 8, 10)
        ));
        JLabel l = new JLabel(label);
        l.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        l.setForeground(COLOR_TEXT_SECONDARY);
        JLabel v = new JLabel(value);
        v.setFont(new Font("Segoe UI", Font.BOLD, 14));
        v.setForeground(col);
        card.add(l);
        card.add(v);
        return card;
    }

    private JPanel createDriverItem(String name, String desc, Color col) {
        JPanel row = new JPanel(new BorderLayout(8, 2));
        row.setBackground(COLOR_SURFACE_ALT);
        row.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(COLOR_BORDER, 1, true),
                new EmptyBorder(6, 10, 6, 10)
        ));
        JLabel nl = new JLabel(name);
        nl.setFont(new Font("Segoe UI", Font.BOLD, 12));
        nl.setForeground(COLOR_TEXT_PRIMARY);
        JLabel dl = new JLabel(desc);
        dl.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        dl.setForeground(col);
        row.add(nl, BorderLayout.NORTH);
        row.add(dl, BorderLayout.SOUTH);
        return row;
    }

    // ------------------------------------------------------------------------
    // UNIVERSAL SETTINGS DIALOG (Accessible at any time)
    // ------------------------------------------------------------------------
    private void showSettingsDialog(String roleName) {
        JDialog dlg = new JDialog(this, "⚙ " + roleName + " Settings & Preferences", true);
        dlg.getContentPane().setBackground(COLOR_SURFACE);
        dlg.setSize(480, 420);
        dlg.setLocationRelativeTo(this);
        dlg.setLayout(new BorderLayout(0, 16));

        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(COLOR_SURFACE);
        content.setBorder(new EmptyBorder(20, 24, 20, 24));

        JLabel title = new JLabel(roleName + " Configuration");
        title.setFont(new Font("Segoe UI", Font.BOLD, 17));
        title.setForeground(COLOR_TEXT_PRIMARY);
        content.add(title);
        content.add(Box.createVerticalStrut(16));

        JTextField nameField = new JTextField(currentUser.name);
        nameField.setBackground(COLOR_SURFACE_ALT);
        nameField.setForeground(COLOR_TEXT_PRIMARY);

        JTextField phoneField = new JTextField(currentUser.phone);
        phoneField.setBackground(COLOR_SURFACE_ALT);
        phoneField.setForeground(COLOR_TEXT_PRIMARY);

        JTextField addrField = new JTextField(currentUser.address);
        addrField.setBackground(COLOR_SURFACE_ALT);
        addrField.setForeground(COLOR_TEXT_PRIMARY);

        content.add(createLabeledBox("Display Name:", nameField));
        content.add(Box.createVerticalStrut(10));
        content.add(createLabeledBox("Contact Phone:", phoneField));
        content.add(Box.createVerticalStrut(10));
        content.add(createLabeledBox("Default Location:", addrField));
        content.add(Box.createVerticalStrut(18));

        JButton saveBtn = new JButton("💾 Save Preferences");
        saveBtn.setFont(new Font("Segoe UI", Font.BOLD, 13));
        saveBtn.setBackground(COLOR_PRIMARY);
        saveBtn.setForeground(Color.WHITE);
        saveBtn.setOpaque(true);
        saveBtn.setContentAreaFilled(true);
        saveBtn.setBorderPainted(false);
        saveBtn.addActionListener(e -> {
            currentUser.name = nameField.getText().trim();
            currentUser.phone = phoneField.getText().trim();
            currentUser.address = addrField.getText().trim();
            dlg.dispose();
            JOptionPane.showMessageDialog(this, "Settings updated successfully!", "Saved", JOptionPane.INFORMATION_MESSAGE);
        });

        content.add(saveBtn);
        dlg.add(content, BorderLayout.CENTER);
        dlg.setVisible(true);
    }

    private JPanel createLabeledBox(String labelText, JComponent comp) {
        JPanel p = new JPanel(new BorderLayout(0, 4));
        p.setOpaque(false);
        p.setMaximumSize(new Dimension(Integer.MAX_VALUE, 48));
        JLabel l = new JLabel(labelText);
        l.setFont(new Font("Segoe UI", Font.BOLD, 11));
        l.setForeground(COLOR_TEXT_SECONDARY);
        p.add(l, BorderLayout.NORTH);
        p.add(comp, BorderLayout.CENTER);
        return p;
    }

    private JTable createDarkTable(DefaultTableModel model) {
        JTable table = new JTable(model);
        table.setBackground(COLOR_SURFACE_ALT);
        table.setForeground(COLOR_TEXT_PRIMARY);
        table.setGridColor(COLOR_BORDER);
        table.setRowHeight(28);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 12));

        JTableHeader th = table.getTableHeader();
        th.setBackground(COLOR_SURFACE);
        th.setForeground(COLOR_TEXT_SECONDARY);
        th.setFont(new Font("Segoe UI", Font.BOLD, 12));

        DefaultTableCellRenderer renderer = new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable t, Object v, boolean s, boolean f, int r, int c) {
                Component comp = super.getTableCellRendererComponent(t, v, s, f, r, c);
                setHorizontalAlignment(SwingConstants.CENTER);
                if (!s) {
                    comp.setBackground(r % 2 == 0 ? COLOR_SURFACE : COLOR_SURFACE_ALT);
                    comp.setForeground(COLOR_TEXT_PRIMARY);
                }
                return comp;
            }
        };
        for (int i = 0; i < table.getColumnCount(); i++) table.getColumnModel().getColumn(i).setCellRenderer(renderer);
        return table;
    }

    private void refreshData() {
        // Customer orders table
        if (userOrdersTableModel != null) {
            userOrdersTableModel.setRowCount(0);
            for (Order o : ORDERS.values()) {
                userOrdersTableModel.addRow(new Object[]{
                        o.orderNumber, o.fuelType, String.format(Locale.US, "%.1f L", o.quantityLitres),
                        String.format(Locale.US, "₹%.2f", o.totalAmount), o.status, o.estimatedDeliveryMinutes + " mins"
                });
            }
        }

        // Owner fleet table
        if (ownerFleetTableModel != null) {
            ownerFleetTableModel.setRowCount(0);
            for (Tanker t : TANKERS.values()) {
                ownerFleetTableModel.addRow(new Object[]{
                        t.code, t.name, t.fuelType, String.format(Locale.US, "%.0f / %.0f L", t.currentLitres, t.capacityLitres),
                        t.status, String.format(Locale.US, "%.1f km/h", t.speedKmh), String.format(Locale.US, "%.1f°C", t.tankTempC),
                        String.format(Locale.US, "%.2f%%", t.nozzleCalibrationPct)
                });
            }
        }

        // Owner orders table
        if (ownerOrdersTableModel != null) {
            ownerOrdersTableModel.setRowCount(0);
            for (Order o : ORDERS.values()) {
                ownerOrdersTableModel.addRow(new Object[]{
                        o.orderNumber, o.fuelType, String.format(Locale.US, "%.1f L", o.quantityLitres),
                        String.format(Locale.US, "₹%.2f", o.fuelRateAtOrder), String.format(Locale.US, "₹%.2f", o.totalAmount),
                        o.status, o.deliveryAddress
                });
            }
        }

        // Owner rates table
        if (ownerRatesTableModel != null) {
            ownerRatesTableModel.setRowCount(0);
            for (FuelRate r : FUEL_RATES.values()) {
                ownerRatesTableModel.addRow(new Object[]{
                        r.city, r.fuelType, String.format(Locale.US, "₹%.2f / L", r.ratePerLitre), "₹50.00", "₹0.00 (Zero)"
                });
            }
        }

        // Owner Bulk Tanks panel
        if (ownerTanksPanel != null) {
            ownerTanksPanel.removeAll();
            for (FuelTank ft : FUEL_TANKS.values()) {
                JPanel b = new JPanel(new BorderLayout(8, 8));
                b.setBackground(COLOR_SURFACE);
                b.setBorder(BorderFactory.createCompoundBorder(
                        new LineBorder(COLOR_BORDER, 1, true),
                        new EmptyBorder(12, 14, 12, 14)
                ));
                JLabel name = new JLabel(ft.id.toUpperCase() + " (" + ft.fuelType + ")");
                name.setFont(new Font("Segoe UI", Font.BOLD, 13));
                name.setForeground(COLOR_TEXT_PRIMARY);

                int pct = (int) Math.round((ft.currentQuantityLitres / ft.maxCapacityLitres) * 100);
                JProgressBar pb = new JProgressBar(0, 100);
                pb.setValue(pct);
                pb.setStringPainted(true);
                pb.setString(String.format(Locale.US, "%.0f / %.0f L (%d%%)", ft.currentQuantityLitres, ft.maxCapacityLitres, pct));
                pb.setForeground(pct < 25 ? COLOR_DANGER : COLOR_PRIMARY);
                pb.setBackground(COLOR_SURFACE_ALT);

                b.add(name, BorderLayout.NORTH);
                b.add(pb, BorderLayout.CENTER);
                ownerTanksPanel.add(b);
            }
            ownerTanksPanel.revalidate();
            ownerTanksPanel.repaint();
        }

        // Customer complaints table
        if (userComplaintsTableModel != null) {
            userComplaintsTableModel.setRowCount(0);
            for (Complaint c : COMPLAINTS.values()) {
                userComplaintsTableModel.addRow(new Object[]{
                        c.ticketNumber, c.category, c.description, c.priority, c.status, c.resolutionNotes, c.createdAt
                });
            }
        }

        // Customer feedback table
        if (userFeedbackTableModel != null) {
            userFeedbackTableModel.setRowCount(0);
            for (DeliveryFeedback fb : FEEDBACKS.values()) {
                String stars = "★".repeat(Math.max(1, Math.min(5, fb.rating)));
                userFeedbackTableModel.addRow(new Object[]{
                        fb.orderNumber, fb.customerName, stars, fb.driverName, fb.comment, fb.createdAt
                });
            }
        }

        // Owner complaints table
        if (ownerComplaintsTableModel != null) {
            ownerComplaintsTableModel.setRowCount(0);
            for (Complaint c : COMPLAINTS.values()) {
                ownerComplaintsTableModel.addRow(new Object[]{
                        c.ticketNumber, c.customerName, c.customerPhone, c.category, c.priority, c.status, c.description, c.resolutionNotes
                });
            }
        }

        // Owner feedback table
        if (ownerFeedbackTableModel != null) {
            ownerFeedbackTableModel.setRowCount(0);
            for (DeliveryFeedback fb : FEEDBACKS.values()) {
                ownerFeedbackTableModel.addRow(new Object[]{
                        fb.orderNumber, fb.customerName, fb.rating + "/5 ★", fb.driverName, fb.comment, fb.createdAt
                });
            }
        }
    }

    // ========================================================================
    // 6. MAIN ENTRY POINT
    // ========================================================================
    public static void main(String[] args) {
        System.out.println("============================================================================");
        System.out.println("  FuelTrack - Zero-Hidden-Fee Doorstep Fuel Delivery & Operations Center");
        System.out.println("  100% Pure Java Multi-Page Web Engine & Localhost Server");
        System.out.println("============================================================================");

        seedDatabase();
        startEmbeddedHttpServer();

        boolean webOnly = false;
        for (String arg : args) {
            if ("--web-only".equalsIgnoreCase(arg) || "--headless".equalsIgnoreCase(arg) || "-w".equalsIgnoreCase(arg)) {
                webOnly = true;
            }
        }

        if (!webOnly && !GraphicsEnvironment.isHeadless()) {
            SwingUtilities.invokeLater(() -> {
                try {
                    UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
                } catch (Exception ignored) {}

                FuelTrackApp app = new FuelTrackApp();
                app.refreshData();
                app.setVisible(true);
                System.out.println(">> Desktop Support Window Active (Use buttons to open pages in your browser).");
            });
        }

        // Lock to keep server running permanently
        Object lock = new Object();
        synchronized (lock) {
            try {
                lock.wait();
            } catch (InterruptedException ignored) {}
        }
    }
}
