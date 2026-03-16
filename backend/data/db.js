const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { allProduce } = require('./produce');
const { initFirebase, getFirestore } = require('../config/firebase');

const DB_PATH = path.join(__dirname, 'db.json');

// ============================================================
// SEED DATA GENERATORS
// ============================================================

const defaultSeedVendors = () => {
  const hash = bcrypt.hashSync('password123', 10);
  return [
    { id: 'vendor-1', name: 'Ravi Vegetables', email: 'ravi@freshlink.com', phone: '9876543210', password: hash, role: 'vendor', upiId: 'ravi.veggies@upi', shopName: 'Ravi Fresh Vegetables', location: { lat: 17.4486, lng: 78.3908, address: 'Madhapur Vegetable Market, Hyderabad' }, rating: 4.7, totalOrders: 342, joinedDate: '2025-06-15' },
    { id: 'vendor-2', name: 'Lakshmi Fresh Fruits', email: 'lakshmi@freshlink.com', phone: '9876543211', password: hash, role: 'vendor', upiId: 'lakshmi.fruits@paytm', shopName: 'Lakshmi Fresh Fruits Stall', location: { lat: 17.4375, lng: 78.4483, address: 'Ameerpet Market, Hyderabad' }, rating: 4.5, totalOrders: 218, joinedDate: '2025-08-20' },
    { id: 'vendor-3', name: 'Krishna Organics', email: 'krishna@freshlink.com', phone: '9876543212', password: hash, role: 'vendor', upiId: 'krishna.organic@gpay', shopName: 'Krishna Organic Farm Store', location: { lat: 17.4849, lng: 78.3883, address: 'Kukatpally Rythu Bazaar, Hyderabad' }, rating: 4.9, totalOrders: 512, joinedDate: '2025-03-10' },
    { id: 'vendor-4', name: 'Suresh Farm Fresh', email: 'suresh@freshlink.com', phone: '9876543213', password: hash, role: 'vendor', upiId: 'suresh.farmfresh@upi', shopName: 'Suresh Farm Fresh Store', location: { lat: 17.3688, lng: 78.5247, address: 'Dilsukhnagar Market, Hyderabad' }, rating: 4.3, totalOrders: 156, joinedDate: '2025-10-05' },
    { id: 'vendor-5', name: 'Annapurna Veggies', email: 'annapurna@freshlink.com', phone: '9876543214', password: hash, role: 'vendor', upiId: 'annapurna.veggies@paytm', shopName: 'Annapurna Vegetable Shop', location: { lat: 17.4440, lng: 78.4715, address: 'Begumpet Vegetable Market, Hyderabad' }, rating: 4.6, totalOrders: 289, joinedDate: '2025-05-22' },
    { id: 'vendor-6', name: 'Venkat Green Farms', email: 'venkat@freshlink.com', phone: '9876543215', password: hash, role: 'vendor', upiId: 'venkat.greenfarms@gpay', shopName: 'Venkat Green Farms Outlet', location: { lat: 17.4401, lng: 78.3489, address: 'Gachibowli Weekly Market, Hyderabad' }, rating: 4.8, totalOrders: 401, joinedDate: '2025-04-18' },
    { id: 'vendor-7', name: 'Kondapur Fresh Market', email: 'kondapur@freshlink.com', phone: '9876543216', password: hash, role: 'vendor', upiId: 'kondapur.fresh@upi', shopName: 'Kondapur Fresh Market Store', location: { lat: 17.4600, lng: 78.3548, address: 'Kondapur Main Road, Hyderabad' }, rating: 4.4, totalOrders: 178, joinedDate: '2025-09-12' },
    { id: 'vendor-8', name: 'Secunderabad Mandi', email: 'secmandi@freshlink.com', phone: '9876543217', password: hash, role: 'vendor', upiId: 'secmandi.wholesale@paytm', shopName: 'Secunderabad Mandi Wholesale', location: { lat: 17.4399, lng: 78.4983, address: 'General Bazaar, Secunderabad' }, rating: 4.6, totalOrders: 334, joinedDate: '2025-07-01' },
  ];
};

