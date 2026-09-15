import React from 'react';
import { ArrowRight, BarChart3, BriefcaseBusiness } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { WorkspaceMode } from '../../types';

const workspaceOptions: Array<{
  mode: WorkspaceMode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}> = [
  {
    mode: 'demo',
    eyebrow: 'Demo / Interviewer',
    title: 'Explore BizPilot',
    description: 'Explore BizPilot with realistic Indian sample data.',
    action: 'Enter Demo',
  },
  {
    mode: 'client',
    eyebrow: 'Client',
    title: 'Run your business',
    description: 'Set up and manage your own business workspace.',
    action: 'Enter Client',
  },
];

export const WorkspaceEntryView: React.FC = () => {
  const navigate = useNavigate();
  const { switchWorkspace } = useBusiness();

  const enterWorkspace = (mode: WorkspaceMode) => {
    switchWorkspace(mode);
    navigate('/dashboard');
  };

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between gap-12 sm:min-h-[calc(100vh-6rem)]">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-900 shadow-sm">
            <BarChart3 size={20} strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-slate-900">BIZPILOT</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Business intelligence, made practical.</p>
          </div>
        </header>

        <section className="w-full">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Choose your workspace</p>
            <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
              A clearer view of your business starts here.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Continue with a ready-to-explore demonstration or begin with a clean workspace for your own business.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {workspaceOptions.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => enterWorkspace(option.mode)}
                className="group flex min-h-64 flex-col justify-between border border-slate-200 bg-white p-6 text-left shadow-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:p-8"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{option.eyebrow}</span>
                    <BriefcaseBusiness className="text-slate-400 transition-colors group-hover:text-slate-900" size={21} />
                  </div>
                  <h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-950">{option.title}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{option.description}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  {option.action}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>BizPilot workspace selection</span>
          <span>Designed for focused decisions.</span>
        </footer>
      </div>
    </main>
  );
};
