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
import presentationScript from '../presentation_script.md?raw';

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
    id: 'oltp-growth-wall',
    title: 'OLTP Layer: The Growth Wall',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
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
      <div className="w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-lg bg-white border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-4 text-xs font-bold uppercase">Feature</th>
              <th className="p-4 text-xs font-bold uppercase">Manual / PgPool-II</th>
              <th className="p-4 text-xs font-bold uppercase">Vitess / Citus</th>
              <th className="p-4 text-xs font-bold uppercase text-[#4285F4]">Cloud Spanner</th>
            </tr>
          </thead>
          <tbody className="text-[11px] divide-y divide-slate-100">
            <tr>
              <td className="p-4 font-bold bg-slate-50">Sharding Model</td>
              <td className="p-4 text-red-600 font-bold">App Logic / Proxy</td>
              <td className="p-4">Extension / Sidecar</td>
              <td className="p-4 font-bold text-[#4285F4]">Native Transparent</td>
            </tr>
            <tr>
              <td className="p-4 font-bold bg-slate-50">Resharding</td>
              <td className="p-4 text-red-500 font-bold">Manual / Brutal</td>
              <td className="p-4">Semi-Automated</td>
              <td className="p-4">Native / Invisible</td>
            </tr>
            <tr>
              <td className="p-4 font-bold bg-slate-50">Consistency</td>
              <td className="p-4">Session-based</td>
              <td className="p-4">Strong per Keyspace</td>
              <td className="p-4">Global (Paxos + TrueTime)</td>
            </tr>
            <tr>
              <td className="p-4 font-bold bg-slate-50">Complexity</td>
              <td className="p-4">MAX (Developer Tax)</td>
              <td className="p-4">High (Ops Heavy)</td>
              <td className="p-4 font-bold text-green-600">Low (API Only)</td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 bg-blue-50 text-blue-800 text-center text-[10px] border-t border-blue-100 font-bold italic">
           "PgPool-II handles session load balancing, but doesn't solve the hard consistency of distributed shards."
        </div>
      </div>
    )
  },
  {
    id: 'manual-sharding',
    title: 'Distributed OLTP: The Manual Path',
    accentColor: GCP_COLORS.red,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
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
    id: 'spanner-distributed',
    title: 'Cloud Spanner: Distributed Consistency',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="space-y-8 w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border-t-4 border-[#4285F4] shadow-md">
            <h4 className="font-bold text-sm mb-2">Anti-Pattern: Monotonic PKs</h4>
            <p className="text-xs text-slate-500">Incremental IDs go to a single node. You create a <strong>Hotspot</strong>.</p>
            <div className="mt-4 p-2 bg-red-50 text-red-600 text-[10px] font-mono border border-red-100 rounded">
              BAD: 1, 2, 3... <br />
              GOOD: UUID or Hash
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border-t-4 border-[#4285F4] shadow-md">
            <h4 className="font-bold text-sm mb-2">Table Interleaving</h4>
            <p className="text-xs text-slate-500">Co-locate child data with parent data physically. Zero-cost JOINS.</p>
            <pre className="mt-4 text-[9px] bg-slate-50 p-2 rounded">
{`INTERLEAVE IN PARENT Customers
ON DELETE CASCADE`}
            </pre>
          </div>
          <div className="bg-white p-6 rounded-xl border-t-4 border-[#4285F4] shadow-md">
            <h4 className="font-bold text-sm mb-2">Stored Columns</h4>
            <p className="text-xs text-slate-500">Add extra columns to the index to avoid extra base table lookups.</p>
          </div>
        </div>

        <div className="bg-[#202124] p-8 rounded-2xl text-white flex gap-8 items-center">
          <div className="w-16 h-16 shrink-0 bg-[#4285F4] rounded-full flex items-center justify-center font-black text-2xl">PK</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">The Secret to Spanner Scale</h3>
            <p className="text-sm text-slate-400">
              Spanner splits data based on PK ranges. If your PKs are evenly distributed, your throughput scales <strong>linearly</strong> with nodes. 
              If not, you're paying for nodes and using only one.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
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
      <div className="flex flex-col items-center justify-center space-y-12 max-w-6xl mx-auto">
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

        <div className="p-6 bg-[#3C4043] rounded-2xl text-white w-full max-w-4xl">
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
    title: 'Senior Tweaks: The Query Plan',
    accentColor: GCP_COLORS.dark,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#EA4335] mb-2 uppercase text-[10px]">Cloud SQL: Bloat Detect</h4>
            <pre className="bg-slate-900 p-3 rounded font-mono text-[9px] text-green-400 overflow-x-auto">
{`-- Find heavily updated tables with dead tuples
SELECT relname, n_live_tup, n_dead_tup, 
       last_autovacuum 
FROM pg_stat_user_tables 
ORDER BY n_dead_tup DESC LIMIT 5;`}
            </pre>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#4285F4] mb-2 uppercase text-[10px]">Spanner: Force Index & Interleave</h4>
            <pre className="bg-slate-900 p-3 rounded font-mono text-[9px] text-green-400 overflow-x-auto">
{`-- Force index and avoid full scan
SELECT * FROM Orders@{FORCE_INDEX=OrdersByStatus}
WHERE Status = 'ACTIVE';

-- Interleaved Join (Zero Network Shuffle)
SELECT c.Name, o.OrderId 
FROM Customers c JOIN Orders o ON c.CustomerId = o.CustomerId;`}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#34A853] mb-2 uppercase text-[10px]">BigQuery: Nested Fields & SEARCH</h4>
            <pre className="bg-slate-900 p-3 rounded font-mono text-[9px] text-green-400 overflow-x-auto">
{`-- Avoid Self-Joins with Nested Fields
SELECT id, 
  (SELECT price FROM UNNEST(items)) as prices
FROM orders;

-- Use SEARCH for log analytics
SELECT * FROM logs WHERE SEARCH(message, 'error 500');`}
            </pre>
          </div>
          <div className="bg-[#202124] p-6 rounded-2xl text-white">
            <h3 className="text-lg font-bold mb-4 text-[#FBBC04]">Internal Tweak Checklist</h3>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li>• <strong>Cloud SQL:</strong> Tune `max_connections` vs `shared_buffers` (25% RAM rule).</li>
              <li>• <strong>Spanner:</strong> Avoid huge transactions (&gt;100MB). They block Paxos heartbeats.</li>
              <li>• <strong>BigQuery:</strong> Use <strong>Nested & Repeated fields</strong> (JSON) to avoid massive self-joins.</li>
              <li>• <strong>Architecture:</strong> Always use <strong>Streaming Buffer</strong> for real-time BQ ingest.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'takeaways',
    title: 'Architectural Commandments',
    accentColor: GCP_COLORS.blue,
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-[#4285F4] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
            <div className="text-4xl font-bold mb-2">1</div>
            <p className="font-medium">Transaction Integrity First. Use Spanner for Global, Cloud SQL for Local.</p>
          </div>
          <div className="bg-[#EA4335] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
            <div className="text-4xl font-bold mb-2">2</div>
            <p className="font-medium">Separate Compute from Storage. BigQuery is the only answer for 10TB+ scans.</p>
          </div>
          <div className="bg-[#34A853] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
            <div className="text-4xl font-bold mb-2">3</div>
            <p className="font-medium">Zero-ETL is the future. Minimize friction between OLTP and OLAP.</p>
          </div>
        </div>

        <div className="text-center space-y-6 pt-12">
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight leading-tight max-w-4xl">
            "If you're not analyzing your query plans daily, you're not architecting, you're just hoping."
          </h3>
          <p className="text-xl text-slate-400 font-light">Cloud data is about efficiency of access, not just size.</p>
        </div>
      </div>
    )
  },
  {
    id: 'qa',
    title: 'Discussion & Deep Dive',
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

function ScriptPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124]">
      <header className="sticky top-0 z-20 border-b border-[#D2E3FC] bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#4285F4]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#4285F4]">Presentation Script</p>
              <h1 className="text-xl font-black tracking-tight">Cloud Data Architecture at Scale</h1>
            </div>
          </div>

          <a
            href="/"
            className="rounded-full border border-[#D2E3FC] bg-[#E8F0FE] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1967D2] transition hover:bg-[#D2E3FC]"
          >
            Back to slides
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-[#D2E3FC] bg-white p-5 shadow-sm">
          <p className="text-sm leading-6 text-[#5F6368]">
            This page exposes the full speaker notes from <code className="rounded bg-slate-100 px-1.5 py-0.5">presentation_script.md</code>,
            so attendees can follow the detailed speech during or after the session.
          </p>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-[#3C4043]">
            {presentationScript}
          </pre>
        </article>
      </main>
    </div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/script') {
    return <ScriptPage />;
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
    <div className="fixed inset-0 bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-0 md:p-4">
      {/* Main Presentation Container (Geometric Shell) */}
      <div className="w-full h-full max-w-[1280px] max-h-[800px] bg-white text-[#3C4043] font-sans overflow-hidden flex flex-col border-[6px] md:border-[8px] border-[#4285F4] shadow-2xl relative">
        
        {/* Header Section */}
        <header className="h-20 md:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 z-20">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-2.5 h-6 bg-[#4285F4] rounded-full"></div>
              <div className="w-2.5 h-6 bg-[#EA4335] rounded-full translate-y-1.5 md:translate-y-2"></div>
              <div className="w-2.5 h-6 bg-[#FBBC04] rounded-full"></div>
              <div className="w-2.5 h-6 bg-[#34A853] rounded-full translate-y-1.5 md:translate-y-2"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#202124]">Data Architecture Masterclass</h1>
              <p className="text-[10px] md:text-xs text-[#5F6368] font-bold uppercase tracking-widest leading-none">Architectural Decisions & Real-World Pitfalls</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <a
              href="/script"
              className="text-[10px] md:text-xs font-bold text-[#4285F4] bg-[#E8F0FE] px-3 py-1 rounded-full inline-block border border-[#D2E3FC] transition hover:bg-[#D2E3FC]"
            >
              SESSION: POD GDC-02
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
              className="w-full h-full p-6 md:p-10 flex flex-col items-center justify-center"
            >
              <div className="w-full h-full max-w-6xl mx-auto flex flex-col">
                {/* Slide Title Indicator */}
                <div className="mb-8 hidden md:block">
                  <div className="flex items-center gap-2 text-[#4285F4] font-bold text-sm uppercase tracking-tighter">
                     <span className="w-8 h-0.5 bg-[#4285F4]"></span>
                     <span>Slide {String(currentSlide + 1).padStart(2, '0')} — {slide.title}</span>
                  </div>
                </div>

                <div className="flex-grow flex items-center justify-center">
                  {slide.content}
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
                : 'bg-white text-white bg-[#202124] hover:bg-black border border-[#202124]'
            }`}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Footer Bar */}
        <footer className="h-10 md:h-12 bg-[#E8F0FE] flex items-center px-6 md:px-10 justify-between z-30 border-t border-[#D2E3FC]">
          <div className="flex gap-4 md:gap-6 text-[8px] md:text-[10px] font-bold text-[#1967D2] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> Horizontal Scaling</span>
            <span className="hidden sm:flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> TrueTime Consistency</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div> Columnar Magic</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-[9px] md:text-[10px] text-gray-500 font-medium uppercase tracking-tight hidden sm:block">
              {currentSlide + 1 < slides.length ? `Next: ${slides[currentSlide + 1].title}` : "End of Presentation"}
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

