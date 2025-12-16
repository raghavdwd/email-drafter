import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-base-100 font-sans overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {/* Navbar (Fixed) */}
      <div className="navbar bg-base-100/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-white/5 px-6 py-3">
        <div className="flex-1">
          <a className="btn btn-ghost gap-2 px-0 hover:bg-transparent text-xl font-black tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-base-content text-base-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-base-content font-bold">EmailDrafter</span>
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-8 mr-8">
            {['How It Works', 'Features'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {item}
                </a>
            ))}
            <Link to="/about-dev" className="text-sm font-medium hover:text-primary transition-colors">
                About Dev
            </Link>
        </div>
        <div className="flex-none">
          <button onClick={() => navigate('/login')} className="btn btn-neutral btn-sm md:btn-md">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO */}
      <section className="h-screen w-full snap-start flex items-center justify-center pt-16 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
          <div className="flex flex-col justify-center text-left space-y-8">
             <div className="badge badge-outline gap-2 py-3 px-4">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Version 2.0 Now Live
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-base-content">
                Stop writing the <br /> same email twice.
             </h1>
             <p className="text-xl text-base-content/60 leading-relaxed max-w-lg">
                Automate your outreach with Excel-powered drafts. Upload your data, choose a template, and let AI handle the rest locally in your Gmail.
             </p>
             <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg rounded-md text-lg px-8">
                  Start Drafting Free
                </button>
                <button className="btn btn-ghost btn-lg gap-2 border border-base-content/10">
                   Watch Demo
                </button>
             </div>
          </div>
          <div className="h-[60vh] w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <img 
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Productivity" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="h-screen w-full snap-start bg-base-200/30 flex items-center justify-center px-6">
        <div className="container mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
                 <p className="text-xl text-base-content/60 max-w-2xl mx-auto">Three simple steps to automate your email workflow forever.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {/* Step 1 */}
                 <div className="card bg-base-100 shadow-xl border border-white/5 p-8 hover:-translate-y-2 transition-transform duration-300">
                     <div className="text-6xl font-black text-base-content/10 mb-6">01</div>
                     <h3 className="text-2xl font-bold mb-4">Upload Data</h3>
                     <p className="text-base-content/70 text-lg">Simply upload your Excel or CSV file containing your contact list. We automatically detect columns.</p>
                 </div>
                 {/* Step 2 */}
                 <div className="card bg-base-100 shadow-xl border border-white/5 p-8 hover:-translate-y-2 transition-transform duration-300">
                     <div className="text-6xl font-black text-base-content/10 mb-6">02</div>
                     <h3 className="text-2xl font-bold mb-4">Create Template</h3>
                     <p className="text-base-content/70 text-lg">Write your email template using {'{{variables}}'} mapped from your columns. Draft it once, send it to many.</p>
                 </div>
                 {/* Step 3 */}
                 <div className="card bg-base-100 shadow-xl border border-white/5 p-8 hover:-translate-y-2 transition-transform duration-300">
                     <div className="text-6xl font-black text-base-content/10 mb-6">03</div>
                     <h3 className="text-2xl font-bold mb-4">Sync to Gmail</h3>
                     <p className="text-base-content/70 text-lg">Click generate and watch as drafts appear in your Gmail. Review them and click send. No spam folders.</p>
                 </div>
             </div>
        </div>
      </section>

      {/* SECTION 3: BENEFITS */}
      <section id="features" className="h-screen w-full snap-start flex items-center justify-center px-6">
         <div className="container mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Use EmailDrafter?</h2>
                 <p className="text-xl text-base-content/60 max-w-2xl mx-auto">Built for professionals who value their time and data privacy.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 max-w-5xl mx-auto">
                 <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Save Hours Weekly</h3>
                        <p className="text-base-content/70 text-lg">Stop copy-pasting names and details. Generate 100 drafts in the time it takes to write one.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">100% Accuracy</h3>
                        <p className="text-base-content/70 text-lg">Eliminate human error. Ensure every recipient gets the right personalized details every time.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Secure & Local</h3>
                        <p className="text-base-content/70 text-lg">We don't send emails for you. We draft them in your account. You stay in full control.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">High Deliverability</h3>
                        <p className="text-base-content/70 text-lg">Since emails are sent from your actual Gmail, they land in the Primary inbox, not Promotions.</p>
                    </div>
                 </div>
             </div>
         </div>
      </section>

      {/* SECTION 4: HIRE ME */}
      <section className="h-screen w-full snap-start bg-base-200/30 flex items-center justify-center px-6">
         <div className="container mx-auto text-center">
             <h2 className="text-4xl md:text-5xl font-bold mb-6">Built by Raghav</h2>
             <p className="text-xl text-base-content/60 mb-12 max-w-2xl mx-auto">
                I'm a passionate full-stack developer who loves building tools that solve real problems. Check out my work!
             </p>
             
             <div className="flex justify-center mb-12">
                 <div className="bg-base-100 p-4 rounded-2xl shadow-xl border border-white/5 overflow-hidden">
                     {/* GitHub Stats Image */}
                     <img 
                        src="https://github-readme-stats.vercel.app/api?username=ashu-dwd&show_icons=true&theme=dark" 
                        alt="Ashu's GitHub Stxats" 
                        className="w-full max-w-lg"
                     />
                 </div>
             </div>

             <div className="flex justify-center gap-6">
                 <a href="https://github.com/ashu-dwd" target="_blank" rel="noopener noreferrer" className="btn btn-neutral btn-wide btn-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                    Visit GitHub Profile
                 </a>
                 <button className="btn btn-outline btn-lg" onClick={() => window.location.href = "mailto:dwivediji425@gmail.com"}>
                    Contact Me
                 </button>
             </div>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;
