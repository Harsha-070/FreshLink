# FreshLink Pro 🥬

**Hyperlocal Fresh Produce Supply & Waste Reduction Platform**

A full-stack B2B platform connecting small retailers with fresh produce vendors, featuring real-time stock management, smart matching, and waste reduction through surplus redistribution.

## Features

### For Vendors
- **Stock Management** - Add, edit, and track inventory with images
- **Surplus Hub** - Mark near-expiry items as surplus with discounts
- **Order Management** - Accept and track orders in real-time
- **Analytics Dashboard** - Sales trends, waste metrics, and insights

### For Businesses
- **Quick Requirement Poster** - Find matching vendors instantly
- **Marketplace** - Browse fresh produce from multiple vendors
- **Smart Cart** - Multi-vendor ordering with single checkout
- **UPI Payments** - Integrated payment with QR codes

### Platform Features
- Real-time stock sync
- 50+ Hyderabad areas coverage
- Cold storage integration
- Instakart logistics integration
- Push notifications

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore / Local JSON (fallback)
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Harsha-070/FreshLink.git
cd freshlink-pro

# Install all dependencies
npm run install:all

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Demo Credentials

**Vendor Login:**
- Phone: `9876543210`
- Password: `password123`

**Business Login:**
- Phone: `9988776655`
- Password: `password123`

## Deployment

### Option 1: Render.com (Recommended)

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your GitHub repo
4. Render will auto-detect the `render.yaml` configuration
5. Deploy!

### Option 2: Docker

```bash
# Build the image
docker build -t freshlink-pro .

# Run the container
docker run -p 5000:5000 -e NODE_ENV=production freshlink-pro
```

### Option 3: Manual Deployment

```bash
# Build frontend
npm run build

# Start production server
npm run start
```

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key

# Optional: Firebase (for persistent storage)
# Place serviceAccountKey.json in backend/ folder
# Or set FIREBASE_SERVICE_ACCOUNT with JSON content
```

## Project Structure

```
freshlink-pro/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── store/         # Zustand stores
│   │   └── lib/           # Utilities & API
│   └── dist/              # Production build
├── backend/               # Express backend
│   ├── routes/            # API routes
│   ├── data/              # Database & seed data
│   └── config/            # Configuration
├── Dockerfile             # Docker configuration
├── render.yaml            # Render.com blueprint
└── vercel.json           # Vercel configuration
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/stock/all` | Get marketplace items |
| `POST /api/orders` | Create order |
| `GET /api/matching/find` | Find vendor matches |
| `GET /api/health` | Health check |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE for details

---

Built with ❤️ for reducing food waste and connecting local communities
