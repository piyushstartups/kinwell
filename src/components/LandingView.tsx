import React from 'react';
import { Button } from './ui/Button.tsx';
import { Logo } from './Logo.tsx';
import { BrainCircuitIcon, HeartPulseIcon, ReceiptIcon, UsersIcon } from './icons/FeatureIcons.tsx';

interface LandingViewProps {
  onNavigateToLogin: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onNavigateToLogin }) => {
  const features = [
    {
      name: 'Centralized Health Records',
      description: 'Keep track of medical history, prescriptions, and appointments for your entire family in one secure place.',
      icon: <HeartPulseIcon />,
    },
    {
      name: 'AI-Powered Insights',
      description: 'Get simple, understandable summaries of health data and identify trends to stay proactive.',
      icon: <BrainCircuitIcon />,
    },
    {
      name: 'Insurance & Billing Hub',
      description: 'Manage policies, track medical bills, and monitor deductibles to take control of healthcare finances.',
      icon: <ReceiptIcon />,
    },
    {
      name: 'Secure Caregiver Access',
      description: 'Share read-only access with doctors or caregivers to ensure everyone is on the same page.',
      icon: <UsersIcon />,
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
          <div className="flex items-center gap-x-2">
            <Logo className="h-8 w-auto text-primary-600" />
            <span className="text-xl font-bold text-slate-800">Kinwell</span>
          </div>
          <div className="flex items-center gap-x-4">
            <Button onClick={onNavigateToLogin} variant="ghost">Sign In</Button>
            <Button onClick={onNavigateToLogin}>Get Started</Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
                Family health, finally organized.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 font-light">
                Kinwell is your family's secure health hub. Manage medical records, get AI insights, and coordinate care, all in one place.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button onClick={onNavigateToLogin} className="px-6 py-3 text-base">
                  Get started for free
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">Everything in one place</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A better way to manage care
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600 font-light">
                From tracking vitals to managing bills, Kinwell brings all your family's health information together in a simple, secure app.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-slate-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                         <div className="text-white">{feature.icon}</div>
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-slate-600 font-light">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Ready to take control?
                    <br />
                    Get started with Kinwell today.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600 font-light">
                    Trusted by thousands of families nationwide.
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
                  <Button onClick={onNavigateToLogin} className="px-6 py-3 text-base">
                      Get started for free
                  </Button>
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
       <footer className="bg-slate-50 border-t">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <div className="flex justify-center items-center gap-2">
            <Logo className="h-6 w-auto text-primary-600" />
            <span className="font-semibold text-slate-700">Kinwell</span>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} Kinwell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;