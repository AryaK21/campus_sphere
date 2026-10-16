import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Plus, Trash2, Cpu, Activity, Clock, Layers } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
}

interface GanttBlock {
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
  isIdle?: boolean;
}

interface ProcessResult {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  color: string;
}

const DEFAULT_PROCESSES: Process[] = [
  { id: '1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: '#6366F1' },
  { id: '2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#EC4899' },
  { id: '3', name: 'P3', arrivalTime: 2, burstTime: 8, priority: 3, color: '#10B981' },
  { id: '4', name: 'P4', arrivalTime: 3, burstTime: 6, priority: 2, color: '#F59E0B' },
];

const PROCESS_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444', '#14B8A6'];

export const CPUSchedulerVisualizer: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'FCFS' | 'SJF_NP' | 'SRTF' | 'RR' | 'PRIORITY'>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);

  // New process input state
  const [newPid, setNewPid] = useState<string>('P5');
  const [newAt, setNewAt] = useState<number>(0);
  const [newBt, setNewBt] = useState<number>(4);
  const [newPriority, setNewPriority] = useState<number>(1);

  const addProcess = () => {
    if (newBt <= 0) return;
    const newProcess: Process = {
      id: Date.now().toString(),
      name: newPid.trim() || `P${processes.length + 1}`,
      arrivalTime: Math.max(0, newAt),
      burstTime: newBt,
      priority: Math.max(1, newPriority),
      color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length],
    };
    setProcesses([...processes, newProcess]);
    setNewPid(`P${processes.length + 2}`);
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const resetToDefault = () => {
    setProcesses(DEFAULT_PROCESSES);
  };

  // Run Scheduling Algorithm
  const { ganttChart, results, avgTAT, avgWT, cpuUtilization } = useMemo(() => {
    if (processes.length === 0) {
      return { ganttChart: [], results: [], avgTAT: 0, avgWT: 0, cpuUtilization: 0 };
    }

    const procs = processes.map((p) => ({ ...p }));
    const gantt: GanttBlock[] = [];
    const resultMap: Record<string, { ct: number; tat: number; wt: number }> = {};

    let currentTime = 0;
    let totalBusyTime = 0;

    // FCFS Algorithm
    if (algorithm === 'FCFS') {
      const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
      for (const p of sorted) {
        if (currentTime < p.arrivalTime) {
          gantt.push({
            processName: 'IDLE',
            startTime: currentTime,
            endTime: p.arrivalTime,
            color: '#64748B',
            isIdle: true,
          });
          currentTime = p.arrivalTime;
        }

        const start = currentTime;
        currentTime += p.burstTime;
        totalBusyTime += p.burstTime;

        gantt.push({
          processName: p.name,
          startTime: start,
          endTime: currentTime,
          color: p.color,
        });

        const ct = currentTime;
        const tat = ct - p.arrivalTime;
        const wt = tat - p.burstTime;
        resultMap[p.id] = { ct, tat, wt };
      }
    }

    // SJF Non-Preemptive
    else if (algorithm === 'SJF_NP') {
      let completed = 0;
      const isCompleted: Record<string, boolean> = {};

      while (completed < procs.length) {
        const available = procs.filter((p) => p.arrivalTime <= currentTime && !isCompleted[p.id]);

        if (available.length === 0) {
          // Advance to next arrival
          const nextArrival = Math.min(...procs.filter((p) => !isCompleted[p.id]).map((p) => p.arrivalTime));
          gantt.push({
            processName: 'IDLE',
            startTime: currentTime,
            endTime: nextArrival,
            color: '#64748B',
            isIdle: true,
          });
          currentTime = nextArrival;
          continue;
        }

        // Pick shortest burst
        available.sort((a, b) => a.burstTime - b.burstTime);
        const p = available[0];

        const start = currentTime;
        currentTime += p.burstTime;
        totalBusyTime += p.burstTime;

        gantt.push({
          processName: p.name,
          startTime: start,
          endTime: currentTime,
          color: p.color,
        });

        const ct = currentTime;
        const tat = ct - p.arrivalTime;
        const wt = tat - p.burstTime;
        resultMap[p.id] = { ct, tat, wt };

        isCompleted[p.id] = true;
        completed++;
      }
    }

    // SRTF (Shortest Remaining Time First - Preemptive SJF)
    else if (algorithm === 'SRTF') {
      const remBurst: Record<string, number> = {};
      procs.forEach((p) => (remBurst[p.id] = p.burstTime));

      let completed = 0;
      let prevProc: Process | null = null;
      let blockStart = 0;

      while (completed < procs.length) {
        const available = procs.filter((p) => p.arrivalTime <= currentTime && remBurst[p.id] > 0);

        if (available.length === 0) {
          if (prevProc) {
            gantt.push({
              processName: prevProc.name,
              startTime: blockStart,
              endTime: currentTime,
              color: prevProc.color,
            });
            prevProc = null;
          }
          const nextArrival = Math.min(...procs.filter((p) => remBurst[p.id] > 0).map((p) => p.arrivalTime));
          gantt.push({
            processName: 'IDLE',
            startTime: currentTime,
            endTime: nextArrival,
            color: '#64748B',
            isIdle: true,
          });
          currentTime = nextArrival;
          continue;
        }

        available.sort((a, b) => remBurst[a.id] - remBurst[b.id]);
        const currentProc = available[0];

        if (!prevProc || prevProc.id !== currentProc.id) {
          if (prevProc) {
            gantt.push({
              processName: prevProc.name,
              startTime: blockStart,
              endTime: currentTime,
              color: prevProc.color,
            });
          }
          prevProc = currentProc;
          blockStart = currentTime;
        }

        remBurst[currentProc.id] -= 1;
        currentTime += 1;
        totalBusyTime += 1;

        if (remBurst[currentProc.id] === 0) {
          completed++;
          const ct = currentTime;
          const tat = ct - currentProc.arrivalTime;
          const wt = tat - currentProc.burstTime;
          resultMap[currentProc.id] = { ct, tat, wt };

          gantt.push({
            processName: currentProc.name,
            startTime: blockStart,
            endTime: currentTime,
            color: currentProc.color,
          });
          prevProc = null;
        }
      }
    }

    // Round Robin
    else if (algorithm === 'RR') {
      const q = Math.max(1, timeQuantum);
      const remBurst: Record<string, number> = {};
      procs.forEach((p) => (remBurst[p.id] = p.burstTime));

      const readyQueue: Process[] = [];
      const visited: Record<string, boolean> = {};

      const sortedByArrival = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);

      currentTime = sortedByArrival[0].arrivalTime;
      if (currentTime > 0) {
        gantt.push({
          processName: 'IDLE',
          startTime: 0,
          endTime: currentTime,
          color: '#64748B',
          isIdle: true,
        });
      }

      // Add first arrivals
      sortedByArrival.forEach((p) => {
        if (p.arrivalTime <= currentTime && !visited[p.id]) {
          readyQueue.push(p);
          visited[p.id] = true;
        }
      });

      let completed = 0;

      while (completed < procs.length) {
        if (readyQueue.length === 0) {
          const unvisited = sortedByArrival.find((p) => remBurst[p.id] > 0);
          if (unvisited) {
            gantt.push({
              processName: 'IDLE',
              startTime: currentTime,
              endTime: unvisited.arrivalTime,
              color: '#64748B',
              isIdle: true,
            });
            currentTime = unvisited.arrivalTime;
            readyQueue.push(unvisited);
            visited[unvisited.id] = true;
          } else {
            break;
          }
        }

        const curr = readyQueue.shift()!;
        const execTime = Math.min(q, remBurst[curr.id]);

        gantt.push({
          processName: curr.name,
          startTime: currentTime,
          endTime: currentTime + execTime,
          color: curr.color,
        });

        currentTime += execTime;
        totalBusyTime += execTime;
        remBurst[curr.id] -= execTime;

        // Check for new arrivals during this execution window
        sortedByArrival.forEach((p) => {
          if (p.arrivalTime <= currentTime && !visited[p.id] && remBurst[p.id] > 0) {
            readyQueue.push(p);
            visited[p.id] = true;
          }
        });

        if (remBurst[curr.id] > 0) {
          readyQueue.push(curr);
        } else {
          completed++;
          const ct = currentTime;
          const tat = ct - curr.arrivalTime;
          const wt = tat - curr.burstTime;
          resultMap[curr.id] = { ct, tat, wt };
        }
      }
    }

    // Priority Scheduling (Non-Preemptive, Lower number = Higher priority)
    else if (algorithm === 'PRIORITY') {
      let completed = 0;
      const isCompleted: Record<string, boolean> = {};

      while (completed < procs.length) {
        const available = procs.filter((p) => p.arrivalTime <= currentTime && !isCompleted[p.id]);

        if (available.length === 0) {
          const nextArrival = Math.min(...procs.filter((p) => !isCompleted[p.id]).map((p) => p.arrivalTime));
          gantt.push({
            processName: 'IDLE',
            startTime: currentTime,
            endTime: nextArrival,
            color: '#64748B',
            isIdle: true,
          });
          currentTime = nextArrival;
          continue;
        }

        // Sort by priority (lowest number first)
        available.sort((a, b) => a.priority - b.priority);
        const p = available[0];

        const start = currentTime;
        currentTime += p.burstTime;
        totalBusyTime += p.burstTime;

        gantt.push({
          processName: p.name,
          startTime: start,
          endTime: currentTime,
          color: p.color,
        });

        const ct = currentTime;
        const tat = ct - p.arrivalTime;
        const wt = tat - p.burstTime;
        resultMap[p.id] = { ct, tat, wt };

        isCompleted[p.id] = true;
        completed++;
      }
    }

    const calculatedResults: ProcessResult[] = processes.map((p) => ({
      ...p,
      completionTime: resultMap[p.id]?.ct || 0,
      turnaroundTime: resultMap[p.id]?.tat || 0,
      waitingTime: resultMap[p.id]?.wt || 0,
    }));

    const totalTAT = calculatedResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0);
    const totalWT = calculatedResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
    const finalTime = currentTime || 1;

    return {
      ganttChart: gantt,
      results: calculatedResults,
      avgTAT: Number((totalTAT / processes.length).toFixed(2)),
      avgWT: Number((totalWT / processes.length).toFixed(2)),
      cpuUtilization: Number(((totalBusyTime / finalTime) * 100).toFixed(1)),
    };
  }, [processes, algorithm, timeQuantum]);

  return (
    <div className="space-y-6">
      
      {/* Algorithm Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-gray-100 dark:bg-[#131B2C] rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'FCFS', label: 'First Come First Served (FCFS)' },
            { id: 'SJF_NP', label: 'SJF (Non-Preemptive)' },
            { id: 'SRTF', label: 'SRTF (Preemptive SJF)' },
            { id: 'RR', label: 'Round Robin' },
            { id: 'PRIORITY', label: 'Priority Scheduling' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAlgorithm(item.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                algorithm === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {algorithm === 'RR' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500">Time Quantum:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value)))}
              className="w-12 px-2 py-0.5 text-xs font-bold text-center bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Dynamic Gantt Chart Card */}
      <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Dynamic Execution Gantt Timeline
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Total Cycle: {ganttChart[ganttChart.length - 1]?.endTime || 0} Units
          </span>
        </div>

        {/* Gantt Timeline visualization */}
        <div className="relative pt-2 pb-6 overflow-x-auto">
          <div className="flex items-stretch min-w-[500px] h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg shadow-inner">
            {ganttChart.map((block, idx) => {
              const duration = block.endTime - block.startTime;
              const totalDuration = ganttChart[ganttChart.length - 1]?.endTime || 1;
              const widthPct = Math.max(8, (duration / totalDuration) * 100);

              return (
                <div
                  key={idx}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: block.isIdle ? '#334155' : block.color,
                  }}
                  className="relative flex items-center justify-center text-white font-bold text-xs group transition-all hover:brightness-110 cursor-pointer border-r border-black/20"
                >
                  <span>{block.processName}</span>
                  {/* Tooltip */}
                  <div className="absolute -top-9 hidden group-hover:flex items-center px-2 py-1 bg-gray-900 text-[10px] text-white rounded-md whitespace-nowrap z-20 shadow-md">
                    {block.processName} [{block.startTime} → {block.endTime}] ({duration}ms)
                  </div>
                  {/* Time Marker */}
                  <span className="absolute -bottom-6 left-0 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                    {block.startTime}
                  </span>
                  {idx === ganttChart.length - 1 && (
                    <span className="absolute -bottom-6 right-0 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                      {block.endTime}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 font-medium">Average Turnaround Time</p>
            <p className="text-lg font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              {avgTAT} <span className="text-xs font-normal">units</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 font-medium">Average Waiting Time</p>
            <p className="text-lg font-extrabold font-mono text-emerald-500 mt-0.5">
              {avgWT} <span className="text-xs font-normal">units</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 font-medium">CPU Utilization</p>
            <p className="text-lg font-extrabold font-mono text-purple-500 mt-0.5">
              {cpuUtilization}%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 font-medium">Total Processes</p>
            <p className="text-lg font-extrabold font-mono text-gray-900 dark:text-white mt-0.5">
              {processes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Process Table & Add Process Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Process Table (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Process Evaluation Matrix
            </h4>
            <button
              onClick={resetToDefault}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-semibold">
                  <th className="py-2.5 px-3">Process</th>
                  <th className="py-2.5 px-3">Arrival (AT)</th>
                  <th className="py-2.5 px-3">Burst (BT)</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Completion (CT)</th>
                  <th className="py-2.5 px-3">Turnaround (TAT)</th>
                  <th className="py-2.5 px-3">Waiting (WT)</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                {results.map((proc) => (
                  <tr key={proc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: proc.color }}
                      />
                      {proc.name}
                    </td>
                    <td className="py-2.5 px-3">{proc.arrivalTime}</td>
                    <td className="py-2.5 px-3">{proc.burstTime}</td>
                    <td className="py-2.5 px-3">{proc.priority}</td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-500">{proc.completionTime}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-500">{proc.turnaroundTime}</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-500">{proc.waitingTime}</td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => removeProcess(proc.id)}
                        className="p-1 text-gray-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Process Form (1 Column) */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Add New Process
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1">Process Name</label>
              <input
                type="text"
                value={newPid}
                onChange={(e) => setNewPid(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1">Arrival Time</label>
                <input
                  type="number"
                  min="0"
                  value={newAt}
                  onChange={(e) => setNewAt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1">Burst Time</label>
                <input
                  type="number"
                  min="1"
                  value={newBt}
                  onChange={(e) => setNewBt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1">
                Priority (Lower = Higher)
              </label>
              <input
                type="number"
                min="1"
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={addProcess}
              className="w-full mt-2"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Insert Process
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
