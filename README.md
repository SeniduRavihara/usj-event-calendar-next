# 🎓 USJ Event Calendar System

A modern, full-stack event management system for the University of Sri Jayewardenepura, built with Next.js 15, featuring role-based authentication, real-time event management, and a beautiful dark theme UI.

## 📋 **Technical Overview**

### **🏗️ Project Architecture**

**Framework & Runtime:**

- **Next.js 15.5.3** - React-based full-stack framework with App Router
- **React 18** - Frontend UI library with hooks and context API
- **TypeScript** - Type-safe JavaScript for better development experience
- **Node.js** - Server-side runtime environment

### **🎨 Frontend Technologies**

**UI & Styling:**

- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Modern icon library with consistent styling
- **Professional Light Theme** - Clean, university-appropriate design
- **Responsive Design** - Mobile-first approach with breakpoints

**State Management:**

- **React Context API** - Global authentication state management
- **useState/useEffect** - Local component state management
- **Custom Hooks** - Reusable authentication logic

**Routing & Navigation:**

- **Next.js App Router** - File-based routing system
- **Protected Routes** - Role-based access control with Suspense boundaries
- **Client-side Navigation** - Smooth page transitions

### **🔐 Authentication System**

**Authentication Methods:**

- **JWT (JSON Web Tokens)** - Stateless authentication
- **HTTP-Only Cookies** - Secure token storage
- **Password Hashing** - bcryptjs with salt rounds (10)
- **Role-Based Access Control (RBAC)** - Admin/Student roles

**Security Features:**

- **Token Expiration** - 7-day token lifetime
- **Secure Cookies** - HttpOnly, SameSite=Lax, Secure in production
- **Password Validation** - Strength requirements (8+ chars, mixed case, numbers)
- **Input Sanitization** - XSS protection
- **CSRF Protection** - SameSite cookie policy

**Authentication Flow:**

```
1. User Registration → Password Hashing → Database Storage
2. User Login → Credential Verification → JWT Generation → Cookie Setting
3. Protected Routes → Token Verification → Role-based Access
4. Logout → Cookie Clearing → State Reset
```

### **🗄️ Database & ORM**

**Database:**

- **SQLite** - Local development database
- **PostgreSQL** - Production database (Neon)
- **Database Migrations** - Version-controlled schema changes

**ORM - Prisma:**

- **Prisma Client** - Type-safe database access
- **Prisma Schema** - Database schema definition
- **Prisma Migrate** - Database migration management
- **Connection Pooling** - Efficient database connections

**Database Schema:**

```prisma
model User {
  id          Int      @id @default(autoincrement())
  name        String
  email       String   @unique
  password    String
  role        Role     @default(STUDENT)
  department  String?
  student_id  String?  @unique
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model Event {
  id                  Int      @id @default(autoincrement())
  title               String
  description         String
  date                String   // YYYY-MM-DD format
  time                String   // HH:MM format
  location            String
  departments         Json
  registration_needed Boolean  @default(false)
  registration_link   String?
  cover_color         String?
  created_by          Int
  creator             User     @relation(fields: [created_by], references: [id])
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
}
```

### **🔄 API Architecture**

**RESTful API Endpoints:**

- **Authentication Routes:**

  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current user
  - `PUT /api/auth/me` - Update user profile

- **Event Management Routes:**

  - `GET /api/events` - List all events
  - `POST /api/events` - Create new event (Admin only)
  - `GET /api/events/[id]` - Get single event
  - `PUT /api/events/[id]` - Update event (Admin only)
  - `DELETE /api/events/[id]` - Delete event (Admin only)

- **Analytics Routes:**
  - `GET /api/analytics/users` - User statistics (Admin only)

**API Features:**

- **Middleware Protection** - Route-level authentication
- **Error Handling** - Comprehensive error responses
- **Data Validation** - Input validation and sanitization
- **CORS Support** - Cross-origin resource sharing
- **Rate Limiting** - Built-in Next.js protection

### **🛡️ Security Implementation**

**Authentication Security:**

- **JWT Secret** - Environment-based secret key
- **Token Verification** - Server-side token validation
- **Password Security** - bcrypt hashing with salt
- **Session Management** - HTTP-only cookie storage

**Authorization:**

- **Role-based Access** - Admin vs Student permissions
- **Route Protection** - Middleware-based access control
- **API Security** - Protected endpoints with role checks

**Data Protection:**

- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Prisma ORM protection
- **XSS Prevention** - React's built-in escaping
- **CSRF Protection** - SameSite cookie policy

### **📱 User Interface Features**

**Dashboard Components:**

- **Event List View** - Paginated event display with search and filtering
- **Calendar View** - Month, Week, and Day views with timeline
- **Search & Filter** - Real-time event filtering by department
- **Statistics Cards** - Event counts and user metrics
- **Responsive Design** - Mobile-optimized layout

**Admin Features:**

- **Event Management** - Full CRUD operations with modal forms
- **User Management** - User profile updates and analytics
- **Department Filtering** - CS, SE, IS departments with proper mapping
- **Real-time Updates** - Dynamic data refresh
- **Analytics Dashboard** - User statistics and department breakdowns
- **Admin Profile Management** - Dedicated admin profile page

**User Features:**

