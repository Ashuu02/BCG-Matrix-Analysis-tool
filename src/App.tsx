/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  HandCoins, 
  CircleHelp, 
  Skull,
  LayoutGrid,
  Info,
  ChevronRight,
  BarChart3,
  Upload,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

interface ProductData {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  competitorMarketShare: number;
  marketGrowth: number;
}

interface AnalysisResult extends ProductData {
  rms: number;
  category: 'Star' | 'Cash Cow' | 'Question Mark' | 'Dog';
  recommendation: string;
}

const CATEGORIES = {
  Star: {
    icon: Star,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    recommendation: 'Invest for growth. Maintain market leadership and capitalize on high growth.'
  },
  'Cash Cow': {
    icon: HandCoins,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    recommendation: 'Harvest cash. Minimize investment and use profits to fund other business units.'
  },
  'Question Mark': {
    icon: CircleHelp,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    recommendation: 'Decide to Build or Divest. Assess if the product can become a Star.'
  },
  Dog: {
    icon: Skull,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    recommendation: 'Candidate for SKU Rationalization. Divest or liquidate non-profitable products.'
  }
};

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<ProductData[]>([
    { id: '1', name: 'Premium Bypass Pruner', revenue: 1200000, marketShare: 35, competitorMarketShare: 25, marketGrowth: 15 },
    { id: '2', name: 'Classic Orange-handled Scissors', revenue: 5000000, marketShare: 60, competitorMarketShare: 20, marketGrowth: 3 },
    { id: '3', name: 'X-Series Axe', revenue: 600000, marketShare: 15, competitorMarketShare: 40, marketGrowth: 12 },
    { id: '4', name: 'Standard Trowel', revenue: 300000, marketShare: 10, competitorMarketShare: 30, marketGrowth: 5 }
  ]);

  const addProduct = () => {
    const newProduct: ProductData = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      revenue: 0,
      marketShare: 0,
      competitorMarketShare: 1,
      marketGrowth: 0
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductData, value: string | number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedProducts: ProductData[] = results.data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: row['SKU Identification'] || 'Untitled SKU',
          revenue: parseFloat(row['Revenue']) || 0,
          marketShare: parseFloat(row['Market Share (%)']) || 0,
          competitorMarketShare: parseFloat(row["Top Comp's Market Share (%)"]) || 1,
          marketGrowth: parseFloat(row['Market Growth Rate (%)']) || 0
        }));
        setProducts(importedProducts);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        alert('Error parsing CSV. Please check the format.');
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analysis = useMemo((): AnalysisResult[] => {
    return products.map(p => {
      const rms = p.marketShare / (p.competitorMarketShare || 1);
      const mgr = p.marketGrowth;
      
      let category: AnalysisResult['category'];
      if (rms >= 1.0) {
        category = mgr >= 10 ? 'Star' : 'Cash Cow';
      } else {
        category = mgr >= 10 ? 'Question Mark' : 'Dog';
      }

      return {
        ...p,
        rms,
        category,
        recommendation: CATEGORIES[category].recommendation
      };
    });
  }, [products]);

  const downloadCSV = () => {
    const headers = ['SKU Identification', 'Revenue', 'Market Share (%)', "Top Comp's Market Share (%)", 'Market Growth Rate (%)', 'RMS', 'Category'];
    const rows = analysis.map(a => [
      a.name,
      a.revenue,
      a.marketShare,
      a.competitorMarketShare,
      a.marketGrowth,
      a.rms.toFixed(2),
      a.category
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "fiskars_portfolio_analysis.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stableAssetId = useMemo(() => Math.random().toString(36).substr(7).toUpperCase(), []);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200 p-6 md:p-10 flex flex-col">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-10 bg-orange-600"></div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Fiskars Strategic Portfolio</h1>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] ml-7">BCG Matrix Analysis</p>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-4">
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-2 border-slate-900 text-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button 
              onClick={downloadCSV}
              className="bg-slate-900 text-white px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]"
            >
              <Download className="w-4 h-4 text-orange-500" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10 flex-1">
        {/* Left Column: Data Input & Inventory */}
        <section className="col-span-12 lg:col-span-5 space-y-10 order-1">
          <div className="bg-white border-2 border-slate-900 p-1 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="bg-slate-900 text-white p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest shrink-0">Product Line Inventory</h2>
                </div>
              </div>
              
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="SEARCH SKU BY NAME..." 
                  className="w-full bg-slate-800 border-none text-xs font-bold pl-10 pr-4 py-2 focus:ring-1 focus:ring-orange-500 placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-black border-b-2 border-slate-900">
                    <th className="px-4 py-4 uppercase tracking-widest">SKU Identification</th>
                    <th className="px-4 py-4 uppercase tracking-widest text-orange-600">Revenue</th>
                    <th className="px-4 py-4 uppercase tracking-widest">Market Share (%)</th>
                    <th className="px-4 py-4 uppercase tracking-widest">Top Comp Mkt Share (%)</th>
                    <th className="px-4 py-4 uppercase tracking-widest">Mkt Growth Rate (%)</th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((p) => (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`transition-all duration-300 ${selectedProductId === p.id ? 'bg-orange-50 ring-2 ring-orange-500 ring-inset' : 'hover:bg-orange-50/30'}`}
                        id={`row-${p.id}`}
                      >
                        <td className="px-4 py-4">
                          <input 
                            type="text" 
                            className="w-full min-w-[150px] bg-transparent border-none focus:ring-0 font-bold text-slate-900 placeholder:text-slate-200" 
                            placeholder="PRODUCT_NAME"
                            value={p.name}
                            onChange={(e) => updateProduct(p.id, 'name', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4 font-mono font-black text-orange-600">
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none focus:ring-0" 
                            value={p.revenue}
                            onChange={(e) => updateProduct(p.id, 'revenue', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4 font-mono font-bold">
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none focus:ring-0" 
                            value={p.marketShare}
                            onChange={(e) => updateProduct(p.id, 'marketShare', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4 font-mono">
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none focus:ring-0" 
                            value={p.competitorMarketShare}
                            onChange={(e) => updateProduct(p.id, 'competitorMarketShare', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-600">
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none focus:ring-0" 
                            value={p.marketGrowth}
                            onChange={(e) => updateProduct(p.id, 'marketGrowth', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => removeProduct(p.id)}
                            className="text-slate-200 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t-2 border-slate-900 flex justify-center bg-slate-50">
              <button 
                onClick={addProduct}
                className="bg-slate-900 hover:bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]"
              >
                <Plus className="w-4 h-4 text-orange-500" />
                Add Another SKU
              </button>
            </div>
          </div>
        </section>

        {/* Matrix Visualization */}
        <section className="col-span-12 lg:col-span-7 flex flex-col order-2">
          <div className="relative flex-1 bg-white border-2 border-slate-900 min-h-[500px]">
             
             {/* Colored Quadrants Background */}
             <div className="absolute inset-0 flex flex-wrap overflow-hidden">
                <div className="w-1/2 h-1/2 bg-yellow-50/40 border-r-2 border-b-2 border-slate-900/10 flex items-center justify-center relative transition-colors hover:bg-yellow-100/40">
                   <div className="absolute top-4 left-4 text-[12px] font-black text-yellow-700 uppercase tracking-[0.3em] bg-white/80 px-3 py-1 border-2 border-yellow-200">Stars</div>
                   <div className="absolute top-12 left-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60">High Growth / High Share</div>
                </div>
                <div className="w-1/2 h-1/2 bg-blue-50/40 border-b-2 border-slate-900/10 flex items-center justify-center relative transition-colors hover:bg-blue-100/40">
                   <div className="absolute top-4 right-4 text-[12px] font-black text-blue-700 uppercase tracking-[0.3em] bg-white/80 px-3 py-1 border-2 border-blue-200">Question Marks</div>
                   <div className="absolute top-12 right-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60 text-right">High Growth / Low Share</div>
                </div>
                <div className="w-1/2 h-1/2 bg-green-50/40 border-r-2 border-slate-900/10 flex items-center justify-center relative transition-colors hover:bg-green-100/40">
                   <div className="absolute bottom-4 left-4 text-[12px] font-black text-green-700 uppercase tracking-[0.3em] bg-white/80 px-3 py-1 border-2 border-green-200">Cash Cows</div>
                   <div className="absolute bottom-12 left-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Low Growth / High Share</div>
                </div>
                <div className="w-1/2 h-1/2 bg-red-50/40 flex items-center justify-center relative transition-colors hover:bg-red-100/40">
                   <div className="absolute bottom-4 right-4 text-[12px] font-black text-red-700 uppercase tracking-[0.3em] bg-white/80 px-3 py-1 border-2 border-red-200">Dogs</div>
                   <div className="absolute bottom-12 right-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60 text-right">Low Growth / Low Share</div>
                </div>
             </div>

             {/* Axis Labels */}
             <div className="absolute -left-6 top-1/2 -rotate-90 origin-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap z-30">Market Growth Rate (%)</div>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap z-30">Relative Market Share (RMS)</div>

             {/* Grid Lines Overlay */}
             <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-900/20 z-10"></div>
             <div className="absolute left-1/2 top-0 h-full w-[2px] bg-slate-900/20 z-10"></div>

             {/* PLOTTED CONTENT */}
             <div className="relative w-full h-full p-20 z-40">
                {analysis.map((p, i) => {
                  const x = 50 - (Math.min(Math.max(p.rms - 1, -1), 4) / 4) * 50;
                  const y = 100 - (Math.min(Math.max(p.marketGrowth, 0), 20) / 20) * 100;
                  const cat = CATEGORIES[p.category];

                  // Tooltip positioning logic
                  const isTop = y < 30;
                  const isLeft = x < 25;
                  const isRight = x > 75;

                  let tooltipClasses = isTop ? 'top-full mt-4' : 'bottom-full mb-4';
                  let arrowClasses = isTop 
                    ? 'bottom-full mb-[-2px] border-b-orange-600 border-t-transparent' 
                    : 'top-full mt-[-2px] border-t-orange-600 border-b-transparent';
                  
                  if (isLeft) {
                    tooltipClasses += ' left-0 translate-x-0';
                  } else if (isRight) {
                    tooltipClasses += ' right-0 translate-x-0';
                  } else {
                    tooltipClasses += ' left-1/2 -translate-x-1/2';
                  }

                  return (
                    <motion.div 
                      key={p.id}
                      className={`absolute ${selectedProductId === p.id ? 'z-[100]' : 'z-20'} group cursor-pointer`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: selectedProductId === p.id ? 1.2 : 1, 
                        opacity: 1 
                      }}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        document.getElementById(`row-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      transition={{ type: 'spring', damping: 15, delay: i * 0.05 }}
                    >
                      <div className="relative -translate-x-1/2 -translate-y-1/2">
                        <div className={`bg-white border-2 border-slate-900 p-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${selectedProductId === p.id ? 'border-orange-600 shadow-[6px_6px_0px_0px_rgba(234,88,12,1)]' : 'group-hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)]'} transition-all min-w-[120px]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <cat.icon className={`w-3 h-3 ${cat.color}`} />
                            <span className="text-[10px] font-black uppercase truncate max-w-[100px]">{p.name || 'SKU_EMPTY'}</span>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-100 pt-1">
                             <div className="text-[8px] font-bold text-slate-400">RMS: <span className="text-slate-900">{p.rms.toFixed(2)}x</span></div>
                             <div className="text-[8px] font-bold text-slate-400">MGR: <span className="text-slate-900">{p.marketGrowth}%</span></div>
                          </div>
                        </div>
                        
                        {/* Full Details Tooltip */}
                        <div className={`absolute ${tooltipClasses} ${selectedProductId === p.id ? 'block' : 'hidden group-hover:block'} transition-opacity pointer-events-none z-[100]`}>
                          <div className="bg-slate-900 text-white p-3 border-2 border-orange-600 shadow-2xl min-w-[200px]">
                            <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 border-b border-slate-700 pb-1 italic">SKU Detailed Analysis</div>
                            <div className="space-y-1 mt-2">
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">NAME:</span> <span>{p.name.toUpperCase()}</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">QUADRANT:</span> <span className={cat.color}>{p.category.toUpperCase()}S</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">REVENUE:</span> <span>${p.revenue.toLocaleString()}</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">REL_SHARE:</span> <span>{p.rms.toFixed(2)}X</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">MKT_GROWTH:</span> <span>{p.marketGrowth}%</span></div>
                            </div>
                          </div>
                          <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${arrowClasses} ${isLeft ? 'ml-4' : isRight ? 'mr-4 ml-auto' : 'mx-auto'}`} />
                        </div>

                        <div className={`absolute -top-1 -right-1 w-2 h-2 bg-orange-600 rounded-full animate-pulse ${selectedProductId === p.id ? 'block' : 'hidden group-hover:block'}`} />
                      </div>
                    </motion.div>
                  );
                })}
             </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Portfolio SKUs</div>
              <div className="text-2xl font-black">{products.length}</div>
            </div>
            <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Star Ratio</div>
              <div className="text-2xl font-black text-orange-600">
                {((analysis.filter(a => a.category === 'Star').length / (products.length || 1)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Avg. Growth</div>
              <div className="text-2xl font-black">
                {(products.reduce((acc, p) => acc + p.marketGrowth, 0) / (products.length || 1)).toFixed(1)}%
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-12 space-y-10 order-3">
          <div className="flex flex-col gap-4">
          </div>
        </section>
      </div>

      <footer className="mt-16 pt-6 border-t-2 border-slate-200 text-[10px] text-slate-400 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="font-bold uppercase tracking-widest italic flex items-center gap-2">
          <Info className="w-3 h-3" />
          Confidential Strategic Resource • Fiskars Global Portfolio Management
        </div>
        <div className="font-mono flex items-center gap-4">
        </div>
      </footer>
    </div>
  );
}
