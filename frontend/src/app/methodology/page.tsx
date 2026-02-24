import React from 'react';
import { BookOpen, Database, Cpu, FileText, ExternalLink } from 'lucide-react';

function FormulaBlock({ title, formula, explanation }: { title: string; formula: string; explanation: string }) {
    return (
        <div className="stat-card">
            <div className="text-sm font-bold text-white mb-2">{title}</div>
            <div className="font-mono text-emerald-400 text-sm bg-slate-900/50 px-3 py-2 rounded-lg mb-2 overflow-x-auto">
                {formula}
            </div>
            <div className="text-xs text-slate-400">{explanation}</div>
        </div>
    );
}

export default function MethodologyPage() {
    return (
        <main className="page-container">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="text-teal-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">Methodology & About</h1>
                </div>
                <p className="text-slate-400 text-sm">Data sources, analytical methods, and how to cite I-ASCAP</p>
            </div>

            <div className="space-y-8 max-w-4xl">
                {/* Data Sources */}
                <section className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={16} className="text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Data Sources</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="stat-card">
                            <div className="text-sm font-bold text-white mb-1">ICRISAT District-Level Database</div>
                            <div className="text-xs text-slate-400 mb-2">
                                Agricultural metrics including area, production, and yield for major crops across Indian districts (1966–2017).
                            </div>
                            <div className="text-[10px] text-slate-500">Source: International Crops Research Institute for the Semi-Arid Tropics</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-sm font-bold text-white mb-1">India Meteorological Department (IMD)</div>
                            <div className="text-xs text-slate-400 mb-2">
                                Rainfall data including annual total, seasonal breakdowns (monsoon, pre-monsoon, post-monsoon, winter).
                            </div>
                            <div className="text-[10px] text-slate-500">Source: IMD Gridded Rainfall Dataset</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-sm font-bold text-white mb-1">Census of India</div>
                            <div className="text-xs text-slate-400 mb-2">
                                District boundary changes, administrative split events, and LGD (Local Government Directory) codes for geocoding.
                            </div>
                            <div className="text-[10px] text-slate-500">Source: Office of the Registrar General & Census Commissioner</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-sm font-bold text-white mb-1">GeoJSON District Boundaries</div>
                            <div className="text-xs text-slate-400 mb-2">
                                Geospatial boundaries of Indian districts for choropleth map visualizations, matched to LGD codes via bridge mapping.
                            </div>
                            <div className="text-[10px] text-slate-500">Source: DataMeet India GeoJSON</div>
                        </div>
                    </div>
                </section>

                {/* Metrics Explained */}
                <section className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu size={16} className="text-purple-400" />
                        <h2 className="text-lg font-bold text-white">Metrics & Formulas</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormulaBlock
                            title="Crop Diversification Index (CDI)"
                            formula="CDI = 1 − Σ(pᵢ²)"
                            explanation="Simpson's Diversity Index. pᵢ = proportion of total area for crop i. Values closer to 1 indicate higher diversification; 0 means monoculture."
                        />
                        <FormulaBlock
                            title="Resilience Score"
                            formula="RS = 0.6 × (1 − CV_norm) + 0.4 × (P₁₀ / Median)"
                            explanation="Combines yield stability (coefficient of variation) with drought resistance (10th percentile / median ratio). Score 0–1, higher is better."
                        />
                        <FormulaBlock
                            title="Compound Annual Growth Rate (CAGR)"
                            formula="CAGR = (End/Start)^(1/n) − 1"
                            explanation="Measures average yearly growth over n years. Used for 5-year and full-history yield trend calculations."
                        />
                        <FormulaBlock
                            title="Yield Efficiency"
                            formula="Efficiency = District_Yield / P95_State_Yield"
                            explanation="Compares district yield against the 95th percentile of all yields in the state. Identifies yield gap and potential for improvement."
                        />
                        <FormulaBlock
                            title="Volatility Score (CV)"
                            formula="CV = (σ / μ) × 100"
                            explanation="Coefficient of variation as a percentage. Higher CV indicates more unpredictable yields. Used in risk classification."
                        />
                        <FormulaBlock
                            title="SARIMA Forecast"
                            formula="SARIMA(1,1,1) with linear fallback"
                            explanation="Seasonal ARIMA model when ≥10 years of data available. Falls back to linear trend extrapolation for shorter series. Returns predictions with confidence intervals."
                        />
                    </div>
                </section>

                {/* Architecture */}
                <section className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu size={16} className="text-amber-400" />
                        <h2 className="text-lg font-bold text-white">Technical Architecture</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="stat-card">
                            <div className="text-sm font-bold text-emerald-400 mb-2">Frontend</div>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• Next.js 15 (App Router)</li>
                                <li>• React 19 + TypeScript</li>
                                <li>• TanStack React Query</li>
                                <li>• Recharts for visualizations</li>
                                <li>• Leaflet for maps</li>
                                <li>• Tailwind CSS v4</li>
                            </ul>
                        </div>
                        <div className="stat-card">
                            <div className="text-sm font-bold text-blue-400 mb-2">Backend</div>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• FastAPI (Python 3.10+)</li>
                                <li>• asyncpg (PostgreSQL driver)</li>
                                <li>• statsmodels (SARIMA)</li>
                                <li>• Redis (caching layer)</li>
                                <li>• Gunicorn + Uvicorn</li>
                            </ul>
                        </div>
                        <div className="stat-card">
                            <div className="text-sm font-bold text-purple-400 mb-2">Infrastructure</div>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• PostgreSQL 16 (Neon)</li>
                                <li>• Render (Backend hosting)</li>
                                <li>• Vercel (Frontend deploy)</li>
                                <li>• Docker Compose (local)</li>
                                <li>• GitHub Actions (CI/CD)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Citation */}
                <section className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={16} className="text-rose-400" />
                        <h2 className="text-lg font-bold text-white">How to Cite</h2>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="font-mono text-xs text-slate-300 leading-relaxed">
                            I-ASCAP Team. (2026). <em>Indian Agri-Spatial Comparative Analytics Platform (I-ASCAP)</em>:
                            A research-grade tool for analyzing agricultural performance across administrative boundary changes in India.
                            Available at: https://i-ascap.vercel.app
                        </p>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                        If you use I-ASCAP data or analyses in your research, please cite the platform and the underlying data sources (ICRISAT, IMD) separately.
                    </div>
                </section>

                {/* Links */}
                <section className="glass-card rounded-xl p-6">
                    <h3 className="section-header">External Resources</h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'ICRISAT Data Portal', url: 'http://data.icrisat.org' },
                            { label: 'IMD Rainfall', url: 'https://www.imdpune.gov.in' },
                            { label: 'Census of India', url: 'https://censusindia.gov.in' },
                            { label: 'GitHub Repository', url: 'https://github.com/Satyamkumar2610/I-ASCAP' },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
                            >
                                <ExternalLink size={12} />
                                {link.label}
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
