/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Database, 
  BarChart3, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  ArrowRightLeft,
  Layout,
  Layers,
  Globe,
  Settings
} from 'lucide-react';
import presentationScriptEn from '../presentation_script.md?raw';
import presentationScriptPt from '../presentation_script.pt.md?raw';
import presentationScriptEs from '../presentation_script.es.md?raw';
import presentationQaEn from '../presentation_qa.md?raw';
import presentationQaPt from '../presentation_qa.pt.md?raw';
import presentationQaEs from '../presentation_qa.es.md?raw';
import { MarkdownContent } from './MarkdownContent';
import {
  getInitialLanguage,
  LanguageSelector,
  persistLanguage,
  translateNode,
  translateText,
  uiCopy,
  type Language,
} from './i18n';

// Google Cloud Brand Colors
const GCP_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
  dark: '#202124',
  gray: '#5F6368',
  light: '#F8F9FA'
};

const scriptsByLanguage: Record<Language, string> = {
  en: presentationScriptEn,
  pt: presentationScriptPt,
  es: presentationScriptEs,
};

const qaByLanguage: Record<Language, string> = {
  en: presentationQaEn,
  pt: presentationQaPt,
  es: presentationQaEs,
};

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
  bgColor?: string;
  accentColor?: string;
}

const slides: Slide[] = [
  {
    id: 'intro',
    title: 'Cloud Data Architecture at Scale',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-white rounded-2xl shadow-xl relative overflow-hidden group border-2 border-[#4285F4]/20"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 flex">
            <div className="h-full flex-1 bg-[#4285F4]"></div>
            <div className="h-full flex-1 bg-[#EA4335]"></div>
            <div className="h-full flex-1 bg-[#FBBC04]"></div>
            <div className="h-full flex-1 bg-[#34A853]"></div>
          </div>
          <Database className="w-20 h-20 text-[#4285F4] stroke-[1.5]" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#202124] leading-tight">
            Distributed OLTP <br />vs OLAP on GCP
          </h1>
          <p className="text-xl md:text-2xl text-[#5F6368] font-medium max-w-2xl mx-auto">
            Deep Dive: Mastering Architectural Decisions <br />
            <span className="text-[#EA4335] text-lg font-bold uppercase tracking-widest">(Expert Level)</span>
          </p>
        </div>

        <div className="pt-8 text-[10px] font-bold text-[#4285F4] uppercase tracking-[0.3em] bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          Senior Data Engineering Series • 2026
        </div>
      </div>
    )
  },
  {
    id: 'session-roadmap',
    title: 'Why OLTP and OLAP Exist',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="grid h-full w-full max-w-none grid-cols-1 gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-0 flex-col justify-center rounded-3xl bg-[#202124] p-6 text-white shadow-2xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-[#FBBC04]">Start with the workload</p>
          <h2 className="text-3xl font-black leading-tight tracking-tight">
            The database is not the strategy. The workload is.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            OLTP and OLAP solve different business questions. One protects the transaction while it happens; the other explains what happened across millions or billions of events.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D2E3FC]">Guiding question</p>
            <p className="mt-2 text-xl font-black text-white">Am I changing the state of the business or analyzing its history?</p>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              icon: Database,
              title: '1. Operational truth',
              text: 'Orders, payments, inventory, login sessions, account balances. Small writes must be correct now.',
              color: GCP_COLORS.blue
            },
            {
              icon: ArrowRightLeft,
              title: '2. Movement without damage',
              text: 'CDC and streaming move facts out of production so analytics do not steal CPU, locks, or IOPS from users.',
              color: GCP_COLORS.red
            },
            {
              icon: BarChart3,
              title: '3. Analytical memory',
              text: 'Revenue trends, cohorts, fraud signals, forecasting, dashboards. Big scans are expected, not accidental.',
              color: GCP_COLORS.green
            },
            {
              icon: Layers,
              title: '4. Architecture decision',
              text: 'Cloud SQL, Spanner, AlloyDB, and BigQuery are not interchangeable. Each optimizes a different shape of work.',
              color: GCP_COLORS.yellow
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute right-5 top-4 text-5xl font-black text-slate-100">{String(index + 1).padStart(2, '0')}</div>
                <div className="relative flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: item.color }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-black text-[#202124]">{item.title}</h3>
                    <p className="text-sm leading-6 text-[#5F6368]">{item.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  },
  {
    id: 'oltp-vs-olap-purpose',
    title: 'OLTP vs OLAP: What Each One Is Good At',
    accentColor: GCP_COLORS.green,
    content: (
      <div className="grid h-full w-full max-w-none grid-cols-1 gap-4 md:grid-cols-[1fr_0.9fr_1fr]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#D2E3FC] bg-white shadow-xl">
          <div className="bg-[#E8F0FE] p-3">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#1967D2]">OLTP</p>
            <h3 className="mt-1 text-xl font-black text-[#202124]">Run the business</h3>
            <p className="mt-1 text-xs leading-5 text-[#3C4043]">Fast, consistent transactions for operational systems.</p>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 p-3">
            {[
              ['Good at', 'checkout, payments, stock updates, user actions'],
              ['Optimized for', 'low latency, ACID, many small reads and writes'],
              ['Watch out for', 'big scans, ad hoc reports, dashboard traffic']
            ].map(([label, text]) => (
              <div key={label} className="rounded-xl border border-blue-100 bg-blue-50/70 p-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#1967D2]">{label}</p>
                <p className="mt-0.5 text-xs font-bold leading-4 text-slate-800">{text}</p>
              </div>
            ))}
            <div className="mt-auto rounded-xl bg-[#1967D2] p-2 text-white">
              <p className="text-xs font-black">Best fit: Cloud SQL, AlloyDB, Spanner</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center rounded-3xl bg-[#202124] p-4 text-white shadow-2xl">
          <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.25em] text-[#FBBC04]">Workload Signal</p>
          <div className="space-y-3">
            {[
              ['Latency sensitive', 95, 35],
              ['Transactional writes', 90, 25],
              ['Historical scans', 25, 95],
              ['Aggregations', 35, 90]
            ].map(([label, oltp, olap]) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{label}</span>
                  <span className="text-[11px] uppercase tracking-widest text-slate-400">OLTP / OLAP</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#4285F4]" style={{ width: `${oltp}%` }} />
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#34A853]" style={{ width: `${olap}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-[#4285F4] px-3 py-2">
              <p className="text-sm font-black">ms: OLTP thinks in latency</p>
            </div>
            <div className="rounded-2xl bg-[#34A853] px-3 py-2">
              <p className="text-sm font-black">TB: OLAP thinks in volume</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl">
          <div className="bg-green-50 p-3">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#188038]">OLAP</p>
            <h3 className="mt-1 text-xl font-black text-[#202124]">Understand the business</h3>
            <p className="mt-1 text-xs leading-5 text-[#3C4043]">Large-scale analysis for decisions, reporting, and discovery.</p>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 p-3">
            {[
              ['Good at', 'dashboards, cohorts, forecasting, fraud analysis'],
              ['Optimized for', 'column scans, joins, aggregates, cheap storage'],
              ['Watch out for', 'single-row updates, high-frequency transactions']
            ].map(([label, text]) => (
              <div key={label} className="rounded-xl border border-green-100 bg-green-50/70 p-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#188038]">{label}</p>
                <p className="mt-0.5 text-xs font-bold leading-4 text-slate-800">{text}</p>
              </div>
            ))}
            <div className="mt-auto rounded-xl bg-[#188038] p-2 text-white">
              <p className="text-xs font-black">Best fit: BigQuery, Looker, BI Engine</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'oltp-growth-wall',
    title: 'OLTP Layer: The Growth Wall',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-none">
        <div className="space-y-6">
          <div className="bg-[#E8F0FE] p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-[#1967D2] mb-3">When Single Node Fails</h3>
            <ul className="space-y-3 text-sm text-[#3C4043]">
              <li className="flex gap-2"><strong>Vertical Limit:</strong> Even with massive RAM, locking (MVCC bloat) and IOPS limits will eventually throttle you.</li>
              <li className="flex gap-2"><strong>The Dilemma:</strong> Do you try to shard your existing DB manually, or migrate to a globally distributed engine?</li>
              <li className="flex gap-2"><strong>Connections:</strong> Managed DBs solve management, but not the physics of single-node throughput bottlenecks.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
             <h4 className="text-xs font-black text-red-500 uppercase mb-4">Point of No Return</h4>
             <div className="flex justify-center gap-4">
                <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                   <div className="text-lg font-bold">10k</div>
                   <div className="text-[10px] text-slate-400">Writes/Sec</div>
                </div>
                <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-200">
                   <div className="text-lg font-bold text-red-600">??</div>
                   <div className="text-[10px] text-red-400">Horizontal Limit</div>
                </div>
             </div>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-2xl text-white flex flex-col justify-center">
          <Zap className="text-yellow-400 w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-4 italic">"Growth is a tax on infrastructure."</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            In OLTP, performance is linear until it's not. Once you hit the locking overhead of a single disk writer, 
            adding more CPU won't save you. You need to <strong>distribute</strong>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'oltp-deep-sql',
    title: 'Cloud SQL: MVCC & The WAL',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-none">
        <div className="space-y-6">
          <div className="bg-[#E8F0FE] p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-[#1967D2] mb-3">Postgres Internals: MVCC</h3>
            <ul className="space-y-3 text-sm text-[#3C4043]">
              <li className="flex gap-2"><strong>MVCC:</strong> Multi-Version Concurrency Control. Every UPDATE is a DELETE + INSERT.</li>
              <li className="flex gap-2"><strong>Table Bloat:</strong> If autovacuum can't remove "Dead Tuples", your table grows physically, slowing down index scans and IO.</li>
              <li className="flex gap-2"><strong>WAL (Write Ahead Log):</strong> Every change hits the log first. IOPS bottlenecks here kill commit speed.</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3">Detecting Bloat</h4>
            <pre className="text-[9px] bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`SELECT relname, n_live_tup, n_dead_tup,
       last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-2xl text-white flex flex-col justify-center">
          <Database className="text-[#4285F4] w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-4 italic">"The reported size isn't always real."</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            A 100GB table might only have 40GB of "live" data. The rest is bloat. 
            <strong>Senior Tip:</strong> Avoid long-running transactions on OLTP; they block the Vacuum horizon and rot the DB from the inside out.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'advanced-indexing',
    title: 'Advanced Indexing: Beyond B-Trees',
    accentColor: GCP_COLORS.red,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-none">
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">01. Partial Indexes</h4>
            <p className="text-xs text-slate-500 mb-2">Why index 100M rows if you only query 'ACTIVE' users? Save space and write IO.</p>
            <pre className="bg-slate-50 p-3 rounded font-mono text-[10px] text-blue-600">
{`CREATE INDEX idx_active_users 
ON users(email) 
WHERE status = 'ACTIVE';`}
            </pre>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">02. Ordered (DESC) Indexes</h4>
            <p className="text-xs text-slate-500 mb-2">Indexes are ordered. If you query \`ORDER BY created_at DESC\`, your index should match.</p>
            <pre className="bg-slate-50 p-3 rounded font-mono text-[10px] text-blue-600">
{`CREATE INDEX idx_latest_orders 
ON orders(created_at DESC);`}
            </pre>
          </div>
        </div>
        <div className="bg-[#EA4335] p-8 rounded-2xl text-white flex flex-col justify-center transition-all hover:scale-[1.02]">
          <Zap className="text-white w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic">"Scanning is Losing"</h3>
          <p className="text-white font-medium text-sm leading-relaxed">
            <strong>Partial:</strong> Use for sparse columns or status-filtered queries.
            <br /><br />
            <strong>Ordered:</strong> Use to avoid "External Sort" operations in RAM. 
            If the index is pre-sorted, the DB engine just reads the leaf nodes in order. Zero CPU cost.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'sharding-comparison',
    title: 'Decision Fork: How to Scale?',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="w-full max-w-none mx-auto overflow-hidden rounded-2xl shadow-lg bg-white border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3 text-[10px] font-bold uppercase">Dimension</th>
              <th className="p-3 text-[10px] font-bold uppercase">Cloud SQL HA</th>
              <th className="p-3 text-[10px] font-bold uppercase text-[#FBBC04]">AlloyDB</th>
              <th className="p-3 text-[10px] font-bold uppercase">Vitess / Citus</th>
              <th className="p-3 text-[10px] font-bold uppercase text-[#4285F4]">Cloud Spanner</th>
            </tr>
          </thead>
          <tbody className="text-[10px] divide-y divide-slate-100">
            <tr>
              <td className="p-3 font-bold bg-slate-50">Sharding Model</td>
              <td className="p-3">None (single primary)</td>
              <td className="p-3">Storage tier auto-scale</td>
              <td className="p-3">Extension / Sidecar</td>
              <td className="p-3 font-bold text-[#4285F4]">Native Transparent</td>
            </tr>
            <tr>
              <td className="p-3 font-bold bg-slate-50">Max Sustained Writes</td>
              <td className="p-3 text-red-600 font-bold">~3–5K TPS</td>
              <td className="p-3 font-bold text-[#B06000]">~15–20K TPS</td>
              <td className="p-3">~30–50K TPS</td>
              <td className="p-3 font-bold text-[#4285F4]">~10K/node, linear</td>
            </tr>
            <tr>
              <td className="p-3 font-bold bg-slate-50">Cost Floor (regional)</td>
              <td className="p-3">~US$ 350/mo</td>
              <td className="p-3">~US$ 600/mo</td>
              <td className="p-3 text-slate-500">infra + ops</td>
              <td className="p-3">~US$ 650/mo</td>
            </tr>
            <tr>
              <td className="p-3 font-bold bg-slate-50">Consistency</td>
              <td className="p-3">Local strong</td>
              <td className="p-3">Local strong</td>
              <td className="p-3">Strong per keyspace</td>
              <td className="p-3">Global (Paxos + TrueTime)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold bg-slate-50 text-[#4285F4]">When to choose</td>
              <td className="p-3 text-[9.5px]">&lt;5K TPS, single region, full SQL surface</td>
              <td className="p-3 text-[9.5px] font-bold text-[#B06000]">HTAP on Postgres, regional only</td>
              <td className="p-3 text-[9.5px]">Already on Postgres, can't migrate keys</td>
              <td className="p-3 text-[9.5px] font-bold text-[#4285F4]">&gt;20K TPS or multi-region writes</td>
            </tr>
          </tbody>
        </table>
        <div className="p-3 bg-blue-50 text-blue-800 text-center text-[10px] border-t border-blue-100 font-bold italic">
           "Include engineering cost in the comparison. A cheap line item with a permanent on-call rotation is not cheap."
        </div>
      </div>
    )
  },
  {
    id: 'manual-sharding',
    title: 'Distributed OLTP: Hash vs Range Sharding',
    accentColor: GCP_COLORS.red,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-none">
        <div className="space-y-6">
          <div className="p-6 bg-red-50 rounded-xl border border-red-100">
            <h3 className="font-bold text-[#EA4335] mb-4">Sharding Logic: Hash vs Range</h3>
            <div className="space-y-4">
               <div>
                  <h4 className="text-sm font-bold text-slate-800">01. Manual Hashing</h4>
                  <p className="text-xs text-slate-600">Using \`MOD(hash(key), N)\` to distribute keys. Prevents hotspots but makes Range Scans (BETWEEN) impossible without hitting all shards.</p>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-800">02. Application Complexity</h4>
                  <p className="text-xs text-slate-600">The app must maintain a "Shard Map". Distributed transactions (2PC) become a performance nightmare.</p>
               </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-2">The Resharding Tax</h4>
            <p className="text-[11px] text-slate-500 italic">"Scaling from 2 to 4 shards usually involves manual data migration, downtime, or building complex live-copy scripts. It is the silent killer of engineering velocity."</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 p-6 rounded-xl text-white">
             <h4 className="text-yellow-400 font-mono text-xs mb-4">// Manual Router Pseudo-code</h4>
             <pre className="text-[10px] text-slate-300">
{`function getShard(userID) {
  // Use a stable hash like MurmurHash3
  const hash = murmur3(userID);
  return \`db_shard_\${hash % 16}\`;
}

// Problem: What if we need 17 shards tomorrow? 
// 15/16 of your keys will move to a different shard.`}
             </pre>
          </div>
          <div className="p-4 bg-white border-2 border-dashed border-red-200 rounded-xl">
             <h4 className="text-[10px] font-black text-red-500 uppercase mb-2">Cons of Manual Path</h4>
             <ul className="text-[10px] space-y-1 text-slate-600">
                <li>• No Global Referencial Integrity (Foreign Keys)</li>
                <li>• Backup/Restore consistency across shards is hard</li>
                <li>• Complexity moves to the Developers</li>
             </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'consistent-hashing',
    title: 'Avoiding Hotspots with Consistent Hashing',
    accentColor: GCP_COLORS.red,
    content: (
      <div className="grid h-full w-full max-w-none grid-cols-1 gap-5 md:grid-cols-[0.78fr_1.22fr]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-black text-[#EA4335]">
              <Globe className="h-6 w-6" />
              Hash Ring: Keys Move Clockwise
            </h3>
            <p className="text-xs leading-6 text-slate-700">
              Every key and every node is hashed onto the same logical ring. To store a key,
              move clockwise until you find the next node position. That node owns the data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-black text-slate-800">Why not <code>hash(key) % N</code>?</h4>
              <p className="text-xs leading-6 text-slate-600">
                When <code>N</code> changes from 10 to 11, many keys calculate a different shard.
                Consistent hashing avoids this by moving only the key range owned by the changed node.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-black text-slate-800">Virtual Nodes Smooth the Load</h4>
              <p className="text-xs leading-6 text-slate-600">
                A physical node appears multiple times on the ring, like <strong>A1</strong>, <strong>A2</strong>, and <strong>A3</strong>.
                This prevents one unlucky node position from owning a huge portion of the key space.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#FBBC04]">
              <AlertTriangle className="h-4 w-4" />
              Hotspot Reminder
            </h4>
            <p className="text-xs leading-6 text-slate-300">
              Hashing balances data positions, but the key must represent the real traffic.
              For a noisy tenant, prefer keys like <code className="rounded bg-white/10 px-1">hash(tenant_id + user_id)</code>
              instead of only <code className="rounded bg-white/10 px-1">tenant_id</code>.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-3xl border border-[#D2E3FC] bg-[#E8F0FE] p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4285F4]">Consistent Hashing</p>
              <h3 className="text-xl font-black text-[#202124]">Ring Routing, Failure, and Virtual Nodes</h3>
            </div>
            <div className="hidden rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#1967D2] shadow-sm sm:block">
              Only affected ranges move
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl bg-white p-2">
            <img
              src="/assets/consistent-hashing.png"
              alt="Consistent hashing ring showing healthy nodes, a failed node, and requests reassigned clockwise"
              className="max-h-full w-full object-contain"
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white p-2 text-center">
              <p className="text-[10px] font-black text-[#1967D2]">1. Hash request</p>
            </div>
            <div className="rounded-xl bg-white p-2 text-center">
              <p className="text-[10px] font-black text-[#EA4335]">2. Walk clockwise</p>
            </div>
            <div className="rounded-xl bg-white p-2 text-center">
              <p className="text-[10px] font-black text-[#188038]">3. Use next healthy node</p>
            </div>
          </div>
        </div>
      </div>
    )
  },

  {
    id: 'spanner-distributed',
    title: 'Cloud Spanner: Distributed Consistency',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="space-y-6 w-full max-w-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#4285F4] text-white p-4 rounded-xl shadow-md">
            <p className="text-[9px] uppercase tracking-widest opacity-80">Throughput / node</p>
            <p className="text-2xl font-black mt-1">~10K QPS</p>
            <p className="text-[10px] opacity-90 mt-1">~5–7K in practice, linear scale</p>
          </div>
          <div className="bg-[#4285F4] text-white p-4 rounded-xl shadow-md">
            <p className="text-[9px] uppercase tracking-widest opacity-80">Storage cost</p>
            <p className="text-2xl font-black mt-1">$0.30/GB</p>
            <p className="text-[10px] opacity-90 mt-1">regional · $0.50 multi-region</p>
          </div>
          <div className="bg-[#1967D2] text-white p-4 rounded-xl shadow-md">
            <p className="text-[9px] uppercase tracking-widest opacity-80">Cost floor</p>
            <p className="text-2xl font-black mt-1">~$650/mo</p>
            <p className="text-[10px] opacity-90 mt-1">1 regional node minimum</p>
          </div>
          <div className="bg-[#EA4335] text-white p-4 rounded-xl shadow-md">
            <p className="text-[9px] uppercase tracking-widest opacity-80">Multi-region write p50</p>
            <p className="text-2xl font-black mt-1">~100 ms</p>
            <p className="text-[10px] opacity-90 mt-1">physics floor: Paxos quorum</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border-t-4 border-[#EA4335] shadow-md">
            <h4 className="font-bold text-sm mb-2">Anti-Pattern: Monotonic PKs</h4>
            <p className="text-xs text-slate-500">Incremental IDs concentrate writes on the last split — one node hot, the rest idle.</p>
            <div className="mt-3 p-2 bg-red-50 text-red-600 text-[10px] font-mono border border-red-100 rounded">
              BAD: 1, 2, 3...<br />
              GOOD: <code>BIT_REVERSE_POSITIVE(id)</code>, UUID, hash prefix
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-t-4 border-[#4285F4] shadow-md">
            <h4 className="font-bold text-sm mb-2">Interleaving</h4>
            <p className="text-xs text-slate-500">Co-locate child rows under parent. Joins become local. Rule: parent + children &lt; 8 GB.</p>
            <pre className="mt-3 text-[9px] bg-slate-50 p-2 rounded">
{`INTERLEAVE IN PARENT Customers
ON DELETE CASCADE`}
            </pre>
          </div>
          <div className="bg-white p-5 rounded-xl border-t-4 border-[#34A853] shadow-md">
            <h4 className="font-bold text-sm mb-2">Stored Columns</h4>
            <p className="text-xs text-slate-500">Add covering columns to indexes to avoid base-table lookups on hot read paths.</p>
            <div className="mt-3 p-2 bg-green-50 text-green-700 text-[10px] font-mono border border-green-100 rounded">
              CREATE INDEX ...<br />
              STORING (col1, col2)
            </div>
          </div>
        </div>

        <div className="bg-[#202124] p-6 rounded-2xl text-white flex gap-6 items-center">
          <div className="w-14 h-14 shrink-0 bg-[#4285F4] rounded-full flex items-center justify-center font-black text-xl">PK</div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Spanner removes the sharding tax, not the modeling tax</h3>
            <p className="text-xs text-slate-400">
              Even key distribution = linear scale with nodes. Monotonic keys = paying for N nodes, using one.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'olap-bq-storage',
    title: 'BigQuery: The Dremel Engine Architecture',
    accentColor: GCP_COLORS.green,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-none">
        <div className="space-y-6">
          <div className="p-6 bg-green-50 rounded-xl border border-green-100">
            <h3 className="font-bold text-green-800 mb-2">Physical Layout: Partitioning vs Clustering</h3>
            <p className="text-sm text-slate-600 mb-4">
              <strong>Partitioning:</strong> Logical slice (e.g., by Date). Stops BQ from scanning whole history.
              <br />
              <strong>Clustering:</strong> Physical sort within partition. Groups similar data together.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <span className="text-[10px] uppercase font-black text-slate-400">Standard DDL</span>
              <pre className="text-[10px] font-mono mt-2">
{`CREATE TABLE orders
PARTITION BY DATE(created_at)
CLUSTER BY user_id, status;`}
              </pre>
            </div>
          </div>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-slate-200">
             <h4 className="text-xs font-black mb-2 uppercase">Slot Management</h4>
             <p className="text-[11px] text-slate-500">Slots are units of computation. Use <strong>Reservations</strong> for predictable runtime, or <strong>On-Demand</strong> for burst. Deeply monitor `avg_slot_ms` to find inefficient queries.</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#34A853]">
            <h4 className="text-sm font-bold mb-4">Anti-Pattern: The "Select *" Tax</h4>
            <p className="text-sm text-slate-600 mb-4">BQ is Columnar. Scanning unused columns is literal waste of money and throughput.</p>
            <div className="flex items-center gap-2 text-xs font-mono">
               <span className="text-red-500">SELECT * (6.2 GB)</span>
               <ArrowRightLeft className="w-3 h-3 text-slate-300" />
               <span className="text-green-500">SELECT id, price (120 MB)</span>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <h4 className="text-[#34A853] font-bold mb-2">BI Engine & Search</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For sub-second dashboard performance, activate <strong>BI Engine</strong> (In-memory analysis). 
              For log analysis, leverage <strong>BigQuery Search Indexes</strong> (`SEARCH` function).
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'under-the-hood',
    title: 'Under the Hood: How it Actually Works',
    accentColor: GCP_COLORS.red,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-none">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-b-8 border-[#4285F4]">
          <Cpu className="text-[#4285F4] mb-4 w-10 h-10" />
          <h3 className="font-bold text-lg mb-4 text-slate-800">Spanner: Paxos + TrueTime</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Spanner uses <strong>Paxos</strong> for replication consistency and <strong>TrueTime</strong> (Atomic clocks + GPS) to eliminate clock skew. 
            This allows for "External Consistency" — the DB knows exactly when a transaction happened, globally.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border-b-8 border-[#34A853]">
          <Layers className="text-[#34A853] mb-4 w-10 h-10" />
          <h3 className="font-bold text-lg mb-4 text-slate-800">BigQuery: Dremel Tree</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            BigQuery uses a <strong>Tree-structured execution</strong>. Root server → Mixers → Leaf nodes (Slots). 
            Data is stored in <strong>Capacitor</strong> (Columnar), allowing for aggressive RLE compression and metadata-based filtering.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border-b-8 border-[#EA4335]">
          <Zap className="text-[#EA4335] mb-4 w-10 h-10" />
          <h3 className="font-bold text-lg mb-4 text-slate-800">Cloud SQL: Multi-Version (MVCC)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Postgres uses <strong>MVCC</strong>. Every update creates a new row version. 
            If your "Vacuum" can't keep up because of long transactions, you get <strong>Bloat</strong>. 
            Understanding WAL (Write Ahead Log) is key to recovery.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'data-movement-cdc',
    title: 'The Glue: CDC & Zero-ETL',
    accentColor: GCP_COLORS.yellow,
    content: (
      <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-none mx-auto">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full border-t-8 border-[#FBBC04]">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
             <ArrowRightLeft className="text-[#FBBC04]" /> 
             Syncing Without Killing Prod
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-xs font-black text-slate-400 uppercase">Input</span>
              <h4 className="font-bold my-2">CDC (Debezium/Datastream)</h4>
              <p className="text-xs text-slate-500">Reads DB logs (WAL) instead of querying tables. Zero impact on OLTP CPU.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-xs font-black text-slate-400 uppercase">Process</span>
              <h4 className="font-bold my-2">Dataflow (Beam)</h4>
              <p className="text-xs text-slate-500">Stateful processing for deduplication and sessions. Handles late data.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-xs font-black text-slate-400 uppercase">Output</span>
              <h4 className="font-bold my-2">BigQuery Write API</h4>
              <p className="text-xs text-slate-500">Storage-optimized ingest. High throughput, lower cost than traditional inserts.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#3C4043] rounded-2xl text-white w-full max-w-none">
           <h4 className="text-[#FBBC04] font-bold mb-2">Cloud Spanner to BigQuery Federated Query</h4>
           <p className="text-sm text-slate-300">
             Need live data in BQ? Use `EXTERNAL_QUERY`. It pulls live data directly from Spanner into BQ memory for the JOIN, but be careful with pushdown filters!
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'performance-tweaks',
    title: 'Senior Tweaks: Three Real Incidents',
    accentColor: GCP_COLORS.dark,
    content: (
      <div className="space-y-5 w-full max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border-t-4 border-[#EA4335] shadow-md flex flex-col gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#EA4335]">Case 01 · Cloud SQL</p>
              <h4 className="font-black text-sm text-slate-800 mt-1">Silent bloat from a long transaction</h4>
            </div>
            <div className="text-[10.5px] leading-5 text-slate-600 space-y-2">
              <p><strong className="text-slate-800">Symptom:</strong> 1.5 TB orders table; latency drifted 200 ms → 4 s over 6 months.</p>
              <p><strong className="text-slate-800">Diagnosis:</strong> nightly export held a 90-min transaction, freezing the vacuum horizon. Dead tuples = 38%.</p>
              <p><strong className="text-slate-800">Fix:</strong> moved export to a read replica; lowered <code className="bg-slate-100 px-1 rounded">autovacuum_vacuum_scale_factor</code>.</p>
            </div>
            <div className="mt-auto bg-red-50 border border-red-100 rounded-lg p-2 text-[10px]">
              <span className="font-black text-red-700">Result:</span>
              <span className="text-red-600"> 250 ms p95 · 600 GB reclaimed</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-t-4 border-[#4285F4] shadow-md flex flex-col gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#4285F4]">Case 02 · Spanner</p>
              <h4 className="font-black text-sm text-slate-800 mt-1">8 nodes paid, 1 node hot</h4>
            </div>
            <div className="text-[10.5px] leading-5 text-slate-600 space-y-2">
              <p><strong className="text-slate-800">Symptom:</strong> hot-shard alert at 30K QPS, cluster average utilization at 12%.</p>
              <p><strong className="text-slate-800">Diagnosis:</strong> primary key was a monotonic <code className="bg-slate-100 px-1 rounded">order_id</code> — every write hit the last split.</p>
              <p><strong className="text-slate-800">Fix:</strong> composite key prefixed with <code className="bg-slate-100 px-1 rounded">BIT_REVERSE_POSITIVE(order_id)</code>.</p>
            </div>
            <div className="mt-auto bg-blue-50 border border-blue-100 rounded-lg p-2 text-[10px]">
              <span className="font-black text-blue-700">Result:</span>
              <span className="text-blue-600"> even distribution · headroom restored · zero new nodes</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-t-4 border-[#34A853] shadow-md flex flex-col gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#34A853]">Case 03 · BigQuery</p>
              <h4 className="font-black text-sm text-slate-800 mt-1">24x cheaper, same output</h4>
            </div>
            <div className="text-[10.5px] leading-5 text-slate-600 space-y-2">
              <p><strong className="text-slate-800">Symptom:</strong> daily report scanned 4.2 TB · US$ 26/run · 3x/day.</p>
              <p><strong className="text-slate-800">Diagnosis:</strong> <code className="bg-slate-100 px-1 rounded">SELECT *</code> with no partition filter on a partitioned-but-unclustered table.</p>
              <p><strong className="text-slate-800">Fix:</strong> cluster on <code className="bg-slate-100 px-1 rounded">user_id</code>, partition filter required, narrowed to 8 columns.</p>
            </div>
            <div className="mt-auto bg-green-50 border border-green-100 rounded-lg p-2 text-[10px]">
              <span className="font-black text-green-700">Result:</span>
              <span className="text-green-700"> 180 GB scanned · US$ 1.10/run · 24x cheaper</span>
            </div>
          </div>
        </div>

        <div className="bg-[#202124] p-5 rounded-2xl text-white flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="shrink-0">
            <p className="text-[#FBBC04] text-[10px] font-black uppercase tracking-widest">Senior Tweak Checklist</p>
            <p className="text-base font-bold mt-1">Always look at the plan. Never trust the SQL.</p>
          </div>
          <ul className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-300">
            <li>• <strong className="text-white">Cloud SQL:</strong> watch <code>n_dead_tup / n_live_tup</code> &gt; 20%.</li>
            <li>• <strong className="text-white">Spanner:</strong> avoid transactions &gt; 100 MB; they block Paxos.</li>
            <li>• <strong className="text-white">BigQuery:</strong> nested/repeated fields beat massive self-joins.</li>
            <li>• <strong className="text-white">Architecture:</strong> Storage Write API for high-throughput ingest.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'takeaways',
    title: 'Architectural Commandments & Decision Tree',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="flex flex-col gap-5 w-full max-w-none">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4285F4] mb-2">Six Commandments</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { n: '01', color: GCP_COLORS.blue, title: 'Respect the Growth Wall', text: 'One node is a great start, never a long-term strategy.' },
              { n: '02', color: GCP_COLORS.red, title: 'Keys for Traffic, Not Rows', text: 'A bad distribution key hot-spots any system.' },
              { n: '03', color: GCP_COLORS.yellow, title: 'Consistency Has a Price', text: 'Multi-region writes ≈ 100 ms p50. Every time.' },
              { n: '04', color: GCP_COLORS.green, title: 'Cluster for the Bill', text: 'In BQ, layout is cost control, not just performance.' },
              { n: '05', color: GCP_COLORS.dark, title: "Don't Use OLTP as OLAP", text: 'CDC, change streams, federation. Each system does its job.' },
              { n: '06', color: GCP_COLORS.blue, title: 'Physics Wins', text: 'Network, disk, and coordination set the ceiling.' }
            ].map((c) => (
              <div key={c.n} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex gap-3 items-start">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: c.color }}>{c.n}</div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-black text-slate-800 leading-tight">{c.title}</h4>
                  <p className="text-[10.5px] text-slate-500 leading-snug mt-1">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#202124] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBC04]">Decision Tree</p>
            <p className="text-[10px] text-slate-400 italic">From workload signal to GCP service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#4285F4]">Step 1 · Spanner</p>
              <p className="text-white text-[12px] font-bold mt-2 leading-tight">Multi-region writes <span className="text-slate-400 font-normal">or</span> &gt; 20K TPS?</p>
              <p className="text-slate-400 text-[10.5px] mt-2">Choose <strong className="text-white">Cloud Spanner</strong> — global consistency, linear scale.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#FBBC04]">Step 2 · AlloyDB</p>
              <p className="text-white text-[12px] font-bold mt-2 leading-tight">PostgreSQL features + HTAP, regional only?</p>
              <p className="text-slate-400 text-[10.5px] mt-2">Choose <strong className="text-white">AlloyDB</strong> — ~4x Cloud SQL writes, columnar engine.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#34A853]">Step 3 · Cloud SQL</p>
              <p className="text-white text-[12px] font-bold mt-2 leading-tight">&lt; 5K TPS, single region, mainstream SQL?</p>
              <p className="text-slate-400 text-[10.5px] mt-2">Choose <strong className="text-white">Cloud SQL HA</strong> — simplest, ~US$ 350/mo floor.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#EA4335]">Step 4 · BigQuery</p>
              <p className="text-white text-[12px] font-bold mt-2 leading-tight">Analytical, &gt; 1 TB scans?</p>
              <p className="text-slate-400 text-[10.5px] mt-2">Choose <strong className="text-white">BigQuery</strong> — Editions once &gt; 50 TB/mo.</p>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-300 italic mt-4">
            "If you're not analyzing your query plans daily, you're not architecting — you're hoping."
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'qa',
    title: 'Discussion & Repository',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
        <div className="h-32 w-32 bg-slate-900 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
             <Layers className="text-white w-16 h-16" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic">Questions?</h2>
          <p className="text-xl text-slate-500 font-medium tracking-wide">Let's discuss Slot management, Spanner split points, or Federation strategies.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-none">
          <a
            href="https://github.com/TheMasterRoot/Distributed-OLTP-vs-OLAP-on-GCP"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4285F4]">Repository</p>
            <p className="mt-2 text-sm font-bold text-slate-800">Download the source and presentation material</p>
          </a>
          <a
            href="/script"
            className="rounded-2xl border border-[#D2E3FC] bg-[#E8F0FE] p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1967D2]">Speaker Notes</p>
            <p className="mt-2 text-sm font-bold text-slate-800">Open the full speech at /script</p>
          </a>
          <a
            href="/qa"
            className="rounded-2xl border border-[#FCE8E6] bg-[#FEF7F6] p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#EA4335]">Q&A Bank</p>
            <p className="mt-2 text-sm font-bold text-slate-800">Open prepared Q&A at /qa</p>
          </a>
        </div>

        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 pt-8">
            <span>Query Plan Analysis</span>
            <span>Distributed Storage</span>
            <span>Data Reliability</span>
          </div>
        </div>
      </div>
    )
  }
];

interface LocalizedPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function ScriptPage({ language, onLanguageChange }: LocalizedPageProps) {
  const copy = uiCopy[language];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124]">
      <header className="sticky top-0 z-20 border-b border-[#D2E3FC] bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#4285F4]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#4285F4]">{copy.presentationScript}</p>
              <h1 className="text-xl font-black tracking-tight">{translateText('Cloud Data Architecture at Scale', language)}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
            <a
              href="/"
              className="rounded-full border border-[#D2E3FC] bg-[#E8F0FE] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1967D2] transition hover:bg-[#D2E3FC]"
            >
              {copy.backToSlides}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-[#D2E3FC] bg-white p-5 shadow-sm">
          <p className="text-sm leading-6 text-[#5F6368]">
            {copy.scriptIntro}
          </p>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
          <MarkdownContent content={scriptsByLanguage[language]} />
        </article>
      </main>
    </div>
  );
}

function QaPage({ language, onLanguageChange }: LocalizedPageProps) {
  const copy = uiCopy[language];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124]">
      <header className="sticky top-0 z-20 border-b border-[#FCE8E6] bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF7F6] text-[#EA4335]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#EA4335]">{copy.qaBank}</p>
              <h1 className="text-xl font-black tracking-tight">{translateText('Cloud Data Architecture at Scale', language)}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
            <a
              href="/"
              className="rounded-full border border-[#FCE8E6] bg-[#FEF7F6] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#EA4335] transition hover:bg-[#FCE8E6]"
            >
              {copy.backToSlides}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-[#FCE8E6] bg-white p-5 shadow-sm">
          <p className="text-sm leading-6 text-[#5F6368]">
            {copy.qaIntro}
          </p>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
          <MarkdownContent content={qaByLanguage[language]} />
        </article>
      </main>
    </div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const handleLanguageChange = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    persistLanguage(nextLanguage);
  }, []);

  if (normalizedPath === '/script') {
    return <ScriptPage language={language} onLanguageChange={handleLanguageChange} />;
  }

  if (normalizedPath === '/qa') {
    return <QaPage language={language} onLanguageChange={handleLanguageChange} />;
  }

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-[#F8F9FA] overflow-hidden flex items-center justify-center px-5 py-2.5">
      {/* Main Presentation Container (Geometric Shell) */}
      <div className="w-full h-full bg-white text-[#3C4043] font-sans overflow-hidden flex flex-col border-[6px] md:border-[8px] border-[#4285F4] shadow-2xl relative">
        
        {/* Header Section */}
        <header className="h-16 md:h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 z-20">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-2.5 h-6 bg-[#4285F4] rounded-full"></div>
              <div className="w-2.5 h-6 bg-[#EA4335] rounded-full translate-y-1.5 md:translate-y-2"></div>
              <div className="w-2.5 h-6 bg-[#FBBC04] rounded-full"></div>
              <div className="w-2.5 h-6 bg-[#34A853] rounded-full translate-y-1.5 md:translate-y-2"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#202124]">{translateText('Data Architecture Masterclass', language)}</h1>
              <p className="text-[10px] md:text-xs text-[#5F6368] font-bold uppercase tracking-widest leading-none">
                {translateText('Architectural Decisions & Real-World Pitfalls', language)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <LanguageSelector language={language} onLanguageChange={handleLanguageChange} />
            <a
              href="/script"
              className="hidden text-[10px] md:text-xs font-bold text-[#4285F4] bg-[#E8F0FE] px-3 py-1 rounded-full border border-[#D2E3FC] transition hover:bg-[#D2E3FC] sm:inline-block"
            >
              {translateText('SESSION: POD GDC-02', language)}
              <span className="ml-2 text-[#1967D2]">/script</span>
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-[#F8F9FA]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full px-12 py-3 md:px-16 md:py-4 flex flex-col items-center justify-center"
            >
              <div className="w-full h-full max-w-none mx-auto flex flex-col">
                {/* Slide Title Indicator */}
                <div className="mb-2 hidden md:block">
                  <div className="flex items-center gap-2 text-[#4285F4] font-bold text-base uppercase tracking-tighter">
                     <span className="w-8 h-0.5 bg-[#4285F4]"></span>
                     <span>Slide {String(currentSlide + 1).padStart(2, '0')} — {translateText(slide.title, language)}</span>
                  </div>
                </div>

                <div className="min-h-0 flex-grow flex items-center justify-center text-[1.06rem]">
                  {translateNode(slide.content, language)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation Layers (HUD) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-40">
           <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-3 md:p-4 rounded-full transition-all shadow-lg active:scale-90 pointer-events-auto ${
              currentSlide === 0 
                ? 'bg-white/50 text-slate-200 cursor-not-allowed opacity-0' 
                : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`p-3 md:p-4 rounded-full transition-all shadow-lg active:scale-90 pointer-events-auto ${
              currentSlide === slides.length - 1 
                ? 'bg-white/50 text-slate-200 cursor-not-allowed opacity-0' 
                : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Footer Bar */}
        <footer className="h-9 md:h-10 bg-[#E8F0FE] flex items-center px-6 md:px-10 justify-between z-30 border-t border-[#D2E3FC]">
          <div className="flex gap-4 md:gap-6 text-[9px] md:text-xs font-bold text-[#1967D2] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> {translateText('Horizontal Scaling', language)}</span>
            <span className="hidden sm:flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> {translateText('TrueTime Consistency', language)}</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> {translateText('Columnar Magic', language)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-tight hidden sm:block">
              {currentSlide + 1 < slides.length
                ? `${translateText('Next: ', language)}${translateText(slides[currentSlide + 1].title, language)}`
                : translateText('End of Presentation', language)}
            </div>
            <div className="flex gap-1 h-3">
               {slides.map((_, i) => (
                <div key={i} className={`w-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-[#4285F4] h-full' : 'bg-gray-300 h-1 mt-1'}`}></div>
               ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

