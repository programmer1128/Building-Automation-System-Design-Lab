import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Label
} from 'recharts';

const LoadGraphSection = ({ graphHistory }) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Real-Time Load Graph</h2>
        <div className="card" style={{ padding: '20px' }}>
            <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphHistory} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 14 }} minTickGap={30}>
                            <Label value="Time" offset={0} position="insideBottom" dy={20} fill="#94a3b8" style={{ fontSize: '0.9rem' }} />
                        </XAxis>
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 14 }} width={60}>
                            <Label value="Power (W)" angle={-90} position="insideLeft" fill="#94a3b8" fontSize={14} style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Area
                            type="monotone" dataKey="power"
                            stroke="#3b82f6" strokeWidth={4}
                            fillOpacity={1} fill="url(#colorPower)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

export default LoadGraphSection;