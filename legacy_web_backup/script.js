/* ==========================================================================
   FuelTrack - Interactive Dashboard & Business Logic
   Transparent Pricing Engine, Digital Dispenser Meter, GPS Route Simulator
   ========================================================================== */

// --- 1. DATA STORE & INITIAL DATABASE ---
const STORAGE_KEYS = {
  STATES: 'fueltrack_states',
  CITIES: 'fueltrack_cities',
  PRICES: 'fueltrack_prices',
  STATIONS: 'fueltrack_stations',
  ORDERS: 'fueltrack_orders',
  USERS: 'fueltrack_users',
  ENQUIRIES: 'fueltrack_enquiries'
};

const INITIAL_DATA = {
  states: [
    { id: 'ST-101', name: 'Maharashtra', code: 'MH', status: 'Active', stationsCount: 14 },
    { id: 'ST-102', name: 'Delhi NCR', code: 'DL', status: 'Active', stationsCount: 18 },
    { id: 'ST-103', name: 'Karnataka', code: 'KA', status: 'Active', stationsCount: 12 },
    { id: 'ST-104', name: 'Tamil Nadu', code: 'TN', status: 'Active', stationsCount: 9 },
    { id: 'ST-105', name: 'Telangana', code: 'TS', status: 'Active', stationsCount: 8 },
    { id: 'ST-106', name: 'Gujarat', code: 'GJ', status: 'Active', stationsCount: 11 }
  ],
  cities: [
    { id: 'CT-201', name: 'Mumbai', state: 'Maharashtra', status: 'Active', stationsCount: 8 },
    { id: 'CT-202', name: 'Pune', state: 'Maharashtra', status: 'Active', stationsCount: 6 },
    { id: 'CT-203', name: 'New Delhi', state: 'Delhi NCR', status: 'Active', stationsCount: 18 },
    { id: 'CT-204', name: 'Bengaluru', state: 'Karnataka', status: 'Active', stationsCount: 12 },
    { id: 'CT-205', name: 'Chennai', state: 'Tamil Nadu', status: 'Active', stationsCount: 9 },
    { id: 'CT-206', name: 'Hyderabad', state: 'Telangana', status: 'Active', stationsCount: 8 },
    { id: 'CT-207', name: 'Ahmedabad', state: 'Gujarat', status: 'Active', stationsCount: 11 }
  ],
  prices: [
    { id: 'FP-1', type: 'Petrol (Regular)', rate: 104.21, change: '+1.2%', unit: 'Litre', density: '745.2 kg/m³', updated: 'Today, 06:00 AM' },
    { id: 'FP-2', type: 'Diesel (High Speed)', rate: 92.15, change: '-0.4%', unit: 'Litre', density: '832.4 kg/m³', updated: 'Today, 06:00 AM' },
    { id: 'FP-3', type: 'CNG (Compressed Natural Gas)', rate: 86.50, change: '0.0%', unit: 'Kg', density: '0.78 kg/m³', updated: 'Yesterday' },
    { id: 'FP-4', type: 'Premium Speed Petrol (97 Octane)', rate: 114.80, change: '+1.8%', unit: 'Litre', density: '751.0 kg/m³', updated: 'Today, 06:00 AM' }
  ],
  stations: [
    { 
      id: 'STN-501', 
      name: 'HP Auto Care Point', 
      owner: 'Rajesh Sharma', 
      city: 'Mumbai', 
      address: 'Plot 44, Andheri East Highway, Mumbai', 
      phone: '+91 98201 44521', 
      rating: 4.8, 
      status: 'Active', 
      fuels: ['Petrol', 'Diesel', 'CNG'], 
      tanks: { petrol: 82, diesel: 58, cng: 90 } 
    },
    { 
      id: 'STN-502', 
      name: 'Shell Express Fuel Station', 
      owner: 'Pooja Verma', 
      city: 'Bengaluru', 
      address: 'Outer Ring Road, Bellandur, Bengaluru', 
      phone: '+91 98860 12399', 
      rating: 4.9, 
      status: 'Active', 
      fuels: ['Petrol', 'Diesel', 'Premium'], 
      tanks: { petrol: 91, diesel: 74, cng: 40 } 
    },
    { 
      id: 'STN-503', 
      name: 'IndianOil Mega Dispenser', 
      owner: 'Amit Patel', 
      city: 'New Delhi', 
      address: 'Connaught Place Outer Circle, New Delhi', 
      phone: '+91 99110 56781', 
      rating: 4.7, 
      status: 'Active', 
      fuels: ['Petrol', 'Diesel', 'CNG'], 
      tanks: { petrol: 65, diesel: 42, cng: 85 } 
    },
    { 
      id: 'STN-504', 
      name: 'Bharat Petroleum Highway Hub', 
      owner: 'Kavita Sundaram', 
      city: 'Pune', 
      address: 'Pune-Bangalore Expressway, Hinjewadi, Pune', 
      phone: '+91 97654 32109', 
      rating: 4.6, 
      status: 'Active', 
      fuels: ['Petrol', 'Diesel'], 
      tanks: { petrol: 45, diesel: 88, cng: 0 } 
    },
    { 
      id: 'STN-505', 
      name: 'TotalEnergies Smart Fuel', 
      owner: 'Farhan Syed', 
      city: 'Hyderabad', 
      address: 'Hitech City Main Road, Madhapur, Hyderabad', 
      phone: '+91 90001 88992', 
      rating: 4.8, 
      status: 'Active', 
      fuels: ['Petrol', 'Diesel', 'Premium', 'CNG'], 
      tanks: { petrol: 78, diesel: 66, cng: 95 } 
    }
  ],
  orders: [
    {
      id: 'FL-9021',
      customer: 'Ananya Deshmukh',
      phone: '+91 98700 11223',
      station: 'HP Auto Care Point',
      stationId: 'STN-501',
      fuelType: 'Petrol (Regular)',
      litres: 35,
      rate: 104.21,
      fuelCost: 3647.35,
      deliveryFee: 50.00,
      extraSurcharge: 0.00,
      amount: 3697.35,
      paymentMethod: 'UPI (Instant)',
      date: '2026-09-04 20:30',
      status: 'In Transit',
      deliveryAddress: 'Flat 402, Sea Green Apts, Worli, Mumbai',
      densityCertified: '745.2 kg/m³ @ 15°C (100% Pure)',
      driver: { name: 'Suresh Kumar', phone: '+91 98210 99441', vehicle: 'MH-02-FL-4401', eta: '12 mins', distance: '1.8 km away' }
    },
    {
      id: 'FL-8942',
      customer: 'Vikram Sengupta',
      phone: '+91 98190 22334',
      station: 'Shell Express Fuel Station',
      stationId: 'STN-502',
      fuelType: 'Diesel (High Speed)',
      litres: 50,
      rate: 92.15,
      fuelCost: 4607.50,
      deliveryFee: 50.00,
      extraSurcharge: 0.00,
      amount: 4657.50,
      paymentMethod: 'Credit Card',
      date: '2026-09-04 18:45',
      status: 'Accepted',
      deliveryAddress: 'Tower B, Tech Park, Whitefield, Bengaluru',
      densityCertified: '832.4 kg/m³ @ 15°C (100% Pure)',
      driver: { name: 'Manish Patil', phone: '+91 97651 22883', vehicle: 'KA-01-TK-9088', eta: '25 mins', distance: '4.2 km away' }
    },
    {
      id: 'FL-8819',
      customer: 'Rohan Mehra',
      phone: '+91 99100 44556',
      station: 'IndianOil Mega Dispenser',
      stationId: 'STN-503',
      fuelType: 'CNG (Compressed Natural Gas)',
      litres: 20,
      rate: 86.50,
      fuelCost: 1730.00,
      deliveryFee: 50.00,
      extraSurcharge: 0.00,
      amount: 1780.00,
      paymentMethod: 'Pay on Delivery',
      date: '2026-09-04 14:15',
      status: 'Delivered',
      deliveryAddress: 'Sector 62, Noida / New Delhi Border',
      densityCertified: '0.78 kg/m³ (100% Pure)',
      driver: { name: 'Harpreet Singh', phone: '+91 98112 33445', vehicle: 'DL-1C-FL-1092', eta: 'Delivered', distance: 'Arrived' }
    }
  ],
  users: [
    { id: 'USR-101', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98700 11223', city: 'Mumbai', orders: 12, status: 'Active' },
    { id: 'USR-102', name: 'Vikram Sengupta', email: 'vikram.s@outlook.com', phone: '+91 98190 22334', city: 'Bengaluru', orders: 8, status: 'Active' }
  ],
  enquiries: [
    { id: 'ENQ-401', name: 'Gaurav Khanna', email: 'gaurav.k@yahoo.com', subject: 'Fleet diesel supply query', message: 'Looking for zero-markup diesel delivery for 15 trucks.', date: '2026-09-04', status: 'Open' }
  ]
};

// Database Access
function getStore(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const fallbackKey = key.replace('fueltrack_', '');
      const fallbackData = INITIAL_DATA[fallbackKey] || [];
      localStorage.setItem(key, JSON.stringify(fallbackData));
      return fallbackData;
    }
    return JSON.parse(raw);
  } catch (e) {
    const fallbackKey = key.replace('fueltrack_', '');
    return INITIAL_DATA[fallbackKey] || [];
  }
}

function setStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function initDataStore() {
  Object.keys(INITIAL_DATA).forEach(k => {
    const sKey = 'fueltrack_' + k;
    if (!localStorage.getItem(sKey)) {
      localStorage.setItem(sKey, JSON.stringify(INITIAL_DATA[k]));
    }
  });
}
initDataStore();

