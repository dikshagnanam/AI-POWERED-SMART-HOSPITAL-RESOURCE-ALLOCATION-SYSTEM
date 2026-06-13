import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const API = 'http://localhost:5000';

export default function ICUPanel() {
  const [days, setDays] = useState(7);
  const [icuBeds, setIcuBeds] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchICU = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/allocate-icu`, { days, total_icu_beds: icuBeds });
      setData(res.data);
      setSelectedDay(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.allocation?.map(d => ({
    day: `Day ${d.day}`,
    critical: d.allocated.critical,
    serious: d.allocated.serious,
    moderate: d.allocated.moderate,
    available: d.available_beds
  })) || [];

  const dayDetail = data?.allocation?.[selectedDay];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>🏥 ICU Bed Allocation</h2>
        <p>Linear Programming optimally allocates ICU beds across patient severity categories</p>
      </div>

      <div className="control-bar">
        <div className="control-group">
          <label>Days:</label>
          <input type="number" min="1" max="14" value={days}
            onChange={e => setDays(Number(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Total ICU Beds:</label>
          <input type="number" min="10" max="100" value={icuBeds}
            onChange={e => setIcuBeds(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={fetchICU} disabled={loading}>
          {loading ? 'Allocating...' : '🔧 Run LP Allocation'}
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Solving Linear Programming optimization...</p>
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
          {/* Summary Stats */}
          <div className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-value">{icuBeds}</div>
              <div className="stat-label">Total ICU Beds</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-value">
                {Math.max(...data.allocation.map(d => d.allocated.total))}
              </div>
              <div className="stat-label">Peak Beds Used</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-value">
                {Math.round(data.allocation.reduce((a, d) => a + d.utilization_percent, 0) / data.allocation.length)}%
              </div>
              <div className="stat-label">Avg Utilization</div>
            </div>
            <div className="stat-card stat-yellow">
              <div className="stat-value">
                {Math.min(...data.allocation.map(d => d.available_beds))}
              </div>
              <div className="stat-label">Min Available Beds</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <h3>📊 ICU Bed Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="critical" fill="#ef4444" name="Critical" radius={[2,2,0,0]} />
                <Bar dataKey="serious"  fill="#f97316" name="Serious"  radius={[2,2,0,0]} />
                <Bar dataKey="moderate" fill="#eab308" name="Moderate" radius={[2,2,0,0]} />
                <Bar dataKey="available" fill="#22c55e" name="Available" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Day Selector */}
          <div className="day-selector">
            {data.allocation.map((d, i) => (
              <button
                key={i}
                className={`day-btn ${selectedDay === i ? 'selected' : ''}`}
                onClick={() => setSelectedDay(i)}
              >
                Day {d.day}
              </button>
            ))}
          </div>

          {/* Day Detail */}
          {dayDetail && (
            <div className="two-col-grid">
              <div className="chart-card">
                <h3>Day {dayDetail.day} — Allocation Detail</h3>
                <div style={{ marginTop: 8 }}>
                  {[
                    { label: 'Critical Patients', val: dayDetail.allocated.critical, color: '#ef4444', max: icuBeds },
                    { label: 'Serious Patients',  val: dayDetail.allocated.serious,  color: '#f97316', max: icuBeds },
                    { label: 'Moderate Patients', val: dayDetail.allocated.moderate, color: '#eab308', max: icuBeds },
                    { label: 'Available Beds',    val: dayDetail.available_beds,     color: '#22c55e', max: icuBeds },
                  ].map(({ label, val, color, max }) => (
                    <div key={label} className="util-row">
                      <span className="util-label">{label}</span>
                      <div className="util-bar-wrap">
                        <div className="util-bar-fill"
                          style={{ width: `${(val/max)*100}%`, background: color }} />
                      </div>
                      <span className="util-value">{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '12px', background: '#0f172a', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Predicted Admissions:</span>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>{dayDetail.predicted_admissions}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>ICU Demand:</span>
                    <span style={{ color: '#f87171', fontWeight: 600 }}>{dayDetail.icu_demand}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Utilization:</span>
                    <span style={{ color: '#facc15', fontWeight: 600 }}>{dayDetail.utilization_percent}%</span>
                  </div>
                </div>
              </div>

              {/* Full Table */}
              <div className="table-card" style={{ marginBottom: 0 }}>
                <h3>All Days Summary</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Demand</th>
                      <th>Used</th>
                      <th>Free</th>
                      <th>Util%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allocation.map((d, i) => {
                      const util = d.utilization_percent;
                      const badgeClass = util >= 90 ? 'badge-red' : util >= 70 ? 'badge-yellow' : 'badge-green';
                      return (
                        <tr key={i} onClick={() => setSelectedDay(i)}
                          style={{ cursor: 'pointer', background: selectedDay === i ? '#172554' : '' }}>
                          <td>Day {d.day}</td>
                          <td>{d.icu_demand}</td>
                          <td>{d.allocated.total}</td>
                          <td>{d.available_beds}</td>
                          <td><span className={`badge ${badgeClass}`}>{util}%</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🏥</div>
          <p>Click <strong>"Run LP Allocation"</strong> to optimally distribute ICU beds using Linear Programming.</p>
        </div>
      )}
    </div>
  );
}
