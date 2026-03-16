-- ============================================
-- FreshLink Pro - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS / PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text,
  phone text,
  role text not null check (role in ('vendor', 'business')),
  business_type text,
  address text,
  lat double precision default 17.3850,
  lng double precision default 78.4867,
  rating double precision default 4.0,
  total_orders integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 2. PRODUCE CATALOG (South Indian prices)
create table public.produce (
  id text primary key,
  name text not null,
  local_name text,
  category text not null,
  price_per_kg integer not null,
  unit text default 'kg',
  image text,
  seasonal boolean default false,
  shelf_life integer default 5
);

alter table public.produce enable row level security;
create policy "Produce is viewable by everyone" on public.produce for select using (true);

-- 3. VENDOR STOCK
create table public.stock (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.profiles(id) on delete cascade not null,
  produce_id text references public.produce(id),
  name text not null,
  local_name text,
  category text,
  quantity integer not null,
  price_per_kg integer not null,
  unit text default 'kg',
  image text,
  status text default 'In Stock',
  expiry_date date,
  is_surplus boolean default false,
  discount_price integer,
  listed_at timestamp with time zone default now()
);

alter table public.stock enable row level security;

create policy "Stock is viewable by everyone"
  on public.stock for select using (true);

create policy "Vendors can insert their own stock"
  on public.stock for insert with check (auth.uid() = vendor_id);

create policy "Vendors can update their own stock"
  on public.stock for update using (auth.uid() = vendor_id);

create policy "Vendors can delete their own stock"
  on public.stock for delete using (auth.uid() = vendor_id);

-- 4. ORDERS
create table public.orders (
  id text primary key,
  vendor_id uuid references public.profiles(id) not null,
  business_id uuid references public.profiles(id) not null,
  items jsonb not null,
  total integer not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'processing', 'in_transit', 'delivered', 'cancelled')),
  delivery_address text,
  estimated_delivery text,
  created_at timestamp with time zone default now(),
  delivered_at timestamp with time zone
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select using (
    auth.uid() = vendor_id or auth.uid() = business_id
  );

create policy "Business users can create orders"
  on public.orders for insert with check (auth.uid() = business_id);

create policy "Order participants can update orders"
  on public.orders for update using (
    auth.uid() = vendor_id or auth.uid() = business_id
  );

-- 5. REQUIREMENTS
create table public.requirements (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.profiles(id) on delete cascade not null,
  items jsonb not null,
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high')),
  status text default 'open' check (status in ('open', 'partially_fulfilled', 'fulfilled')),
  needed_by date,
  meal_type text,
  created_at timestamp with time zone default now()
);

alter table public.requirements enable row level security;

create policy "Business users can view their own requirements"
  on public.requirements for select using (auth.uid() = business_id);

create policy "Business users can create requirements"
  on public.requirements for insert with check (auth.uid() = business_id);

create policy "Business users can update their own requirements"
  on public.requirements for update using (auth.uid() = business_id);

create policy "Business users can delete their own requirements"
  on public.requirements for delete using (auth.uid() = business_id);

-- 6. COLD STORAGE FACILITIES
create table public.cold_storage (
  id text primary key,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  capacity integer,
  available integer,
  price_per_kg_per_day numeric(5,2),
  temperature text,
  contact text
);

alter table public.cold_storage enable row level security;
create policy "Cold storage viewable by everyone" on public.cold_storage for select using (true);

-- 7. SURPLUS COLD STORAGE REQUESTS
create table public.surplus_requests (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.profiles(id) on delete cascade not null,
  stock_id uuid references public.stock(id),
  cold_storage_id text references public.cold_storage(id),
  quantity integer not null,
  pickup_time text,
  return_time text,
  status text default 'scheduled',
  created_at timestamp with time zone default now()
);

alter table public.surplus_requests enable row level security;

create policy "Vendors can view their surplus requests"
  on public.surplus_requests for select using (auth.uid() = vendor_id);

create policy "Vendors can create surplus requests"
  on public.surplus_requests for insert with check (auth.uid() = vendor_id);

-- ============================================
-- SEED DATA: South Indian Produce Catalog
-- ============================================