function resetDemoData() {
  Object.keys(INITIAL_DATA).forEach(k => {
    localStorage.setItem('fueltrack_' + k, JSON.stringify(INITIAL_DATA[k]));
  });
  showToast('Demo data reset to default successfully!', 'success');
  const currentRole = document.querySelector('.role-switcher-btn.active-role')?.dataset?.role || 'home';
  switchRole(currentRole);
}

// --- 2. CHART INSTANCE MANAGER ---
const chartRegistry = {};
function safeDestroyChart(name) {
  if (chartRegistry[name]) {
    try { chartRegistry[name].destroy(); } catch (e) {}
    delete chartRegistry[name];
  }
}

// --- 3. TOAST SYSTEM ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} fade-in`;
  
  let icon = 'fa-check-circle text-emerald-500';
  if (type === 'warning') icon = 'fa-exclamation-triangle text-amber-500';
  if (type === 'danger') icon = 'fa-times-circle text-red-500';
  if (type === 'info') icon = 'fa-info-circle text-blue-500';

  toast.innerHTML = `
    <i class="fas ${icon} text-lg"></i>
    <div class="flex-1 text-sm font-medium text-slate-800">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- 4. MODALS ---
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
  }
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    e.target.classList.remove('flex');
  }
});

// --- 5. NAVIGATION & SECTION SWITCHER ---
function showSection(id) {
  const sections = [
    'home', 'contacts', 
    'adminLogin', 'adminRegister', 'adminForgot', 'adminPanel',
    'ownerLogin', 'ownerRegister', 'ownerForgot', 'stationOwnerLayout',
    'userLogin', 'userRegister', 'userForgot', 'userSection'
  ];
  
  sections.forEach(secId => {
    const el = document.getElementById(secId);
    if (el) el.classList.add('hidden');
  });
  
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('fade-in');
  }

  if (id === 'adminPanel') {
    updateRoleSwitcherUI('admin');
    setTimeout(() => {
      showAdminSection('adminDashboard');
      renderAdminDashboard();
    }, 50);
  } else if (id === 'stationOwnerLayout') {
    updateRoleSwitcherUI('owner');
    setTimeout(() => {
      showSubSection('dashboard');
      renderOwnerDashboard();
    }, 50);
  } else if (id === 'userSection') {
    updateRoleSwitcherUI('user');
    setTimeout(() => {
      showUserSection('orderFuel');
      renderUserOrderFuel();
      renderUserDashboard();
    }, 50);
  } else if (id === 'home') {
    updateRoleSwitcherUI('home');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchRole(role) {
  if (role === 'admin') showSection('adminPanel');
  else if (role === 'owner') showSection('stationOwnerLayout');
  else if (role === 'user') showSection('userSection');
  else showSection('home');
  showToast(`Switched view to <strong>${role.toUpperCase()}</strong> mode.`, 'info');
}

function updateRoleSwitcherUI(activeRole) {
  document.querySelectorAll('.role-switcher-btn').forEach(btn => {
    if (btn.dataset.role === activeRole) {
      btn.classList.add('active-role');
    } else {
      btn.classList.remove('active-role');
    }
  });
}

function showAdminSection(id) {
  document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-sidebar button').forEach(btn => btn.classList.remove('sidebar-active'));
  
  const target = document.getElementById(id);
  if (target) target.classList.add('active', 'fade-in');

  const activeBtn = document.querySelector(`.admin-sidebar button[onclick*="${id}"]`);
  if (activeBtn) activeBtn.classList.add('sidebar-active');

  if (id === 'adminDashboard') renderAdminDashboard();
  else if (id === 'state') renderStateManagement();
  else if (id === 'city') renderCityManagement();
  else if (id === 'fuelPrice') renderFuelPriceManagement();
  else if (id === 'regUsers') renderRegisteredUsers();
  else if (id === 'regOwners') renderRegisteredOwners();
  else if (id === 'regAdmins') renderRegisteredAdmins();
  else if (id === 'enquiry') renderEnquiries();
  else if (id === 'reports') renderAdminReports();
}

function showSubSection(id) {
  document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#stationOwnerLayout .admin-sidebar button').forEach(btn => btn.classList.remove('sidebar-active'));

  const target = document.getElementById(id);
  if (target) target.classList.add('active', 'fade-in');

  const activeBtn = document.querySelector(`#stationOwnerLayout .admin-sidebar button[onclick*="${id}"]`);
  if (activeBtn) activeBtn.classList.add('sidebar-active');

  if (id === 'dashboard') renderOwnerDashboard();
  else if (id === 'viewFuelStations' || id === 'manageFuelStation') renderOwnerStations();
  else if (id === 'viewOrders' || id === 'orderHistory') renderOwnerOrders();
}

function showUserSection(id) {
  document.querySelectorAll('.user-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.user-nav button').forEach(btn => btn.classList.remove('nav-active'));

  const target = document.getElementById(id);
  if (target) target.classList.add('active', 'fade-in');

  const activeBtn = document.querySelector(`.user-nav button[onclick*="${id}"]`);
  if (activeBtn) activeBtn.classList.add('nav-active');

  if (id === 'userDashboard') renderUserDashboard();
  else if (id === 'orderFuel') renderUserOrderFuel();
  else if (id === 'orderStatus') renderUserOrderStatus();
  else if (id === 'searchStation') renderUserSearchStations();
}

// --- 6. ADMIN DASHBOARD & CHARTS ---
function renderAdminDashboard() {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const stations = getStore(STORAGE_KEYS.STATIONS);
  
  const totalRev = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.amount : 0), 0);
  const totalLitres = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.litres : 0), 0);

  const elOrders = document.getElementById('adminStatOrders');
  const elStations = document.getElementById('adminStatStations');
  const elRev = document.getElementById('adminStatRevenue');
  const elLitres = document.getElementById('adminStatLitres');

  if (elOrders) elOrders.innerText = orders.length;
  if (elStations) elStations.innerText = stations.filter(s => s.status === 'Active').length;
  if (elRev) elRev.innerText = '₹' + totalRev.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (elLitres) elLitres.innerText = totalLitres.toLocaleString('en-IN') + ' L';

  setTimeout(() => {
    renderAdminRevenueChart();
    renderAdminFuelShareChart();
  }, 100);

  renderAdminRecentOrders(orders);
  initRadarFleetLiveMovement();
  initDepotFluidTanks();
}

