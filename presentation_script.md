# Presentation Script: Cloud Data Architecture at Scale (Senior Level)

> Speaker target: 28 minutes of spoken delivery (~3.000 words) + 2 minutes of buffer. 30 minutes follow-up Q&A — see `presentation_qa.md` for the prepared bank of anticipated questions.

## Slide 1: Introduction
**Title: Deep Dive: Mastering Architectural Decisions (Expert Level)**
"Hello everyone. Today we will go beyond the textbook line that OLTP is for transactions and OLAP is for analytics. Most people in this room already know that. The harder question is what happens when a system actually grows.

In production, the questions change. What happens to write latency when transaction volume doubles? What happens to the BigQuery bill when an analyst writes one bad `SELECT *`? When does one database stop being enough, and how do you connect the transactional and analytical worlds without breaking either of them?

On GCP, Cloud SQL, AlloyDB, Cloud Spanner, BigQuery, and Datastream each answer those questions differently. The goal of this session is to leave you with the numbers, the trade-offs, and a decision framework you can apply on Monday morning."

---

## Slide 2: Session Roadmap
**Title: What We Will Cover Today**
"Quick roadmap before we go deep.

We start at the OLTP layer with the growth wall — why a single relational database eventually stops scaling, even on the biggest instance. Then we open the hood of Cloud SQL: MVCC, bloat, and the Write Ahead Log, because those are the mechanics behind most real incidents.

From there we go into indexing, the decision fork between Cloud SQL, AlloyDB, sharded Postgres, and Spanner, then hash versus range sharding, and consistent hashing with virtual nodes. That leads us to Spanner as the managed alternative.

We then move to BigQuery: Dremel, slots, clustering, and the cost model. We connect both worlds through CDC, change streams, and continuous queries, look at three real-world micro-cases, and close with a decision tree you can take home."

---

## Slide 3: OLTP Layer: The Growth Wall
**Title: OLTP Layer: The Growth Wall**
"Most systems start the same way: a single relational node. So let's start there too.

It works beautifully at the beginning. Cloud SQL gives you transactions, indexes, joins, backups, and operational simplicity — all in one place. Teams move fast because the data model is familiar and everything is local.

Then transactions keep growing. Vertical scaling buys you time. Cloud SQL today goes up to 128 vCPU and roughly 864 GB of RAM on Enterprise Plus. That is a lot of headroom, but it is not infinite. And the wall is usually not CPU.

**The mechanism.** In PostgreSQL, every `UPDATE` creates a new row version because of MVCC — Multi-Version Concurrency Control. Great for concurrency, costly under pressure. If your write rate outpaces autovacuum's ability to clean dead tuples, you accumulate bloat, locks contend, and adding CPU stops helping. In practice, Cloud SQL starts to hit that wall somewhere between three and five thousand sustained write TPS on a heavy instance — earlier if your workload is contentious.

**The fork.** This is the growth wall: the bottleneck stops being hardware and becomes coordination. The interesting thing is that you have one stop before Spanner — AlloyDB. Same PostgreSQL API, a redesigned storage engine, and roughly four times the write throughput of Cloud SQL. We will come back to that decision in a few slides."

---

## Slide 4: Cloud SQL Deep Dive: MVCC, Bloat, and WAL
**Title: Cloud SQL: MVCC & The WAL**
"Coordination overhead is the headline problem. But there is a quieter one happening inside the engine itself.

When a Cloud SQL instance feels slow, the first reflex is to blame disk or instance size. Sometimes that is true. Often the real cause is two mechanisms inside PostgreSQL itself.

**MVCC and bloat.** An `UPDATE` never replaces the row in place. PostgreSQL keeps the old version and writes a new one. `autovacuum` is what cleans up — but only versions invisible to active transactions. If one long-running export, report, or analytical query holds a transaction open, the visibility horizon freezes and autovacuum cannot reclaim anything during that window.

The signal worth watching is `n_dead_tup` over `n_live_tup` in `pg_stat_user_tables`. Anything above twenty percent on a high-churn table means you are already losing query performance to bloat. If `last_autovacuum` is older than twenty-four hours on the same table, you are not losing — you are bleeding.

