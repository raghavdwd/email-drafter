import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: The actual login logic happens via the backend redirect to Google
  // This function is mostly for handling the UI state if we were doing client-side flow,
  // but for now we just redirect.

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Left Column: Visual/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-base-200 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px] animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
             <div className="card bg-base-100/40 backdrop-blur-md border border-white/20 shadow-xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                        <span className="text-2xl">📝</span>
                    </div>
                    <div>
                        <div className="h-4 w-32 bg-base-content/10 rounded mb-2"></div>
                        <div className="h-3 w-20 bg-base-content/10 rounded"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-3 w-full bg-base-content/5 rounded"></div>
                    <div className="h-3 w-5/6 bg-base-content/5 rounded"></div>
                    <div className="h-3 w-4/6 bg-base-content/5 rounded"></div>
                </div>
             </div>
             <div className="mt-12">
                <h2 className="text-4xl font-bold mb-4">Draft smarter, not harder.</h2>
                <p className="text-lg opacity-70">Join thousands of professionals automating their outreach workflow with EmailDrafter.</p>
             </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-base-100">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <div 
                    onClick={() => navigate('/')} 
                    className="cursor-pointer mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 mb-6"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="mt-2 text-base-content/60">Sign in to your account to continue</p>
            </div>

            <div className="mt-8 space-y-6">
                {error && (
                    <div className="alert alert-error shadow-sm text-sm py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={() => {
                        setLoading(true);
                        window.location.href = `${api.defaults.baseURL}/auth/google`;
                    }}
                    disabled={loading}
                    className="btn btn-outline btn-lg w-full normal-case gap-3 relative overflow-hidden group hover:btn-primary hover:text-white transition-all duration-300"
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-md"></span>
                    ) : (
                        <>
                            <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-base-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-base-100 text-base-content/50">Admin access</span>
                    </div>
                </div>

                <div className="text-center">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="btn btn-ghost btn-sm text-xs opacity-70 hover:opacity-100"
                    >
                        Login as Administrator
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