// --- 6.1 WEB AUDIO SYNTHESIZER ENGINE ---
let audioFxEnabled = true;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playAudioCue(type = 'click') {
  if (!audioFxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'pump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'cash') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {}
}

function toggleAudioFX() {
  audioFxEnabled = !audioFxEnabled;
  const btn = document.getElementById('audioFxToggleBtn');
  const label = document.getElementById('audioFxLabel');
  if (btn && label) {
    if (audioFxEnabled) {
      btn.className = 'filter-pill-btn active';
      label.innerText = 'Sound: ON';
      playAudioCue('chime');
      showToast('🔊 Interactive Sound FX Enabled', 'info');
    } else {
      btn.className = 'filter-pill-btn';
      label.innerText = 'Sound: MUTED';
      showToast('🔇 Sound FX Muted', 'warning');
    }
  }
}

// --- 6.2 LIVE GPS RADAR & TELEMATICS ENGINE ---
const FLEET_DATA = {
  'TK-101': {
    title: 'Tanker TK-101 (Mumbai Express)',
    status: '● STATUS: IN-TRANSIT (ETA 12 MINS)',
    speed: '42 km/h',
    driver: 'Rajesh Verma (+91 98201 44556)',
    payload: 'Diesel (4,000 / 5,000 L)',
    nozzle: 'Calibrated (±0.01% Error)',
    temp: '24.2°C • PESO Certified',
    destination: 'Bandra West, Mumbai',
    distance: '2.8 km away',
    progress: '72%'
  },
  'TK-102': {
    title: 'Tanker TK-102 (Pune Express)',
    status: '● STATUS: EN ROUTE (ETA 18 MINS)',
    speed: '38 km/h',
    driver: 'Amit Saxena (+91 98111 22334)',
    payload: 'Petrol (3,500 / 5,000 L)',
    nozzle: 'Digital Ultrasonic (Active)',
    temp: '23.8°C • Temperature Regulated',
    destination: 'Hinjewadi Tech Park, Pune',
    distance: '5.1 km away',
    progress: '45%'
  },
  'TK-103': {
    title: 'Tanker TK-103 (Highway Micro-Tanker)',
    status: '● STATUS: DISPENSING LIVE (NOZZLE ACTIVE)',
    speed: '0 km/h (Stationary)',
    driver: 'Sunil Jadhav (+91 97654 88990)',
    payload: 'CNG (2,800 / 4,000 kg)',
    nozzle: 'Dispensing: 45 L/min',
    temp: '21.0°C • High Pressure Safe',
    destination: 'Thane Highway Logistics Depot',
    distance: '0.1 km (At Location)',
    progress: '92%'
  },
  'TK-104': {
    title: 'Tanker TK-104 (Navi Mumbai Fleet)',
    status: '● STATUS: RETURNING TO DEPOT',
    speed: '52 km/h',
    driver: 'Vikram Gill (+91 99887 66554)',
    payload: 'Diesel (Empty / To Refill)',
    nozzle: 'Standby / Sealed',
    temp: '25.1°C • Cleaned Tank',
    destination: 'Depot HQ Storage, Mumbai',
    distance: '7.4 km away',
    progress: '28%'
  }
};

let currentSelectedTanker = 'TK-101';

function inspectTanker(id) {
  playAudioCue('click');
  currentSelectedTanker = id;
  const data = FLEET_DATA[id];
  if (!data) return;

  const elTitle = document.getElementById('hudTankerTitle');
  const elStatus = document.getElementById('hudTankerStatus');
  const elSpeed = document.getElementById('hudTankerSpeed');
  const elDriver = document.getElementById('hudDriverName');
  const elPayload = document.getElementById('hudFuelPayload');
  const elNozzle = document.getElementById('hudNozzleCalib');
  const elTemp = document.getElementById('hudTankTemp');
  const elDist = document.getElementById('hudRouteDist');
  const elProg = document.getElementById('hudRouteProgress');

  if (elTitle) elTitle.innerText = data.title;
  if (elStatus) elStatus.innerText = data.status;
  if (elSpeed) elSpeed.innerText = data.speed;
  if (elDriver) elDriver.innerText = data.driver;
  if (elPayload) elPayload.innerText = data.payload;
  if (elNozzle) elNozzle.innerText = data.nozzle;
  if (elTemp) elTemp.innerText = data.temp;
  if (elDist) elDist.innerText = data.distance;
  if (elProg) elProg.style.width = data.progress;

  showToast(`📡 Telematics synced for <strong>${id}</strong> (${data.speed})`, 'info');
}

function pingAllFleet() {
  playAudioCue('chime');
  showToast('📡 Radar ping sent to 4 micro-tankers! 100% telemetry online.', 'success');
}

function pingDriverCurrent() {
  playAudioCue('click');
  const data = FLEET_DATA[currentSelectedTanker];
  showToast(`📻 Radio ping acknowledged by <strong>${data ? data.driver : 'Driver'}</strong>!`, 'success');
}

function simulateFastArrival() {
  playAudioCue('cash');
  const elStatus = document.getElementById('hudTankerStatus');
  const elDist = document.getElementById('hudRouteDist');
  const elProg = document.getElementById('hudRouteProgress');
  const elSpeed = document.getElementById('hudTankerSpeed');

  if (elStatus) elStatus.innerText = '● STATUS: ARRIVED AT DESTINATION';
  if (elDist) elDist.innerText = '0.0 km (Arrived)';
  if (elProg) elProg.style.width = '100%';
  if (elSpeed) elSpeed.innerText = '0 km/h';

  pushLiveEvent(`Micro-Tanker ${currentSelectedTanker} arrived at destination!`, 'truck-fast', 'blue');
  showToast(`⚡ ${currentSelectedTanker} arrived at customer location. Ready to dispense.`, 'success');
}

let radarInterval = null;
function initRadarFleetLiveMovement() {
  if (radarInterval) clearInterval(radarInterval);
  radarInterval = setInterval(() => {
    ['tankerDot1', 'tankerDot2', 'tankerDot3', 'tankerDot4'].forEach(dotId => {
      const dot = document.getElementById(dotId);
      if (dot) {
        const currentTop = parseFloat(dot.style.top) || 50;
        const currentLeft = parseFloat(dot.style.left) || 50;
        const deltaY = (Math.random() - 0.5) * 1.5;
        const deltaX = (Math.random() - 0.5) * 1.5;
        dot.style.top = Math.max(15, Math.min(85, currentTop + deltaY)) + '%';
        dot.style.left = Math.max(15, Math.min(85, currentLeft + deltaX)) + '%';
      }
    });
  }, 2000);
}

// --- 6.3 3D ANIMATED FLUID TANK ENGINE ---
const DEPOT_STORAGE = {
  petrol: { current: 7800, max: 10000, unit: 'L' },
  diesel: { current: 9600, max: 15000, unit: 'L' },
  cng: { current: 7040, max: 8000, unit: 'kg' }
};

function initDepotFluidTanks() {
  updateTankVisuals('petrol');
  updateTankVisuals('diesel');
  updateTankVisuals('cng');
}

function updateTankVisuals(type) {
  const tank = DEPOT_STORAGE[type];
  if (!tank) return;

  const pct = Math.round((tank.current / tank.max) * 100);
  const bar = document.getElementById(type + 'FluidBar');
  const pctLabel = document.getElementById(type + 'TankPct');
  const volLabel = document.getElementById(type + 'TankVolume');

  if (bar) bar.style.height = pct + '%';
  if (pctLabel) pctLabel.innerText = pct + '%';
  if (volLabel) volLabel.innerText = `${tank.current.toLocaleString()} ${tank.unit} / ${tank.max.toLocaleString()} ${tank.unit}`;
}

function drainOrFillTank(type, deltaLitres) {
  playAudioCue('pump');
  const tank = DEPOT_STORAGE[type];
  if (!tank) return;

  tank.current = Math.max(0, Math.min(tank.max, tank.current + deltaLitres));
  updateTankVisuals(type);

  if (deltaLitres < 0) {
    showToast(`🛢️ Dispensed ${Math.abs(deltaLitres)}${tank.unit} of ${type.toUpperCase()}. Tank adjusted!`, 'info');
  } else {
    showToast(`⛽ Added ${deltaLitres}${tank.unit} to ${type.toUpperCase()} Tank!`, 'success');
  }
}

function simRefillAllTanks() {
  playAudioCue('cash');
  DEPOT_STORAGE.petrol.current = 9600;
  DEPOT_STORAGE.diesel.current = 14200;
  DEPOT_STORAGE.cng.current = 7800;
  initDepotFluidTanks();
  showToast('⚡ All 3 Bulk Storage Tanks refilled to >95% capacity!', 'success');
}

// --- 6.4 IOT PUMP DISPENSER SIMULATOR ENGINE ---
let simPumpActive = false;
let simPumpTimer = null;
let simTotalLitres = 0;
let simTotalAmount = 0;
const SIM_FUEL_RATE = 104.21; // Rate per Litre

function togglePumpSimulation() {
  if (!simPumpActive) {
    startPumpSimulation();
  } else {
    stopPumpSimulation();
  }
}

function startPumpSimulation() {
  simPumpActive = true;
  playAudioCue('click');
  const container = document.getElementById('pumpSimContainer');
  const stateBadge = document.getElementById('simPumpStateBadge');
  const btnText = document.getElementById('simPumpBtnText');
  const flowBar = document.getElementById('simNozzleFlowBar');

  if (container) container.classList.add('pump-active-pulse');
  if (stateBadge) {
    stateBadge.className = 'text-xs font-mono font-bold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full animate-pulse';
    stateBadge.innerText = 'DISPENSING FLOWING';
  }
  if (btnText) btnText.innerText = 'Pause Nozzle Flow';
  if (flowBar) {
    flowBar.className = 'h-full rounded-full nozzle-flow-anim';
    flowBar.style.width = '85%';
  }

  showToast('⛽ IoT Dispenser nozzle opened! Pumping fuel at 45 L/min.', 'info');

  simPumpTimer = setInterval(() => {
    simTotalLitres += 0.8;
    simTotalAmount = simTotalLitres * SIM_FUEL_RATE;

    const elAmount = document.getElementById('simLcdAmount');
    const elLitres = document.getElementById('simLcdLitres');
    if (elAmount) elAmount.innerText = '₹' + simTotalAmount.toFixed(2);
    if (elLitres) elLitres.innerText = simTotalLitres.toFixed(2) + ' L';

    // Slightly drain the petrol tank live
    DEPOT_STORAGE.petrol.current = Math.max(0, DEPOT_STORAGE.petrol.current - 0.8);
    updateTankVisuals('petrol');

    // Audio cue
    playAudioCue('pump');
  }, 250);
}

function stopPumpSimulation() {
  simPumpActive = false;
  if (simPumpTimer) clearInterval(simPumpTimer);

  playAudioCue('cash');
  const container = document.getElementById('pumpSimContainer');
  const stateBadge = document.getElementById('simPumpStateBadge');
  const btnText = document.getElementById('simPumpBtnText');
  const flowBar = document.getElementById('simNozzleFlowBar');

  if (container) container.classList.remove('pump-active-pulse');
  if (stateBadge) {
    stateBadge.className = 'text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full';
    stateBadge.innerText = 'COMPLETED / IDLE';
  }
  if (btnText) btnText.innerText = 'Resume Dispense';
  if (flowBar) flowBar.style.width = '0%';

  // Push event
  if (simTotalLitres > 0) {
    pushLiveEvent(`IoT Pump Dispensed ${simTotalLitres.toFixed(1)}L (₹${simTotalAmount.toFixed(0)})`, 'gas-pump', 'orange');
    showToast(`✅ Dispense session finished: ${simTotalLitres.toFixed(2)}L for ₹${simTotalAmount.toFixed(2)}`, 'success');
  }
}

function resetPumpSimulation() {
  stopPumpSimulation();
  simTotalLitres = 0;
  simTotalAmount = 0;
  const elAmount = document.getElementById('simLcdAmount');
  const elLitres = document.getElementById('simLcdLitres');
  if (elAmount) elAmount.innerText = '₹0.00';
  if (elLitres) elLitres.innerText = '0.00 L';
  showToast('IoT Dispenser meters reset to 0.00', 'info');
}

// --- 6.5 REALTIME LIVE STREAM & EVENT FEED ---
let realtimeStreamActive = true;
let realtimeStreamInterval = null;

function toggleRealtimeStream() {
  realtimeStreamActive = !realtimeStreamActive;
  const btn = document.getElementById('realtimeStreamToggleBtn');
  const label = document.getElementById('streamLabel');

  if (realtimeStreamActive) {
    if (btn) btn.className = 'filter-pill-btn active';
    if (label) label.innerText = 'Live Stream: ON';
    startRealtimeStream();
    showToast('📡 Realtime transaction stream: ACTIVE', 'success');
  } else {
    if (btn) btn.className = 'filter-pill-btn';
    if (label) label.innerText = 'Live Stream: PAUSED';
    if (realtimeStreamInterval) clearInterval(realtimeStreamInterval);
    showToast('⏸️ Realtime stream paused.', 'warning');
  }
}

function startRealtimeStream() {
  if (realtimeStreamInterval) clearInterval(realtimeStreamInterval);
  realtimeStreamInterval = setInterval(() => {
    if (!realtimeStreamActive) return;
    const randomVehicles = ['Mercedes E-Class', 'Toyota Fortuner', 'Tata Ace Fleet', 'Caterpillar DG Set', 'Hyundai Creta'];
    const randomLits = [25, 35, 45, 80, 50, 60][Math.floor(Math.random() * 6)];
    const randomVeh = randomVehicles[Math.floor(Math.random() * randomVehicles.length)];
    const randomLocs = ['Andheri East', 'Powai Tech City', 'Koramangala', 'Gachibowli', 'Noida Sec 62'];
    const randomLoc = randomLocs[Math.floor(Math.random() * randomLocs.length)];

    pushLiveEvent(`New Order: ${randomLits}L delivered to ${randomVeh} • ${randomLoc}`, 'truck-fast', 'emerald');
  }, 10000);
}
startRealtimeStream();

function pushLiveEvent(text, icon = 'truck-fast', color = 'emerald') {
  const list = document.getElementById('eventStreamList');
  if (!list) return;

  const row = document.createElement('div');
  row.className = 'event-stream-row text-xs bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 fade-in';
  row.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span class="w-6 h-6 rounded-lg bg-${color}-100 text-${color}-700 flex items-center justify-center text-[10px] font-bold">
        <i class="fas fa-${icon}"></i>
      </span>
      <div>
        <strong class="text-slate-800">${text}</strong>
        <span class="text-[10px] text-slate-400 block">IoT telemetry confirmed • Zero surcharge</span>
      </div>
    </div>
    <span class="text-[10px] font-mono text-emerald-600 font-bold">Just now</span>
  `;

  list.insertBefore(row, list.firstChild);
  if (list.children.length > 8) {
    list.lastChild.remove();
  }
}

// --- 6.6 TIMEFRAME & METRIC CHART SWITCHERS ---
let currentAdminMetric = 'revenue';

function setAdminChartMetric(metric) {
  currentAdminMetric = metric;
  playAudioCue('click');
  const btnRev = document.getElementById('chartMetricRev');
  const btnVol = document.getElementById('chartMetricVol');

  if (btnRev && btnVol) {
    if (metric === 'revenue') {
      btnRev.classList.add('active');
      btnVol.classList.remove('active');
    } else {
      btnVol.classList.add('active');
      btnRev.classList.remove('active');
    }
  }
  renderAdminRevenueChart();
}

function switchAdminTimeframe(timeframe) {
  playAudioCue('click');
  document.querySelectorAll('.admin-timeframe-btn').forEach(btn => {
    if (btn.dataset.time === timeframe) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const elRev = document.getElementById('adminStatRevenue');
  const elLitres = document.getElementById('adminStatLitres');
  const elOrders = document.getElementById('adminStatOrders');

  if (timeframe === '1h') {
    if (elRev) elRev.innerText = '₹84,200';
    if (elLitres) elLitres.innerText = '820 L';
    if (elOrders) elOrders.innerText = '14';
  } else if (timeframe === 'today') {
    if (elRev) elRev.innerText = '₹4,85,600';
    if (elLitres) elLitres.innerText = '4,650 L';
    if (elOrders) elOrders.innerText = '68';
  } else if (timeframe === '7d') {
    if (elRev) elRev.innerText = '₹32,40,000';
    if (elLitres) elLitres.innerText = '31,200 L';
    if (elOrders) elOrders.innerText = '412';
  } else if (timeframe === '30d') {
    if (elRev) elRev.innerText = '₹1.42 Cr';
    if (elLitres) elLitres.innerText = '1,38,000 L';
    if (elOrders) elOrders.innerText = '1,890';
  }

  renderAdminRevenueChart();
  showToast(`📊 Switched analytics range to: <strong>${timeframe.toUpperCase()}</strong>`, 'info');
}

function renderAdminRevenueChart() {
  const ctx = document.getElementById('adminRevenueChart');
  if (!ctx) return;
  safeDestroyChart('adminRevenue');

  if (typeof Chart === 'undefined') return;

  const isRevenue = currentAdminMetric === 'revenue';

  try {
    chartRegistry['adminRevenue'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00 (Live)'],
        datasets: [
          {
            label: isRevenue ? 'Live Revenue (₹ in Thousands)' : 'Volume Dispensed (Litres)',
            data: isRevenue ? [45, 88, 142, 118, 195, 230] : [430, 840, 1360, 1130, 1870, 2210],
            borderColor: isRevenue ? '#1e40af' : '#f97316',
            backgroundColor: isRevenue ? 'rgba(30, 64, 175, 0.12)' : 'rgba(249, 115, 22, 0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: isRevenue ? '#1e40af' : '#f97316',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  } catch (e) {}
}

function renderAdminFuelShareChart() {
  const ctx = document.getElementById('adminFuelShareChart');
  if (!ctx) return;
  safeDestroyChart('adminFuelShare');

  if (typeof Chart === 'undefined') return;

  try {
    chartRegistry['adminFuelShare'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Petrol', 'Diesel', 'CNG', 'Premium 97'],
        datasets: [{
          data: [42, 38, 14, 6],
          backgroundColor: ['#1e40af', '#f97316', '#10b981', '#8b5cf6'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '70%'
      }
    });
  } catch (e) {}
}

function renderAdminRecentOrders(orders) {
  const tbody = document.getElementById('adminRecentOrdersTbody');
  if (!tbody) return;

  tbody.innerHTML = orders.slice(0, 6).map(order => `
    <tr class="hover:bg-slate-50 transition">
      <td class="font-mono font-bold text-blue-800">${order.id}</td>
      <td>
        <div class="font-semibold text-slate-800">${order.customer}</div>
        <div class="text-xs text-slate-500">${order.phone}</div>
      </td>
      <td><span class="text-xs bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">${order.fuelType}</span></td>
      <td class="font-bold">${order.litres} L</td>
      <td class="font-semibold text-emerald-700">₹${order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td><span class="status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
      <td>
        <button onclick="viewOrderDetailsModal('${order.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
          <i class="fas fa-eye mr-1"></i> Invoice
        </button>
      </td>
    </tr>
  `).join('');
}

// --- 7. STATE & CITY MANAGEMENT (CRUD) ---
function renderStateManagement() {
  const states = getStore(STORAGE_KEYS.STATES);
  const tbody = document.getElementById('stateTableTbody');
  if (!tbody) return;

  tbody.innerHTML = states.map(st => `
    <tr>
      <td class="font-mono font-bold text-blue-900">${st.id}</td>
      <td class="font-semibold text-slate-900">${st.name} <span class="text-xs text-slate-400 font-mono">(${st.code})</span></td>
      <td><span class="status status-${st.status.toLowerCase()}">${st.status}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <button onclick="toggleStateStatus('${st.id}')" class="fuel-btn-secondary text-xs py-1 px-2.5">Toggle</button>
          <button onclick="deleteState('${st.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleAddState(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('newStateName')?.value.trim();
  const code = document.getElementById('newStateCode')?.value.trim().toUpperCase();

  if (!name || !code) return;

  const states = getStore(STORAGE_KEYS.STATES);
  const newId = 'ST-' + (100 + states.length + 1);
  states.push({ id: newId, name, code, status: 'Active', stationsCount: 0 });
  setStore(STORAGE_KEYS.STATES, states);

  closeModal('addStateModal');
  renderStateManagement();
  showToast(`State <strong>${name}</strong> added!`, 'success');
}

function toggleStateStatus(id) {
  const states = getStore(STORAGE_KEYS.STATES);
  const item = states.find(s => s.id === id);
  if (item) {
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    setStore(STORAGE_KEYS.STATES, states);
    renderStateManagement();
    showToast(`State ${item.name} set to ${item.status}`, 'info');
  }
}

function deleteState(id) {
  let states = getStore(STORAGE_KEYS.STATES);
  states = states.filter(s => s.id !== id);
  setStore(STORAGE_KEYS.STATES, states);
  renderStateManagement();
  showToast('State removed successfully', 'danger');
}

function renderCityManagement() {
  const cities = getStore(STORAGE_KEYS.CITIES);
  const states = getStore(STORAGE_KEYS.STATES);
  const tbody = document.getElementById('cityTableTbody');
  if (!tbody) return;

  const stateSelect = document.getElementById('newCityState');
  if (stateSelect) {
    stateSelect.innerHTML = states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  }

  tbody.innerHTML = cities.map(c => `
    <tr>
      <td class="font-mono font-bold text-blue-900">${c.id}</td>
      <td class="font-semibold text-slate-900">${c.name}</td>
      <td><span class="text-xs bg-slate-100 font-medium px-2 py-1 rounded text-slate-700">${c.state}</span></td>
      <td><span class="status status-${c.status.toLowerCase()}">${c.status}</span></td>
      <td>
        <button onclick="deleteCity('${c.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function handleAddCity(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('newCityName')?.value.trim();
  const state = document.getElementById('newCityState')?.value;

  if (!name) return;

  const cities = getStore(STORAGE_KEYS.CITIES);
  const newId = 'CT-' + (200 + cities.length + 1);
  cities.push({ id: newId, name, state, status: 'Active', stationsCount: 0 });
  setStore(STORAGE_KEYS.CITIES, cities);

  closeModal('addCityModal');
  renderCityManagement();
  showToast(`City <strong>${name}</strong> added!`, 'success');
}

function deleteCity(id) {
  let cities = getStore(STORAGE_KEYS.CITIES);
  cities = cities.filter(c => c.id !== id);
  setStore(STORAGE_KEYS.CITIES, cities);
  renderCityManagement();
  showToast('City removed successfully', 'danger');
}

// --- 8. FUEL PRICE MANAGEMENT ---
function renderFuelPriceManagement() {
  const prices = getStore(STORAGE_KEYS.PRICES);
  const tbody = document.getElementById('fuelPriceTableTbody');
  if (!tbody) return;

  tbody.innerHTML = prices.map(p => `
    <tr>
      <td class="font-semibold text-slate-900">
        <i class="fas fa-gas-pump fuel-icon"></i> ${p.type}
      </td>
      <td class="text-lg font-bold text-slate-900">₹${p.rate.toFixed(2)} <span class="text-xs text-slate-500 font-normal">/${p.unit}</span></td>
      <td>
        <span class="text-xs px-2.5 py-1 rounded-md font-bold ${p.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : p.change.startsWith('-') ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}">
          ${p.change}
        </span>
      </td>
      <td class="text-sm text-slate-500">${p.updated}</td>
      <td>
        <button onclick="openUpdatePriceModal('${p.id}', '${p.type}', ${p.rate})" class="fuel-btn text-xs py-1.5 px-3">
          <i class="fas fa-edit mr-1"></i> Update Price
        </button>
      </td>
    </tr>
  `).join('');
}

function openUpdatePriceModal(id, type, rate) {
  document.getElementById('updatePriceFuelId').value = id;
  document.getElementById('updatePriceFuelType').innerText = type;
  document.getElementById('updatePriceValue').value = rate;
  openModal('updatePriceModal');
}

function handleSaveFuelPrice(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('updatePriceFuelId').value;
  const newRate = parseFloat(document.getElementById('updatePriceValue').value);

  if (isNaN(newRate) || newRate <= 0) return;

  const prices = getStore(STORAGE_KEYS.PRICES);
  const item = prices.find(p => p.id === id);
  if (item) {
    const diff = newRate - item.rate;
    const pct = ((diff / item.rate) * 100).toFixed(1);
    item.change = (diff >= 0 ? '+' : '') + pct + '%';
    item.rate = newRate;
    item.updated = 'Just now';
    setStore(STORAGE_KEYS.PRICES, prices);
    
    closeModal('updatePriceModal');
    renderFuelPriceManagement();
    calculateOrderLiveTotal();
    showToast(`Updated price for <strong>${item.type}</strong> to ₹${newRate.toFixed(2)}`, 'success');
  }
}

// --- 9. USERS, OWNERS, ENQUIRIES, REPORTS ---
function renderRegisteredUsers() {
  const users = getStore(STORAGE_KEYS.USERS);
  const tbody = document.getElementById('regUsersTbody');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => `
    <tr>
      <td class="font-mono font-bold text-blue-900">${u.id}</td>
      <td>
        <div class="font-bold text-slate-900">${u.name}</div>
        <div class="text-xs text-slate-500">${u.email}</div>
      </td>
      <td>${u.phone}</td>
      <td>${u.city}</td>
      <td class="font-semibold text-slate-800">${u.orders} orders</td>
      <td><span class="status status-${u.status.toLowerCase()}">${u.status}</span></td>
      <td>
        <button onclick="toggleUserStatus('${u.id}')" class="text-xs font-semibold text-blue-600 hover:underline">
          ${u.status === 'Active' ? 'Block User' : 'Unblock'}
        </button>
      </td>
    </tr>
  `).join('');
}

function toggleUserStatus(id) {
  const users = getStore(STORAGE_KEYS.USERS);
  const u = users.find(x => x.id === id);
  if (u) {
    u.status = u.status === 'Active' ? 'Blocked' : 'Active';
    setStore(STORAGE_KEYS.USERS, users);
    renderRegisteredUsers();
    showToast(`User ${u.name} is now ${u.status}`, 'info');
  }
}

function renderRegisteredOwners() {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const tbody = document.getElementById('regOwnersTbody');
  if (!tbody) return;

  tbody.innerHTML = stations.map(s => `
    <tr>
      <td class="font-mono font-bold text-blue-900">${s.id}</td>
      <td class="font-bold text-slate-900">${s.owner}</td>
      <td>${s.name}</td>
      <td>${s.city}</td>
      <td>${s.phone}</td>
      <td><span class="status status-${s.status.toLowerCase()}">${s.status}</span></td>
    </tr>
  `).join('');
}

function renderRegisteredAdmins() {
  const tbody = document.getElementById('regAdminsTbody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td class="font-mono font-bold text-blue-900">ADM-001</td>
      <td class="font-bold text-slate-900">Chief Administrator</td>
      <td>admin@fueltrack.com</td>
      <td>+91 99000 11223</td>
      <td><span class="status status-active">Super Admin</span></td>
    </tr>
  `;
}

function renderEnquiries() {
  const enqs = getStore(STORAGE_KEYS.ENQUIRIES);
  const tbody = document.getElementById('enquiryTbody');
  if (!tbody) return;

  tbody.innerHTML = enqs.map(e => `
    <tr>
      <td class="font-mono font-bold text-blue-900">${e.id}</td>
      <td>
        <div class="font-bold text-slate-900">${e.name}</div>
        <div class="text-xs text-slate-500">${e.email}</div>
      </td>
      <td class="font-semibold text-slate-800">${e.subject}</td>
      <td class="text-sm text-slate-600 max-w-xs truncate">${e.message}</td>
      <td><span class="status status-${e.status.toLowerCase()}">${e.status}</span></td>
      <td>
        <button onclick="resolveEnquiry('${e.id}')" class="fuel-btn text-xs py-1.5 px-3"><i class="fas fa-check mr-1"></i> Resolve</button>
      </td>
    </tr>
  `).join('');
}

function resolveEnquiry(id) {
  const enqs = getStore(STORAGE_KEYS.ENQUIRIES);
  const item = enqs.find(e => e.id === id);
  if (item) {
    item.status = 'Resolved';
    setStore(STORAGE_KEYS.ENQUIRIES, enqs);
    renderEnquiries();
    showToast(`Inquiry from ${item.name} resolved!`, 'success');
  }
}

function renderAdminReports() {
  const ctx = document.getElementById('adminReportsChart');
  if (!ctx) return;
  safeDestroyChart('adminReports');

  if (typeof Chart === 'undefined') return;

  try {
    chartRegistry['adminReports'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'],
        datasets: [
          {
            label: 'Total Orders Delivered',
            data: [1420, 1980, 1650, 980, 1120, 890, 780],
            backgroundColor: '#1e40af',
            borderRadius: 6
          },
          {
            label: 'Station Dispense Volume (kL)',
            data: [42, 68, 55, 31, 38, 29, 24],
            backgroundColor: '#f97316',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } }
      }
    });
  } catch (e) {}
}

// --- 10. STATION OWNER DASHBOARD ---
function renderOwnerDashboard() {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const myStation = stations[0] || {};

  const elOrders = document.getElementById('ownerStatOrders');
  const elPending = document.getElementById('ownerStatPending');
  const elTodaySales = document.getElementById('ownerStatSales');
  
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Accepted');
  
  if (elOrders) elOrders.innerText = orders.length;
  if (elPending) elPending.innerText = pendingOrders.length;
  if (elTodaySales) elTodaySales.innerText = '₹68,450';

  renderOwnerTankLevels(myStation);
  setTimeout(renderOwnerHourlyChart, 100);
  renderOwnerOrdersList(orders);
}

function renderOwnerTankLevels(station) {
  const container = document.getElementById('ownerTankGaugesContainer');
  if (!container) return;

  const tanks = station.tanks || { petrol: 80, diesel: 60, cng: 90 };

  container.innerHTML = `
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm font-semibold mb-1">
          <span class="text-blue-900"><i class="fas fa-gas-pump mr-1.5 text-blue-600"></i> Petrol Underground Tank A</span>
          <span class="text-blue-800 font-bold">${tanks.petrol}% (${(tanks.petrol * 250).toLocaleString()} / 25,000 L)</span>
        </div>
        <div class="tank-progress">
          <div class="tank-progress-bar bg-blue-600" style="width: ${tanks.petrol}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm font-semibold mb-1">
          <span class="text-orange-900"><i class="fas fa-truck-moving mr-1.5 text-orange-600"></i> Diesel Bulk Tank B</span>
          <span class="text-orange-800 font-bold">${tanks.diesel}% (${(tanks.diesel * 300).toLocaleString()} / 30,000 L)</span>
        </div>
        <div class="tank-progress">
          <div class="tank-progress-bar bg-orange-500" style="width: ${tanks.diesel}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm font-semibold mb-1">
          <span class="text-emerald-900"><i class="fas fa-wind mr-1.5 text-emerald-600"></i> CNG High-Pressure Unit</span>
          <span class="text-emerald-800 font-bold">${tanks.cng}% (${(tanks.cng * 100).toLocaleString()} / 10,000 Kg)</span>
        </div>
        <div class="tank-progress">
          <div class="tank-progress-bar bg-emerald-500" style="width: ${tanks.cng}%"></div>
        </div>
      </div>
    </div>
  `;
}

function renderOwnerHourlyChart() {
  const ctx = document.getElementById('ownerHourlyDispenseChart');
  if (!ctx) return;
  safeDestroyChart('ownerHourly');

  if (typeof Chart === 'undefined') return;

  try {
    chartRegistry['ownerHourly'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [{
          label: 'Hourly Dispense (Litres)',
          data: [420, 1150, 1890, 1420, 1100, 1980, 2450, 1800, 950],
          backgroundColor: '#f97316',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: '#f8fafc' } } }
      }
    });
  } catch (e) {}
}

