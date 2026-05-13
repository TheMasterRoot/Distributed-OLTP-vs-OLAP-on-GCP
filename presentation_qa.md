# Q&A Bank — Cloud Data Architecture at Scale

> Prepared answers for the 30-minute discussion that follows the talk. Each answer is intentionally concise (~100–130 words) so the speaker can deliver it without notes. Grouped into four buckets: Cost & Sizing, Migration & Operations, Architecture & Modeling, Edge Cases.

---

## Cost & Sizing

### Q1. When is Cloud Spanner cheaper than sharded Cloud SQL?
Cost components: Spanner regional ≈ US$ 650/mo per node + storage. Sharded Cloud SQL: N × HA pair (~US$ 350/mo each) + load balancer + shard router. On infrastructure alone, crossover sits around 5–6 shards.

The real driver is engineering cost. Sharded Postgres usually requires 0.5–1 dedicated DBA, custom rebalancing tooling, and an on-call rotation for shard migrations. At enterprise scale (above ~10K TPS or ~2 TB), Spanner almost always wins on total cost of ownership once engineering is counted. Below 5K TPS and single region, Cloud SQL HA is cheaper end-to-end. The break is rarely on the cloud bill — it is on payroll.

### Q2. BigQuery on-demand vs Editions — how do I decide?
On-demand bills per scan: ~US$ 6.25/TB in us-central1, no commitment, no slot management. Editions bill per slot-hour: Standard ~US$ 0.04/slot-hr with autoscale, Enterprise ~US$ 0.06.

Rough breakeven: ~50 TB scanned/month or ~400 slot-hours/month. Above that, Editions wins predictability and cost.

Other tipping points: (a) workload isolation between teams (Editions reservations), (b) predictable batch windows (low baseline + autoscale), (c) flat-budget requirements from finance.

Do not switch because you "feel" heavy — measure 30 days of `bytes_billed` from `INFORMATION_SCHEMA.JOBS_BY_*`. Half the projects I have audited would lose money on Editions because their actual scan volume sits well under the breakeven.

### Q3. How do I size an initial Spanner reservation?
Start with 1 regional node (~5K–7K QPS in practice) and load-test with realistic transaction mix, not just point reads.

Monitor three things: (1) CPU per node — target steady-state under 65%, (2) p99 latency for `priority HIGH` transactions, (3) split count growth. If splits are stable and CPU has headroom, you are sized right.

Scale up by one node when CPU sustains above 65% for 24 hours or when p99 drifts. Use Spanner Autoscaler (the open-source managed instance group) for daily peaks instead of sizing for peak.

Storage drives steady-state cost once nodes are sized; compute drives short-term tuning. Do not provision for a year-out forecast — Spanner adds nodes online.

### Q4. When is BI Engine worth the reservation cost?
BI Engine: ~US$ 30/GB-month, caches hot data in memory for sub-second dashboards.

