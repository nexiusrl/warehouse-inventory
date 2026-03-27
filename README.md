# Warehouse Inventory System

A modern, full-featured warehouse inventory management application built with Next.js 15 and MySQL.

## Features

- **Authentication**: Secure email/password login with NextAuth.js and bcrypt
- **Dashboard**: Real-time inventory metrics and stock status overview
- **Product Management**: Create, view, and manage products with unique SKUs
- **Stock Control**: Increment/decrement stock levels with full audit trail
- **Activity Log**: Complete history of all stock adjustments
- **Responsive Design**: Works on desktop and tablet devices
- **Dark/Light Mode**: Toggle between themes based on preference
- **MySQL Database**: Persistent storage with raw SQL queries

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Database**: MySQL/MariaDB (Laragon)
- **Database Driver**: mysql2 with connection pooling
- **Authentication**: NextAuth.js with JWT
- **API**: Next.js API Routes
- **Security**: bcrypt password hashing, CSRF protection

## Quick Start

### Prerequisites

- Node.js 18+
- **Laragon** installed - [Download](https://laragon.org)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Laragon Database

1. **Start Laragon** → Click "Start All"
2. **No need to create database** - it will be created automatically

### 3. Set Up Environment

```bash
# Copy environment example
copy .env.example .env.local
```

Edit `.env.local` with your Laragon credentials:

```env
# Database Configuration
DATABASE_HOSTNAME=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=          # Leave empty for default Laragon
DATABASE_NAME=warehouse_inventory

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Common Laragon Settings:**
- No password (default): `DATABASE_PASSWORD=`
- With password: `DATABASE_PASSWORD=your_password`
- Custom port: Change `DATABASE_PORT` (e.g., 3307)

### 4. Initialize Database

```bash
# Create database and tables
npm run db:init

# Optional: Seed with demo data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials (after seeding)

- **Email**: demo@warehouse.com
- **Password**: password123

## Project Structure

```
warehouse-inventory/
├── scripts/
│   ├── db-init.js          # Database initialization
│   └── db-seed.js          # Demo data seeding
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login/Signup pages
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Entry point
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth-provider.tsx
│   │   ├── query-provider.tsx
│   │   └── theme-toggle.tsx
│   └── lib/
│       ├── db.ts           # MySQL connection pool
│       ├── types.ts        # TypeScript types
│       ├── validation.ts   # Zod schemas
│       └── utils.ts        # Utilities
├── .env.example            # Environment template
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Database Schema

### User
- `id` (VARCHAR/UUID) - Primary key
- `email` (VARCHAR) - Unique, indexed
- `name` (VARCHAR) - Optional
- `password` (VARCHAR) - Bcrypt hashed
- `createdAt`, `updatedAt` (DATETIME)

### Product
- `id` (VARCHAR/UUID) - Primary key
- `sku` (VARCHAR) - Unique per user
- `name` (VARCHAR) - Required
- `category` (VARCHAR)
- `description` (TEXT) - Optional
- `quantity` (INT) - Min: 0
- `userId` (VARCHAR) - Foreign key to User
- `createdAt`, `updatedAt` (DATETIME)

### StockAdjustment
- `id` (VARCHAR/UUID) - Primary key
- `productId` (VARCHAR) - Foreign key
- `userId` (VARCHAR) - Foreign key
- `type` (ENUM) - ADD or REMOVE
- `quantity` (INT)
- `previousQuantity` (INT)
- `newQuantity` (INT)
- `timestamp` (DATETIME)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/[...nextauth]` | Login/Logout/Session |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product details |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/adjust` | Adjust stock |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | Inventory metrics |
| GET | `/api/activity` | Stock adjustment history |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:init` | Initialize database (create tables) |
| `npm run db:seed` | Seed database with demo data |

## Usage Guide

### Creating an Account

1. Navigate to the signup page
2. Enter your name, email, and password (min 6 characters)
3. You'll be automatically logged in

### Managing Products

1. **Add Product**: Click "Add Product" in the sidebar
2. **View Products**: Browse all products with search and filter
3. **Adjust Stock**: Click a product to view and adjust stock levels

### Stock Adjustments

- **Add Stock**: Enter quantity and click "Add Stock" (green)
- **Remove Stock**: Enter quantity and click "Remove Stock" (red)
- All adjustments are logged with timestamps

## Security Features

1. **Password Hashing** - bcrypt with salt rounds
2. **SQL Injection Prevention** - Parameterized queries with mysql2
3. **CSRF Protection** - NextAuth.js built-in
4. **Session Management** - JWT with secure cookies
5. **User Isolation** - All queries scoped to user ID
6. **Input Validation** - Zod schemas on all inputs
7. **Transaction Support** - Stock adjustments use database transactions

## Database Management

### View Database

**Using phpMyAdmin:**
1. Open Laragon menu → Database → phpMyAdmin
2. Select `warehouse_inventory` database
3. Browse tables: User, Product, StockAdjustment

**Using HeidiSQL:**
1. Open Laragon menu → Database → HeidiSQL
2. Connect to localhost
3. Select `warehouse_inventory` database

### Reset Database

```bash
# Drop and recreate all tables
npm run db:init

# Re-seed demo data
npm run db:seed
```

### Backup Database

**Using phpMyAdmin:**
1. Select `warehouse_inventory` database
2. Click **Export** → **Go**
3. Save `.sql` file

**Using Command Line:**
```bash
cd C:\laragon\bin\mysql\mysql-8.0.x\bin
mysqldump -u root warehouse_inventory > backup.sql
```

## Documentation

- [mysql2 Docs](https://github.com/sidorares/node-mysql2)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Next.js Docs](https://nextjs.org/docs)

## AI Credits

This project was developed with the assistance of AI tools:

- **[Qwen Code](https://github.com/QwenLM/qwen-code)** - Primary development assistant for code generation, project scaffolding, and implementation
- **Gemini** - Product Requirements Document (PRD) creation and planning

The PRD (`PRD.md`) was created using Gemini to define project scope, features, and requirements.

## Production Deployment

### Environment Variables

Set these in your hosting platform:

```env
DATABASE_HOSTNAME=mysql-host.example.com
DATABASE_PORT=3306
DATABASE_USERNAME=prod_user
DATABASE_PASSWORD=strong-password
DATABASE_NAME=warehouse_inventory
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Build and Deploy

```bash
npm run build
npm start
```

Initialize database on first deploy:
```bash
npm run db:init
npm run db:seed
```

## Troubleshooting

### Database Connection Issues

1. Verify Laragon MySQL is running (green status)
2. Check `.env.local` credentials
3. Try restarting MySQL in Laragon

### "Access denied" Error

- Check `DATABASE_PASSWORD` in `.env.local`
- If no password, ensure `DATABASE_PASSWORD=` (empty)

### "Table doesn't exist"

Run database initialization:
```bash
npm run db:init
```

## License

MIT