**The WAL.** Before any change touches the table, PostgreSQL writes it to the Write Ahead Log. The WAL is what makes durability and crash recovery possible. Every commit is a flush. On SSD, each `fsync` is roughly one to three milliseconds. At five thousand commits per second, you are saturating fsync, not CPU. That is why batching small writes is one of the simplest wins in any OLTP workload — same data volume, fewer flushes.

The takeaway is straightforward. Cloud SQL performance is not a function of instance size alone. It is a function of transaction discipline, vacuum health, and WAL pressure."

---

## Slide 5: Advanced Indexing: Ordered vs Partial
**Title: Advanced Indexing: Beyond B-Trees**
"If MVCC and the WAL are the engine's heartbeat, indexes are the steering wheel. And like a steering wheel, more of them is not better.

Indexes feel free. They are not. Every index consumes storage, memory, and write IO — and write IO is exactly what an OLTP system has least of.

I often see tables with eight, ten, twelve indexes, most of them adding nothing because the planner already had a better path. Two techniques cut that fat: partial indexes and ordered indexes.

**Partial indexes.** Imagine an orders table with five hundred million rows, but the application dashboards only ever query active orders, which are maybe two percent of the table. Indexing the whole column is waste. In PostgreSQL, `CREATE INDEX ... WHERE status = 'ACTIVE'` builds an index over just those rows. Smaller index, fits in cache, lower write overhead on every insert that does not match.

**Ordered indexes.** A surprising amount of latency in OLTP comes from sorts. If your query says `ORDER BY created_at DESC` and the index is plain `(created_at)`, the planner may still scan backwards or sort. If the sort spills out of `work_mem`, it becomes an external sort on disk — and that is where milliseconds turn into seconds.

The senior question is not 'do I have an index on this column.' It is 'does this index match the filter, the order, and the selectivity of the query that actually runs?'"

---

## Slide 6: Decision Fork: How to Scale?
**Title: Decision Fork: How to Scale?**
"Even with perfect indexes and a healthy vacuum, you can still outgrow one node. That is where the architecture decision shows up. Four real options on GCP today.

**Cloud SQL HA, plus tuning.** Single primary with synchronous replica. Practical ceiling around three to five thousand sustained write TPS. Cost floor is roughly three hundred and fifty US dollars per month for a small HA pair. Choose this when you are under that TPS budget, you live in one region, and you want full PostgreSQL or MySQL surface area.

**AlloyDB.** PostgreSQL-compatible, but the storage layer is rewritten — separated storage and compute, with a columnar engine for analytical queries on the same data. In practice, it delivers roughly four times the write throughput of Cloud SQL on the same SQL surface, reaches fifteen to twenty thousand TPS without sharding, and runs regionally. Cost floor around six hundred US dollars per month with the minimum node count. Choose this when you want HTAP on a PostgreSQL workload and you can stay regional.

**Vitess or Citus.** Sharding extensions on top of MySQL or PostgreSQL. They take you further — thirty to fifty thousand TPS is achievable — but you still own the operational complexity: shard maps, rebalancing, cross-shard transactions. Cost is mostly engineering.

**Cloud Spanner.** Native distributed database. Roughly ten thousand QPS per node, scales linearly, strong external consistency, multi-region writes if you need them. Cost floor around six hundred and fifty US dollars per month for one regional node. Choose this above twenty thousand TPS, or when multi-region writes are a real requirement, or when you cannot tolerate manual resharding.

A blunt rule: include engineering cost in the comparison. A cheap line item with a permanent on-call rotation behind it is not cheap."

---

## Slide 7: Distributed OLTP: Hash vs Range Sharding
**Title: Distributed OLTP: Hash vs Range Sharding**
"If you do take the manual sharding path, even briefly, you face one decision before everything else: how to split the data. Two strategies dominate — hash and range.

**Hash sharding.** A hash function turns a key into a shard number, typically something like `hash(user_id) mod N`. With ten shards, every user lands on one of ten nodes independent of when they signed up. The benefit is even distribution. If user IDs are 101, 102, and 103, hashing scatters them across the cluster instead of piling recent IDs on the same node.

