import React, { useState } from 'react';
import PredictionPanel from './components/PredictionPanel';
import ICUPanel from './components/ICUPanel';
import SchedulePanel from './components/SchedulePanel';
import WaitTimePanel from './components/WaitTimePanel';
import './App.css';

const TABS = [
  { id: 'prediction', label: '📈 Admission Prediction', icon: '📈' },
  { id: 'icu',        label: '🏥 ICU Allocation',       icon: '🏥' },
  { id: 'schedule',   label: '👨‍⚕️ Staff Scheduling',    icon: '👨‍⚕️' },
  { id: 'waittime',   label: '⏱️ Wait Time Optimizer',   icon: '⏱️' },
];

function App() {
  const [activeTab, setActiveTab] = useState('prediction');

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">🏨</div>
            <div className="header-text">
              <h1>Smart Hospital Resource Allocation</h1>
              <p>AI-Powered · LSTM · Linear Programming · Greedy Scheduling</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="live-dot"></span>
            System Live
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'prediction' && <PredictionPanel />}
        {activeTab === 'icu'        && <ICUPanel />}
        {activeTab === 'schedule'   && <SchedulePanel />}
        {activeTab === 'waittime'   && <WaitTimePanel />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>AI-Powered Smart Hospital Resource Allocation System · College Demo Project</p>
      </footer>
    </div>
  );
}

export default App;
