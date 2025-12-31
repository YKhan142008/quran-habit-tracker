# 📖 Quran Productivity Tracker

A beautiful, modern web application designed to help Muslims build consistent Quran reading habits through goal tracking, progress visualization, and motivational reminders.

> ⚠️ **Work in Progress**: This application is currently under active development. Features are being added and refined regularly.

## ✨ Features

### Current Features
- **📊 Visual Progress Tracking**: Beautiful progress bar showing your journey through the Quran
- **🎯 Flexible Goal Setting**: 
  - Daily Pages Goal: Set a target number of pages to read each day
  - Finish by Date Goal: Complete the Quran by a specific deadline with automatic daily page calculations
- **🔥 Streak Tracking**: Monitor your consistency with daily streak counters
- **📧 Email Reminders**: Receive encouraging notifications when you miss your goals, featuring authentic Hadiths
- **💾 Data Persistence**: All your progress is saved using SQLite database with Prisma ORM
- **🎨 Premium UI**: Modern, responsive design with smooth animations and glassmorphism effects

### In Development
- User authentication system
- Enhanced analytics and insights
- Mobile app version
- Social features for accountability partners

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YKhan142008/quran-habit-tracker.git
   cd quran-habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="file:./quran-prod.db"
   RESEND_API_KEY="your_resend_api_key_here"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **Styling**: Vanilla CSS with modern design patterns
- **Email**: [Resend](https://resend.com/) for notification delivery
- **API**: [Quran.com API](https://quran.com/) for Quran text and metadata

## 📁 Project Structure

```
quran-productivity/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions and helpers
│   └── styles/           # CSS stylesheets
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json
```

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue if you encounter any bugs or have feature requests.

## 📝 License

This project is open source and available under the MIT License.

## 🌟 Acknowledgments

- Quran text provided by [Quran.com API](https://quran.com/)
- Hadith collections for motivational reminders
- Inspired by the desire to make Quran reading a consistent daily habit

---

**Built with ❤️ to help Muslims strengthen their connection with the Quran**