**Range sharding.** Data is split by ordered intervals. Users one to one million on shard A, one to two million on shard B, and so on. Or by date: January on one shard, February on another. Range sharding is what you want for range queries — give me all orders from March is easy and local. The cost is hotspots. If today's orders all land on today's shard, that shard absorbs most of the write traffic while the rest sit idle.

The trade-off is simple. Hash sharding is better for write distribution. Range sharding is better for ordered access and large scans. The workload picks the answer; there is no general best."

---

## Slide 8: Avoiding Hotspots with Consistent Hashing
**Title: Avoiding Hotspots with Consistent Hashing**
"Hash sharding sounds clean until you need to add one shard. That is when consistent hashing earns its keep. This slide is the one I want you to remember — the hash ring.

A hotspot is when too much traffic goes to one shard, one key range, or one physical partition. Sequential IDs, timestamps, noisy tenants — all classic causes. Simple modulo hashing makes this worse during resharding: change `N` from ten to eleven and the modulo result changes for almost every key. That is the resharding tax — most of your dataset moves at once.

**Consistent hashing.** Both keys and nodes live on the same logical ring. Imagine a number line bent into a circle. To place a key, you hash it onto a position, then walk clockwise until you find the next node. That node owns the key. If a node fails, the affected keys continue clockwise to the next healthy node. The crucial property: only the ranges next to the changed node move. The rest of the ring stays still.

**Virtual nodes.** In practice we do not place a physical node on the ring once. Each node appears many times — Node A as A1, A2, A3, and so on. Without that, one node could randomly own a huge arc of the ring; with many virtual nodes, ownership is sliced into smaller, more uniform intervals. Adding capacity touches only the slices owned by the new node. Removing a node only redistributes its own slices.

This is why consistent hashing shows up in distributed caches, key-value stores, and any system that needs to rebalance without freezing.

One warning, and it is the senior point. Consistent hashing fixes distribution mechanics, not key design. If one tenant generates forty percent of all writes, hashing only by `tenant_id` still concentrates load. The fix is a compound key — `hash(tenant_id + user_id)` — or a write-bucketed key like `hash(user_id + time_bucket)` to spread bursty writers across the ring.

Hash design is workload design. You are not hashing rows. You are hashing traffic."

---

## Slide 9: Cloud Spanner: Distributed Consistency
**Title: Cloud Spanner: Distributed Consistency**
"Consistent hashing is elegant on a whiteboard. But who wants to maintain that ring at three in the morning during an incident? Cloud Spanner exists exactly because someone said no.

Spanner gives you horizontal scale, strong consistency, and global availability without owning the ring yourself. It splits data into ranges called splits, distributes them across nodes, and rebalances automatically.

Some practical numbers. A Spanner node handles roughly ten thousand queries per second in theory; in practice you should size around five to seven thousand for realistic transactional workloads. Storage costs around thirty cents per gigabyte per month in regional, fifty cents in multi-region. A single regional node starts at about six hundred and fifty US dollars per month — that is the floor for the smallest Spanner deployment.

Spanner is not magic. Schema decisions still drive everything.

**The primary key pitfall.** Spanner stores rows ordered by primary key. A monotonic key — an auto-incrementing ID or a timestamp — concentrates new writes on the last split. That split becomes a hotspot, and adding nodes does not help because there is nowhere else for the writes to go. The fix is to break monotonicity: `BIT_REVERSE_POSITIVE`, UUIDs, or hash-prefixed composite keys.

**Interleaving.** Spanner lets you physically co-locate child rows under their parent. Orders interleaved under Customers means a customer and all their orders live on the same split. Joins become local instead of distributed. The rule to remember: a parent plus all its interleaved children should stay under eight gigabytes, otherwise the locality benefit collapses.

**Multi-region.** Multi-region Spanner replicates across continents using Paxos. That is the source of its resilience, and it is also where physics shows up — write latency floors around one hundred milliseconds at the median, simply because light has to cross oceans.