insert into public.produce (id, name, local_name, category, price_per_kg, unit, image, seasonal, shelf_life) values
  ('v1', 'Tomato', 'Thakkali', 'Vegetables', 28, 'kg', 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300', false, 5),
  ('v2', 'Onion', 'Vengayam', 'Vegetables', 35, 'kg', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300', false, 15),
  ('v3', 'Potato', 'Urulaikizhangu', 'Vegetables', 30, 'kg', 'https://images.unsplash.com/photo-1518977676601-b53f82ber40c?w=300', false, 20),
  ('v4', 'Brinjal', 'Kathirikai', 'Vegetables', 36, 'kg', 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=300', false, 4),
  ('v5', 'Lady Finger (Okra)', 'Vendakkai', 'Vegetables', 42, 'kg', 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=300', false, 3),
  ('v6', 'Drumstick', 'Murungakkai', 'Vegetables', 55, 'kg', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300', true, 5),
  ('v7', 'Snake Gourd', 'Pudalangai', 'Vegetables', 30, 'kg', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300', true, 4),
  ('v8', 'Bottle Gourd', 'Sorakkai', 'Vegetables', 25, 'kg', 'https://images.unsplash.com/photo-1563288527-8cae78607bc3?w=300', false, 5),
  ('v9', 'Ridge Gourd', 'Peerkangai', 'Vegetables', 35, 'kg', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300', true, 3),
  ('v10', 'Bitter Gourd', 'Paavakai', 'Vegetables', 45, 'kg', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300', false, 4),
  ('v11', 'Carrot', 'Carrot', 'Vegetables', 40, 'kg', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300', false, 10),
  ('v12', 'French Beans', 'Beans', 'Vegetables', 48, 'kg', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae9b8a6?w=300', false, 3),
  ('v13', 'Cabbage', 'Muttaikose', 'Vegetables', 20, 'kg', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300', false, 7),
  ('v14', 'Cauliflower', 'Pookkose', 'Vegetables', 32, 'kg', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300', false, 5),
  ('v15', 'Green Chilli', 'Pachai Milagai', 'Vegetables', 60, 'kg', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300', false, 5),
  ('v16', 'Capsicum', 'Kudai Milagai', 'Vegetables', 50, 'kg', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300', false, 5),
  ('v17', 'Spinach', 'Keerai', 'Leafy Greens', 25, 'bunch', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300', false, 2),
  ('v18', 'Curry Leaves', 'Kariveppilai', 'Leafy Greens', 15, 'bunch', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300', false, 3),
  ('v19', 'Coriander', 'Kothamalli', 'Leafy Greens', 20, 'bunch', 'https://images.unsplash.com/photo-1592928302636-c83cf1e1c785?w=300', false, 2),
  ('v20', 'Mint', 'Pudina', 'Leafy Greens', 20, 'bunch', 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=300', false, 2),
  ('v21', 'Ginger', 'Inji', 'Vegetables', 100, 'kg', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300', false, 20),
  ('v22', 'Garlic', 'Poondu', 'Vegetables', 160, 'kg', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2e85?w=300', false, 30),
  ('v23', 'Coconut', 'Thengai', 'Vegetables', 30, 'piece', 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=300', false, 15),
  ('v24', 'Ash Gourd', 'Poosanikai', 'Vegetables', 18, 'kg', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300', true, 10),
  ('v25', 'Raw Banana', 'Vaazhaikai', 'Vegetables', 38, 'kg', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300', false, 5),
  ('v26', 'Beetroot', 'Beetroot', 'Vegetables', 30, 'kg', 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=300', false, 10),
  ('v27', 'Radish', 'Mullangi', 'Vegetables', 25, 'kg', 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=300', false, 7),
  ('v28', 'Sweet Potato', 'Sakkara Valli', 'Vegetables', 35, 'kg', 'https://images.unsplash.com/photo-1596097635121-14b63a7ffa7b?w=300', false, 15),
  ('v29', 'Cluster Beans', 'Kothavarangai', 'Vegetables', 55, 'kg', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae9b8a6?w=300', true, 3),
  ('v30', 'Broad Beans', 'Avarakkai', 'Vegetables', 45, 'kg', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae9b8a6?w=300', true, 3),
  ('f1', 'Banana', 'Vazhaipazham', 'Fruits', 50, 'dozen', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', false, 5),
  ('f2', 'Mango (Banganapalli)', 'Maambazham', 'Fruits', 120, 'kg', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300', true, 5),
  ('f3', 'Papaya', 'Pappali', 'Fruits', 30, 'kg', 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=300', false, 4),
  ('f4', 'Guava', 'Koyyapazham', 'Fruits', 50, 'kg', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=300', false, 4),
  ('f5', 'Pomegranate', 'Mathulai', 'Fruits', 140, 'kg', 'https://images.unsplash.com/photo-1541344999736-4a599a80182f?w=300', false, 10),
  ('f6', 'Watermelon', 'Thannir Pazham', 'Fruits', 18, 'kg', 'https://images.unsplash.com/photo-1589984662742-a04d20d05044?w=300', true, 7),
  ('f7', 'Muskmelon', 'Mulam Pazham', 'Fruits', 32, 'kg', 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=300', true, 5),
  ('f8', 'Sapota (Chikoo)', 'Sapota', 'Fruits', 65, 'kg', 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=300', false, 4),
  ('f9', 'Grapes', 'Thiratchai', 'Fruits', 80, 'kg', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300', true, 5),
  ('f10', 'Orange (Nagpur)', 'Orange', 'Fruits', 60, 'kg', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300', true, 10),
  ('f11', 'Lemon', 'Elumichai', 'Fruits', 80, 'kg', 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300', false, 10),
  ('f12', 'Pineapple', 'Annasi', 'Fruits', 40, 'piece', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300', false, 5),
  ('f13', 'Jackfruit', 'Palappazham', 'Fruits', 40, 'kg', 'https://images.unsplash.com/photo-1528825871115-3581a5e31985?w=300', true, 3),
  ('f14', 'Custard Apple', 'Seetha Pazham', 'Fruits', 100, 'kg', 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=300', true, 3),
  ('f15', 'Fig', 'Athipazham', 'Fruits', 150, 'kg', 'https://images.unsplash.com/photo-1601379760883-1bb497c558ea?w=300', true, 3),
  ('f16', 'Sweet Lime (Mosambi)', 'Sathukudi', 'Fruits', 55, 'kg', 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300', false, 8),
  ('f17', 'Coconut Tender', 'Ilaneer', 'Fruits', 35, 'piece', 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=300', false, 5),
  ('f18', 'Dragon Fruit', 'Dragon Fruit', 'Exotic', 180, 'kg', 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=300', true, 5),
  ('f19', 'Avocado', 'Avocado', 'Exotic', 200, 'kg', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300', true, 5),
  ('f20', 'Passion Fruit', 'Passion Fruit', 'Exotic', 220, 'kg', 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=300', true, 4);

-- SEED: Cold Storage Facilities
insert into public.cold_storage (id, name, address, lat, lng, capacity, available, price_per_kg_per_day, temperature, contact) values
  ('cs-1', 'Hyderabad Cold Chain Hub', 'Miyapur Industrial Area, Hyderabad', 17.4969, 78.3548, 500, 320, 2.00, '2-8°C', '9111222333'),
  ('cs-2', 'Fresh Store LB Nagar', 'LB Nagar Main Road, Hyderabad', 17.3457, 78.5522, 300, 180, 2.50, '2-6°C', '9111222334'),
  ('cs-3', 'Agri Cold Solutions', 'Kukatpally, Hyderabad', 17.4849, 78.3883, 800, 550, 1.80, '0-5°C', '9111222335');

-- ============================================
-- HELPER FUNCTION: Distance calculation (km)
-- ============================================
create or replace function public.distance_km(lat1 float, lng1 float, lat2 float, lng2 float)
returns float as $$
  select 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) *
    cos(radians(lng2) - radians(lng1)) +
    sin(radians(lat1)) * sin(radians(lat2))
  );
$$ language sql immutable;

-- ============================================
-- VIEW: Nearby vendor stock (for matching)
-- ============================================
create or replace view public.stock_with_vendor as
select
  s.*,
  p.name as vendor_name,
  p.rating as vendor_rating,
  p.address as vendor_address,
  p.lat as vendor_lat,
  p.lng as vendor_lng
from public.stock s
join public.profiles p on s.vendor_id = p.id
where p.role = 'vendor';
