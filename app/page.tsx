"use client";

import { useState } from 'react';
import { Settings, Activity, Globe, FileText, Tag, BarChart } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    if (!apiKey) {
      setShowSettings(true);
      setError('⚠️ 请点击右上角设置，填入你的 API Key 才能开始工作');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '请求失败');
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 顶部导航 */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI 网址分析器</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white hover:shadow rounded-full transition-all">
            <Settings className={showSettings ? "text-blue-600" : "text-gray-500"} />
          </button>
        </header>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold mb-4 text-gray-800">⚙️ API 配置</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base URL (选填)</label>
                <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} 
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://api.openai.com/v1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">API Key (必填)</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} 
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="sk-..." />
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">保存设置</button>
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 flex items-center gap-2 border border-gray-100 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <div className="pl-4 text-gray-400"><Globe size={20} /></div>
          <input 
            type="url" value={url} onChange={(e) => setUrl(e.target.value)} 
            placeholder="输入要分析的网址，例如 https://example.com"
            className="flex-1 p-3 outline-none text-lg bg-transparent w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button onClick={handleAnalyze} disabled={loading} 
            className={`px-6 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300'}`}>
            {loading ? '分析中...' : '开始'}
          </button>
        </div>

        {/* 错误提示 */}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">{error}</div>}

        {/* 结果展示 */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 摘要 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800"><FileText className="text-blue-500" size={20}/> 智能摘要</h2>
              <p className="text-gray-600 leading-relaxed">{result.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.keywords?.map((kw: string, i: number) => (
                  <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Tag size={12}/> {kw}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SEO */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><BarChart className="text-green-500" size={20}/> SEO 诊断</h2>
                <div className="space-y-3 text-sm">
                  <div><span className="font-semibold block text-gray-900">页面标题</span><span className="text-gray-500">{result.page_title}</span></div>
                  <div><span className="font-semibold block text-gray-900">AI 评价</span><span className="text-gray-500">{result.seo_analysis}</span></div>
                </div>
              </div>

              {/* 表格数据 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Activity className="text-purple-500" size={20}/> 数据提取</h2>
                <div className="bg-gray-50 p-3 rounded-xl text-xs font-mono text-gray-600 h-40 overflow-auto whitespace-pre-wrap">{result.structured_data}</div>
              </div>
            </div>
            
            <details className="text-center">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">查看原始 JSON 数据</summary>
              <pre className="mt-2 text-left bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}