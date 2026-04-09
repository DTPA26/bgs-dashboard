import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Download, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const BGSDashboard = () => {
  const [data, setData] = useState([
    { date: '2025-12-11', hsbc: 16136.75, capitalOnTap: 22034.42, hsbc_cc: 4282.43, capitalOne: 43.57, fuel: 355.01, notes: '' },
    { date: '2025-12-18', hsbc: 71469, capitalOnTap: 46742, hsbc_cc: 5023, capitalOne: 47.56, fuel: 485.4, notes: '' },
    { date: '2025-12-25', hsbc: 65939.2, capitalOnTap: 0, hsbc_cc: 0, capitalOne: 0, fuel: 454.47, notes: '' },
    { date: '2026-01-01', hsbc: 43417.23, capitalOnTap: 0, hsbc_cc: 0, capitalOne: 0, fuel: 361.45, notes: '' },
    { date: '2026-01-08', hsbc: 33170.78, capitalOnTap: 0, hsbc_cc: 0, capitalOne: 0, fuel: 196.77, notes: '' },
    { date: '2026-01-15', hsbc: 19750.37, capitalOnTap: 15069.25, hsbc_cc: 9276.13, capitalOne: 305.06, fuel: 236.18, notes: '' },
    { date: '2026-01-22', hsbc: 1315.26, capitalOnTap: 8287, hsbc_cc: 9678, capitalOne: 355, fuel: 486.18, notes: '' },
    { date: '2026-01-29', hsbc: -19486, capitalOnTap: 8774.17, hsbc_cc: 4254.13, capitalOne: 355.05, fuel: 264.27, notes: '' },
    { date: '2026-02-05', hsbc: 15267, capitalOnTap: 18456, hsbc_cc: 5674, capitalOne: 543, fuel: 232.23, notes: '' },
  ]);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hsbc: '',
    capitalOnTap: '',
    hsbc_cc: '',
    capitalOne: '',
    fuel: '',
    notes: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bgs_dashboard_data');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bgs_dashboard_data', JSON.stringify(data));
  }, [data]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    const entry = {
      date: newEntry.date,
      hsbc: newEntry.hsbc ? parseFloat(newEntry.hsbc) : 0,
      capitalOnTap: newEntry.capitalOnTap ? parseFloat(newEntry.capitalOnTap) : 0,
      hsbc_cc: newEntry.hsbc_cc ? parseFloat(newEntry.hsbc_cc) : 0,
      capitalOne: newEntry.capitalOne ? parseFloat(newEntry.capitalOne) : 0,
      fuel: newEntry.fuel ? parseFloat(newEntry.fuel) : 0,
      notes: newEntry.notes
    };

    // Check if entry for this date already exists
    const existingIndex = data.findIndex(d => d.date === newEntry.date);
    if (existingIndex >= 0) {
      const updated = [...data];
      updated[existingIndex] = entry;
      setData(updated);
    } else {
      setData([...data, entry].sort((a, b) => new Date(a.date) - new Date(b.date)));
    }

    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      hsbc: '',
      capitalOnTap: '',
      hsbc_cc: '',
      capitalOne: '',
      fuel: '',
      notes: ''
    });
    setShowForm(false);
  };

  const calculateStats = () => {
    if (data.length === 0) return {};
    
    const latestData = data[data.length - 1];
    const previousData = data.length > 1 ? data[data.length - 2] : null;
    
    const hsbcChange = previousData ? latestData.hsbc - previousData.hsbc : 0;
    const fuelAvg = (data.reduce((sum, d) => sum + (d.fuel || 0), 0) / data.length).toFixed(2);
    
    // Calculate weeks of cash remaining (assume £5k weekly burn rate as baseline)
    const weeklyBurn = 5000;
    const liquidCash = latestData.hsbc + latestData.capitalOnTap;
    const weeksOfCash = (liquidCash / weeklyBurn).toFixed(1);

    return {
      latestData,
      hsbcChange,
      fuelAvg,
      weeksOfCash,
      liquidCash
    };
  };

  const stats = calculateStats();

  const formatCurrency = (value) => {
    if (!value) return '£0.00';
    return '£' + parseFloat(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'HSBC_Balance', 'Capital_On_Tap', 'HSBC_CC', 'Capital_One', 'Fuel_Cost', 'Notes'];
    const rows = data.map(d => [
      d.date,
      d.hsbc,
      d.capitalOnTap,
      d.hsbc_cc,
      d.capitalOne,
      d.fuel,
      d.notes
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BGS-Dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">BGS Ltd Dashboard</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Weekly Financial Metrics Tracker</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`px-3 py-2 rounded text-sm ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {stats.latestData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* HSBC Balance */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div className="text-xs font-semibold opacity-70 mb-1">HSBC Balance</div>
              <div className="text-2xl font-bold mb-2">{formatCurrency(stats.latestData.hsbc)}</div>
              <div className="flex items-center gap-1 text-xs">
                {stats.hsbcChange > 0 ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className={stats.hsbcChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  {stats.hsbcChange > 0 ? '+' : ''}{formatCurrency(stats.hsbcChange)}
                </span>
              </div>
            </div>

            {/* Total Liquid */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div className="text-xs font-semibold opacity-70 mb-1">Total Liquid Cash</div>
              <div className="text-2xl font-bold mb-2">{formatCurrency(stats.liquidCash)}</div>
              <div className="text-xs opacity-50">HSBC + Capital On Tap</div>
            </div>

            {/* Weeks of Cash */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} ${stats.weeksOfCash < 2 ? 'border border-red-500' : stats.weeksOfCash < 4 ? 'border border-yellow-500' : 'border border-green-500'}`}>
              <div className="text-xs font-semibold opacity-70 mb-1">Weeks of Cash</div>
              <div className="text-2xl font-bold mb-2">{stats.weeksOfCash}w</div>
              <div className={`text-xs ${stats.weeksOfCash < 2 ? 'text-red-400' : stats.weeksOfCash < 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                {stats.weeksOfCash < 2 ? '⚠️ Critical' : stats.weeksOfCash < 4 ? '⚠️ Caution' : '✓ Healthy'}
              </div>
            </div>

            {/* Avg Fuel Cost */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div className="text-xs font-semibold opacity-70 mb-1">Avg Weekly Fuel</div>
              <div className="text-2xl font-bold mb-2">{formatCurrency(stats.fuelAvg)}</div>
              <div className="text-xs opacity-50">Last {data.length} weeks</div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Account Balances Chart */}
        <div className={`p-6 rounded-lg mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <h2 className="text-lg font-semibold mb-4">Account Balances Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
              />
              <Legend />
              <Line type="monotone" dataKey="hsbc" stroke="#3b82f6" name="HSBC" strokeWidth={2} />
              <Line type="monotone" dataKey="capitalOnTap" stroke="#10b981" name="Capital On Tap" strokeWidth={2} />
              <Line type="monotone" dataKey="hsbc_cc" stroke="#f59e0b" name="HSBC CC" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Costs Chart */}
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <h2 className="text-lg font-semibold mb-4">Weekly Fuel Costs</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="fuel" fill="#ef4444" name="Fuel Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Entry Button & Form */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 font-semibold flex items-center gap-2"
        >
          <Plus size={18} /> Add This Week's Data
        </button>

        {showForm && (
          <div className={`mt-4 p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <h3 className="text-lg font-semibold mb-4">Enter Weekly Metrics</h3>
            <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">HSBC Balance (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.hsbc}
                  onChange={(e) => setNewEntry({ ...newEntry, hsbc: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capital On Tap (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.capitalOnTap}
                  onChange={(e) => setNewEntry({ ...newEntry, capitalOnTap: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">HSBC CC (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.hsbc_cc}
                  onChange={(e) => setNewEntry({ ...newEntry, hsbc_cc: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capital One (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.capitalOne}
                  onChange={(e) => setNewEntry({ ...newEntry, capitalOne: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fuel Cost (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.fuel}
                  onChange={(e) => setNewEntry({ ...newEntry, fuel: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}
                  placeholder="e.g., Maeve payment made, holiday notes, etc."
                  rows="2"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-4 py-2 rounded font-semibold ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="max-w-7xl mx-auto">
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <h3 className="text-lg font-semibold mb-4">Historical Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-right py-2 px-3">HSBC</th>
                  <th className="text-right py-2 px-3">Cap On Tap</th>
                  <th className="text-right py-2 px-3">HSBC CC</th>
                  <th className="text-right py-2 px-3">Capital One</th>
                  <th className="text-right py-2 px-3">Fuel</th>
                  <th className="text-left py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(-10).reverse().map((entry, idx) => (
                  <tr key={idx} className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <td className="py-2 px-3">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(entry.hsbc)}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(entry.capitalOnTap)}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(entry.hsbc_cc)}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(entry.capitalOne)}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(entry.fuel)}</td>
                    <td className="py-2 px-3 text-xs opacity-70">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BGSDashboard;
