import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import api from '../../utils/api';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        totalTemplates: 0,
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Month');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const userRes = await api.get('/admin/users');
            const users = userRes.data.users || [];
            
            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'approved').length,
                pendingUsers: users.filter(u => u.status === 'pending').length,
                totalTemplates: 12, // Mocked
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Mock Data ---

    const userStatusData = [
        { name: 'Approved', value: stats.activeUsers },
        { name: 'Pending', value: stats.pendingUsers },
    ];
    const COLORS = ['#00C853', '#FFD600']; 

    const activityData = [
        { name: 'Mon', newUsers: 4, drafts: 20 },
        { name: 'Tue', newUsers: 3, drafts: 15 },
        { name: 'Wed', newUsers: 7, drafts: 32 },
        { name: 'Thu', newUsers: 2, drafts: 10 },
        { name: 'Fri', newUsers: 6, drafts: 28 },
        { name: 'Sat', newUsers: 1, drafts: 5 },
        { name: 'Sun', newUsers: 0, drafts: 2 },
    ];

    const productivityData = [
        { name: 'Week 1', drafts: 145 },
        { name: 'Week 2', drafts: 230 },
        { name: 'Week 3', drafts: 195 },
        { name: 'Week 4', drafts: 340 },
    ];

    const radarData = [
        { subject: 'Drafts', A: 120, fullMark: 150 },
        { subject: 'Templates', A: 98, fullMark: 150 },
        { subject: 'Logins', A: 86, fullMark: 150 },
        { subject: 'Exports', A: 99, fullMark: 150 },
        { subject: 'API Calls', A: 85, fullMark: 150 },
        { subject: 'Support', A: 65, fullMark: 150 },
    ];

    const topProductiveUsers = [
        { name: 'John Doe', drafts: 82 },
        { name: 'Sarah Smith', drafts: 65 },
        { name: 'Mike Ross', drafts: 48 },
        { name: 'Jane T.', drafts: 35 },
    ];

    if (loading) {
        return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                    <p className="text-base-content/60">Welcome back, Admin. Here's your performance summary.</p>
                </div>
                <select 
                    className="select select-bordered" 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <option>Today</option>
                    <option>Week</option>
                    <option>Month</option>
                    <option>Year</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stats shadow border border-base-content/10 bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value text-primary">{stats.totalUsers}</div>
                        <div className="stat-desc text-success">↗︎ 12% more than last month</div>
                    </div>
                </div>
                
                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="stat-title">Active Users</div>
                        <div className="stat-value text-secondary">{stats.activeUsers}</div>
                        <div className="stat-desc">Approved accounts</div>
                    </div>
                </div>

                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-warning">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div className="stat-title">Pending Users</div>
                        <div className="stat-value text-warning">{stats.pendingUsers}</div>
                        <div className="stat-desc">Awaiting approval</div>
                    </div>
                </div>

                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-accent">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="stat-title">Avg. Drafts/Day</div>
                        <div className="stat-value text-accent">128</div>
                        <div className="stat-desc text-success">↗︎ 5% increase</div>
                    </div>
                </div>
            </div>

            {/* Main Graphs Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Productivity Trend Area Chart */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Total Drafts Generated</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={productivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDrafts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#36d399" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#36d399" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Area type="monotone" dataKey="drafts" stroke="#36d399" fillOpacity={1} fill="url(#colorDrafts)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Activity Bar Chart */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Weekly User Activity</h3>
                        <div className="h-72 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={activityData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Legend />
                                    <Bar dataKey="drafts" fill="#7480ff" radius={[4, 4, 0, 0]} name="Emails Drafted" />
                                    <Bar dataKey="newUsers" fill="#00c853" radius={[4, 4, 0, 0]} name="New Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar Chart: Platform Health */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden lg:col-span-1">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Platform Health</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid opacity={0.2} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                                    <Radar name="Performance" dataKey="A" stroke="#ff5722" fill="#ff5722" fillOpacity={0.6} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart: User Status */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden lg:col-span-1">
                    <div className="card-body">
                        <h3 className="card-title mb-4">User Status</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {userStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                 {/* Top Productive Users Horizontal Bar */}
                 <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden lg:col-span-1">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Top Productive Users</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={topProductiveUsers}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Bar dataKey="drafts" fill="#36d399" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
