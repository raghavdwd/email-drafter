import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutDev = () => {
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, reposRes] = await Promise.all([
                    fetch('https://api.github.com/users/ashu-dwd'),
                    fetch('https://api.github.com/users/ashu-dwd/repos?sort=updated&per_page=6')
                ]);

                if (!userRes.ok || !reposRes.ok) throw new Error('Failed to fetch GitHub data');

                const userData = await userRes.json();
                const reposData = await reposRes.json();

                setProfile(userData);
                setRepos(reposData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="alert alert-error max-w-md">
                    <span>{error}</span>
                    <Link to="/" className="btn btn-sm">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content relative overflow-hidden">
            {/* Background decoration similar to landing page but subtler */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-base-100/80 backdrop-blur-md border-b border-base-content/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-base-content text-base-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">EmailDrafter</span>
                    </Link>
                    <Link to="/" className="btn btn-ghost btn-sm">Back to Home</Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="card bg-base-100 border border-base-content/10 shadow-xl mb-12 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-base-content/5 to-base-content/10"></div>
                        <div className="card-body pt-0 relative">
                            <div className="absolute -top-16 left-8 p-1 bg-base-100 rounded-full">
                                <div className="avatar">
                                    <div className="w-32 rounded-full border-4 border-base-100">
                                        <img src={profile.avatar_url} alt={profile.login} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                <div>
                                    <h1 className="text-4xl font-bold mb-1">{profile.name}</h1>
                                    <p className="text-xl text-base-content/60 font-mono mb-4">@{profile.login}</p>
                                    <p className="text-lg max-w-2xl">{profile.bio}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Follow on GitHub
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-6 mt-8 p-4 bg-base-200/50 rounded-xl border border-base-content/5">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{profile.public_repos}</div>
                                    <div className="text-xs uppercase tracking-wide opacity-60">Repositories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{profile.followers}</div>
                                    <div className="text-xs uppercase tracking-wide opacity-60">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{profile.following}</div>
                                    <div className="text-xs uppercase tracking-wide opacity-60">Following</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Repositories Grid */}
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Recent Repositories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {repos.map(repo => (
                            <a 
                                key={repo.id} 
                                href={repo.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="card bg-base-100 border border-base-content/10 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="card-body">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="card-title text-lg font-bold group-hover:text-primary transition-colors">
                                            {repo.name}
                                        </h3>
                                        {repo.language && <div className="badge badge-outline">{repo.language}</div>}
                                    </div>
                                    <p className="text-base-content/70 text-sm line-clamp-2 h-10 mb-4">
                                        {repo.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-base-content/50">
                                        <div className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            {repo.stargazers_count}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {repo.forks_count}
                                        </div>
                                        <div className="ml-auto">
                                            Updated: {new Date(repo.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutDev;