function renderOwnerOrdersList(orders) {
  const tbody = document.getElementById('ownerOrdersTbody');
  if (!tbody) return;

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td class="font-mono font-bold text-blue-800">${o.id}</td>
      <td>
        <div class="font-semibold text-slate-900">${o.customer}</div>
        <div class="text-xs text-slate-500">${o.deliveryAddress}</div>
      </td>
      <td><span class="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">${o.fuelType}</span></td>
      <td class="font-bold">${o.litres} L</td>
      <td class="font-semibold text-emerald-700">₹${o.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td><span class="status status-${o.status.toLowerCase().replace(' ', '-')}">${o.status}</span></td>
      <td>
        <div class="flex items-center gap-1.5">
          ${o.status === 'Pending' ? `
            <button onclick="updateOrderStatus('${o.id}', 'Accepted')" class="fuel-btn text-xs py-1 px-2.5">
              <i class="fas fa-check"></i> Accept
            </button>
          ` : ''}
          ${o.status === 'Accepted' ? `
            <button onclick="updateOrderStatus('${o.id}', 'In Transit')" class="fuel-btn fuel-btn-orange text-xs py-1 px-2.5">
              <i class="fas fa-truck"></i> Dispatch
            </button>
          ` : ''}
          ${o.status === 'In Transit' ? `
            <button onclick="updateOrderStatus('${o.id}', 'Delivered')" class="fuel-btn fuel-btn-success text-xs py-1 px-2.5">
              <i class="fas fa-flag-checkered"></i> Deliver
            </button>
          ` : ''}
          <button onclick="viewOrderDetailsModal('${o.id}')" class="text-slate-500 hover:text-slate-800 text-sm px-2">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const o = orders.find(x => x.id === orderId);
  if (o) {
    o.status = newStatus;
    if (newStatus === 'In Transit' && !o.driver) {
      o.driver = { name: 'Ramesh Powar', phone: '+91 98330 11992', vehicle: 'MH-03-FL-9911', eta: '18 mins', distance: '2.1 km away' };
    }
    setStore(STORAGE_KEYS.ORDERS, orders);
    renderOwnerDashboard();
    renderUserOrderStatus();
    showToast(`Order <strong>${orderId}</strong> status updated to <strong>${newStatus}</strong>!`, 'success');
  }
}

function renderOwnerStations() {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const container = document.getElementById('ownerStationsCardsContainer');
  if (!container) return;

  container.innerHTML = stations.map(s => `
    <div class="card relative overflow-hidden">
      <div class="flex justify-between items-start mb-3">
        <div>
          <h4 class="text-lg font-bold text-slate-900">${s.name}</h4>
          <p class="text-xs text-slate-500"><i class="fas fa-map-marker-alt text-red-500 mr-1"></i> ${s.address}</p>
        </div>
        <span class="status status-${s.status.toLowerCase()}">${s.status}</span>
      </div>
      <div class="flex items-center gap-4 text-sm text-slate-600 my-3">
        <div><i class="fas fa-star text-amber-400 mr-1"></i> <strong>${s.rating}</strong>/5</div>
        <div><i class="fas fa-phone text-blue-500 mr-1"></i> ${s.phone}</div>
      </div>
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${s.fuels.map(f => `<span class="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded">${f}</span>`).join('')}
      </div>
      <div class="flex gap-2 pt-3 border-t border-slate-100">
        <button onclick="openRefillModal('${s.id}')" class="fuel-btn text-xs py-1.5 flex-1">
          <i class="fas fa-gas-pump mr-1"></i> Refill Tank
        </button>
        <button onclick="toggleStationStatus('${s.id}')" class="fuel-btn-secondary text-xs px-3">
          Toggle
        </button>
      </div>
    </div>
  `).join('');
}

function openRefillModal(stationId) {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const st = stations.find(s => s.id === stationId) || stations[0];
  if (st) {
    document.getElementById('refillStationId').value = st.id;
    document.getElementById('refillStationName').innerText = st.name;
    openModal('refillTankModal');
  }
}

function handleSaveTankRefill(e) {
  if (e) e.preventDefault();
  const stationId = document.getElementById('refillStationId').value;
  const fuelType = document.getElementById('refillFuelType').value;
  const percentage = parseInt(document.getElementById('refillAmount').value) || 100;

  const stations = getStore(STORAGE_KEYS.STATIONS);
  const st = stations.find(s => s.id === stationId);
  if (st) {
    if (!st.tanks) st.tanks = { petrol: 80, diesel: 60, cng: 90 };
    st.tanks[fuelType] = Math.min(100, Math.max(0, percentage));
    setStore(STORAGE_KEYS.STATIONS, stations);

    closeModal('refillTankModal');
    renderOwnerDashboard();
    renderOwnerStations();
    showToast(`Refilled <strong>${fuelType.toUpperCase()}</strong> tank at ${st.name} to ${percentage}%!`, 'success');
  }
}

function toggleStationStatus(stationId) {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const st = stations.find(s => s.id === stationId);
  if (st) {
    st.status = st.status === 'Active' ? 'Inactive' : 'Active';
    setStore(STORAGE_KEYS.STATIONS, stations);
    renderOwnerStations();
    showToast(`Station ${st.name} status changed to ${st.status}`, 'info');
  }
}

// --- 11. USER DASHBOARD & TRANSPARENT FUEL ORDERING ---
function renderUserDashboard() {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  
  const elTotal = document.getElementById('userStatTotalOrders');
  const elPending = document.getElementById('userStatPendingOrders');
  const elSpent = document.getElementById('userStatTotalSpent');

  const pending = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const spent = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.amount, 0);

  if (elTotal) elTotal.innerText = orders.length;
  if (elPending) elPending.innerText = pending.length;
  if (elSpent) elSpent.innerText = '₹' + spent.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  setTimeout(renderUserExpenseChart, 100);
}

