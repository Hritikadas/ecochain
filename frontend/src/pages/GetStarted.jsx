import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Structural Onboarding Data Stream mapping the EcoChain Infrastructure Modules
  const onboardingSteps = [
    {
      icon: '🔐',
      badge: 'Security Infrastructure',
      title: 'Decentralized Multi-Tenant Accounts',
      description: 'Initialize your cryptographic profile layer. Secure your ledger records behind enterprise-grade JWT sessions, salted bcrypt password hashes, and localized biometric compliance parameters.',
      accent: 'border-l-rose-500 text-rose-500 bg-rose-500/5'
    },
    {
      icon: '🤖',
      badge: 'Ecosystem Analytics',
      title: 'AI-Powered Carbon Footprint Engine',
      description: 'Feed active computational pipelines your daily commute parameters, transportation modalities, and dietary context. Calculate real-time ecological expenditure without static text variables.',
      accent: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/5'
    },
    {
      icon: '🔗',
      badge: 'Blockchain Layer',
      title: 'Immutable Stellar Ledger Anchoring',
      description: 'Trade verified carbon offsets and mint asset audit proofs natively onto the Stellar Testnet protocol layer. Turn sustainability certifications into tamper-proof, public transactional hashes.',
      accent: 'border-l-blue-500 text-blue-400 bg-blue-500/5'
    },
    {
      icon: '🗺️',
      badge: 'Spatial Geoframing',
      title: 'Interactive Spatial Mapping',
      description: 'Discover nearby EV charging docks, verified upcycling centers, and organic reserves through leafleted geospatial loops anchored to active GPS device coordinates.',
      accent: 'border-l-purple-500 text-purple-400 bg-purple-500/5'
    }
  ];

  const handleNext = () => {
    if (activeStep < onboardingSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      navigate('/signup'); // Direct route transition to Auth Gateway sheet upon completion
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans antialiased text-slate-800 min-h-[80vh] flex flex-col justify-center">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
          🚀 Onboarding Gateway Phase 1
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Welcome to EcoChain Engineering Terminal
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Before configuring your authentication parameters, review the architectural components underpinning our immutable sustainability stack.
        </p>
      </div>

      {/* WORKSPACE SECTOR CONTROL INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
        
        {/* LEFT COLUMN: ARCHITECTURAL STEP SELECTOR TRAIN */}
        <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
          {onboardingSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === index
                  ? 'bg-slate-900 text-white border-slate-950 shadow-md translate-x-2'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-wider block ${activeStep === index ? 'text-emerald-400' : 'text-slate-400'}`}>
                  Module 0{index + 1}
                </div>
                <div className="text-xs font-bold tracking-tight mt-0.5">{step.badge}</div>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: ACTIVE INTERACTIVE PRESENTATION CORE DISPLAY PANEL */}
        <div className="lg:col-span-7 order-1 lg:order-2 h-full">
          <div className={`h-full border-l-4 p-6 md:p-8 bg-white rounded-r-2xl border-y border-r border-slate-200 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 min-h-64 ${onboardingSteps[activeStep].accent}`}>
            
            {/* Blurry Design Accents inside active card wrapper */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md mb-4">
                {onboardingSteps[activeStep].badge}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-3">
                {onboardingSteps[activeStep].title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {onboardingSteps[activeStep].description}
              </p>
            </div>

            {/* PIPELINE FOOTER REGULATORS */}
            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              
              {/* PROGRESS SLIDER CHIPS INDICATORS */}
              <div className="flex gap-1.5">
                {onboardingSteps.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === index ? 'w-6 bg-slate-900' : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* EXECUTION FORWARD LINK INTERACTION TRIGGER BUTTON */}
              <button
                onClick={handleNext}
                className="inline-flex justify-center items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                {activeStep === onboardingSteps.length - 1 ? 'Configure My Credentials 🔑' : 'Advance Stream →'}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default GetStarted;