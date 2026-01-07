import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../../utils/api';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        totalTemplates: 0,
    });
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [dailyActivity, setDailyActivity] = useState([]);
    const [weeklyProductivity, setWeeklyProductivity] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
                totalTemplates: 0,
            });

            // Fetch real dashboard stats
            const statsRes = await api.get('/admin/stats');
            const data = statsRes.data;
            setOverview(data.overview);
            setTrends(data.trends);
            setDailyActivity(data.dailyActivity || []);
            setWeeklyProductivity(data.weeklyProductivity || []);
            setTopUsers(data.topUsers || []);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const userStatusData = [
        { name: 'Approved', value: overview?.activeUsers || stats.activeUsers },
        { name: 'Pending', value: overview?.pendingUsers || stats.pendingUsers },
    ];
    const COLORS = ['#00C853', '#FFD600'];

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
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stats shadow border border-base-content/10 bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value text-primary">{overview?.totalUsers || stats.totalUsers}</div>
                        <div className="stat-desc text-success">↗︎ {trends?.newUsersThisWeek || 0} this week</div>
                    </div>
                </div>
                
                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="stat-title">Active Users</div>
                        <div className="stat-value text-secondary">{overview?.activeUsers || stats.activeUsers}</div>
                        <div className="stat-desc">Approved accounts</div>
                    </div>
                </div>

                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-warning">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div className="stat-title">Pending Users</div>
                        <div className="stat-value text-warning">{overview?.pendingUsers || stats.pendingUsers}</div>
                        <div className="stat-desc">Awaiting approval</div>
                    </div>
                </div>

                <div className="stats shadow border border-base-content/10 bg-base-100">
                     <div className="stat">
                        <div className="stat-figure text-accent">
                             <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="stat-title">Avg. Drafts/Day</div>
                        <div className="stat-value text-accent">{trends?.avgDraftsPerDay || 0}</div>
                        <div className="stat-desc text-success">↗︎ {trends?.sentThisWeek || 0} this week</div>
                    </div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-xs text-base-content/60">Total Emails Sent</div>
                        <div className="text-xl font-bold text-success">{overview?.totalSentEmails || 0}</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-xs text-base-content/60">Failed Emails</div>
                        <div className="text-xl font-bold text-error">{overview?.failedEmails || 0}</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-xs text-base-content/60">Templates</div>
                        <div className="text-xl font-bold text-primary">{overview?.totalTemplates || 0}</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-xs text-base-content/60">File Uploads</div>
                        <div className="text-xl font-bold text-secondary">{overview?.totalUploads || 0}</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-xs text-base-content/60">Active Jobs</div>
                        <div className="text-xl font-bold text-accent">{overview?.activeJobs || 0}</div>
                    </div>
                </div>
            </div>

            {/* Main Graphs Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Productivity Trend Area Chart */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Weekly Productivity</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyProductivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDrafts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#36d399" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#36d399" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="week" />
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
                        <h3 className="card-title mb-4">Daily Activity (Last 7 Days)</h3>
                        <div className="h-72 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dailyActivity}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Legend />
                                    <Bar dataKey="emailsSent" fill="#7480ff" radius={[4, 4, 0, 0]} name="Emails Sent" />
                                    <Bar dataKey="newUsers" fill="#00c853" radius={[4, 4, 0, 0]} name="New Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart: User Status */}
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden">
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
                <div className="card bg-base-100 border border-base-content/10 shadow-xl overflow-hidden">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Top Productive Users</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={topUsers.slice(0, 5)}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1d232a', borderColor: '#333', color: '#fff' }} />
                                    <Bar dataKey="drafts" fill="#36d399" radius={[0, 4, 4, 0]} barSize={20} name="Drafts Created" />
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