function renderUserExpenseChart() {
  const ctx = document.getElementById('userExpenseChart');
  if (!ctx) return;
  safeDestroyChart('userExpense');

  if (typeof Chart === 'undefined') return;

  try {
    chartRegistry['userExpense'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep (Current)'],
        datasets: [{
          label: 'Fuel Spending (₹)',
          data: [4200, 5800, 3900, 7200, 3647],
          backgroundColor: '#1e40af',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: '#f8fafc' } } }
      }
    });
  } catch (e) {}
}

function renderUserOrderFuel() {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const prices = getStore(STORAGE_KEYS.PRICES);

  const selectStation = document.getElementById('orderFuelStationSelect');
  const selectFuel = document.getElementById('orderFuelTypeSelect');

  if (selectStation) {
    selectStation.innerHTML = stations.filter(s => s.status === 'Active').map(s => `
      <option value="${s.id}">${s.name} (${s.city}) - ⭐ ${s.rating}</option>
    `).join('');
  }

  if (selectFuel) {
    selectFuel.innerHTML = prices.map(p => `
      <option value="${p.id}" data-rate="${p.rate}" data-density="${p.density}">${p.type} - ₹${p.rate.toFixed(2)}/${p.unit}</option>
    `).join('');
  }

  calculateOrderLiveTotal();
}

