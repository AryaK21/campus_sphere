import React, { useState, useMemo } from 'react';
import { Network, Send, Play, CheckCircle, ArrowRight, Server, Wifi, Shield } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const NetworkVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subnet' | 'routing'>('subnet');

  // Subnet calculator states
  const [ipAddress, setIpAddress] = useState<string>('192.168.10.45');
  const [cidr, setCidr] = useState<number>(24);

  // Packet Routing simulation states
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [activeHop, setActiveHop] = useState<number>(-1);
  const [packetStatus, setPacketStatus] = useState<string>('Ready for packet transmission.');

  // Subnet Math Calculations
  const subnetDetails = useMemo(() => {
    try {
      const parts = ipAddress.split('.').map(Number);
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        return null;
      }

      // 32-bit IP integer
      const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];

      // Netmask
      const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
      const maskParts = [
        (maskInt >>> 24) & 255,
        (maskInt >>> 16) & 255,
        (maskInt >>> 8) & 255,
        maskInt & 255,
      ];

      // Wildcard
      const wildcardParts = maskParts.map((b) => 255 - b);

      // Network ID
      const networkInt = (ipInt & maskInt) >>> 0;
      const networkParts = [
        (networkInt >>> 24) & 255,
        (networkInt >>> 16) & 255,
        (networkInt >>> 8) & 255,
        networkInt & 255,
      ];

      // Broadcast
      const broadcastInt = (networkInt | ~maskInt) >>> 0;
      const broadcastParts = [
        (broadcastInt >>> 24) & 255,
        (broadcastInt >>> 16) & 255,
        (broadcastInt >>> 8) & 255,
        broadcastInt & 255,
      ];

      // Usable range
      const firstHost = [...networkParts];
      firstHost[3] += 1;
      const lastHost = [...broadcastParts];
      lastHost[3] -= 1;

      const totalHosts = Math.pow(2, 32 - cidr);
      const usableHosts = Math.max(0, totalHosts - 2);

      // Binary string
      const ipBin = parts.map((p) => p.toString(2).padStart(8, '0')).join('.');
      const maskBin = maskParts.map((p) => p.toString(2).padStart(8, '0')).join('.');

      // Class
      let ipClass = 'Class C';
      if (parts[0] <= 127) ipClass = 'Class A';
      else if (parts[0] <= 191) ipClass = 'Class B';
      else if (parts[0] <= 223) ipClass = 'Class C';
      else ipClass = 'Class D/E';

      return {
        ip: parts.join('.'),
        mask: maskParts.join('.'),
        wildcard: wildcardParts.join('.'),
        networkId: networkParts.join('.'),
        broadcast: broadcastParts.join('.'),
        firstUsable: firstHost.join('.'),
        lastUsable: lastHost.join('.'),
        usableHosts,
        totalHosts,
        ipBin,
        maskBin,
        ipClass,
      };
    } catch {
      return null;
    }
  }, [ipAddress, cidr]);

  // Run Packet Routing Simulation
  const runPacketTrace = async () => {
    setIsTransmitting(true);
    const steps = [
      'Encapsulating TCP packet at Host A (192.168.1.10)...',
      'Forwarded to Campus Gateway Switch (L2 Switching)...',
      'Routing through Core Autonomous System Router (BGP / OSPF lookup)...',
      'Transiting Tier-1 Internet Exchange Backbone...',
      'Received at Cloud Data Center Firewall & Server B (203.0.113.195)!',
    ];

    for (let i = 0; i < 5; i++) {
      setActiveHop(i);
      setPacketStatus(steps[i]);
      await new Promise((r) => setTimeout(r, 700));
    }

    setIsTransmitting(false);
  };

  const routers = [
    { name: 'Host Client A', ip: '192.168.1.10', icon: Wifi, type: 'source' },
    { name: 'Gateway Switch', ip: '192.168.1.1', icon: Network, type: 'switch' },
    { name: 'Core Router R1', ip: '10.0.4.1', icon: Shield, type: 'router' },
    { name: 'Backbone Transit', ip: '172.16.0.2', icon: Network, type: 'transit' },
    { name: 'Target Server B', ip: '203.0.113.195', icon: Server, type: 'dest' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab bar */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-[#131B2C] rounded-2xl border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('subnet')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'subnet'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          CIDR Subnet Calculator & Address Parser
        </button>
        <button
          onClick={() => setActiveTab('routing')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'routing'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Visual Hop-by-Hop Packet Routing
        </button>
      </div>

      {activeTab === 'subnet' ? (
        <div className="space-y-6">
          
          {/* Input Controls */}
          <div className="glass-card rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  IPv4 Host Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  <span>CIDR Prefix: /{cidr}</span>
                  <span className="font-mono text-indigo-500">{subnetDetails?.mask}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="30"
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>/8 (Class A)</span>
                  <span>/16 (Class B)</span>
                  <span>/24 (Class C)</span>
                  <span>/30 (PtP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {subnetDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl glass-card">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Network Address (NetID)</p>
                  <p className="text-lg font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                    {subnetDetails.networkId}
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-card">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Broadcast Address</p>
                  <p className="text-lg font-extrabold font-mono text-rose-500 mt-1">
                    {subnetDetails.broadcast}
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-card">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Usable Host Capacity</p>
                  <p className="text-lg font-extrabold font-mono text-emerald-500 mt-1">
                    {subnetDetails.usableHosts.toLocaleString()} <span className="text-xs font-normal">usable IPs</span>
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown Card */}
              <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Comprehensive Subnet Breakdown
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-sans">Usable Host IP Range</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {subnetDetails.firstUsable} → {subnetDetails.lastUsable}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-sans">Wildcard Mask</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {subnetDetails.wildcard}
                    </span>
                  </div>
                </div>

                {/* Binary breakdown */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 font-mono text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-gray-400">IP in Binary:</span>
                    <span className="text-indigo-400 font-bold">{subnetDetails.ipBin}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-gray-400">Mask in Binary:</span>
                    <span className="text-emerald-400 font-bold">{subnetDetails.maskBin}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Packet Routing Simulation */
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Autonomous System Packet Transit Engine
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Simulate IP packet travel across network interfaces using SPF route calculation.
              </p>
            </div>
            <Button
              variant="gradient"
              size="md"
              onClick={runPacketTrace}
              disabled={isTransmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {isTransmitting ? 'Transmitting...' : 'Send Packet'}
            </Button>
          </div>

          {/* Hop progression node display */}
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
              {routers.map((node, index) => {
                const Icon = node.icon;
                const isActive = activeHop === index;
                const isPassed = activeHop > index;

                return (
                  <React.Fragment key={node.name}>
                    <div className="flex flex-col items-center text-center z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                          isActive
                            ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/40 shadow-indigo-600/50'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-dark-surface text-gray-400 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white mt-2">
                        {node.name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {node.ip}
                      </span>
                    </div>

                    {index < routers.length - 1 && (
                      <div className="hidden md:flex flex-1 items-center justify-center">
                        <div
                          className={`h-1 w-full rounded transition-colors duration-300 ${
                            isPassed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <p className="text-xs font-mono text-indigo-950 dark:text-indigo-200">
              {packetStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
