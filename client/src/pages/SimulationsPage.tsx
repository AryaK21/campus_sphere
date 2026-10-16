import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Cpu,
  BarChart2,
  Zap,
  Network,
} from 'lucide-react';
import { DSASortingVisualizer } from '../components/simulations/DSASortingVisualizer';
import { CPUSchedulerVisualizer } from '../components/simulations/CPUSchedulerVisualizer';
import { LogicGatesVisualizer } from '../components/simulations/LogicGatesVisualizer';
import { NetworkVisualizer } from '../components/simulations/NetworkVisualizer';
import { simulationsApi } from '../api/endpoints';

type SimTab = 'dsa' | 'os' | 'logic' | 'network';

export const SimulationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SimTab) || 'dsa';
  const [activeTab, setActiveTab] = useState<SimTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as SimTab;
    if (tabParam && ['dsa', 'os', 'logic', 'network'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SimTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });

    const slugMap: Record<SimTab, string> = {
      dsa: 'sorting-algorithms',
      os: 'cpu-scheduling',
      logic: 'logic-gates',
      network: 'packet-routing',
    };
    simulationsApi.recordRun(slugMap[tab]).catch(() => {});
  };

  const tabs: Array<{ id: SimTab; label: string; icon: any; desc: string; color: string }> = [
    {
      id: 'dsa',
      label: 'Sorting Algorithms',
      icon: BarChart2,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      desc: 'Step-by-step QuickSort, MergeSort, BubbleSort with comparison metrics',
    },
    {
      id: 'os',
      label: 'CPU Scheduling',
      icon: Cpu,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      desc: 'Dynamic Gantt charts for FCFS, SJF, Round Robin & Priority algorithms',
    },
    {
      id: 'logic',
      label: 'Digital Logic Gates',
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
      desc: 'Interactive 0/1 signal toggles, live truth tables & 1-bit half adder circuit',
    },
    {
      id: 'network',
      label: 'Networks & Subnetting',
      icon: Network,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
      desc: 'CIDR calculator, broadcast addresses, usable host ranges & packet transit',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Interactive Computer Science Labs
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
          Visual, hands-on simulators for Algorithms, Operating Systems, Digital Circuits, and Computer Networks.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`p-4 rounded-xl text-left transition-all duration-150 flex flex-col justify-between border cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-dark-secondary border-primary-500 ring-2 ring-primary-500/20 shadow-card-md'
                  : 'bg-white dark:bg-dark-secondary border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border-strong shadow-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isActive && (
                    <span className="badge-blue text-[10px]">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {t.label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-dark-border text-xs font-medium text-primary-600 dark:text-primary-400">
                {isActive ? 'Currently Viewing' : 'Launch Visualizer →'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Visualizer Module */}
      <div className="pt-2">
        {activeTab === 'dsa' && <DSASortingVisualizer />}
        {activeTab === 'os' && <CPUSchedulerVisualizer />}
        {activeTab === 'logic' && <LogicGatesVisualizer />}
        {activeTab === 'network' && <NetworkVisualizer />}
      </div>

    </div>
  );
};

export default SimulationsPage;
