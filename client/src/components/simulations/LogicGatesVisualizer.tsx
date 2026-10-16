import React, { useState, useMemo } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Cpu, Table, Check, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';

type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export const LogicGatesVisualizer: React.FC = () => {
  const [gate, setGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);
  const [circuitMode, setCircuitMode] = useState<'single' | 'halfAdder'>('single');

  // Single Gate evaluation
  const output = useMemo(() => {
    switch (gate) {
      case 'AND':
        return inputA && inputB;
      case 'OR':
        return inputA || inputB;
      case 'NOT':
        return !inputA;
      case 'NAND':
        return !(inputA && inputB);
      case 'NOR':
        return !(inputA || inputB);
      case 'XOR':
        return inputA !== inputB;
      case 'XNOR':
        return inputA === inputB;
    }
  }, [gate, inputA, inputB]);

  // Half Adder evaluation
  const halfAdderSum = inputA !== inputB;
  const halfAdderCarry = inputA && inputB;

  // Truth Table Generator
  const truthTable = useMemo(() => {
    if (gate === 'NOT') {
      return [
        { a: false, b: false, out: true },
        { a: true, b: false, out: false },
      ];
    }

    const rows = [
      { a: false, b: false },
      { a: false, b: true },
      { a: true, b: false },
      { a: true, b: true },
    ];

    return rows.map((r) => {
      let out = false;
      if (gate === 'AND') out = r.a && r.b;
      if (gate === 'OR') out = r.a || r.b;
      if (gate === 'NAND') out = !(r.a && r.b);
      if (gate === 'NOR') out = !(r.a || r.b);
      if (gate === 'XOR') out = r.a !== r.b;
      if (gate === 'XNOR') out = r.a === r.b;
      return { ...r, out };
    });
  }, [gate]);

  const getExpression = () => {
    switch (gate) {
      case 'AND':
        return 'Y = A • B';
      case 'OR':
        return 'Y = A + B';
      case 'NOT':
        return "Y = A'";
      case 'NAND':
        return "Y = (A • B)'";
      case 'NOR':
        return "Y = (A + B)'";
      case 'XOR':
        return 'Y = A ⊕ B';
      case 'XNOR':
        return 'Y = (A ⊕ B)';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-gray-100 dark:bg-[#131B2C] rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCircuitMode('single')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              circuitMode === 'single'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Individual Logic Gate
          </button>
          <button
            onClick={() => setCircuitMode('halfAdder')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              circuitMode === 'halfAdder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Combinational: Half Adder (XOR + AND)
          </button>
        </div>

        {circuitMode === 'single' && (
          <div className="flex flex-wrap items-center gap-1">
            {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as GateType[]).map((g) => (
              <button
                key={g}
                onClick={() => setGate(g)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  gate === g
                    ? 'bg-white dark:bg-dark-surface text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Circuit Canvas */}
      {circuitMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Circuit Playground (2 Cols) */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 flex flex-col justify-between min-h-[380px] shadow-sm relative overflow-hidden">
            
            {/* Expression Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-indigo-500 tracking-wider">
                  Logic Gate Simulator
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {gate} Gate Implementation
                </h3>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                {getExpression()}
              </div>
            </div>

            {/* Circuit Wire & Gate Diagram */}
            <div className="my-8 flex items-center justify-center gap-4 sm:gap-8">
              
              {/* Inputs Column */}
              <div className="flex flex-col gap-8">
                {/* Input A */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInputA(!inputA)}
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md active:scale-95 ${
                      inputA
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-sans">Input A</span>
                    <span className="text-lg">{inputA ? '1' : '0'}</span>
                  </button>
                  <div
                    className={`h-1.5 w-12 sm:w-16 rounded transition-all ${
                      inputA
                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                </div>

                {/* Input B (Hidden for NOT gate) */}
                {gate !== 'NOT' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInputB(!inputB)}
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md active:scale-95 ${
                        inputB
                          ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-sans">Input B</span>
                      <span className="text-lg">{inputB ? '1' : '0'}</span>
                    </button>
                    <div
                      className={`h-1.5 w-12 sm:w-16 rounded transition-all ${
                        inputB
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Gate Node */}
              <div className="relative px-8 py-10 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 flex flex-col items-center justify-center min-w-[120px]">
                <Cpu className="w-8 h-8 mb-1" />
                <span>{gate}</span>
                <span className="text-[10px] font-mono opacity-80 mt-1">TTL Logic</span>
              </div>

              {/* Output Column */}
              <div className="flex items-center gap-3">
                <div
                  className={`h-1.5 w-12 sm:w-16 rounded transition-all ${
                    output
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold transition-all shadow-lg ring-4 ${
                    output
                      ? 'bg-emerald-500 text-white ring-emerald-500/30 shadow-emerald-500/40'
                      : 'bg-rose-500 text-white ring-rose-500/30 shadow-rose-500/40'
                  }`}
                >
                  <span className="text-[10px] uppercase font-sans">Output Y</span>
                  <span className="text-xl">{output ? '1 (HIGH)' : '0 (LOW)'}</span>
                </div>
              </div>

            </div>

            <div className="text-center text-xs text-gray-400">
              💡 Click on Input buttons to toggle binary state (HIGH 1 / LOW 0)
            </div>
          </div>

          {/* Real-time Truth Table (1 Col) */}
          <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Truth Table Specification
              </h4>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#131B2C] text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-800">
                    <th className="py-2.5 px-3">A</th>
                    {gate !== 'NOT' && <th className="py-2.5 px-3">B</th>}
                    <th className="py-2.5 px-3">Output (Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {truthTable.map((row, idx) => {
                    const isCurrent =
                      gate === 'NOT'
                        ? row.a === inputA
                        : row.a === inputA && row.b === inputB;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-indigo-500/15 font-bold text-indigo-600 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <td className="py-2 px-3">{row.a ? '1' : '0'}</td>
                        {gate !== 'NOT' && <td className="py-2 px-3">{row.b ? '1' : '0'}</td>}
                        <td className="py-2 px-3 font-extrabold">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              row.out
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {row.out ? '1' : '0'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              The currently active state row is highlighted in indigo in real time.
            </p>
          </div>

        </div>
      ) : (
        /* Half Adder Interactive Combinational Circuit */
        <div className="glass-card rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-purple-500 tracking-wider">
                Combinational Logic Simulator
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                1-Bit Half Adder Architecture
              </h3>
            </div>
            <Badge variant="purple">Sum = A ⊕ B | Carry = A • B</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Input Switches */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-bold">Input Bit A:</span>
                <button
                  onClick={() => setInputA(!inputA)}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-white transition-all ${
                    inputA ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-700'
                  }`}
                >
                  {inputA ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-bold">Input Bit B:</span>
                <button
                  onClick={() => setInputB(!inputB)}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-white transition-all ${
                    inputB ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-700'
                  }`}
                >
                  {inputB ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>
            </div>

            {/* Arithmetic Formula Display */}
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
              <p className="text-xs text-gray-500 uppercase font-bold">Binary Addition</p>
              <div className="text-3xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {inputA ? '1' : '0'} + {inputB ? '1' : '0'} = {halfAdderCarry ? '1' : '0'}{halfAdderSum ? '1' : '0'}{' '}
                <span className="text-sm font-normal font-sans">
                  (Base 10: {(inputA ? 1 : 0) + (inputB ? 1 : 0)})
                </span>
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  SUM (S = A ⊕ B):
                </span>
                <span className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {halfAdderSum ? '1' : '0'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  CARRY (C = A • B):
                </span>
                <span className="text-xl font-mono font-extrabold text-purple-600 dark:text-purple-400">
                  {halfAdderCarry ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
