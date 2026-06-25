import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MonitorPage } from './presentation/pages/MonitorPage';
import { AnalyticsPage } from './presentation/pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Monitor menjadi halaman utama sementara */}
        <Route path="/" element={<MonitorPage />} />
        {/* Halaman Riwayat/Analytics */}
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
};