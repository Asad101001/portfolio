import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, BookOpen, Instagram, Music, ChevronDown, Code, Brain, Cloud, Award, Sun, Moon, X } from 'lucide-react';

export default function Portfolio() {
  const [darkMode, setDarkMode] = useState(true);
  const [showCertifications, setShowCertifications] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavVisible(false);
        setShowCertifications(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // TO ADD YOUR IMAGES: 
  // For GitHub Pages, images need to be in public folder
  // Profile: public/profile.jpg (NOT in assets folder for GitHub Pages!)
  // Certification: public/certification.jpg
  // CV/Resume: public/resume.pdf
  
  // Note: GitHub Pages paths don't include 'assets' in deployment
  // Use root-level paths like: /portfolio/profile.jpg

  const skillsData = [
    { name: "Python", icon: "devicon-python-plain colored" },
    { name: "Java", icon: "devicon-java-plain colored" },
    { name: "NumPy", icon: "devicon-numpy-plain colored" },
    { name: "Pandas", icon: "devicon-pandas-plain colored" },
    { name: "TensorFlow", icon: "devicon-tensorflow-original colored" },
    { name: "Jupyter", icon: "devicon-jupyter-plain colored" },
    { name: "HTML5", icon: "devicon-html5-plain colored" },
    { name: "CSS3", icon: "devicon-css3-plain colored" },
    { name: "Git", icon: "devicon-git-plain colored" },
    { name: "GitHub", icon: "devicon-github-original colored" },
    { name: "VSCode", icon: "devicon-vscode-plain colored" },
    { name: "PyCharm", icon: "devicon-pycharm-plain colored" },
    { name: "IntelliJ", icon: "devicon-intellij-plain colored" },
    { name: "AWS", icon: "devicon-amazonwebservices-plain-wordmark colored" },
    { name: "Linux", icon: "devicon-linux-plain colored" }
  ];

  const projects = [
    {
      title: "Data Science Fundamentals",
      description: "Comprehensive collection covering analytics, visualization, and ML from basic to advanced concepts using Python.",
      tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "TensorFlow"],
      github: "https://github.com/Asad101001/Data-Science_Fundamentals",
      emoji: "📊"
    },
    {
      title: "Mini LMS",
      description: "Learning Management System for course administration and student progress tracking built with Python OOP principles.",
      tech: ["Python", "OOP"],
      github: "https://github.com/Asad101001/Mini-LMS",
      emoji: "🎓"
    }
  ];

  const certifications = [
    {
      title: "Certified Data Scientist",
      issuer: "NED University of Engineering & Technology",
      issuingAuthority: "Information Science & Technology Department, Government of Sindh",
      date: "November 2024 - January 2025",
      issueDate: "January 10, 2025",
      description: "Completed intensive 2-month certification program covering advanced analytics, machine learning, data visualization, and real-world applications. Program included hands-on projects in Python, statistical analysis, predictive modeling, and data-driven decision making.",
      skills: ["Python", "Machine Learning", "Data Analytics", "Data Visualization", "Statistical Analysis"]
    }
  ];

  const socials = [
    { icon: <Github size={24} />, link: "https://github.com/Asad101001", label: "GitHub", bg: "#333" },
    { icon: <Linkedin size={24} />, link: "https://www.linkedin.com/in/muhammadasadk", label: "LinkedIn", bg: "#0077b5" },
    { icon: <Mail size={24} />, link: "mailto:muhammadasadk42@gmail.com", label: "Email", bg: "#ea4335" },
    { icon: <BookOpen size={24} />, link: "https://medium.com/@muhammadasadk42", label: "Medium", bg: "#000" },
    { icon: <Instagram size={24} />, link: "https://www.instagram.com/muhammadasad.k_/", label: "Instagram", bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
    { icon: <Music size={24} />, link: "https://open.spotify.com/user/31nzox4rnz5dywmealmdmufewe3u", label: "Spotify", bg: "#1DB954" }
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const textColor = darkMode ? '#c9d1d9' : '#334155';
  const headingColor = darkMode ? '#f0f6fc' : '#0f172a';
  const mutedColor = darkMode ? '#8b949e' : '#64748b';
  const accentColor = darkMode ? '#58a6ff' : '#3b82f6';
  const borderColor = darkMode ? '#21262d' : '#e2e8f0';
  const cardBg = darkMode ? '#0d1117' : '#ffffff';
  const sectionBg = darkMode ? '#161b22' : '#f1f5f9';
  const navBg = darkMode ? 'rgba(13, 17, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${bgColor}; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow-x: hidden; transition: background 0.3s, color 0.3s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        
        .particle {
          position: fixed;
          width: 3px;
          height: 3px;
          background: ${accentColor};
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          box-shadow: 0 0 15px ${accentColor};
        }
        
        .particle:nth-child(1) { left: 10%; animation: float 15s infinite; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation: float 18s infinite; animation-delay: 2s; }
        .particle:nth-child(3) { left: 30%; animation: float 16s infinite; animation-delay: 4s; }
        .particle:nth-child(4) { left: 40%; animation: float 17s infinite; animation-delay: 1s; }
        .particle:nth-child(5) { left: 50%; animation: float 15s infinite; animation-delay: 3s; }
        .particle:nth-child(6) { left: 60%; animation: float 19s infinite; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation: float 16s infinite; animation-delay: 2.5s; }
        .particle:nth-child(8) { left: 80%; animation: float 18s infinite; animation-delay: 1.5s; }
        .particle:nth-child(9) { left: 90%; animation: float 17s infinite; animation-delay: 4.5s; }
        
        .wave-container {
          position: fixed;
          top: 50%;
          left: -10%;
          width: 120%;
          height: 600px;
          pointer-events: none;
          z-index: 0;
          opacity: ${darkMode ? '0.12' : '0.08'};
          transform: translateY(-50%);
        }
        
        .wave-path {
          stroke: ${darkMode ? '#8b5cf6' : '#a855f7'};
          stroke-width: 3;
          fill: none;
          filter: blur(1px);
        }
        
        section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        
        .bounce { animation: bounce 2s infinite; }
        
        .nav {
          position: fixed;
          top: 0;
          width: 100%;
          background: ${navBg};
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid ${borderColor};
          transform: translateY(0);
          transition: transform 0.3s ease;
        }
        
        .nav.nav-hidden {
          transform: translateY(-100%);
        }
        
        .nav-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.5rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${headingColor};
        }
        
        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .nav-link {
          color: ${textColor};
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          position: relative;
          padding: 0.4rem 0;
          transition: all 0.3s;
          font-weight: 500;
        }
        
        .nav-link:hover { 
          color: ${accentColor}; 
          transform: translateY(-2px);
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: ${accentColor};
          transition: width 0.3s;
        }
        
        .nav-link:hover::after { width: 100%; }
        
        .theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${darkMode ? '#21262d' : '#e2e8f0'};
          border: 1px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: ${headingColor};
        }
        
        .theme-toggle:hover {
          background: ${darkMode ? '#30363d' : '#cbd5e1'};
          transform: scale(1.15);
        }
        
        .github-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
        }
        
        .github-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
        }
        
        .cert-modal {
          position: fixed;
          top: 80px;
          right: 2rem;
          width: 400px;
          max-height: 80vh;
          background: ${cardBg};
          border-radius: 1rem;
          border: 2px solid ${darkMode ? '#8b5cf6' : '#a855f7'};
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 1500;
          opacity: 0;
          animation: slideIn 0.3s forwards;
          overflow-y: auto;
        }
        
        @keyframes slideIn {
          to { opacity: 1; }
        }
        
        .cert-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${darkMode ? '#21262d' : '#f1f5f9'};
          border: 1px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: ${headingColor};
          z-index: 10;
        }
        
        .cert-close:hover {
          background: ${darkMode ? '#30363d' : '#e2e8f0'};
          transform: rotate(90deg) scale(1.1);
        }
        
        .cert-image {
          width: 100%;
          height: auto;
          border-radius: 0.5rem;
          object-fit: cover;
          margin-bottom: 1rem;
        }
        
        .cert-details {
          padding: 1.5rem;
        }
        
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem 4rem;
          text-align: center;
          position: relative;
        }
        
        .profile-image {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          border: 4px solid ${darkMode ? '#8b5cf6' : '#a855f7'};
          box-shadow: 0 0 50px ${darkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(168, 85, 247, 0.4)'};
          object-fit: cover;
          transition: all 0.3s;
        }
        
        .profile-image:hover {
          transform: scale(1.05);
          box-shadow: 0 0 70px ${darkMode ? 'rgba(139, 92, 246, 0.7)' : 'rgba(168, 85, 247, 0.6)'};
        }
        
        .hello-tag {
          color: ${darkMode ? '#79c0ff' : '#3b82f6'};
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          letter-spacing: 3px;
          font-weight: 600;
        }
        
        .hero-title {
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          color: ${headingColor};
          margin-bottom: 1.25rem;
          font-weight: 800;
          line-height: 1.2;
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, ${darkMode ? '#58a6ff' : '#3b82f6'} 0%, ${darkMode ? '#bc8cff' : '#a855f7'} 50%, ${darkMode ? '#ff7eb6' : '#ec4899'} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: ${mutedColor};
          margin-bottom: 2.5rem;
          font-weight: 400;
        }
        
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 4rem;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.7);
        }
        
        .btn-secondary {
          padding: 0.875rem 2rem;
          border: 1.5px solid ${headingColor};
          color: ${headingColor};
          background: transparent;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-secondary:hover {
          background: ${headingColor};
          color: ${bgColor};
          transform: translateY(-4px);
          box-shadow: 0 10px 30px ${darkMode ? 'rgba(240, 246, 252, 0.3)' : 'rgba(15, 23, 42, 0.3)'};
        }
        
        .section-base {
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          position: relative;
        }
        
        .alt-bg { background: ${sectionBg}; }
        
        .section-title {
          font-size: clamp(2rem, 5vw, 2.75rem);
          color: ${headingColor};
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
        }
        
        .section-subtitle {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 3rem;
          color: ${textColor};
          text-align: center;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .focus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .focus-card {
          background: ${cardBg};
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid ${borderColor};
          transition: all 0.3s;
        }
        
        .focus-card:hover {
          border-color: ${accentColor};
          transform: translateY(-8px);
          box-shadow: 0 15px 50px ${darkMode ? 'rgba(88, 166, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
        }
        
        .icon-box {
          width: 56px;
          height: 56px;
          background: ${darkMode ? 'rgba(88, 166, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .icon-box svg { color: ${accentColor}; }
        
        .focus-card h3 {
          color: ${headingColor};
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .focus-card p {
          color: ${mutedColor};
          line-height: 1.6;
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 1rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .skill-tag {
          padding: 1rem 0.75rem;
          background: ${sectionBg};
          border: 1px solid ${borderColor};
          border-radius: 0.75rem;
          color: ${textColor};
          transition: all 0.3s;
          cursor: default;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.75rem;
        }
        
        .skill-tag:hover {
          border-color: ${accentColor};
          transform: translateY(-8px);
          box-shadow: 0 12px 35px ${darkMode ? 'rgba(88, 166, 255, 0.25)' : 'rgba(59, 130, 246, 0.2)'};
          background: ${darkMode ? 'rgba(88, 166, 255, 0.05)' : 'rgba(59, 130, 246, 0.05)'};
        }
        
        .skill-icon {
          font-size: 3rem;
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .project-card {
          background: ${cardBg};
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid ${borderColor};
          transition: all 0.3s;
        }
        
        .project-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px ${darkMode ? 'rgba(88, 166, 255, 0.25)' : 'rgba(59, 130, 246, 0.2)'};
          border-color: ${accentColor};
        }
        
        .project-img {
          width: 100%;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .project-content { padding: 1.75rem; }
        
        .project-content h3 {
          color: ${headingColor};
          margin-bottom: 0.875rem;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .project-content p {
          color: ${mutedColor};
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        
        .tech-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        
        .tech-tag {
          font-size: 0.8rem;
          padding: 0.375rem 0.75rem;
          background: ${darkMode ? 'rgba(88, 166, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
          color: ${accentColor};
          border-radius: 0.375rem;
          font-weight: 500;
          border: 1px solid ${darkMode ? 'rgba(88, 166, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
        }
        
        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${accentColor};
          text-decoration: none;
          transition: all 0.3s;
          font-weight: 500;
        }
        
        .project-link:hover {
          text-decoration: underline;
          gap: 0.75rem;
          transform: translateX(5px);
        }
        
        .contact-text {
          font-size: 1.15rem;
          color: ${mutedColor};
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .social-icons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .social-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s;
          text-decoration: none;
          color: white;
          border: 2px solid transparent;
        }
        
        .social-icon:hover {
          transform: translateY(-8px) scale(1.15);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        footer {
          text-align: center;
          padding: 2.5rem 2rem;
          border-top: 1px solid ${borderColor};
          color: ${mutedColor};
        }
        
        @media (max-width: 968px) {
          .nav-content {
            padding: 0.5rem 1rem;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .logo {
            font-size: 1.1rem;
          }
          
          .nav-links {
            gap: 0.75rem;
            font-size: 0.8rem;
            width: 100%;
            justify-content: center;
          }
          
          .github-btn {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
          }
          
          .cert-modal {
            right: 1rem;
            left: 1rem;
            width: auto;
            top: 70px;
          }
          
          .projects-grid {
            grid-template-columns: 1fr;
          }
          
          .skills-grid {
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 0.75rem;
          }
          
          .skill-tag {
            padding: 0.75rem 0.5rem;
            font-size: 0.7rem;
          }
          
          .skill-icon {
            font-size: 2.5rem;
          }
          
          .profile-image {
            width: 140px;
            height: 140px;
          }
          
          .hero {
            padding: 3rem 1.5rem 3rem;
          }
        }
      `}</style>

      <div style={{ background: bgColor, minHeight: '100vh', position: 'relative' }}>
        {/* Load DevIcons CSS */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
        
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: darkMode ? 0.08 : 0.04, zIndex: 0 }}>
          {[...Array(9)].map((_, i) => <div key={i} className="particle" />)}
        </div>

        <svg className="wave-container" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path className="wave-path" d="M 0 300 Q 150 200 300 300 T 600 300 T 900 300 T 1200 300" />
          <path className="wave-path" d="M 0 350 Q 200 250 400 350 T 800 350 T 1200 350" />
        </svg>

        <nav className={`nav ${!navVisible ? 'nav-hidden' : ''}`}>
          <div className="nav-content">
            <div className="logo">ASAD</div>
            <div className="nav-links">
              <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
              <button onClick={() => scrollToSection('skills')} className="nav-link">Skills</button>
              <button onClick={() => scrollToSection('projects')} className="nav-link">Projects</button>
              <button 
                onMouseEnter={() => setShowCertifications(true)}
                className="nav-link"
              >
                Certifications
              </button>
              <button onClick={() => scrollToSection('contact')} className="nav-link">Socials</button>
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle" title="Toggle theme">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </nav>

        {showCertifications && (
          <div 
            className="cert-modal"
            onMouseLeave={() => setShowCertifications(false)}
          >
            <button onClick={() => setShowCertifications(false)} className="cert-close">
              <X size={16} />
            </button>
            {certifications.map((cert, i) => (
              <div key={i}>
                <div className="cert-details">
                  <img 
                    src="/portfolio/certification.jpg" 
                    alt={cert.title} 
                    className="cert-image"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <h2 style={{ color: headingColor, fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                    <Award size={24} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: darkMode ? '#8b5cf6' : '#a855f7'}} />
                    {cert.title}
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: darkMode ? '#8b5cf6' : '#a855f7', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      {cert.issuer}
                    </p>
                    <p style={{ color: mutedColor, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {cert.issuingAuthority}
                    </p>
                    <p style={{ color: mutedColor, fontSize: '0.8rem' }}>
                      Duration: {cert.date}
                    </p>
                    <p style={{ color: mutedColor, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      Issued: {cert.issueDate}
                    </p>
                  </div>
                  <p style={{ color: textColor, lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {cert.description}
                  </p>
                  <div>
                    <h3 style={{ color: headingColor, fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Skills Acquired
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {cert.skills.map((skill, j) => (
                        <span key={j} className="tech-tag" style={{ fontSize: '0.75rem' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section id="home" className="hero">
          <div style={{ maxWidth: '1100px' }}>
            <img 
              src="/portfolio/profile.jpg" 
              alt="Muhammad Asad Khan" 
              className="profile-image"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='%238b5cf6'/%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-size='80' font-weight='bold' font-family='Arial'%3EMA%3C/text%3E%3C/svg%3E";
              }}
            />
            <h1 className="hero-title">
              I'm <span className="hero-gradient">Muhammad Asad</span>
            </h1>
            <p className="subtitle">CS Student & Python Developer | Data Science & Cloud Enthusiast</p>
            <div className="cta-buttons">
              <button onClick={() => scrollToSection('projects')} className="btn-primary">View Projects</button>
              <a 
                href="/portfolio/resume.pdf" 
                download="Muhammad_Asad_Khan_Resume.pdf"
                className="github-btn"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>
                </svg>
                Download CV
              </a>
            </div>
            <button onClick={() => scrollToSection('about')} className="bounce" style={{ background: 'none', border: 'none', color: mutedColor, cursor: 'pointer' }}>
              <ChevronDown size={32} />
            </button>
          </div>
        </section>

        <section id="about" className="section-base alt-bg">
          <div style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title">About Me</h2>
            <div className="section-subtitle">
              <p>Pursuing BS in Computer Science at UBIT, University of Karachi (2029). Trained in Data Science fundamentals with strong Python and OOP skills. Future focus on Cloud Computing and Network Engineering.</p>
            </div>
            <div className="focus-grid">
              <div className="focus-card">
                <div className="icon-box"><Code size={28} /></div>
                <h3>Development</h3>
                <p>Python, OOP, HTML5, CSS3. Building modular and scalable applications.</p>
              </div>
              <div className="focus-card">
                <div className="icon-box"><Brain size={28} /></div>
                <h3>Data Science</h3>
                <p>NumPy, Pandas, TensorFlow, Scikit-learn for analytics and ML.</p>
              </div>
              <div className="focus-card">
                <div className="icon-box"><Cloud size={28} /></div>
                <h3>Cloud & Networking</h3>
                <p>Exploring AWS, virtualization, and network infrastructure.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="section-base">
          <div style={{ maxWidth: '1100px', width: '100%' }}>
            <h2 className="section-title">Technical Skills</h2>
            <p className="section-subtitle">Tools and technologies I use to bring ideas to life.</p>
            <div className="skills-grid">
              {skillsData.map((skill, i) => (
                <div key={i} className="skill-tag">
                  <i className={`${skill.icon} skill-icon`}></i>
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section-base alt-bg">
          <div style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-subtitle">A selection of my work in Python, Data Science, and Software Development.</p>
            <div className="projects-grid">
              {projects.map((project, i) => (
                <div key={i} className="project-card">
                  <div className="project-img">{project.emoji}</div>
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tech-stack">
                      {project.tech.map((tech, j) => (
                        <span key={j} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <Github size={18} />View on GitHub
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section-base">
          <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
            <h2 className="section-title">Connect With Me</h2>
            <p className="contact-text">Let's connect! Find me on these platforms.</p>
            <div className="social-icons">
              {socials.map((social, i) => (
                <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className="social-icon" title={social.label} style={{ background: social.bg }}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer>
          <p>© 2025 Muhammad Asad Khan. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}