// Vehicle Type Presets
function selectVehicleType(vehicleType, defaultLitres, defaultFuelIndex) {
  document.querySelectorAll('.vehicle-badge-btn').forEach(btn => btn.classList.remove('selected'));
  const activeBtn = document.querySelector(`.vehicle-badge-btn[data-vehicle="${vehicleType}"]`);
  if (activeBtn) activeBtn.classList.add('selected');

  const litresInput = document.getElementById('orderFuelLitres');
  const litresSlider = document.getElementById('orderFuelLitresSlider');
  if (litresInput) litresInput.value = defaultLitres;
  if (litresSlider) litresSlider.value = defaultLitres;

  const fuelSelect = document.getElementById('orderFuelTypeSelect');
  if (fuelSelect && fuelSelect.options[defaultFuelIndex]) {
    fuelSelect.selectedIndex = defaultFuelIndex;
  }

  calculateOrderLiveTotal();
  showToast(`Selected <strong>${vehicleType.toUpperCase()}</strong>: Tank preset set to ${defaultLitres} Litres.`, 'info');
}

function setLitrePreset(litres) {
  const litresInput = document.getElementById('orderFuelLitres');
  const litresSlider = document.getElementById('orderFuelLitresSlider');
  if (litresInput) litresInput.value = litres;
  if (litresSlider) litresSlider.value = litres;
  calculateOrderLiveTotal();
}

