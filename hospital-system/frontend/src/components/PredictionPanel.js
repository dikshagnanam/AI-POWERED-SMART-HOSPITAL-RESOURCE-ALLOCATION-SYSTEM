import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

const API = 'http://localhost:5000';

export default function PredictionPanel() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/predict-admissions`, { days });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.predictions?.map((val, i) => ({
    day: `Day ${i + 1}`,
    admissions: val,
    threshold: 100
  })) || [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>📈 Patient Admission Prediction</h2>
        <p>LSTM Neural Network forecasts expected daily patient admissions</p>
      </div>

      {/* Controls */}
      <div className="control-bar">
        <div className="control-group">
          <label>Forecast Days:</label>
          <input
            type="number"
            min="1" max="14"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          />
        </div>
        <button className="btn-primary" onClick={fetchPredictions} disabled={loading}>
          {loading ? 'Predicting...' : '🚀 Run LSTM Prediction'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Running LSTM model inference...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-box">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-value">{data.average}</div>
              <div className="stat-label">Avg Daily Admissions</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-value">{data.max}</div>
              <div className="stat-label">Peak Day</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-value">{data.min}</div>
              <div className="stat-label">Lowest Day</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-value">{data.days}</div>
              <div className="stat-label">Days Forecasted</div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-card">
            <h3>📊 Predicted Admission Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <ReferenceLine y={100} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'High Load', fill: '#f87171', fontSize: 11 }} />
                <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2.5} fill="url(#admGrad)" name="Admissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="table-card">
            <h3>📋 Daily Breakdown</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Predicted Admissions</th>
                  <th>Load Level</th>
                  <th>ICU Estimate (~15%)</th>
                </tr>
              </thead>
              <tbody>
                {data.predictions.map((val, i) => {
                  const load = val >= 100 ? 'High' : val >= 75 ? 'Medium' : 'Low';
                  const badgeClass = val >= 100 ? 'badge-red' : val >= 75 ? 'badge-yellow' : 'badge-green';
                  return (
                    <tr key={i}>
                      <td>Day {i + 1}</td>
                      <td><strong style={{ color: '#60a5fa' }}>{val}</strong></td>
                      <td><span className={`badge ${badgeClass}`}>{load}</span></td>
                      <td>{Math.ceil(val * 0.15)} beds needed</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <p>Click <strong>"Run LSTM Prediction"</strong> to forecast patient admissions using the trained neural network.</p>
        </div>
      )}
    </div>
  );
}