Spanner removes the operational tax of sharding. It does not remove the modeling tax."

---

## Slide 10: BigQuery: The Dremel Engine Architecture
**Title: BigQuery: The Dremel Engine Architecture**
"OLTP done. Now we cross the river to analytics, where the physics flips completely. BigQuery is built for the opposite problem — scanning, aggregating, and joining at scale. Its architecture separates storage from compute completely.

**Storage.** Data lives in Colossus, Google's distributed file system, in a columnar format called Capacitor. Columnar is what makes analytics cheap: a query that touches three columns out of a hundred reads only those three columns. Capacitor adds compression, encoding, and per-block metadata so the engine can skip blocks that cannot possibly match a filter.

**Clustering and partitioning.** Partitioning slices a table by a column like `event_date`. Clustering sorts data inside each partition by columns you choose, like `customer_id` or `country`. Together they decide how much data BigQuery has to read. A clustered, partitioned, well-filtered query may scan one percent of what a naïve query would.

**Slots.** Compute is measured in slots — units of execution capacity inside the Dremel tree. There are two pricing models, and the choice matters more than people think. On-demand bills you for what you scan — about six US dollars and twenty-five cents per terabyte in us-central1. Editions bill you for slot capacity over time — Standard around four cents per slot-hour with autoscaling, Enterprise around six. The breakeven is roughly fifty terabytes scanned per month: above that, Editions almost always wins. Below that, on-demand is simpler and cheaper.

**BI Engine.** For sub-second dashboards, BI Engine caches hot data in memory. Around thirty US dollars per gigabyte per month gets you interactive latency on cached aggregations.

The practical truth: BigQuery cost is not driven by data volume, it is driven by query shape. Two queries on the same table can differ by a factor of fifty."

---

## Slide 11: Under the Hood: How it Actually Works
**Title: Two Physics: OLTP vs OLAP Primitives**
"Two systems, two completely different physics. Let's name them side by side.

Spanner and BigQuery both solve distributed problems, but their design goals are opposite, and that contrast is worth one slide.

Spanner coordinates writes. **TrueTime** — synchronized clocks with bounded uncertainty — gives Spanner external consistency, meaning the order in which transactions commit matches the order in which they happened in the real world. **Paxos** replication is what makes that order survive failures. The cost of all that coordination is latency, especially across regions.

BigQuery coordinates reads. The **Dremel tree** breaks a query into stages, fans out to leaf workers reading Capacitor, and aggregates back through mixers. There is no global transaction to commit. The cost is **shuffle** — moving intermediate results between workers — and shuffle is what punishes unclustered joins.

One sentence to take home: OLTP coordinates writes, OLAP coordinates reads, and the systems are shaped by that single difference."

---

## Slide 12: The Glue: CDC & Zero-ETL
**Title: The Glue: CDC & Zero-ETL**
"Two physics, one business. The transactional system runs the app; the analytical system runs the decisions. We need them to talk without one killing the other.

The classic anti-pattern is a cron job: every five minutes, query the OLTP database for rows updated since the last run. It looks innocent and breaks in three ways — it misses deletes, it duplicates on clock drift, and it loads production with scans during peak hours.

There are four real patterns, and they map onto a freshness ladder.

**Federated query.** BigQuery `EXTERNAL_QUERY` reads directly from Spanner or Cloud SQL at query time. Freshness is instant; the cost is that you can drown the source if you forget to push filters down. Always filter on the source side.

**Continuous queries in BigQuery.** Streaming SQL inside BigQuery itself, reading from Pub/Sub or another streaming source. Sub-second to a few seconds end-to-end. Use it for aggregations and routing that do not need Dataflow.

**Change Data Capture.** Datastream reads PostgreSQL WAL or MySQL binlog and writes into BigQuery. End-to-end latency is roughly ten to thirty seconds at the median, minutes at the tail under load. Spanner has its own equivalent — change streams — captured by Dataflow templates into BigQuery. CDC is the workhorse for most reliable warehouse ingestion.

**Scheduled batch.** Still appropriate when freshness is measured in hours and cost dominates. Use it only when the honest answer to 'how fresh' is 'tomorrow morning is fine.'

