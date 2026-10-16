import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, BarChart2, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

type Algorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';

interface ArrayBar {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const DSASortingVisualizer: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
  const [arraySize, setArraySize] = useState<number>(20);
  const [speed, setSpeed] = useState<number>(50); // delay in ms
  const [bars, setBars] = useState<ArrayBar[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [currentStepInfo, setCurrentStepInfo] = useState<string>('Ready to visualize.');

  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;

  // Generate random array
  const generateNewArray = (size = arraySize) => {
    setIsRunning(false);
    setIsSorted(false);
    setComparisons(0);
    setSwaps(0);
    setCurrentStepInfo('Initialized new randomized array.');

    const newBars: ArrayBar[] = [];
    for (let i = 0; i < size; i++) {
      newBars.push({
        value: Math.floor(Math.random() * 85) + 15,
        state: 'default',
      });
    }
    setBars(newBars);
  };

  useEffect(() => {
    generateNewArray(arraySize);
  }, [arraySize]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Bubble Sort
  const runBubbleSort = async () => {
    const arr = [...bars];
    const n = arr.length;
    let comp = 0;
    let sw = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunningRef.current) return;

        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        setBars([...arr]);
        comp++;
        setComparisons(comp);
        setCurrentStepInfo(`Comparing index ${j} (${arr[j].value}) with index ${j + 1} (${arr[j + 1].value})`);
        await sleep(speed);

        if (arr[j].value > arr[j + 1].value) {
          arr[j].state = 'swapping';
          arr[j + 1].state = 'swapping';
          setBars([...arr]);
          await sleep(speed);

          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          sw++;
          setSwaps(sw);
          setCurrentStepInfo(`Swapped index ${j} and ${j + 1} since ${arr[j + 1].value} < ${arr[j].value}`);
          setBars([...arr]);
          await sleep(speed);
        }

        arr[j].state = 'default';
        arr[j + 1].state = 'default';
      }
      arr[n - i - 1].state = 'sorted';
      setBars([...arr]);
    }
    arr[0].state = 'sorted';
    setBars([...arr]);
    setIsSorted(true);
    setIsRunning(false);
    setCurrentStepInfo('Array successfully sorted via Bubble Sort!');
  };

  // Selection Sort
  const runSelectionSort = async () => {
    const arr = [...bars];
    const n = arr.length;
    let comp = 0;
    let sw = 0;

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      arr[i].state = 'pivot';
      setBars([...arr]);

      for (let j = i + 1; j < n; j++) {
        if (!isRunningRef.current) return;
        arr[j].state = 'comparing';
        setBars([...arr]);
        comp++;
        setComparisons(comp);
        await sleep(speed);

        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].state = 'default';
          minIdx = j;
          arr[minIdx].state = 'swapping';
          setCurrentStepInfo(`New minimum found: value ${arr[minIdx].value} at index ${minIdx}`);
        } else {
          arr[j].state = 'default';
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        sw++;
        setSwaps(sw);
        setCurrentStepInfo(`Placed minimum ${arr[i].value} at sorted position ${i}`);
      }

      arr[i].state = 'sorted';
      if (minIdx !== i) arr[minIdx].state = 'default';
      setBars([...arr]);
      await sleep(speed);
    }

    setIsSorted(true);
    setIsRunning(false);
    setCurrentStepInfo('Array successfully sorted via Selection Sort!');
  };

  // Insertion Sort
  const runInsertionSort = async () => {
    const arr = [...bars];
    const n = arr.length;
    let comp = 0;
    let sw = 0;

    arr[0].state = 'sorted';
    for (let i = 1; i < n; i++) {
      if (!isRunningRef.current) return;
      const key = arr[i];
      let j = i - 1;
      key.state = 'pivot';
      setBars([...arr]);
      setCurrentStepInfo(`Inserting key value ${key.value} into sorted subarray`);
      await sleep(speed);

      while (j >= 0 && arr[j].value > key.value) {
        if (!isRunningRef.current) return;
        comp++;
        setComparisons(comp);
        arr[j].state = 'comparing';
        setBars([...arr]);
        await sleep(speed);

        arr[j + 1] = arr[j];
        sw++;
        setSwaps(sw);
        j--;
        setBars([...arr]);
        await sleep(speed);
      }
      arr[j + 1] = key;
      key.state = 'sorted';
      setBars([...arr]);
    }

    for (let i = 0; i < n; i++) arr[i].state = 'sorted';
    setBars([...arr]);
    setIsSorted(true);
    setIsRunning(false);
    setCurrentStepInfo('Array successfully sorted via Insertion Sort!');
  };

  // Quick Sort
  const runQuickSort = async () => {
    const arr = [...bars];
    let comp = 0;
    let sw = 0;

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high];
      pivot.state = 'pivot';
      let i = low - 1;

      for (let j = low; j < high; j++) {
        if (!isRunningRef.current) return -1;
        arr[j].state = 'comparing';
        setBars([...arr]);
        comp++;
        setComparisons(comp);
        await sleep(speed);

        if (arr[j].value < pivot.value) {
          i++;
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          sw++;
          setSwaps(sw);
          setBars([...arr]);
        }
        arr[j].state = 'default';
      }

      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      sw++;
      setSwaps(sw);
      arr[i + 1].state = 'sorted';
      setBars([...arr]);
      await sleep(speed);

      return i + 1;
    };

    const quickSortHelper = async (low: number, high: number) => {
      if (low < high && isRunningRef.current) {
        const pi = await partition(low, high);
        if (pi === -1) return;
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
      } else if (low >= 0 && high >= 0 && low < arr.length && high < arr.length) {
        arr[low].state = 'sorted';
        setBars([...arr]);
      }
    };

    await quickSortHelper(0, arr.length - 1);
    for (let i = 0; i < arr.length; i++) arr[i].state = 'sorted';
    setBars([...arr]);
    setIsSorted(true);
    setIsRunning(false);
    setCurrentStepInfo('Array successfully sorted via Quick Sort!');
  };

  const handleStart = async () => {
    if (isSorted) generateNewArray(arraySize);
    setIsRunning(true);
    isRunningRef.current = true;

    if (algorithm === 'bubble') await runBubbleSort();
    else if (algorithm === 'selection') await runSelectionSort();
    else if (algorithm === 'insertion') await runInsertionSort();
    else if (algorithm === 'quick') await runQuickSort();
  };

  const handlePause = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentStepInfo('Visualization paused.');
  };

  const getComplexityDetails = () => {
    switch (algorithm) {
      case 'bubble':
        return { timeBest: 'O(N)', timeAvg: 'O(N²)', timeWorst: 'O(N²)', space: 'O(1)', stable: 'Yes' };
      case 'selection':
        return { timeBest: 'O(N²)', timeAvg: 'O(N²)', timeWorst: 'O(N²)', space: 'O(1)', stable: 'No' };
      case 'insertion':
        return { timeBest: 'O(N)', timeAvg: 'O(N²)', timeWorst: 'O(N²)', space: 'O(1)', stable: 'Yes' };
      case 'quick':
        return { timeBest: 'O(N log N)', timeAvg: 'O(N log N)', timeWorst: 'O(N²)', space: 'O(log N)', stable: 'No' };
      case 'merge':
        return { timeBest: 'O(N log N)', timeAvg: 'O(N log N)', timeWorst: 'O(N log N)', space: 'O(N)', stable: 'Yes' };
    }
  };

  const complexity = getComplexityDetails();

  const getBarColor = (state: ArrayBar['state']) => {
    switch (state) {
      case 'comparing':
        return 'bg-amber-400 dark:bg-amber-400 shadow-amber-500/50';
      case 'swapping':
        return 'bg-rose-500 dark:bg-rose-500 shadow-rose-500/50';
      case 'sorted':
        return 'bg-emerald-500 dark:bg-emerald-400 shadow-emerald-500/50';
      case 'pivot':
        return 'bg-purple-500 dark:bg-purple-400 shadow-purple-500/50';
      default:
        return 'bg-indigo-600 dark:bg-indigo-500 shadow-indigo-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 dark:bg-[#131B2C] rounded-2xl border border-gray-200 dark:border-gray-800">
        {(['bubble', 'selection', 'insertion', 'quick'] as Algorithm[]).map((algo) => (
          <button
            key={algo}
            onClick={() => {
              if (!isRunning) {
                setAlgorithm(algo);
                generateNewArray();
              }
            }}
            disabled={isRunning}
            className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
              algorithm === algo
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {algo} Sort
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {!isRunning ? (
              <Button
                variant="gradient"
                size="md"
                onClick={handleStart}
                leftIcon={<Play className="w-4 h-4" />}
              >
                {isSorted ? 'Re-run' : 'Start Sort'}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                onClick={handlePause}
                leftIcon={<Pause className="w-4 h-4" />}
              >
                Pause
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => generateNewArray()}
              disabled={isRunning}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Randomize
            </Button>
          </div>

          {/* Sliders: Array Size & Speed */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                <span>Array Size: {arraySize}</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={arraySize}
                disabled={isRunning}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                <span>Speed: {105 - speed}ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={105 - speed}
                onChange={(e) => setSpeed(105 - Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Live Metrics */}
          <div className="flex items-center justify-between md:justify-end gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800">
              <span className="text-gray-400">Comparisons:</span>{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{comparisons}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800">
              <span className="text-gray-400">Swaps:</span>{' '}
              <span className="font-bold text-rose-500">{swaps}</span>
            </div>
          </div>

        </div>

        {/* State Banner */}
        <div className="px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
          <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200 font-mono">
            ⚡ {currentStepInfo}
          </p>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-amber-500"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Comparing</span>
            <span className="flex items-center gap-1 text-rose-500"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Swap</span>
            <span className="flex items-center gap-1 text-purple-500"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Pivot</span>
            <span className="flex items-center gap-1 text-emerald-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Sorted</span>
          </div>
        </div>
      </div>

      {/* Array Bars Visualization Canvas */}
      <div className="glass-card rounded-2xl p-6 min-h-[320px] flex items-end justify-center gap-1 sm:gap-2 shadow-inner">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {bar.value}
            </span>
            <div
              style={{ height: `${bar.value * 2.8}px` }}
              className={`w-full rounded-t-md transition-all duration-75 shadow-sm ${getBarColor(bar.state)}`}
            />
            <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 mt-1">
              {index}
            </span>
          </div>
        ))}
      </div>

      {/* Complexity Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl glass-card text-center">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Best Time</p>
          <p className="text-sm font-bold font-mono text-emerald-500 mt-0.5">{complexity.timeBest}</p>
        </div>
        <div className="p-3.5 rounded-xl glass-card text-center">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Average Time</p>
          <p className="text-sm font-bold font-mono text-indigo-500 mt-0.5">{complexity.timeAvg}</p>
        </div>
        <div className="p-3.5 rounded-xl glass-card text-center">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Worst Time</p>
          <p className="text-sm font-bold font-mono text-rose-500 mt-0.5">{complexity.timeWorst}</p>
        </div>
        <div className="p-3.5 rounded-xl glass-card text-center">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Space Complexity</p>
          <p className="text-sm font-bold font-mono text-purple-500 mt-0.5">{complexity.space}</p>
        </div>
        <div className="p-3.5 rounded-xl glass-card text-center col-span-2 md:col-span-1">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Stable Sort?</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{complexity.stable}</p>
        </div>
      </div>
    </div>
  );
};
