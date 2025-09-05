# BDS PRO - Crypto Trading & Investment Platform

A modern, full-stack crypto trading and investment platform built with Next.js, React, and Node.js.

## 🚀 Features

- **Multi-Frontend Architecture**: Next.js and React frontends
- **Secure Backend API**: Express.js with JWT authentication
- **Database Integration**: MySQL with Railway hosting
- **Referral System**: Multi-level referral tracking
- **Payment Processing**: Cryptocurrency deposit/withdrawal
- **Real-time Dashboard**: Investment tracking and analytics
- **Google OAuth**: Social authentication
- **Responsive Design**: Mobile-first approach

## 🏗️ Architecture

```
├── backend/           # Express.js API server
├── frontend/          # React frontend
├── app/              # Next.js frontend
├── components/       # Shared React components
└── lib/              # Shared utilities
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Passport.js** - OAuth strategies
- **CORS** - Cross-origin requests

### Database
- **MySQL** - Primary database
- **Railway** - Database hosting
- **Connection Pooling** - Performance optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL (or Railway MySQL)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bds-pro
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # React Frontend
   cd ../frontend
   npm install

   # Next.js Frontend
   cd ..
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp backend/env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp .env.example .env.local
   ```

4. **Configure Environment Variables**
   - Update `backend/.env` with your database credentials
   - Update `frontend/.env` with your API URL
   - Update `.env.local` with your API URL

5. **Run the application**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run migrate
   npm start

   # Terminal 2: React Frontend
   cd frontend
   npm start

   # Terminal 3: Next.js Frontend
   npm run dev
   ```

## 🌐 Deployment

### Railway (Backend)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Netlify (Frontend)
1. Connect your GitHub repository to Netlify
2. Set build commands and environment variables
3. Deploy automatically

## 📊 Environment Variables

### Backend (.env)
```env
# Database
MYSQLHOST=your-railway-host
MYSQLUSER=root
MYSQLPASSWORD=your-password
MYSQLDATABASE=your-database
MYSQLPORT=3306

# Server
PORT=5001
NODE_ENV=production

# JWT
JWT_SECRET=your-secret

# CORS
CORS_ORIGIN=https://your-netlify-app.netlify.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-railway-app.up.railway.app
```

### Next.js (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run migrate` - Run database migrations

### Frontend
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm run dev` - Start Next.js development server

## 📁 Project Structure

```
bds-pro/
├── backend/
│   ├── config/          # Database and auth config
│   ├── controllers/     # API controllers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── database/        # SQL schemas
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # React pages
│   │   └── services/    # API services
├── app/                 # Next.js pages
├── components/          # Shared components
└── lib/                 # Shared utilities
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

## 📈 Performance

- Database connection pooling
- Caching strategies
- Optimized queries
- CDN-ready static assets
- Lazy loading components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email team.bdspro@gmail.com or create an issue on GitHub.

---

**Built with ❤️ by the BDS PRO Team**