function calculateOrderLiveTotal() {
  const fuelSelect = document.getElementById('orderFuelTypeSelect');
  const litresInput = document.getElementById('orderFuelLitres');
  const litresSlider = document.getElementById('orderFuelLitresSlider');

  if (!fuelSelect || !litresInput) return;

  const litres = parseFloat(litresInput.value) || 0;
  if (litresSlider && litresSlider.value != litres) {
    litresSlider.value = litres;
  }

  const selectedOpt = fuelSelect.options[fuelSelect.selectedIndex];
  const rate = selectedOpt ? parseFloat(selectedOpt.dataset.rate) || 104.21 : 104.21;
  const fuelCost = rate * litres;
  const deliveryFee = litres >= 100 ? 0 : (litres > 0 ? 50 : 0);
  const extraSurcharge = 0.00;
  const grandTotal = fuelCost + deliveryFee + extraSurcharge;

  // Update Digital LCD Dispenser Display
  const lcdAmount = document.getElementById('digitalLcdAmount');
  const lcdVolume = document.getElementById('digitalLcdVolume');
  const lcdRate = document.getElementById('digitalLcdRate');

  if (lcdAmount) lcdAmount.innerText = '₹' + grandTotal.toFixed(2);
  if (lcdVolume) lcdVolume.innerText = litres.toFixed(2) + ' L';
  if (lcdRate) lcdRate.innerText = '₹' + rate.toFixed(2) + '/L';

  // Update Transparent Breakdown Table
  const elBaseRate = document.getElementById('orderLiveRate');
  const elFuelCost = document.getElementById('orderLiveSubtotal');
  const elFee = document.getElementById('orderLiveFee');
  const elTotal = document.getElementById('orderLiveTotal');

  if (elBaseRate) elBaseRate.innerText = '₹' + rate.toFixed(2);
  if (elFuelCost) elFuelCost.innerText = '₹' + fuelCost.toFixed(2);
  if (elFee) elFee.innerText = deliveryFee === 0 ? 'FREE (100L+ Offer)' : '₹' + deliveryFee.toFixed(2);
  if (elTotal) elTotal.innerText = '₹' + grandTotal.toFixed(2);
}

// Temporary order state during checkout
let pendingOrderDraft = null;

function handleInitiateFuelOrder(e) {
  if (e) e.preventDefault();
  
  const stationSelect = document.getElementById('orderFuelStationSelect');
  const fuelSelect = document.getElementById('orderFuelTypeSelect');
  const litresInput = document.getElementById('orderFuelLitres');
  const addressInput = document.getElementById('orderDeliveryAddress');
  const phoneInput = document.getElementById('orderCustomerPhone');

  const litres = parseFloat(litresInput?.value);
  const address = addressInput?.value.trim();
  const phone = phoneInput?.value.trim() || '+91 98700 11223';

  if (!litres || litres < 5) {
    showToast('Please specify at least 5 Litres for delivery.', 'warning');
    return;
  }
  if (!address) {
    showToast('Please enter your delivery address.', 'warning');
    return;
  }

  const stations = getStore(STORAGE_KEYS.STATIONS);
  const prices = getStore(STORAGE_KEYS.PRICES);

  const selectedStation = stations.find(s => s.id === stationSelect.value) || stations[0];
  const selectedFuel = prices.find(p => p.id === fuelSelect.value) || prices[0];

  const rate = selectedFuel.rate;
  const fuelCost = rate * litres;
  const deliveryFee = litres >= 100 ? 0 : 50;
  const totalAmount = fuelCost + deliveryFee;

  pendingOrderDraft = {
    customer: 'Ananya Deshmukh',
    phone: phone,
    station: selectedStation.name,
    stationId: selectedStation.id,
    fuelType: selectedFuel.type,
    densityCertified: `${selectedFuel.density || '745.2 kg/m³'} (100% Pure Certified)`,
    litres: litres,
    rate: rate,
    fuelCost: fuelCost,
    deliveryFee: deliveryFee,
    extraSurcharge: 0.00,
    amount: totalAmount,
    deliveryAddress: address
  };

  document.getElementById('checkoutPayAmountDisplay').innerText = '₹' + totalAmount.toFixed(2);
  document.getElementById('checkoutFuelDetailDisplay').innerText = `${selectedFuel.type} • ${litres} Litres from ${selectedStation.name}`;
  openModal('checkoutPaymentModal');
}

