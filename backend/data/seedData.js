const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { allProduce } = require('./produce');

// Hyderabad area coordinates for demo
const locations = {
  madhapur: { lat: 17.4486, lng: 78.3908 },
  ameerpet: { lat: 17.4375, lng: 78.4483 },
  kukatpally: { lat: 17.4849, lng: 78.3883 },
  dilsukhnagar: { lat: 17.3688, lng: 78.5247 },
  begumpet: { lat: 17.4440, lng: 78.4715 },
  banjara_hills: { lat: 17.4156, lng: 78.4347 },
  jubilee_hills: { lat: 17.4310, lng: 78.4070 },
  gachibowli: { lat: 17.4401, lng: 78.3489 },
  secunderabad: { lat: 17.4399, lng: 78.4983 },
  miyapur: { lat: 17.4969, lng: 78.3548 },
  lb_nagar: { lat: 17.3457, lng: 78.5522 },
  kondapur: { lat: 17.4600, lng: 78.3548 },
};

const passwordHash = bcrypt.hashSync('password123', 10);

// Pre-seeded vendor users
const vendorUsers = [
  {
    id: 'vendor-1',
    name: 'Ravi Vegetables',
    email: 'ravi@freshlink.com',
    phone: '9876543210',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.madhapur, address: 'Madhapur Vegetable Market, Hyderabad' },
    rating: 4.7,
    totalOrders: 342,
    joinedDate: '2025-06-15',
  },
  {
    id: 'vendor-2',
    name: 'Lakshmi Fresh Fruits',
    email: 'lakshmi@freshlink.com',
    phone: '9876543211',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.ameerpet, address: 'Ameerpet Market, Hyderabad' },
    rating: 4.5,
    totalOrders: 218,
    joinedDate: '2025-08-20',
  },
  {
    id: 'vendor-3',
    name: 'Krishna Organics',
    email: 'krishna@freshlink.com',
    phone: '9876543212',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.kukatpally, address: 'Kukatpally Rythu Bazaar, Hyderabad' },
    rating: 4.9,
    totalOrders: 512,
    joinedDate: '2025-03-10',
  },
  {
    id: 'vendor-4',
    name: 'Suresh Farm Fresh',
    email: 'suresh@freshlink.com',
    phone: '9876543213',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.dilsukhnagar, address: 'Dilsukhnagar Market, Hyderabad' },
    rating: 4.3,
    totalOrders: 156,
    joinedDate: '2025-10-05',
  },
  {
    id: 'vendor-5',
    name: 'Annapurna Veggies',
    email: 'annapurna@freshlink.com',
    phone: '9876543214',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.begumpet, address: 'Begumpet Vegetable Market, Hyderabad' },
    rating: 4.6,
    totalOrders: 289,
    joinedDate: '2025-05-22',
  },
  {
    id: 'vendor-6',
    name: 'Venkat Green Farms',
    email: 'venkat@freshlink.com',
    phone: '9876543215',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.gachibowli, address: 'Gachibowli Weekly Market, Hyderabad' },
    rating: 4.8,
    totalOrders: 401,
    joinedDate: '2025-04-18',
  },
  {
    id: 'vendor-7',
    name: 'Kondapur Fresh Market',
    email: 'kondapur@freshlink.com',
    phone: '9876543216',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.kondapur, address: 'Kondapur Main Road, Hyderabad' },
    rating: 4.4,
    totalOrders: 178,
    joinedDate: '2025-09-12',
  },
  {
    id: 'vendor-8',
    name: 'Secunderabad Mandi',
    email: 'secmandi@freshlink.com',
    phone: '9876543217',
    password: passwordHash,
    role: 'vendor',
    location: { ...locations.secunderabad, address: 'General Bazaar, Secunderabad' },
    rating: 4.6,
    totalOrders: 334,
    joinedDate: '2025-07-01',
  },
];

