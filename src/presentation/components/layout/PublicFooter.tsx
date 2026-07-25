import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-surface-container dark:bg-surface-container-high py-16">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="space-y-6">
          <div className="flex items-center h-28">
            <img alt="ecgrhythmia logo" className="h-28 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHsedXHo9mvu0iNLAhVu8x4fO2XAf_57ip0Beh9Ipde8S1n0e0VzNbKffjtNSc4gw8EfVatq7I4utROGSuWkJDq40WiA8yFn6yJOgafQW0FC3S8MU6i_kilW2MrR1zxRYNplAyiFQ3vp9LliYcZyPKlBOzipV5Xpwk9to1fnCpO8IIvigU9cZNtb4D8-DR2yRU1d9KoRF-ZueFV_e9uuf7Qw9n39dTbc_xoalTPyUQGrs8jmbYMhr309acDb31PjWXjs70GrCCRh80" />
          </div>
          <p className="text-on-surface-variant text-body-sm leading-relaxed">
            © 2026 ecgrhythmia. Connecting Technology with the Heart.
          </p>
          <div className="">Because every heartbeat matters</div>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-xl">language</span>
            </a>
          </div>
        </div>
        <div>
          <h5 className="font-bold text-secondary mb-6">Support</h5>
          <ul className="space-y-4 text-on-surface-variant text-body-sm">
            <li><Link className="hover:text-primary transition-all" to="/how-it-works">User Guide</Link></li>
            <li><Link className="hover:text-primary transition-all" to="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-secondary mb-6">Contact</h5>
          <ul className="space-y-4 text-on-surface-variant text-body-sm">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">mail</span>pkmkcwearableecg@gmail.com
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Semarang, Indonesia
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 pt-8 border-t border-on-surface/10 text-center text-body-sm text-on-surface-variant/60">
        All medical data displayed is indicative. Please consult the results with a professional medical provider.
      </div>
    </footer>
  );
};
