import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API = 'http://localhost:5000';

const STATUS_ALERT = {
  'Critical': 'alert-critical',
  'Warning':  'alert-warning',
  'Normal':   'alert-normal',
};

const STATUS_ICON = {
  'Critical': '🔴',
  'Warning':  '🟡',
  'Normal':   '🟢',
};

const PRIORITY_BADGE = {
  'Critical':    'badge-red',
  'Urgent':      'badge-orange',
  'Semi-Urgent': 'badge-yellow',
  'Non-Urgent':  'badge-green',
};

export default function WaitTimePanel() {
  const [days, setDays]       = useState(7);
  const [doctors, setDoctors] = useState(6);
  const [nurses, setNurses]   = useState(8);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchWaitTime = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/optimize-wait-time`, { days, doctors, nurses });
      setData(res.data);
      setSelectedDay(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.wait_optimization?.map(d => ({
    day: `Day ${d.day}`,
    avg_wait: d.avg_wait_minutes,
    throughput: d.throughput_per_hour,
    admissions: d.predicted_admissions
  })) || [];

  const dayDetail = data?.wait_optimization?.[selectedDay];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>⏱️ Wait Time Optimization</h2>
        <p>Priority-based queue management minimizes patient waiting time using triage logic</p>
      </div>

      <div className="control-bar">
        <div className="control-group">
          <label>Days:</label>
          <input type="number" min="1" max="14" value={days}
            onChange={e => setDays(Number(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Doctors Available:</label>
          <input type="number" min="1" max="20" value={doctors}
            onChange={e => setDoctors(Number(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Nurses Available:</label>
          <input type="number" min="1" max="40" value={nurses}
            onChange={e => setNurses(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={fetchWaitTime} disabled={loading}>
          {loading ? 'Optimizing...' : '⚡ Optimize Wait Time'}
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Running priority queue optimization...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-box">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-value">
                {Math.round(data.wait_optimization.reduce((a, d) => a + d.avg_wait_minutes, 0) / data.wait_optimization.length)}m
              </div>
              <div className="stat-label">Avg Wait Time</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-value">
                {data.wait_optimization[0]?.throughput_per_hour}
              </div>
              <div className="stat-label">Patients/Hour</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-value">
                {Math.max(...data.wait_optimization.map(d => d.avg_wait_minutes))}m
              </div>
              <div className="stat-label">Peak Wait</div>
            </div>
            <div className="stat-card stat-yellow">
              <div className="stat-value">
                {data.wait_optimization.filter(d => d.status === 'Normal').length}/{data.wait_optimization.length}
              </div>
              <div className="stat-label">Days Normal Status</div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-card">
            <h3>📊 Average Wait Time Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} unit="m" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val, name) => [
                    name === 'avg_wait' ? `${val} min` : val,
                    name === 'avg_wait' ? 'Avg Wait' : 'Throughput'
                  ]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Line type="monotone" dataKey="avg_wait" stroke="#f97316" strokeWidth={2.5}
                  dot={{ fill: '#f97316', r: 4 }} name="avg_wait" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Day Selector */}
          <div className="day-selector">
            {data.wait_optimization.map((d, i) => (
              <button
                key={i}
                className={`day-btn ${selectedDay === i ? 'selected' : ''}`}
                onClick={() => setSelectedDay(i)}
              >
                Day {d.day} — {STATUS_ICON[d.status]}
              </button>
            ))}
          </div>

          {/* Day Detail */}
          {dayDetail && (
            <div className="two-col-grid">
              <div>
                {/* Alert */}
                <div className={`alert-box ${STATUS_ALERT[dayDetail.status]}`}>
                  {STATUS_ICON[dayDetail.status]} {dayDetail.recommendation}
                </div>

                {/* Day stats */}
                <div className="chart-card">
                  <h3>Day {dayDetail.day} — Queue Breakdown</h3>
                  <table className="data-table" style={{ marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th>Priority</th>
                        <th>Patients</th>
                        <th>Avg Wait</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayDetail.queue_breakdown.map((q, qi) => (
                        <tr key={qi}>
                          <td>
                            <span className={`badge ${PRIORITY_BADGE[q.priority]}`}>
                              {q.priority}
                            </span>
                          </td>
                          <td><strong style={{ color: '#e2e8f0' }}>{q.count}</strong></td>
                          <td style={{ color: '#f97316' }}>{q.avg_wait_min} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="chart-card">
                <h3>📋 All Days — Wait Summary</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Admissions</th>
                      <th>Avg Wait</th>
                      <th>Hrs to Clear</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.wait_optimization.map((d, i) => (
                      <tr key={i} onClick={() => setSelectedDay(i)}
                        style={{ cursor: 'pointer', background: selectedDay === i ? '#172554' : '' }}>
                        <td>Day {d.day}</td>
                        <td>{d.predicted_admissions}</td>
                        <td style={{ color: '#f97316' }}>{d.avg_wait_minutes}m</td>
                        <td>{d.hours_to_clear_queue}h</td>
                        <td>
                          <span className={`badge ${
                            d.status === 'Critical' ? 'badge-red' :
                            d.status === 'Warning'  ? 'badge-orange' : 'badge-green'
                          }`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">⏱️</div>
          <p>Click <strong>"Optimize Wait Time"</strong> to run priority-based queue analysis across predicted admissions.</p>
        </div>
      )}
    </div>
  );
}