The architecture goal is not to pick one. It is to pick the right pattern per table, based on how fresh that table actually needs to be."

---

## Slide 13: Senior Tweaks: The Query Plan
**Title: Senior Tweaks: Three Real Incidents**
"Enough theory. Let me show you three real incidents, one per engine, that tell you what these systems look like when they break. Each one is one minute.

**Cloud SQL.** An e-commerce orders table — about one and a half terabytes. Over six months, queries that used to return in two hundred milliseconds were taking four seconds. Diagnosis: a nightly export job held a transaction open for ninety minutes every night, which froze the autovacuum horizon. The table was thirty-eight percent dead tuples. Fix: move the export to a read replica and lower the autovacuum trigger threshold. Result: latency back to two hundred and fifty milliseconds at p95, and six hundred gigabytes reclaimed after a full vacuum.

**Spanner.** Hot-shard alert at thirty thousand QPS, but only one of eight nodes was hot — the cluster as a whole was at twelve percent average utilization. Diagnosis: primary key was a monotonic order ID, so every new write landed on the same split. Fix: composite key with `BIT_REVERSE_POSITIVE(order_id)` as the prefix. Result: distribution evened out, the other seven nodes finally did work, and the team got their write headroom back without adding a single node.

**BigQuery.** A daily report scanned four point two terabytes and cost about twenty-six US dollars per run, three times a day. Diagnosis: `SELECT *` with no partition filter on a partitioned-but-unclustered table. Fix: cluster on `user_id`, partition filter required, projection narrowed to the eight columns the report actually used. Result: one hundred and eighty gigabytes scanned per run, one dollar and ten cents per run — twenty-four times cheaper, same business output.

Three different engines, three different failure modes, the same lesson: always look at the plan, never trust the SQL."

---

## Slide 14: Architectural Commandments
**Title: Architectural Commandments & Decision Tree**
"The plan is the truth. The SQL is the marketing. Let's close with the rules that come out of all of this — six commandments and one decision tree.

**One. Respect the growth wall.** A single relational node is a great start and a terrible long-term strategy. Plan for the day coordination becomes the bottleneck.

**Two. Choose distribution keys for traffic, not rows.** Hash, range, or Spanner primary keys — a bad key creates hotspots inside any distributed system.

**Three. Consistency has a price tag.** TrueTime and Paxos are real and beautiful, but multi-region writes cost about one hundred milliseconds at the median, every time.

**Four. Cluster for the bill.** In BigQuery, clustering and partitioning are cost controls, not just performance features.

**Five. Do not use OLTP as OLAP.** Pull data out through CDC, change streams, or federation. Each system should keep its day job.

**Six. Physics wins.** Network, disk, and coordination are the real constraints. Good architecture works with them.

And the decision tree that compresses all of this:

If you need multi-region writes or more than twenty thousand TPS — **Cloud Spanner**. If you want PostgreSQL features with analytical workloads on the same data, and you live in one region — **AlloyDB**. If you are under five thousand TPS, single region, with mainstream SQL needs — **Cloud SQL HA**. For analytics above one terabyte scanned — **BigQuery**, with Editions once you cross fifty terabytes per month."

---

## Slide 15: Discussion, Deep Dive, and Repository
**Title: Discussion & Repository**
"We covered the OLTP growth wall, Cloud SQL internals, indexing, the four-way fork with AlloyDB, sharding, consistent hashing, Spanner, BigQuery, CDC, three real incidents, and a decision tree.

The message is one sentence: architecture at scale is not picking a product, it is understanding behavior under load. Keys, plans, freshness, and cost are the four levers.

Now I would like to open it up. If you have seen hotspots, bloat, BigQuery cost spikes, Spanner key issues, or CDC pain in your own systems, this is the time.

The repository, the slides, and the full speaker notes are linked below. A Q&A bank with prepared answers to the most common questions is available at `presentation_qa.md` for after the talk.

https://github.com/TheMasterRoot/Distributed-OLTP-vs-OLAP-on-GCP"