- **Event Browsing** - Department-specific event filtering
- **Calendar Integration** - Interactive calendar with event popups
- **Profile Management** - User profile updates
- **Event Registration** - Registration links when required

**Authentication UI:**

- **Login/Register Forms** - Modern dark theme
- **Password Strength** - Real-time validation
- **Form Validation** - Client-side error handling
- **Loading States** - User feedback during operations
- **Department Selection** - Dropdown with all available departments

### **🔄 Data Flow**

**Authentication Flow:**

```
1. User submits credentials
2. Server validates and hashes password
3. JWT token generated and stored in HTTP-only cookie
4. Client receives user data and token
5. Protected routes check token validity
6. User actions require valid authentication
```

**Event Management Flow:**

```
1. Admin creates event → Database storage
2. Events fetched via API → Client display
3. Users view events → Filtered by department
4. Real-time updates → Automatic refresh
5. CRUD operations → Role-based permissions
```

### **🚀 Deployment & Environment**

**Environment Variables:**

- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection string
- `NODE_ENV` - Environment (development/production)

**Build Process:**

- **TypeScript Compilation** - Type checking and compilation
- **Tailwind CSS** - Utility class optimization
- **Static Generation** - Pre-rendered pages
- **Bundle Optimization** - Code splitting and minification

**Performance Features:**

- **Static Site Generation** - Pre-rendered pages
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Next.js built-in optimization
- **Caching** - HTTP caching strategies

### **📊 Technical Specifications**

**Dependencies:**

- **Core**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Lucide React
- **Database**: Prisma, SQLite/PostgreSQL
- **Authentication**: JWT, bcryptjs
- **Validation**: Built-in form validation

**File Structure:**

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (user)/            # User dashboard pages
│   │   ├── dashboard/     # User dashboard
│   │   └── profile/       # User profile
│   ├── admin/             # Admin dashboard
│   │   └── profile/       # Admin profile
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── events/        # Event management endpoints
│   │   └── analytics/     # Analytics endpoints
│   ├── calendar/          # Main calendar page
│   └── lib/               # Utility functions
├── components/            # React components
│   ├── AuthContext.tsx    # Authentication context
│   └── ProtectedRoute.tsx # Route protection
└── prisma/               # Database schema & migrations
```

**Database Migrations:**

- **Initial Migration** - User table creation
- **Event Migration** - Event table with relationships
- **Schema Evolution** - Version-controlled changes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- SQLite (development) or PostgreSQL (production)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd usj-event-calendar-next
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

4. **Set up the database**

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Features

### **User Features**

- ✅ User registration and authentication
- ✅ Profile management with department selection
- ✅ Event browsing and filtering by department
- ✅ Interactive calendar with month, week, and day views
- ✅ Event popup details on calendar click
- ✅ Department-specific event filtering (CS, SE, IS)
- ✅ Event registration links (when required)
- ✅ Professional light theme UI

### **Admin Features**

- ✅ Full event management (CRUD operations)
- ✅ User management and analytics
- ✅ Department-based event organization
- ✅ Real-time event updates
- ✅ Comprehensive event statistics and analytics
- ✅ User statistics by department
- ✅ Admin profile management
- ✅ Event creation with department selection
- ✅ Event editing with pre-filled forms
- ✅ Event deletion with confirmation

### **Calendar Features**

- ✅ **Month View** - Traditional calendar grid with event indicators
- ✅ **Week View** - Weekly timeline with event details
- ✅ **Day View** - Detailed daily timeline with hour-by-hour events
- ✅ **Current Time Indicator** - Red line showing current time in day view
- ✅ **Event Popups** - Click events to see full details
- ✅ **Navigation** - Easy month/week/day navigation
- ✅ **Responsive Design** - Works on all device sizes

### **Technical Features**

- ✅ Role-based access control
- ✅ JWT authentication with HTTP-only cookies
- ✅ Professional light theme UI design
- ✅ Type-safe development with TypeScript
- ✅ Database migrations with Prisma
- ✅ Modern dark theme UI
- ✅ Real-time data updates
- ✅ Responsive design with Tailwind CSS
- ✅ Suspense boundaries for better UX
- ✅ Form validation and error handling
- ✅ Loading states and user feedback

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Commands

```bash
npx prisma studio           # Open Prisma Studio
npx prisma migrate dev      # Run migrations
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema changes
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify** - Static site deployment
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment
- **AWS** - Cloud deployment

## 🎨 UI/UX Design

### **Design Philosophy**

- **Professional Academic Theme** - Clean, university-appropriate design
- **Light Theme** - Easy on the eyes with excellent contrast
- **Consistent Color Scheme** - Blue primary colors with gray accents
- **Accessible Design** - High contrast ratios and readable fonts

### **Color Palette**

- **Primary Blue**: `#2563eb` (blue-600)
- **Text Colors**: `#111827` (gray-900), `#6b7280` (gray-600)
- **Background**: `#f9fafb` (gray-50)
- **Cards**: `#ffffff` (white) with subtle borders
- **Accents**: `#10b981` (green-600), `#f59e0b` (orange-600)

### **Typography**

- **Headings**: Bold, dark gray for excellent readability
- **Body Text**: Medium gray for comfortable reading
- **Form Labels**: Dark gray for clear identification
- **Input Text**: Dark gray for perfect visibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email seniduravihara@gmail.com or create an issue in the repository.

---