Worth it when: (a) a dashboard runs 100+ times/day on the same aggregated dataset, (b) the working set fits in 1–10 GB (one team's KPIs, not the entire warehouse), (c) users complain about 5–15 s dashboard refresh in Looker.

Not worth it for ad-hoc analytical queries — those benefit far more from clustering.

Quick test: enable BI Engine on the project for one week and check `cached_query_count / total_query_count` in `INFORMATION_SCHEMA.BI_CAPACITIES`. If above 40% of dashboard queries hit cache, the bill is justified. Below that, kill it and invest the budget in clustering and materialized views instead.

---

## Migration & Operations

### Q5. How do I migrate from Cloud SQL to Spanner with minimal downtime?
Standard pattern, in five steps:

1. **Schema redesign first.** Spanner is not a drop-in: redesign primary keys to avoid hotspots, replace foreign keys with `INTERLEAVE IN PARENT` where it helps, remove Postgres-specific features.
2. **Live replicate.** Datastream Cloud SQL → Spanner via Dataflow templates (or Striim/HVR if you need richer transformations).
3. **Dual-write or read-shadow** for a 2–4 week validation window. Diff results row-by-row.
4. **Cut over reads first**, then writes. Keep Cloud SQL as fallback for one release cycle.
5. **Reconcile** with row-level checksums before decommissioning.

Realistic timeline: 3–6 months for a non-trivial schema. Never lift-and-shift — you inherit hotspots and lose every Spanner advantage.

### Q6. AlloyDB vs Cloud SQL for an existing PostgreSQL workload — drop-in?
Largely yes for application code: same wire protocol, same SQL surface, most extensions supported. `pg_dump`/restore or Database Migration Service handles the cutover.

Where it differs: (a) HA model — AlloyDB uses regional storage with separate read pool nodes, different failover semantics, (b) pricing model — per node + storage I/O instead of disk, (c) some Postgres GUCs are not exposed.

The real wins come from the columnar engine. If your application runs inline analytical scans (reports, ad-hoc joins, dashboards on the operational DB), AlloyDB can deliver 10–50x speedups on the same SQL without copying data to BigQuery. If your workload is pure transactional point-reads, the Cloud SQL → AlloyDB delta is closer to 2–4x.

### Q7. How to debug a Spanner hotspot in production?
Three signals to look at, in order:

1. **CPU per node.** One node hot while others idle is the smoking gun — visible in the per-node graphs in Cloud Console.
2. **Lock stats.** Query `spanner_sys.lock_stats_top_minute` for high-conflict rows. A single column dominating the output points to the offending key.
3. **Key Visualizer.** Look for a dark vertical band on a single key range over time — that is the visual of a hotspot.

The fix is almost always at the key, not the cluster: monotonic IDs, common timestamp suffix, single tenant ID. Apply `BIT_REVERSE_POSITIVE`, salt the prefix, or split the workload across more keys. Adding nodes never fixes a hotspot — you just pay for idle nodes.

### Q8. Datastream limitations and gotchas?
Five real-world traps:

1. **Source must allow logical replication.** PostgreSQL needs `wal_level=logical`; MySQL needs row-based binlog with full image.
2. **DDL is not auto-replicated.** Schema evolution is your problem — plan column additions and renames explicitly.
3. **Initial backfill pressures the source.** Schedule off-peak or use a read replica as source.
4. **BigQuery `MERGE` mode has concurrency limits.** For high-update tables, partition by `change_timestamp` and merge per partition.
5. **Tail latency is minutes, not seconds.** End-to-end p99 under load is realistically 2–5 minutes; do not promise sub-second freshness to downstream consumers.

---

## Architecture & Modeling

### Q9. Multi-region Spanner — when is the latency cost acceptable?
Multi-region writes pay for a Paxos quorum across regions. Practical floor: ~100 ms p50 for read-write transactions, often 150–300 ms p99.

Acceptable when: (a) the business genuinely needs zero data loss across a regional outage — settlement, identity, global inventory — (b) users are on multiple continents and read latency dominates UX, (c) regulatory requirements force multi-region durability.

Not acceptable when: (a) the application does chatty multi-statement transactions (each one pays the 100 ms tax), (b) latency budgets are sub-50 ms p99 (most consumer-facing APIs).

For case (a), redesign to single-statement transactions with batched mutations, or accept a single-region deployment with cross-region read replicas instead of writes everywhere.

### Q10. Is interleaving worth it for analytical queries?
Interleaving optimizes parent-child joins via physical co-location.

Worth it when: the access pattern is "give me parent X and all its children" — customer + orders, document + sections, account + transactions for a window.

Not worth it when: analytical queries aggregate across all children regardless of parent (`SELECT SUM(amount) FROM orders WHERE status = 'PAID'`). For that shape, the data belongs in BigQuery anyway.

The hard rule: parent plus all its interleaved children must stay under ~8 GB per cluster. If one customer has 10 million orders, interleaving creates a giant split and hurts you. For unbounded child relationships, keep a foreign-key-style design without `INTERLEAVE`.

### Q11. Can BigQuery replace OLTP for any case?
Short answer: no.

Longer answer: BigQuery has no row-level locking, no efficient point updates, no sub-100 ms latency on small reads, and no transactional semantics across multi-row updates. DML works but is expensive and concurrency-limited (a few thousand operations per table per day).

The one OLTP-adjacent case BigQuery handles well is high-throughput append-only ingestion via the Storage Write API — treat BQ as a streaming sink, not a transactional system.

If you need primary-key lookups under 100 ms, you need Cloud SQL, AlloyDB, Spanner, Bigtable, or Firestore. Never BigQuery. Treating it as OLTP is the most expensive mistake I see in this stack.

### Q12. When to use Storage Write API vs streaming inserts?
**Streaming inserts (legacy):** per-row API, ~US$ 0.01/200 MB, simplest to call, but has the streaming buffer (eventual consistency for a few minutes) and higher per-row cost.

**Storage Write API:** protobuf-based, ~US$ 0.025/GB (much cheaper at volume), exactly-once semantics, supports streaming and batch commit, integrates natively with Dataflow and Apache Beam.

Rule of thumb: above ~10K rows/sec or ~10 GB/day, Storage Write API is significantly cheaper. Below, the cost difference is negligible and the legacy API is simpler.

For all new pipelines in 2026, default to Storage Write API — the legacy streaming inserts API is on the deprecation track and will be removed.

### Q13. Materialized views in BigQuery — when do they pay off?
Materialized views auto-refresh and serve queries from precomputed aggregates.

Worth it when: (a) the same aggregation runs many times on slowly-changing base data — daily KPI dashboards on append-only event tables are the classic case, (b) the aggregation is expensive (group-by on high cardinality with window functions).

Not worth it when: (a) base data updates frequently — refresh cost can exceed query savings, (b) the aggregation shape is too dynamic (different filters per call).

Smart materialization automatically rewrites queries to use the MV when applicable, so users do not have to know it exists. Monitor `INFORMATION_SCHEMA.MATERIALIZED_VIEWS` to confirm actual refresh frequency vs query benefit before scaling them out.

---

## Edge Cases

### Q14. Spanner change streams vs Datastream — which for which case?
They are not competitors — they are the right tool per source.

**Spanner change streams:** native CDC from Spanner, captured by Dataflow templates into BigQuery, Pub/Sub, or GCS. Latency in seconds, exactly-once delivery, no external connectors. Use it for any Spanner-sourced pipeline.

**Datastream:** managed CDC for Cloud SQL (PostgreSQL/MySQL) and Oracle. End-to-end latency in tens of seconds, BigQuery as the primary destination. Use it for any Cloud SQL or AlloyDB source.

If your source is Spanner — change streams. If your source is Cloud SQL, AlloyDB, or Oracle — Datastream. For mixed-source architectures, you run both. There is no scenario where one replaces the other.

### Q15. How does BigQuery search index pricing actually work?
Search indexes (the `SEARCH()` function) accelerate full-text and structured-token queries on text columns.

Costs: (a) index storage at ~US$ 0.04/GB-month, on top of the table's normal storage, (b) index maintenance is incremental and runs against your slot/on-demand budget — usually a few percent of base ingestion cost.

Query benefit: searches that previously scanned 10+ TB can drop to GB-scale by using the index.

Worth it for log analytics, security event search, and any unstructured text query you run multiple times per day. Not worth it for one-off exploration — index storage amortizes over months of queries, not a single ad-hoc.

Pro tip: combine search indexes with partitioning by `event_date` so the index only covers hot ranges.
