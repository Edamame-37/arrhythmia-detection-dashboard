import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PublicHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md shadow-[0px_4px_20px_rgba(0,31,84,0.05)]">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-2 h-20">
          <img alt="ecgrhythmia logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMHY1rwJz3Bn-D6aH30NsUoKCHh50RKw49BhscJugmYHzwjI4ey5ccSp9XawgX4Jzj6xSb8kHazzVJlVQ4AdKSkMKGRM3q1qB3ul_AyWaXLT_CJAZj0oV7QHTVIezEjnYJ1hRIIzWdfCh30ZbtQNyDMH86S-6c8UfQHx6HJub_2ZcnhGdwWIYbmcrjuDuluEo3nxY2ENq7nc0W5lO03dsPefmV_kTOnKCGtpZq9Sd3zxp7toZSYaVXYPGZa3bFZpNAb27eoWoXd1A" />
          <span className="font-headline-md text-headline-md tracking-tight flex items-center">
            <span className="text-brand-red font-extrabold">ecg</span><span className="text-brand-navy font-bold">rhythmia</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/#about-us">About</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/how-it-works">How It Works</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/faq">FAQ</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth/login')}
            className="hidden md:block px-6 py-2 rounded-full border border-secondary text-secondary font-semibold hover:bg-secondary hover:text-white transition-all active:scale-95"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};