const defaultSeedBusinesses = () => {
  const hash = bcrypt.hashSync('password123', 10);
  return [
    { id: 'business-1', name: 'Spice Kitchen Restaurant', email: 'spicekitchen@freshlink.com', phone: '9988776655', password: hash, role: 'business', businessType: 'Restaurant', location: { lat: 17.4156, lng: 78.4347, address: 'Road No. 12, Banjara Hills, Hyderabad' }, joinedDate: '2025-07-01' },
    { id: 'business-2', name: 'The Juice Bar', email: 'juicebar@freshlink.com', phone: '9988776656', password: hash, role: 'business', businessType: 'Juice Shop', location: { lat: 17.4310, lng: 78.4070, address: 'Jubilee Hills, Hyderabad' }, joinedDate: '2025-09-15' },
    { id: 'business-3', name: 'Campus Mess Hall', email: 'campusmess@freshlink.com', phone: '9988776657', password: hash, role: 'business', businessType: 'Mess/Canteen', location: { lat: 17.4401, lng: 78.3489, address: 'IIIT Campus, Gachibowli, Hyderabad' }, joinedDate: '2025-08-01' },
    { id: 'business-4', name: 'Hotel Grand Palace', email: 'grandpalace@freshlink.com', phone: '9988776658', password: hash, role: 'business', businessType: 'Hotel', location: { lat: 17.4399, lng: 78.4983, address: 'MG Road, Secunderabad' }, joinedDate: '2025-06-10' },
  ];
};

function generateStock(users) {
  const stock = [];
  users.filter(v => v.role === 'vendor').forEach((vendor) => {
    const itemCount = 10 + Math.floor(Math.random() * 9);
    const shuffled = [...allProduce].sort(() => Math.random() - 0.5).slice(0, itemCount);
    shuffled.forEach((item) => {
      const priceRange = item.maxPrice - item.minPrice;
      const vendorPrice = item.minPrice + Math.floor(Math.random() * (priceRange + 1));
      const quantity = 5 + Math.floor(Math.random() * 46);
      const daysToExpiry = 1 + Math.floor(Math.random() * item.shelfLife);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry);
      stock.push({
        id: uuidv4(), vendorId: vendor.id, produceId: item.id, name: item.name,
        category: item.category, quantity, pricePerKg: vendorPrice,
        minPrice: item.minPrice, maxPrice: item.maxPrice, unit: item.unit,
        image: item.image, status: quantity > 10 ? 'In Stock' : 'Low Stock',
        expiryDate: expiryDate.toISOString().split('T')[0],
        listedAt: new Date().toISOString(), isSurplus: daysToExpiry <= 2,
        discountPrice: daysToExpiry <= 2 ? Math.round(vendorPrice * 0.7) : null,
        market: 'Hyderabad',
      });
    });
  });
  return stock;
}

function generateOrders(users) {
  const statuses = ['pending', 'confirmed', 'processing', 'in_transit', 'delivered'];
  const orders = [];
  const vendorList = users.filter(v => v.role === 'vendor');
  const businessList = users.filter(b => b.role === 'business');
  for (let i = 0; i < 15; i++) {
    const vendor = vendorList[Math.floor(Math.random() * vendorList.length)];
    const business = businessList[Math.floor(Math.random() * businessList.length)];
    const items = [];
    let total = 0;
    const itemCount = 1 + Math.floor(Math.random() * 4);
    for (let j = 0; j < itemCount; j++) {
      const produce = allProduce[Math.floor(Math.random() * allProduce.length)];
      const qty = 2 + Math.floor(Math.random() * 19);
      items.push({ name: produce.name, quantity: qty, unit: produce.unit, pricePerKg: produce.pricePerKg, subtotal: qty * produce.pricePerKg });
      total += qty * produce.pricePerKg;
    }
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 7));
    orders.push({
      id: `ORD-${String(1000 + i).padStart(4, '0')}`, vendorId: vendor.id, vendorName: vendor.name,
      businessId: business.id, businessName: business.name, items, total: Math.round(total),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      deliveryAddress: business.location.address, createdAt: createdDate.toISOString(),
      estimatedDelivery: ['30 mins', '45 mins', '1 hour'][Math.floor(Math.random() * 3)],
    });
  }
  return orders;
}

function generateSeedData() {
  const vendors = defaultSeedVendors();
  const businesses = defaultSeedBusinesses();
  const users = [...vendors, ...businesses];
  return {
    users,
    stock: generateStock(users),
    orders: generateOrders(users),
    requirements: [],
    surplusRequests: [],
    orderCounter: 2000,
  };
}

// ============================================================
// FIREBASE FIRESTORE PERSISTENCE
// ============================================================

class FirestoreDB {
  constructor(firestore) {
    this.firestore = firestore;
    this.data = null;
    this._saveTimeout = null;
  }

