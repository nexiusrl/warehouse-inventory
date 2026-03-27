# Quick Start Guide

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- NextAuth.js
- Tailwind CSS
- TanStack Query & Table
- React Hook Form
- Zod validation
- shadcn/ui components
- And more...

## Step 2: Set Up Environment (Optional)

For production or to customize the auth secret:

```bash
# Copy the example env file
copy .env.example .env.local
```

Generate a secure secret:
```bash
# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use any random string generator
```

## Step 3: Run Development Server

```bash
npm run dev
```

The app will start at: http://localhost:3000

## Step 4: Create Your First Account

1. You'll be redirected to the login page
2. Click "Sign up" link
3. Enter your details:
   - Name: Your name
   - Email: Any email (e.g., test@example.com)
   - Password: Min 6 characters
4. Click "Create Account"
5. You'll be automatically logged in

## Step 5: Explore the Features

### Dashboard
- View total SKUs, stock quantity, and status overview
- See recent stock adjustments
- Monitor low stock alerts

### Add Products
1. Click "Add Product" in the sidebar
2. Fill in product details:
   - Product Name (e.g., "Wireless Mouse")
   - SKU (e.g., "WM-001")
   - Category (e.g., "Electronics")
   - Initial Stock Level
3. Click "Create Product"

### Manage Stock
1. Click on any product in the Products page
2. Use the "Adjust Stock" controls:
   - Enter quantity
   - Click "Add Stock" (green) to increment
   - Click "Remove Stock" (red) to decrement
3. View transaction history in Activity page

### Search & Filter
- Use the search bar to find products by name, SKU, or category
- Filter products by category using the dropdown
- Navigate through pages with pagination

## Features Checklist (PRD Requirements)

✅ **Authentication & Authorization**
- Signup with email/password
- Login with session persistence
- Protected routes (middleware)

✅ **Dashboard (Home Page)**
- Total SKUs and stock quantity metrics
- Stock status cards (In Stock, Low Stock, Out of Stock)
- Recent activity feed (last 5 adjustments)

✅ **Product Management**
- Create products with validation
- Duplicate SKU prevention
- Searchable product registry
- Category filtering

✅ **Stock Control**
- Increment/decrement stock levels
- Transaction logging with timestamps
- Full audit trail in Activity page

✅ **Technical Requirements**
- TypeScript for type safety
- Responsive design (desktop/tablet)
- Loading states and error handling
- Dark/Light theme toggle

## Important Notes

⚠️ **Data Persistence**: This is a frontend prototype with in-memory storage. Data will reset when the server restarts. For production, connect the API routes to a database.

⚠️ **Security**: The default secret key is for development only. Generate a new one for production.

## Troubleshooting

**Port 3000 already in use?**
```bash
# Run on different port
npm run dev -- -p 3001
```

**Build errors?**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Next Steps

1. **Add more products** to test the inventory system
2. **Test stock adjustments** to see the audit trail
3. **Try the theme toggle** (top right of login/signup, bottom of sidebar)
4. **Explore responsive design** by resizing your browser

## Production Build

When ready for production:

```bash
npm run build
npm start
```

The app will run in optimized production mode.
