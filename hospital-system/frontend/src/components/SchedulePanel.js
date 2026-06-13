import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API = 'http://localhost:5000';

const LOAD_BADGE = {
  'High':   'badge-red',
  'Medium': 'badge-yellow',
  'Low':    'badge-green',
};

export default function SchedulePanel() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/schedule-staff`, { days });
      setData(res.data);
      setSelectedDay(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.schedule?.map(d => ({
    day: `Day ${d.day}`,
    doctors: d.summary.doctors_on_duty,
    nurses: d.summary.nurses_on_duty,
    admissions: d.predicted_admissions
  })) || [];

  const dayDetail = data?.schedule?.[selectedDay];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>👨‍⚕️ Staff Scheduling</h2>
        <p>Greedy Algorithm assigns doctors and nurses to shifts based on predicted patient load</p>
      </div>

      <div className="control-bar">
        <div className="control-group">
          <label>Days:</label>
          <input type="number" min="1" max="14" value={days}
            onChange={e => setDays(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={fetchSchedule} disabled={loading}>
          {loading ? 'Scheduling...' : '📅 Generate Schedule'}
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Running Greedy Scheduling Algorithm...</p>
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
                {data.schedule[0]?.summary.total_doctors_available || 0}
              </div>
              <div className="stat-label">Total Doctors</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-value">
                {data.schedule[0]?.summary.total_nurses_available || 0}
              </div>
              <div className="stat-label">Total Nurses</div>
            </div>
            <div className="stat-card stat-yellow">
              <div className="stat-value">3</div>
              <div className="stat-label">Shifts Per Day</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-value">{data.days}</div>
              <div className="stat-label">Days Scheduled</div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-card">
            <h3>📊 Staff on Duty vs Patient Load</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="doctors" fill="#3b82f6" name="Doctors on Duty" radius={[2,2,0,0]} />
                <Bar dataKey="nurses"  fill="#22c55e" name="Nurses on Duty"  radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Day Selector */}
          <div className="day-selector">
            {data.schedule.map((d, i) => (
              <button
                key={i}
                className={`day-btn ${selectedDay === i ? 'selected' : ''}`}
                onClick={() => setSelectedDay(i)}
              >
                Day {d.day} — <span style={{
                  color: d.load_level === 'High' ? '#f87171' :
                         d.load_level === 'Medium' ? '#facc15' : '#4ade80'
                }}>{d.load_level}</span>
              </button>
            ))}
          </div>

          {/* Shift Detail for Selected Day */}
          {dayDetail && (
            <>
              <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Day {dayDetail.day} · {dayDetail.predicted_admissions} admissions
                </span>
                <span className={`badge ${LOAD_BADGE[dayDetail.load_level]}`}>{dayDetail.load_level} Load</span>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  {dayDetail.summary.doctors_on_duty} doctors · {dayDetail.summary.nurses_on_duty} nurses deployed
                </span>
              </div>

              <div className="shifts-grid">
                {dayDetail.shifts.map((shift, si) => (
                  <div key={si} className="shift-card">
                    <h4>🕐 {shift.shift}</h4>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Doctors ({shift.doctors.length})
                      </div>
                      <ul className="staff-list">
                        {shift.doctors.length > 0 ? shift.doctors.map(d => (
                          <li key={d.id}>{d.name} <span style={{ color: '#475569' }}>({d.specialty})</span></li>
                        )) : <li style={{ color: '#475569' }}>No doctors assigned</li>}
                      </ul>
                    </div>
                    <div>
                      <div style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Nurses ({shift.nurses.length})
                      </div>
                      <ul className="staff-list">
                        {shift.nurses.length > 0 ? shift.nurses.map(n => (
                          <li key={n.id}>{n.name} <span style={{ color: '#475569' }}>({n.ward})</span></li>
                        )) : <li style={{ color: '#475569' }}>No nurses assigned</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Summary Table */}
          <div className="table-card">
            <h3>📋 Weekly Schedule Summary</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Admissions</th>
                  <th>Load</th>
                  <th>Doctors On Duty</th>
                  <th>Nurses On Duty</th>
                  <th>Off Duty (Dr/Nrs)</th>
                </tr>
              </thead>
              <tbody>
                {data.schedule.map((d, i) => (
                  <tr key={i} onClick={() => setSelectedDay(i)}
                    style={{ cursor: 'pointer', background: selectedDay === i ? '#172554' : '' }}>
                    <td>Day {d.day}</td>
                    <td><strong style={{ color: '#60a5fa' }}>{d.predicted_admissions}</strong></td>
                    <td><span className={`badge ${LOAD_BADGE[d.load_level]}`}>{d.load_level}</span></td>
                    <td>
                      <span style={{ color: '#60a5fa' }}>{d.summary.doctors_on_duty}</span>
                      <span style={{ color: '#475569' }}> / {d.summary.total_doctors_available}</span>
                    </td>
                    <td>
                      <span style={{ color: '#4ade80' }}>{d.summary.nurses_on_duty}</span>
                      <span style={{ color: '#475569' }}> / {d.summary.total_nurses_available}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {d.summary.doctors_off_duty} / {d.summary.nurses_off_duty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <p>Click <strong>"Generate Schedule"</strong> to create an optimized staff roster using the Greedy Algorithm.</p>
        </div>
      )}
    </div>
  );
}