  async init() {
    const metaRef = this.firestore.collection('meta').doc('state');
    const metaDoc = await metaRef.get();

    if (metaDoc.exists && metaDoc.data().initialized) {
      // Load existing data from Firestore
      console.log('  [Firebase] Loading data from Firestore...');
      this.data = await this._loadAll();
      console.log(`  [Firebase] Loaded ${this.data.users.length} users, ${this.data.stock.length} stock, ${this.data.orders.length} orders`);
    } else {
      // First run: seed Firestore
      console.log('  [Firebase] First run - seeding Firestore...');
      this.data = generateSeedData();
      await this._saveAll();
      await metaRef.set({ initialized: true, createdAt: new Date().toISOString() });
      console.log(`  [Firebase] Seeded ${this.data.users.length} users, ${this.data.stock.length} stock, ${this.data.orders.length} orders`);
    }
    return this.data;
  }

  async _loadAll() {
    const [usersSnap, stockSnap, ordersSnap, reqsSnap, surplusSnap, metaSnap] = await Promise.all([
      this.firestore.collection('users').get(),
      this.firestore.collection('stock').get(),
      this.firestore.collection('orders').get(),
      this.firestore.collection('requirements').get(),
      this.firestore.collection('surplusRequests').get(),
      this.firestore.collection('meta').doc('counters').get(),
    ]);

    return {
      users: usersSnap.docs.map(d => ({ ...d.data(), _docId: d.id })),
      stock: stockSnap.docs.map(d => ({ ...d.data(), _docId: d.id })),
      orders: ordersSnap.docs.map(d => ({ ...d.data(), _docId: d.id })),
      requirements: reqsSnap.docs.map(d => ({ ...d.data(), _docId: d.id })),
      surplusRequests: surplusSnap.docs.map(d => ({ ...d.data(), _docId: d.id })),
      orderCounter: metaSnap.exists ? (metaSnap.data().orderCounter || 2000) : 2000,
    };
  }

  async _saveAll() {
    const batch = this.firestore.batch();

    // Save in batches of 500 (Firestore limit)
    const collections = [
      { name: 'users', data: this.data.users, key: 'id' },
      { name: 'stock', data: this.data.stock, key: 'id' },
      { name: 'orders', data: this.data.orders, key: 'id' },
      { name: 'requirements', data: this.data.requirements, key: 'id' },
      { name: 'surplusRequests', data: this.data.surplusRequests, key: 'id' },
    ];

    for (const col of collections) {
      for (const item of col.data) {
        const docId = item[col.key] || uuidv4();
        const ref = this.firestore.collection(col.name).doc(docId);
        const { _docId, ...cleanItem } = item;
        batch.set(ref, cleanItem);
      }
    }

    // Save counter
    batch.set(this.firestore.collection('meta').doc('counters'), {
      orderCounter: this.data.orderCounter || 2000,
    });

    // Firestore batches support max 500 writes
    // For seed data this is fine, but for large datasets we'd need to split
    await batch.commit();
  }

  scheduleSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => this._syncToFirestore(), 1000);
  }

  async _syncToFirestore() {
    try {
      await this._saveAll();
    } catch (err) {
      console.error('  [Firebase] Sync error:', err.message);
    }
  }
}

// ============================================================
// LOCAL JSON PERSISTENCE (fallback)
// ============================================================

class LocalDB {
  constructor() {
    this.data = null;
    this._saveTimeout = null;
  }

  init() {
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`  [LocalDB] Loaded ${this.data.users.length} users, ${this.data.stock.length} stock, ${this.data.orders.length} orders`);
        return this.data;
      } catch (e) {
        console.log('  [LocalDB] Corrupt db.json, reinitializing...');
      }
    }

    this.data = generateSeedData();
    this._saveToFile();
    console.log(`  [LocalDB] Created fresh database with ${this.data.users.length} users, ${this.data.stock.length} stock, ${this.data.orders.length} orders`);
    return this.data;
  }

  _saveToFile() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  scheduleSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => this._saveToFile(), 500);
  }
}

// ============================================================
// INITIALIZE DATABASE (Firebase or Local fallback)
// ============================================================

let db = null;
let dbInstance = null;
let scheduleSave = null;

async function initDatabase() {
  const firestore = initFirebase();

  if (firestore) {
    dbInstance = new FirestoreDB(firestore);
    db = await dbInstance.init();
    scheduleSave = () => dbInstance.scheduleSave();
    console.log('  [DB] Using Firebase Firestore');
  } else {
    dbInstance = new LocalDB();
    db = dbInstance.init();
    scheduleSave = () => dbInstance.scheduleSave();
    console.log('  [DB] Using local JSON file');
  }

  return { db, scheduleSave };
}

// For synchronous requires during startup (local mode),
// initialize immediately with local DB as default
dbInstance = new LocalDB();
db = dbInstance.init();
scheduleSave = () => dbInstance.scheduleSave();

module.exports = {
  db,
  scheduleSave: () => scheduleSave(),
  initDatabase,
  get currentDb() { return db; },
};