// Pre-seeded business users
const businessUsers = [
  {
    id: 'business-1',
    name: 'Spice Kitchen Restaurant',
    email: 'spicekitchen@freshlink.com',
    phone: '9988776655',
    password: passwordHash,
    role: 'business',
    businessType: 'Restaurant',
    location: { ...locations.banjara_hills, address: 'Road No. 12, Banjara Hills, Hyderabad' },
    joinedDate: '2025-07-01',
  },
  {
    id: 'business-2',
    name: 'The Juice Bar',
    email: 'juicebar@freshlink.com',
    phone: '9988776656',
    password: passwordHash,
    role: 'business',
    businessType: 'Juice Shop',
    location: { ...locations.jubilee_hills, address: 'Jubilee Hills, Hyderabad' },
    joinedDate: '2025-09-15',
  },
  {
    id: 'business-3',
    name: 'Campus Mess Hall',
    email: 'campusmess@freshlink.com',
    phone: '9988776657',
    password: passwordHash,
    role: 'business',
    businessType: 'Mess/Canteen',
    location: { ...locations.gachibowli, address: 'IIIT Campus, Gachibowli, Hyderabad' },
    joinedDate: '2025-08-01',
  },
  {
    id: 'business-4',
    name: 'Hotel Grand Palace',
    email: 'grandpalace@freshlink.com',
    phone: '9988776658',
    password: passwordHash,
    role: 'business',
    businessType: 'Hotel',
    location: { ...locations.secunderabad, address: 'MG Road, Secunderabad' },
    joinedDate: '2025-06-10',
  },
];

// Generate vendor stock from produce dataset with realistic price variations
function generateVendorStock() {
  const stock = [];
  vendorUsers.forEach((vendor) => {
    // Each vendor carries 10-18 items
    const itemCount = 10 + Math.floor(Math.random() * 9);
    const shuffled = [...allProduce].sort(() => Math.random() - 0.5).slice(0, itemCount);

    shuffled.forEach((item) => {
      // Price varies between minPrice and maxPrice from CSV data
      const priceRange = item.maxPrice - item.minPrice;
      const vendorPrice = item.minPrice + Math.floor(Math.random() * (priceRange + 1));
      const quantity = 5 + Math.floor(Math.random() * 46); // 5-50 kg
      const daysToExpiry = 1 + Math.floor(Math.random() * item.shelfLife);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

      stock.push({
        id: uuidv4(),
        vendorId: vendor.id,
        produceId: item.id,
        name: item.name,
        category: item.category,
        quantity,
        pricePerKg: vendorPrice,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        unit: item.unit,
        image: item.image,
        status: quantity > 10 ? 'In Stock' : quantity > 0 ? 'Low Stock' : 'Out of Stock',
        expiryDate: expiryDate.toISOString().split('T')[0],
        listedAt: new Date().toISOString(),
        isSurplus: daysToExpiry <= 2,
        discountPrice: daysToExpiry <= 2 ? Math.round(vendorPrice * 0.7) : null,
        market: 'Hyderabad',
      });
    });
  });
  return stock;
}

// Generate sample orders
function generateOrders() {
  const statuses = ['pending', 'confirmed', 'processing', 'in_transit', 'delivered'];
  const orders = [];

  for (let i = 0; i < 15; i++) {
    const vendor = vendorUsers[Math.floor(Math.random() * vendorUsers.length)];
    const business = businessUsers[Math.floor(Math.random() * businessUsers.length)];
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const items = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const produce = allProduce[Math.floor(Math.random() * allProduce.length)];
      const qty = 2 + Math.floor(Math.random() * 19);
      const price = produce.pricePerKg;
      items.push({
        name: produce.name,
        quantity: qty,
        unit: produce.unit,
        pricePerKg: price,
        subtotal: qty * price,
      });
      total += qty * price;
    }

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 7));

    orders.push({
      id: `ORD-${String(1000 + i).padStart(4, '0')}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      businessId: business.id,
      businessName: business.name,
      items,
      total: Math.round(total),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      deliveryAddress: business.location.address,
      createdAt: createdDate.toISOString(),
      estimatedDelivery: ['30 mins', '45 mins', '1 hour'][Math.floor(Math.random() * 3)],
    });
  }
  return orders;
}

// Cold storage facilities
const coldStorages = [
  {
    id: 'cs-1',
    name: 'Hyderabad Cold Chain Hub',
    address: 'Miyapur Industrial Area, Hyderabad',
    location: locations.miyapur,
    capacity: 500,
    available: 320,
    pricePerKgPerDay: 2,
    temperature: '2-8°C',
    contact: '9111222333',
  },
  {
    id: 'cs-2',
    name: 'Fresh Store LB Nagar',
    address: 'LB Nagar Main Road, Hyderabad',
    location: locations.lb_nagar,
    capacity: 300,
    available: 180,
    pricePerKgPerDay: 2.5,
    temperature: '2-6°C',
    contact: '9111222334',
  },
  {
    id: 'cs-3',
    name: 'Agri Cold Solutions',
    address: 'Kukatpally, Hyderabad',
    location: locations.kukatpally,
    capacity: 800,
    available: 550,
    pricePerKgPerDay: 1.8,
    temperature: '0-5°C',
    contact: '9111222335',
  },
];

module.exports = {
  vendorUsers,
  businessUsers,
  generateVendorStock,
  generateOrders,
  coldStorages,
  locations,
};
