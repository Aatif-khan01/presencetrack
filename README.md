# 🎓 Presence Track - University Attendance Management System

A modern, intelligent attendance management system built with Next.js 14, TypeScript, and Firebase.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🔐 Smart Authentication
- Role-based access control (Students & Teachers)
- Firebase Authentication integration
- Secure session management

### 📍 Wi-Fi Based Room Access
- **IP-based access control** - Students can only access rooms from university Wi-Fi
- CIDR notation support for flexible network configuration
- Automatic IP validation and logging
- Teacher exemption from Wi-Fi restrictions

### 📊 Real-time Analytics
- Live attendance tracking
- Interactive dashboards for teachers
- Student attendance history
- Performance metrics and insights

### 🎨 Modern UI/UX
- Premium, professional design
- Dark mode support
- Responsive across all devices
- Smooth animations and transitions

### 🛡️ Security Features
- Server-side IP validation
- Environment-based configuration
- Secure middleware implementation
- Protected API routes

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel
- **State Management**: React Hooks

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aatif-khan01/Presence-Track.git
   cd Presence-Track
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase configuration and Wi-Fi settings.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aatif-khan01/Presence-Track)

### Manual Deployment

1. **Push to GitHub** (already done ✅)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import `Aatif-khan01/Presence-Track`

3. **Configure Environment Variables**
   
   Add these in Vercel project settings:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ALLOWED_IP_RANGES=192.168.29.0/24
   ALLOWED_LOCALHOST=true
   BYPASS_WIFI_CHECK=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

## 🔧 Configuration

### Wi-Fi Access Control

Configure allowed IP ranges in `.env.local`:

```env
# Single range
ALLOWED_IP_RANGES=192.168.29.0/24

# Multiple ranges (comma-separated)
ALLOWED_IP_RANGES=192.168.29.0/24,10.0.0.0/8,172.16.0.0/12

# Allow localhost for development
ALLOWED_LOCALHOST=true

# Bypass Wi-Fi check (DEVELOPMENT ONLY)
BYPASS_WIFI_CHECK=false
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Add your Vercel domain to authorized domains

## 📁 Project Structure

```
Presence-Track/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── student/             # Student pages
│   ├── teacher/             # Teacher pages
│   ├── room/                # Room pages
│   └── access-denied/       # Access denied page
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   └── dashboard/           # Dashboard components
├── lib/                     # Utility functions
│   ├── firebase.ts          # Firebase configuration
│   ├── ip-validator.ts      # IP validation utilities
│   └── utils.ts             # Helper functions
├── middleware.ts            # Next.js middleware (Wi-Fi control)
├── public/                  # Static assets
└── vercel.json             # Vercel configuration
```

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Run Production Build Locally
```bash
npm run start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | ❌ |
| `ALLOWED_IP_RANGES` | Allowed IP ranges (CIDR) | ✅ |
| `ALLOWED_LOCALHOST` | Allow localhost access | ❌ |
| `BYPASS_WIFI_CHECK` | Bypass Wi-Fi check (dev only) | ❌ |

## 🔒 Security

- ✅ Server-side IP validation
- ✅ Environment-based configuration
- ✅ Secure Firebase rules
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ HTTPS only in production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Aatif Khan**
- LinkedIn: [aatif-khan-390036273](https://www.linkedin.com/in/aatif-khan-390036273)
- GitHub: [@Aatif-khan01](https://github.com/Aatif-khan01)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

Made with ❤️ for educational institutions