function selectPaymentTab(tabName) {
  document.querySelectorAll('.payment-tab-btn').forEach(btn => btn.classList.remove('active', 'border-blue-600', 'text-blue-600'));
  document.querySelectorAll('.payment-tab-pane').forEach(p => p.classList.add('hidden'));

  const activeBtn = document.querySelector(`.payment-tab-btn[data-tab="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add('active', 'border-blue-600', 'text-blue-600');

  const pane = document.getElementById('payPane_' + tabName);
  if (pane) pane.classList.remove('hidden');
}

function processPayment(paymentMethod) {
  if (!pendingOrderDraft) return;

  const newOrderId = 'FL-' + (9000 + Math.floor(Math.random() * 900));
  const completeOrder = {
    ...pendingOrderDraft,
    id: newOrderId,
    paymentMethod: paymentMethod,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'In Transit',
    driver: {
      name: 'Santosh Jadhav (PESO Certified)',
      phone: '+91 98112 77884',
      vehicle: 'MH-01-FL-8822 (IoT Micro-Tanker)',
      eta: '14 mins',
      distance: '2.4 km away'
    }
  };

  const orders = getStore(STORAGE_KEYS.ORDERS);
  orders.unshift(completeOrder);
  setStore(STORAGE_KEYS.ORDERS, orders);

  closeModal('checkoutPaymentModal');
  showToast(`🎉 Payment Confirmed! Order <strong>#${newOrderId}</strong> placed with zero hidden markup!`, 'success');
  
  showUserSection('orderStatus');
  renderUserOrderStatus();
}

function simulateNextDeliveryStep(orderId) {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const o = orders.find(x => x.id === orderId);
  if (!o) return;

  if (o.status === 'Pending') {
    o.status = 'Accepted';
    if (o.driver) o.driver.distance = '3.5 km away';
  } else if (o.status === 'Accepted') {
    o.status = 'In Transit';
    if (o.driver) o.driver.distance = '1.2 km away';
  } else if (o.status === 'In Transit') {
    o.status = 'Delivered';
    if (o.driver) {
      o.driver.eta = 'Delivered';
      o.driver.distance = 'Arrived at destination';
    }
  } else {
    o.status = 'In Transit';
  }

  setStore(STORAGE_KEYS.ORDERS, orders);
  renderUserOrderStatus();
  showToast(`Order <strong>${orderId}</strong> advanced to <strong>${o.status}</strong>!`, 'success');
}

function renderUserOrderStatus() {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const activeOrder = orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled') || orders[0];

  const trackerBox = document.getElementById('userActiveOrderTrackerBox');
  if (trackerBox && activeOrder) {
    const isPlaced = true;
    const isAccepted = activeOrder.status === 'Accepted' || activeOrder.status === 'In Transit' || activeOrder.status === 'Delivered';
    const isTransit = activeOrder.status === 'In Transit' || activeOrder.status === 'Delivered';
    const isDelivered = activeOrder.status === 'Delivered';

    trackerBox.innerHTML = `
      <div class="card border-blue-200 shadow-lg relative overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold py-1.5 px-4 -mx-6 -mt-6 mb-4 flex justify-between items-center">
          <span><i class="fas fa-shield-check mr-1.5"></i> ZERO HIDDEN FEES GUARANTEE: Paid Only For Fuel (₹${(activeOrder.fuelCost || activeOrder.amount - 50).toFixed(2)}) + Delivery (₹${(activeOrder.deliveryFee || 50).toFixed(2)})</span>
          <span class="bg-white/20 px-2 py-0.5 rounded font-mono">${activeOrder.paymentMethod || 'Online UPI'}</span>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Live On-Demand Dispatch</span>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">${activeOrder.id} • ${activeOrder.fuelType} (${activeOrder.litres}L)</h3>
            <p class="text-xs text-slate-500 mt-1"><i class="fas fa-store text-orange-500 mr-1"></i> Dispatched from: <strong>${activeOrder.station}</strong></p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="simulateNextDeliveryStep('${activeOrder.id}')" class="fuel-btn text-xs py-2 px-3.5 rounded-lg shadow-sm" title="Advance delivery status for live demo">
              <i class="fas fa-forward-step mr-1"></i> Advance Status
            </button>
            <div class="text-right">
              <span class="status status-${activeOrder.status.toLowerCase().replace(' ', '-')} text-xs font-bold">${activeOrder.status}</span>
              <div class="text-xl font-black text-emerald-700 mt-1">₹${activeOrder.amount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <!-- Stepper -->
        <div class="stepper-container">
          <div class="stepper-step ${isPlaced ? (isAccepted ? 'completed' : 'active') : ''}">
            <div class="stepper-icon"><i class="fas fa-receipt"></i></div>
            <div class="stepper-title">Order Placed</div>
          </div>
          <div class="stepper-step ${isAccepted ? (isTransit ? 'completed' : 'active') : ''}">
            <div class="stepper-icon"><i class="fas fa-check"></i></div>
            <div class="stepper-title">Station Confirmed</div>
          </div>
          <div class="stepper-step ${isTransit ? (isDelivered ? 'completed' : 'active') : ''}">
            <div class="stepper-icon"><i class="fas fa-truck-fast"></i></div>
            <div class="stepper-title">Out for Delivery</div>
          </div>
          <div class="stepper-step ${isDelivered ? 'completed active' : ''}">
            <div class="stepper-icon"><i class="fas fa-flag-checkered"></i></div>
            <div class="stepper-title">Delivered</div>
          </div>
        </div>

        <!-- Animated GPS Map -->
        <div class="map-canvas-container my-6 relative flex items-center justify-center">
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div class="relative z-10 w-full px-6 flex justify-between items-center text-white text-xs">
            <div class="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
              <div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-sm">
                <i class="fas fa-gas-pump"></i>
              </div>
              <div>
                <div class="font-bold text-white">${activeOrder.station}</div>
                <div class="text-[10px] text-slate-400">Origin Depot</div>
              </div>
            </div>

            <div class="flex-1 px-4 relative flex items-center justify-center">
              <div class="w-full h-1 bg-slate-700 rounded relative">
                <div class="h-full bg-emerald-500 rounded transition-all duration-1000 ${isDelivered ? 'w-full' : (isTransit ? 'w-2/3' : 'w-1/4')}"></div>
              </div>
              <div class="absolute ${isDelivered ? 'right-4' : (isTransit ? 'left-2/3' : 'left-1/4')} -top-3.5 transition-all duration-1000 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg shadow-orange-500/50 animate-bounce">
                <i class="fas fa-truck-fast"></i>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
              <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">
                <i class="fas fa-location-dot"></i>
              </div>
              <div>
                <div class="font-bold text-white truncate max-w-[120px]">${activeOrder.deliveryAddress}</div>
                <div class="text-[10px] text-slate-400">${activeOrder.driver?.distance || 'Live GPS Active'}</div>
              </div>
            </div>
          </div>
        </div>

        ${activeOrder.driver ? `
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-600/20">
                <i class="fas fa-user-shield"></i>
              </div>
              <div>
                <h5 class="font-bold text-slate-900">${activeOrder.driver.name}</h5>
                <p class="text-xs text-slate-600"><i class="fas fa-truck mr-1 text-blue-500"></i> ${activeOrder.driver.vehicle}</p>
                <p class="text-[11px] text-emerald-700 font-semibold mt-0.5"><i class="fas fa-certificate mr-1"></i> Quality Tested: ${activeOrder.densityCertified || '745.2 kg/m³ Pure'}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <div class="text-right">
                <div class="text-xs text-slate-500">Estimated Arrival</div>
                <div class="text-base font-black text-orange-600">${activeOrder.driver.eta}</div>
              </div>
              <a href="tel:${activeOrder.driver.phone}" class="fuel-btn text-xs py-2 px-3.5 rounded-lg">
                <i class="fas fa-phone mr-1"></i> Call Driver
              </a>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render History Table
  const historyTbody = document.getElementById('userOrderHistoryTbody');
  if (historyTbody) {
    historyTbody.innerHTML = orders.map(o => `
      <tr>
        <td class="font-mono font-bold text-blue-800">${o.id}</td>
        <td>${o.date}</td>
        <td class="font-semibold text-slate-800">${o.station}</td>
        <td><span class="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">${o.fuelType}</span></td>
        <td class="font-bold">${o.litres} L</td>
        <td class="font-semibold text-emerald-700">₹${o.amount.toFixed(2)}</td>
        <td><span class="status status-${o.status.toLowerCase().replace(' ', '-')}">${o.status}</span></td>
        <td>
          <button onclick="viewOrderDetailsModal('${o.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
            <i class="fas fa-file-invoice mr-1"></i> Tax Invoice
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function renderUserSearchStations(query = '', fuelFilter = 'all') {
  const stations = getStore(STORAGE_KEYS.STATIONS);
  const container = document.getElementById('stationSearchResultsContainer');
  if (!container) return;

  const filtered = stations.filter(s => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase()) || 
                         s.city.toLowerCase().includes(query.toLowerCase()) || 
                         s.address.toLowerCase().includes(query.toLowerCase());
    const matchesFuel = fuelFilter === 'all' || s.fuels.some(f => f.toLowerCase() === fuelFilter.toLowerCase());
    return matchesQuery && matchesFuel;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400">
        <i class="fas fa-gas-pump text-5xl mb-3"></i>
        <p class="text-base font-semibold">No fuel stations matching your search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="card flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-bold text-lg text-slate-900">${s.name}</h4>
          <span class="status status-${s.status.toLowerCase()}">${s.status}</span>
        </div>
        <p class="text-xs text-slate-500 mb-3"><i class="fas fa-map-marker-alt text-red-500 mr-1"></i> ${s.address}</p>
        <div class="flex items-center gap-3 text-xs text-slate-600 mb-3">
          <span class="font-bold text-amber-500">⭐ ${s.rating}</span>
          <span><i class="fas fa-phone text-blue-500 mr-1"></i> ${s.phone}</span>
        </div>
        <div class="flex flex-wrap gap-1 mb-4">
          ${s.fuels.map(f => `<span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">${f}</span>`).join('')}
        </div>
      </div>
      <button onclick="triggerQuickOrderForStation('${s.id}')" class="fuel-btn w-full text-xs py-2 rounded-lg">
        <i class="fas fa-truck-fast mr-1"></i> Order from this Hub
      </button>
    </div>
  `).join('');
}

function triggerQuickOrderForStation(stationId) {
  showUserSection('orderFuel');
  const sel = document.getElementById('orderFuelStationSelect');
  if (sel) {
    sel.value = stationId;
    calculateOrderLiveTotal();
  }
}

// Invoice Modal with Certified Density Report
function viewOrderDetailsModal(orderId) {
  const orders = getStore(STORAGE_KEYS.ORDERS);
  const o = orders.find(x => x.id === orderId);
  if (!o) return;

  const fuelCost = o.fuelCost || (o.amount - (o.deliveryFee || 50));
  const deliveryFee = o.deliveryFee !== undefined ? o.deliveryFee : 50;

  const content = document.getElementById('orderDetailsModalContent');
  if (content) {
    content.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <i class="fas fa-shield-check mr-1"></i> Verified Tax Invoice
              </span>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mt-1">Invoice #${o.id}</h3>
            <p class="text-xs text-slate-400">Timestamp: ${o.date} • GSTIN: 27AABCF1234F1ZP</p>
          </div>
          <span class="status status-${o.status.toLowerCase().replace(' ', '-')}">${o.status}</span>
        </div>
        
        <div class="py-4 space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Customer Name:</span>
            <span class="font-semibold text-slate-800">${o.customer}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Contact Number:</span>
            <span class="font-semibold text-slate-800">${o.phone}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Dispensing Hub Depot:</span>
            <span class="font-semibold text-slate-800">${o.station}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Delivery Address:</span>
            <span class="font-medium text-slate-700 text-right max-w-xs">${o.deliveryAddress}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">PESO Purity Verification:</span>
            <span class="font-bold text-emerald-700">${o.densityCertified || '745.2 kg/m³ @ 15°C (100% Pure)'}</span>
          </div>
          
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 my-3 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-600">Fuel Grade (${o.litres}L @ ₹${o.rate}/L):</span>
              <span class="font-bold text-slate-900">₹${fuelCost.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Doorstep Delivery & IoT Metering:</span>
              <span class="font-bold text-slate-900">₹${deliveryFee.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-bold">
              <span>Platform Surcharge / Hidden Fees:</span>
              <span>₹0.00 (Zero Markup)</span>
            </div>
            <div class="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid:</span>
              <span class="text-emerald-700">₹${o.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button onclick="closeModal('orderDetailsModal')" class="fuel-btn-secondary text-xs px-4 py-2 rounded-lg">
            Close
          </button>
          <button onclick="window.print()" class="fuel-btn text-xs px-4 py-2 rounded-lg">
            <i class="fas fa-print mr-1"></i> Print Tax Receipt
          </button>
        </div>
      </div>
    `;
  }
  openModal('orderDetailsModal');
}

// --- 12. SETTINGS & PROFILE MODALS ---
function toggleSettings() {
  const menu = document.getElementById('settingsMenu');
  if (menu) menu.classList.toggle('hidden');
}

function openSection(sectionId) {
  const menu = document.getElementById('settingsMenu');
  if (menu) menu.classList.add('hidden');
  
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');
  if (profileForm) profileForm.classList.add('hidden');
  if (passwordForm) passwordForm.classList.add('hidden');
  
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove('hidden');
}

function createProfile() {
  showToast('Profile updated successfully!', 'success');
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.classList.add('hidden');
}

function changePassword() {
  showToast('Password updated securely!', 'success');
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) passwordForm.classList.add('hidden');
}

// --- 13. AUTHENTICATION & LOGIN PAGE ROUTING ---
function handleAdminLogin() {
  showToast('Welcome, Administrator! Access granted.', 'success');
  showSection('adminPanel');
}

function handleOwnerLogin() {
  showToast('Welcome, Station Owner! Portal ready.', 'success');
  showSection('stationOwnerLayout');
}

function handleUserLogin() {
  showToast('Welcome, Customer! Portal ready.', 'success');
  showUserSection('orderFuel');
  showSection('userSection');
}

function logout() {
  showToast('Logged out of session.', 'info');
  showSection('home');
}

// --- 14. INITIALIZE APP ON LOAD & QUERY PARAMS ---
document.addEventListener('DOMContentLoaded', function() {
  // Check URL params for role routing (e.g. from login.html)
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  if (roleParam) {
    switchRole(roleParam);
  }

  // Bind search listeners
  const searchInput = document.getElementById('stationLiveSearchInput');
  const fuelFilter = document.getElementById('stationFuelFilterSelect');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderUserSearchStations(e.target.value, fuelFilter ? fuelFilter.value : 'all');
    });
  }
  if (fuelFilter) {
    fuelFilter.addEventListener('change', (e) => {
      renderUserSearchStations(searchInput ? searchInput.value : '', e.target.value);
    });
  }

  // Bind Litres & Fuel select
  const litresInput = document.getElementById('orderFuelLitres');
  if (litresInput) {
    litresInput.addEventListener('input', calculateOrderLiveTotal);
  }
  const litresSlider = document.getElementById('orderFuelLitresSlider');
  if (litresSlider) {
    litresSlider.addEventListener('input', (e) => {
      if (litresInput) litresInput.value = e.target.value;
      calculateOrderLiveTotal();
    });
  }
  const fuelSelect = document.getElementById('orderFuelTypeSelect');
  if (fuelSelect) {
    fuelSelect.addEventListener('change', calculateOrderLiveTotal);
  }
});
