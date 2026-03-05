# 🏆 Codeforces Analyzer

A powerful web application to track, analyze, and visualize your Codeforces competitive programming performance. View your rating history, analyze problem-solving patterns, and export detailed reports.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Status](https://img.shields.io/badge/status-active-success)

## ✨ Features

### 📊 Analytics & Visualization
- **Rating History** - See your contest-by-contest rating progression
- **Performance Charts** - Bar charts showing problems solved by rating
- **Topic Breakdown** - Pie charts displaying problem distribution by tags
- **Statistical Summary** - Total problems solved, unique topics, rating range

### 📋 Problem Analysis
- **Scrollable Problem List** - View all solved problems with ratings and tags
- **Smart Filtering** - Search by problem name, rating, or tags
- **Color-Coded Ratings** - Visual difficulty indicators (same as Codeforces)
- **Live Links** - Click any problem to open it on Codeforces

### 📥 Export Options
- **PDF Export** - Professional PDF with problems sorted by rating
- **Excel Export** - Formatted spreadsheet with auto-filters and styling
- **Date Range Selection** - Analyze specific time periods

### 🎨 User Experience
- **Dark Theme** - Eye-friendly interface matching Codeforces style
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-Time Sync** - Auto-sync with Codeforces API
- **Smooth Navigation** - Intuitive single-page application

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone & Setup**
```bash
unzip codeforces_analyzer_FIXED.zip
cd codeforces_analyzer-fixed
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Configure Environment**

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/codeforces_analyzer
PORT=5000
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env.local`:
```env
VITE_API_BASE=http://localhost:5000/api
```

5. **Run Application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open Browser**
```
http://localhost:5173
```

## 📖 Usage

### 1. Enter Your Handle
- Go to home page
- Enter your Codeforces username (e.g., "tourist", "Petr")
- Click "Analyze"

### 2. View Rating History
- See all your contest participations
- Check rating changes and rank progressions
- Analyze contest-by-contest performance

### 3. Analyze Problems
- Select a date range on the right sidebar
- Click "Analyze" to view problems from that period
- See charts and statistics
- Filter problems by name, rating, or tags

### 4. Download Reports
- Click "📥 Download as PDF" for professional report
- Click "📊 Download as Excel" for spreadsheet data
- Data includes problem links, ratings, and tags

## 🏗️ Project Structure

```
codeforces_analyzer/
├── backend/
│   ├── Models/
│   │   ├── Firstsolve.js        # Problem submission schema
│   │   ├── Userhandle.js        # User rating history schema
│   │   └── Users.js             # User data schema
│   ├── Routes/
│   │   ├── api.js               # Main API endpoints
│   │   ├── export.js            # Excel export handler
│   │   └── pdf-export.js        # PDF export handler
│   ├── index.js                 # Express server setup
│   ├── ratings.js               # Codeforces rating API handler
│   ├── Submission.js            # Problem sync handler
│   ├── package.json
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Ratings.jsx      # Rating history page
│   │   │   └── Analysis.jsx     # Analysis & charts page
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local               # Environment variables
│
└── README.md                    # This file
```

## 🔌 API Endpoints

### POST /api/sync
Sync user's rating and problem history
```bash
curl -X POST http://localhost:5000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"handle":"tourist"}'
```

### GET /api/ratings/:handle
Get user's rating history
```bash
curl http://localhost:5000/api/ratings/tourist
```

### GET /api/analysis/:handle?from=X&to=Y
Get problem analysis for date range (Unix timestamps)
```bash
curl "http://localhost:5000/api/analysis/tourist?from=1609459200&to=1735689600"
```

### GET /api/export/:handle?from=X&to=Y
Download Excel file with problems
```bash
curl "http://localhost:5000/api/export/tourist?from=X&to=Y" -o problems.xlsx
```

### GET /api/export-pdf/:handle?from=X&to=Y
Download PDF with problems
```bash
curl "http://localhost:5000/api/export-pdf/tourist?from=X&to=Y" -o problems.pdf
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool
- **React Router** - Navigation
- **SVG Charts** - Custom data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **PDFKit** - PDF generation
- **ExcelJS** - Excel generation

### Database
- **MongoDB** - NoSQL database
- **MongoDB Atlas** - Cloud hosting (optional)

## 📊 Data Models

### User
```javascript
{
  handle: String,
  lastsyncedsubmissionid: Number,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Rating History
```javascript
{
  handle: String,
  contestId: String,
  contestName: String,
  oldRating: Number,
  newRating: Number,
  ratingChange: Number,
  rank: Number,
  user_newrank: String,
  user_oldrank: String,
  Contestdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Problem Submission
```javascript
{
  handle: String,
  problemkey: String,
  first_solved_time: Number,
  rating: Number,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Codeforces Rank Colors

The application uses authentic Codeforces rank colors:

| Rank | Color |
|------|-------|
| Newbie | Gray |
| Pupil | Green |
| Specialist | Cyan |
| Expert | Light Blue |
| Candidate Master | Purple |
| Master | Orange |
| International Master | Dark Orange |
| GrandMaster | Red |

## 🌐 Deployment

### Deploy to Vercel (Free)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Deploy to Vercel"
git push
```

2. **Deploy Backend**
- Connect GitHub repo to Vercel
- Set root directory to `backend/`
- Add MongoDB Atlas connection string
- Deploy

3. **Deploy Frontend**
- Connect GitHub repo to Vercel
- Set root directory to `frontend/`
- Add backend API URL
- Deploy

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Environment Variables

### Backend `.env`
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codeforces_analyzer
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend `.env.local`
```env
VITE_API_BASE=http://localhost:5000/api
```

## 📈 Performance

- **Fast Loading** - Optimized React with Vite
- **Efficient Queries** - Indexed MongoDB collections
- **Responsive UI** - Works on all screen sizes
- **Real-time Sync** - Quick Codeforces API integration

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure backend is running on port 5000
- Check `VITE_API_BASE` in frontend `.env.local`
- Verify MongoDB connection

### "Invalid handle"
- Use valid Codeforces username
- Examples: tourist, Petr, Um_nik
- Usernames are case-sensitive

### "MongoDB connection failed"
- Verify `MONGO_URI` is correct
- Check MongoDB is running locally or Atlas is accessible
- Ensure connection string includes database name

### Charts not showing
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Ensure you have data synced

## 📝 Features in Development

- [ ] Custom date range presets
- [ ] Contest difficulty trends
- [ ] Problem recommendation engine
- [ ] User comparison tool
- [ ] Performance statistics

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License - Feel free to use this project!

## 👨‍💻 Author

Created for competitive programmers who want to analyze their Codeforces journey.

## 🎯 Use Cases

- **Track Progress** - See your rating growth over time
- **Identify Weak Areas** - Analyze problems by topic
- **Prepare for Contests** - Study problems in your rating range
- **Share Results** - Export reports in PDF/Excel format
- **Career Building** - Document your CP journey

## 🔗 Resources

- [Codeforces](https://codeforces.com) - Competitive programming platform
- [Codeforces API](https://codeforces.com/apiHelp) - Official API documentation
- [MongoDB](https://mongodb.com) - Database documentation
- [React](https://react.dev) - Frontend framework docs

## 💡 Tips

- **Sync Regularly** - Keep your data updated
- **Filter Smartly** - Use search to find specific problems
- **Export Data** - Download reports for offline viewing
- **Check Trends** - Analyze your rating progression
- **Study Tags** - See which topics you struggle with

## ⭐ Features You'll Love

✨ **Beautiful UI** - Modern dark theme
⚡ **Fast Performance** - Instant data loading
📱 **Mobile Friendly** - Works on all devices
🎯 **Accurate Data** - Real Codeforces integration
📊 **Rich Analytics** - Charts and statistics
📥 **Easy Export** - PDF and Excel downloads
🔄 **Auto Sync** - Keep data current
🎨 **Color Coded** - Same colors as Codeforces

## 🚀 Getting Started

The fastest way to get started:

1. Download the fixed zip file
2. Run `npm install` in both folders
3. Configure `.env` files
4. Run both servers
5. Open browser and start analyzing!

## 📞 Support

Having issues? 

1. Check the troubleshooting section
2. Review environment variables
3. Check browser console for errors
4. Ensure all dependencies are installed

## 🎉 Ready to Analyze?

Your Codeforces journey awaits! Download, setup, and start tracking your competitive programming progress today.

**Happy analyzing!** 🏆

---

**Version 1.0.0** - Last Updated: March 2026
