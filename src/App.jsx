import React, { useState, useEffect, useMemo } from 'react';
import { fetchSalesData } from './services/dataService';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Search,
  Calendar,
  Filter,
  X,
  PieChart as PieChartIcon,
  Zap,
  Star,
  Target,
  Clock,
  Sparkles,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Brain
} from 'lucide-react';
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const KPICard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="kpi-card group cursor-default">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
      <div className={cn("p-2 rounded-xl transition-colors", color)}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1">
      {trend === 'up' ? (
        <TrendingUp size={16} className="text-accent" />
      ) : (
        <BarChart3 size={16} className="text-red-500" />
      )}
      <span className={cn(
        "text-xs font-semibold",
        trend === 'up' ? "text-accent" : "text-red-500"
      )}>
        {trendValue}
      </span>
      <span className="text-xs text-gray-400">period total</span>
    </div>
  </div>
);

const InsightCard = ({ label, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-primary/20 transition-all">
    <div className={cn("p-2.5 rounded-lg shrink-0", color)}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
      <h4 className="text-sm font-bold text-gray-900 mt-0.5">{value}</h4>
      <p className="text-[11px] text-gray-500 mt-0.5">{subtext}</p>
    </div>
  </div>
);

const GEMINI_MODELS = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];

const App = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('All');

  // AI State
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSalesData();
        setRawData(data);
        if (data.length > 0) {
          setDateRange({
            start: data[0].date,
            end: data[data.length - 1].date
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const {
    uniqueProducts, uniqueChannels, filteredData,
    dataInsights, areaChartData, pieChartData, summary
  } = useMemo(() => {
    const products = ['All', ...new Set(rawData.map(d => d.product).filter(Boolean))];
    const channels = ['All', ...new Set(rawData.map(d => d.channel).filter(Boolean))];

    const filtered = rawData.filter(row => {
      const matchesSearch = Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
      const matchesProduct = selectedProduct === 'All' || row.product === selectedProduct;
      const matchesChannel = selectedChannel === 'All' || row.channel === selectedChannel;
      const rowDate = new Date(row.date);
      const matchesDate = (!dateRange.start || rowDate >= new Date(dateRange.start)) && (!dateRange.end || rowDate <= new Date(dateRange.end));
      return matchesSearch && matchesProduct && matchesChannel && matchesDate;
    });

    let insights = null;
    if (filtered.length > 0) {
      const prodRev = filtered.reduce((a, r) => { a[r.product] = (a[r.product] || 0) + (r.revenue || 0); return a; }, {});
      const bestProduct = Object.entries(prodRev).sort((a, b) => b[1] - a[1])[0];
      const chanRev = filtered.reduce((a, r) => { a[r.channel] = (a[r.channel] || 0) + (r.revenue || 0); return a; }, {});
      const bestChannel = Object.entries(chanRev).sort((a, b) => b[1] - a[1])[0];
      const dayRev = filtered.reduce((a, r) => { a[r.date] = (a[r.date] || 0) + (r.revenue || 0); return a; }, {});
      const topDay = Object.entries(dayRev).sort((a, b) => b[1] - a[1])[0];
      const chanConv = filtered.reduce((a, r) => { if (!a[r.channel]) a[r.channel] = { c: 0, v: 0 }; a[r.channel].c += (r.customers || 0); a[r.channel].v += (r.visitors || 0); return a; }, {});
      const bestConv = Object.entries(chanConv).map(([n, s]) => ({ n, r: s.v > 0 ? s.c / s.v : 0 })).sort((a, b) => b.r - a.r)[0];
      insights = { bestProduct, bestChannel, topDay, bestConv };
    }

    const area = Object.entries(filtered.reduce((a, r) => { a[r.date] = (a[r.date] || 0) + (r.revenue || 0); return a; }, {})).map(([date, revenue]) => ({ date, revenue }));
    const pie = Object.entries(filtered.reduce((a, r) => { a[r.channel] = (a[r.channel] || 0) + (r.revenue || 0); return a; }, {})).map(([name, value]) => ({ name, value }));

    const rev = filtered.reduce((s, r) => s + (r.revenue || 0), 0);
    const ord = filtered.reduce((s, r) => s + (r.orders || 0), 0);
    const prof = filtered.reduce((s, r) => s + (r.revenue || 0) - (r.cost || 0), 0);
    const aov = ord > 0 ? rev / ord : 0;

    return { uniqueProducts: products, uniqueChannels: channels, filteredData: filtered, dataInsights: insights, areaChartData: area, pieChartData: pie, summary: { rev, ord, prof, aov } };
  }, [rawData, search, selectedProduct, selectedChannel, dateRange]);

  const generateAiInsights = async () => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!envKey) {
      alert("Gemini API Key missing in .env file. Please add VITE_GEMINI_API_KEY to your .env.");
      return;
    }

    setAnalyzing(true);
    try {
      const genAI = new GoogleGenerativeAI(envKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const prompt = `Analyze: ${JSON.stringify(summary, null, 2)}. Return JSON with "alerts", "opportunities", "suggestions" (lists of short strings).`;
      const result = await model.generateContent(prompt);
      const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) setAiAnalysis(JSON.parse(jsonMatch[0]));
    } catch (e) {
      console.error(e);
      alert("AI Analysis failed. Please check your API key in the .env file.");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time business performance & insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setSearch(''); setSelectedProduct('All'); setSelectedChannel('All'); }} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"><X size={18} /></button>
        </div>
      </div>

      {dataInsights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard label="Star Product" value={dataInsights.bestProduct[0]} subtext={`${formatCurrency(dataInsights.bestProduct[1])} generated`} icon={Star} color="bg-amber-100 text-amber-600" />
          <InsightCard label="Prime Channel" value={dataInsights.bestChannel[0]} subtext={`${formatCurrency(dataInsights.bestChannel[1])} attribution`} icon={Target} color="bg-indigo-100 text-indigo-600" />
          <InsightCard label="Peak Day" value={dataInsights.topDay[0]} subtext={`${formatCurrency(dataInsights.topDay[1])} generated`} icon={Clock} color="bg-emerald-100 text-emerald-600" />
          <InsightCard label="Conversion" value={dataInsights.bestConv.n} subtext={`${(dataInsights.bestConv.r * 100).toFixed(1)}% rate`} icon={Zap} color="bg-rose-100 text-rose-600" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1 text-xs"><label className="font-bold text-gray-400 uppercase flex items-center gap-1.5 ml-1"><Calendar size={12} /> Start</label><input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} /></div>
        <div className="space-y-1 text-xs"><label className="font-bold text-gray-400 uppercase flex items-center gap-1.5 ml-1"><Calendar size={12} /> End</label><input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} /></div>
        <div className="space-y-1 text-xs"><label className="font-bold text-gray-400 uppercase flex items-center gap-1.5 ml-1"><Filter size={12} /> Product</label><select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>{uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="space-y-1 text-xs"><label className="font-bold text-gray-400 uppercase flex items-center gap-1.5 ml-1"><Filter size={12} /> Channel</label><select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}>{uniqueChannels.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-secondary to-gray-800 p-6 rounded-2xl shadow-lg text-white space-y-6">
          <div className="flex items-center gap-3"><div className="p-2 bg-white/10 rounded-lg"><Brain size={24} /></div><div><h3 className="font-bold">AI Expert</h3><p className="text-[10px] text-gray-400">Gemini Powered</p></div></div>
          <div className="space-y-4">
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>{GEMINI_MODELS.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>)}</select>
            <button onClick={generateAiInsights} disabled={analyzing} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm">{analyzing ? "Analyzing..." : "Generate Strategy"}</button>
          </div>
        </div>
        <div className="lg:col-span-3">
          {aiAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 leading-relaxed"><h3 className="font-bold text-red-600 flex items-center gap-2 mb-4"><AlertCircle size={18} /> Alerts</h3><ul className="space-y-2">{aiAnalysis.alerts.map((a, i) => <li key={i} className="text-sm text-red-800 flex gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />{a}</li>)}</ul></div>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 leading-relaxed"><h3 className="font-bold text-emerald-600 flex items-center gap-2 mb-4"><TrendingUp size={18} /> Opportunity</h3><ul className="space-y-2">{aiAnalysis.opportunities.map((o, i) => <li key={i} className="text-sm text-emerald-800 flex gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />{o}</li>)}</ul></div>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 leading-relaxed"><h3 className="font-bold text-blue-600 flex items-center gap-2 mb-4"><Lightbulb size={18} /> Strategy</h3><ul className="space-y-2">{aiAnalysis.suggestions.map((s, i) => <li key={i} className="text-sm text-blue-800 flex gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />{s}</li>)}</ul></div>
            </div>
          ) : <div className="h-full bg-white border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400"><Brain size={32} className="mb-2 opacity-20" /><p className="text-sm">Click "Generate Strategy" for AI analysis</p></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Revenue" value={formatCurrency(summary.rev)} icon={TrendingUp} trend="up" trendValue="+12%" color="bg-blue-500" />
        <KPICard title="Orders" value={summary.ord.toLocaleString()} icon={ShoppingCart} trend="up" trendValue="+5%" color="bg-purple-500" />
        <KPICard title="Profit" value={formatCurrency(summary.prof)} icon={DollarSign} trend="up" trendValue="+18%" color="bg-emerald-500" />
        <KPICard title="AOV" value={formatCurrency(summary.aov)} icon={BarChart3} trend="down" trendValue="-2%" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v) => [formatCurrency(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900">Channel Mix</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieChartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
