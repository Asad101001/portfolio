# 🌟 Muhammad Asad Khan - Personal Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://asad101001.github.io/portfolio/)

> A modern, responsive portfolio website showcasing my journey as a Computer Science student.



## ✨ Features

- 🎨 **Modern UI/UX** - Clean, professional design with smooth animations
- 🌓 **Dark/Light Mode** - Toggle between themes
- 📱 **Fully Responsive** - Optimized for all devices
- ⚡ **Fast Performance** - Built with React for optimal speed
- 🎯 **Interactive Elements** - Engaging hover effects and transitions
- 📊 **Project Showcase** - Highlighted GitHub repositories
- 🎓 **Certifications Display** - Modal popup for detailed credentials
- 📄 **Downloadable CV** - One-click resume download

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.2.0** - JavaScript library for building user interfaces
- **React DOM 18.2.0** - React package for working with the DOM

### Styling & Design
- **Lucide React 0.263.1** - Beautiful, consistent icon library
- **DevIcons** - Official technology/language icons (via CDN)
- **Custom CSS** - Tailored animations and responsive design

### Development Tools
- **Create React App** - Toolchain for React development
- **React Scripts 5.0.1** - Configuration and scripts for CRA

### Deployment
- **GitHub Pages** - Free hosting via `gh-pages` package
- **Git** - Version control

## 🎨 Design Features

### Color Palette
- **Dark Mode**: Deep navy (`#0d1117`) with vibrant accents
- **Light Mode**: Soft white (`#f8fafc`) with subtle shadows
- **Accent Colors**: Purple (`#8b5cf6`), Blue (`#3b82f6`), Cyan

### Animations
- Smooth scroll behavior
- Fade-in sections on scroll (Intersection Observer API)
- Floating particle background
- Wave SVG animations
- Hover scale and lift effects
- Auto-hiding navbar on scroll down

### Components
1. **Hero Section** - Profile image, name, tagline, CTA buttons
2. **About Section** - Education, focus areas (Dev, Data Science, Networking)
3. **Skills Section** - Icon grid with 15+ technologies
4. **Projects Section** - Featured GitHub repositories
5. **Certifications Modal** - Hover-triggered detailed view
6. **Social Links** - Connect on various platforms

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/Asad101001/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Project Structure
```
portfolio/
├── public/
│   ├── index.html          # HTML template
│   ├── profile.jpg         # Profile photo
│   ├── certification.jpg   # Certificate image
│   └── resume.pdf         # CV/Resume file
├── src/
│   ├── App.js             # Main React component
│   └── index.js           # Entry point
├── package.json           # Dependencies & scripts
└── README.md             # This file
```

## 🚀 Deployment

This portfolio is deployed using GitHub Pages:

1. **Build the project:**
```bash
   npm run build
```

2. **Deploy to GitHub Pages:**
```bash
   npm run deploy
```

3. **Access your site:**
```
   https://Asad101001.github.io/portfolio/
```

### Custom Domain (Optional)
To use a custom domain:
1. Add `CNAME` file in `public/` folder with your domain
2. Configure DNS A records to GitHub's IPs
3. Enable HTTPS in repository settings

## 📸 Adding Your Assets

### Profile Picture
- Place your photo as `public/profile.jpg`
- Recommended size: 400x400px
- Format: JPG or PNG

### Certificate
- Add certificate image as `public/certification.jpg`
- Displays in hover modal
- Format: JPG or PNG

### Resume/CV
- Add your CV as `public/resume.pdf`
- Accessible via "Download CV" button
- Format: PDF

## 🎯 Customization

### Updating Personal Info
Edit `src/App.js`:
- Lines 20-35: Personal details, skills, projects
- Lines 37-54: Certifications
- Lines 56-63: Social media links

### Changing Colors
Modify color variables (Lines 365-373):
```javascript
const bgColor = darkMode ? '#0d1117' : '#f8fafc';
const accentColor = darkMode ? '#58a6ff' : '#3b82f6';
// ... etc
```

### Adding Projects
Update `projects` array with:
```javascript
{
  title: "Project Name",
  description: "Brief description",
  tech: ["Tech1", "Tech2"],
  github: "https://github.com/username/repo",
  emoji: "🚀"
}
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **DevIcons** - Technology icons ([devicon.dev](https://devicon.dev))
- **Lucide** - Icon library ([lucide.dev](https://lucide.dev))
- **React** - UI library ([react.dev](https://react.dev))
- **GitHub Pages** - Free hosting ([pages.github.com](https://pages.github.com))

## 🔮 Future Enhancements

- [ ] Blog section
- [ ] Contact form with backend
- [ ] More project showcases
- [ ] Testimonials section
- [ ] Analytics integration

---
