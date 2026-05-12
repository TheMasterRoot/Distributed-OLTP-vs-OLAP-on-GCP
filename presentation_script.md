# Presentation Script: Cloud Data Architecture at Scale (Senior Level)

## Slide 1: Introduction
**Title: Deep Dive: Mastering Architectural Decisions (Expert Level)**
"Hello everyone. Today we are going to talk about OLTP and OLAP, but not only from the basic definition point of view. Most people already know the simple distinction: OLTP is for transactions and OLAP is for analytics. The real architectural challenge starts when the system grows and those definitions are not enough anymore.

In production, the important questions are different. What happens to latency when write volume increases? What happens to cost when analytical queries scan too much data? What happens when one database can no longer handle the operational workload? And how do we connect transactional systems to analytical systems without breaking reliability?

In GCP, services like Cloud SQL, Cloud Spanner, BigQuery, and Datastream give us different answers to those questions. So the goal of this session is to understand the trade-offs behind those tools and to make better architecture decisions when scale starts to matter."

---

## Slide 2: Session Roadmap
**Title: What We Will Cover Today**
"Before we go deep, let me give you a quick roadmap of the session so you know where we are going.

First, we will start with the OLTP layer and discuss why a traditional relational database eventually hits a growth wall. Then we will look under the hood of Cloud SQL, especially MVCC, bloat, and the Write Ahead Log, because those internal mechanisms explain many real production issues.

After that, we will talk about indexing and the decision point architects face when vertical scaling is no longer enough. That will lead us into distributed OLTP, manual sharding, hash sharding, range sharding, consistent hashing, and hotspot avoidance.

Then we will compare this manual path with Cloud Spanner and discuss how Spanner handles distributed consistency. From there, we will move to OLAP with BigQuery, looking at the Dremel engine, slots, clustering, and query shuffle.

Finally, we will connect both worlds using CDC and Zero-ETL patterns, review practical query-plan tips, and close with a set of architectural principles you can take back to your own systems."

---

## Slide 3: OLTP Layer: The Growth Wall
**Title: OLTP Layer: The Growth Wall**
"Let's start where most architectures begin: a single-node relational database. This could be Cloud SQL for PostgreSQL, Cloud SQL for MySQL, or a similar managed relational database.

At the beginning, this model works very well. It gives us transactions, indexes, joins, backups, and operational simplicity. The team can move fast because the data model is familiar and all the data is in one place.

The problem appears when transaction volume keeps growing. A relational database can scale vertically for a while by adding CPU, memory, and faster disks. But vertical scaling has a physical limit. At some point, the issue is not only hardware anymore. The issue becomes coordination.

**The Mechanism:** As write volume grows, the database spends more time coordinating locks, transactions, indexes, and row versions. In PostgreSQL, this is closely related to **MVCC**, which means **Multi-Version Concurrency Control**. Every update creates a new row version instead of simply overwriting the old one.

That design is great for concurrency, but it has a cost. If your write rate is higher than the database's ability to clean old row versions, you start accumulating dead tuples and table bloat. When that happens, adding more CPU does not necessarily fix the problem. In highly contentious workloads, adding more capacity can even expose more lock contention and coordination overhead.

This is what I call the growth wall: the point where the bottleneck is no longer just disk, memory, or CPU. The bottleneck is the fact that one database node is trying to coordinate too much transactional work."

---

## Slide 4: Cloud SQL Deep Dive: MVCC, Bloat, and WAL
**Title: Cloud SQL: MVCC & The WAL**
"Now let's look a little deeper at Cloud SQL for PostgreSQL, because it is a very common OLTP starting point.

When engineers see slow queries, they often blame the disk or assume the instance is too small. Sometimes that is true, but many times the root cause is inside the database engine itself. Two important concepts here are MVCC bloat and the WAL.

**MVCC and Bloat:** In PostgreSQL, an `UPDATE` does not simply replace a row in place. PostgreSQL keeps the old row version and creates a new version. This allows readers and writers to work concurrently without blocking each other all the time.

The cleanup is handled by `autovacuum`. But `autovacuum` can only remove row versions that are no longer visible to active transactions. If someone runs a long report, export, or analytical query against the OLTP database, that transaction can keep the visibility horizon open for a long time. During that period, old row versions cannot be cleaned.

The result is table bloat. A table that logically has 100 GB of active data might physically grow much larger because it contains dead space. This affects scans, indexes, cache efficiency, and backup size.

**The WAL:** Before data is safely persisted to the table, PostgreSQL writes the change to the **Write Ahead Log**. The WAL is essential for durability and crash recovery. Every committed transaction must be represented there.

If the workload generates many small commits, the database may spend a lot of time flushing WAL records. This is why batching small writes can improve throughput. The data volume may be the same, but the number of commit flushes is lower.

The practical takeaway is this: Cloud SQL performance is not only about instance size. You also need to understand transaction behavior, long-running queries, vacuum health, and WAL pressure."

---

## Slide 5: Advanced Indexing: Ordered vs Partial
**Title: Advanced Indexing: Beyond B-Trees**
"Once the OLTP database grows, indexes become one of the most important design tools. But indexes are not free. Every index consumes disk, memory, and write capacity.

I often see systems with too many generic indexes. They help some reads, but they slow down writes and waste memory. Two useful techniques for more precise indexing are partial indexes and ordered indexes.

**Partial Indexes:** Imagine a table with 500 million orders, but the application dashboard only needs to query active orders. If only a small percentage of the table is active, indexing the full table is wasteful.

In PostgreSQL, you can create an index like `CREATE INDEX ... WHERE status = 'ACTIVE'`. This means the index only contains rows that match that condition. It is smaller, it fits in memory more easily, and it reduces write overhead for rows that do not match the condition.

**Ordered Indexes:** Ordered indexes are useful when the query needs results in a specific order. For example, many applications ask for the latest records using `ORDER BY created_at DESC`.

If the index matches the query order, the database can read the next rows directly from the index. If it does not, the database may need to sort the result. When a sort is too large for memory, it can spill to disk, creating an external sort. External sorts are expensive and can become a hidden source of latency.

The senior-level point here is that indexes should match access patterns. Do not only ask, 'Do I have an index on this column?' Ask, 'Does this index match the filter, order, and selectivity of my real query?'"

---

## Slide 6: Decision Fork: How to Scale?
**Title: Decision Fork: How to Scale?**
"After optimization, better indexing, batching, and tuning, you may still reach a point where a single OLTP database is not enough. At this point, architects face a decision fork.

The common options are manual sharding, distributed database extensions or proxies like Citus and Vitess, or a fully distributed database like Cloud Spanner.

**Manual Sharding:** With manual sharding, the application or an internal routing layer decides where each record lives. This gives you control, but it moves a lot of complexity into your own code and operations. Your team now owns routing, rebalancing, cross-shard queries, and cross-shard transactions.

**Citus and Vitess:** These tools provide a middle ground. They help distribute data while preserving some familiar relational patterns. They can be powerful, but you still need to understand how data is distributed and what types of queries are efficient.

**Cloud Spanner:** Spanner is the managed distributed database option. It gives you automatic sharding, strong consistency, high availability, and horizontal scale. The trade-off is that you must design for Spanner's model, especially around primary keys, interleaving, and transaction boundaries.

**Senior Tip:** When comparing options, include engineering cost. Manual sharding may look cheaper on the cloud bill, but if it requires multiple engineers or DBAs to maintain routing, rebalancing, and incident response, the total cost can be much higher than it appears."

---

## Slide 7: Distributed OLTP: Hash vs Range Sharding
**Title: Distributed OLTP: Hash vs Range Sharding**
"If you choose the manual path, one of the first decisions is how to split the data. The two common strategies are hash sharding and range sharding.

**Hash Sharding:** Hash sharding uses a function to convert a key into a shard number. A simple example is `hash(user_id) % N`, where `N` is the number of shards. If you have 10 shards, the hash result decides which of those 10 shards stores the user's data.

The main benefit is distribution. If the hash function is good and the key has enough variety, users are spread across shards relatively evenly. This helps avoid a situation where all writes go to the same database node.

For example, if user IDs are `101`, `102`, and `103`, the application does not store them by numerical order. It hashes each ID and sends each user to the shard produced by the hash. This usually spreads writes better than simply putting recent IDs on the same shard.

**Range Sharding:** Range sharding splits data by ordered intervals. For example, users with IDs from 1 to 1 million go to shard A, users from 1 million to 2 million go to shard B, and so on. Another common example is date-based sharding, where January data goes to one shard and February data goes to another.

Range sharding is useful for range queries. If I need all orders from March, it is easy to know which shard or shards to query. But it can create hotspots. If most new orders arrive today, and today's range is on one shard, that shard receives most of the write traffic.

So the trade-off is simple: hash sharding is usually better for even write distribution, while range sharding is usually better for ordered access and range scans. The right choice depends on the workload."

---

## Slide 8: Avoiding Hotspots with Consistent Hashing
**Title: Avoiding Hotspots with Consistent Hashing**
"Now let's talk about hotspots and consistent hashing, because this is where manual sharding becomes difficult.

A **hotspot** happens when too much traffic goes to the same shard, node, key range, or physical partition. This can happen with sequential IDs, timestamps, tenant IDs, or any key where the traffic is not evenly distributed.

With simple hash sharding, a common implementation is `hash(user_id) % N`. The problem is that `N` is the number of shards. If you change from 10 shards to 11 shards, the modulo result changes for many keys. That means a large percentage of your data suddenly belongs on a different shard. This is the resharding tax.

**Consistent Hashing:** Consistent hashing reduces this problem by placing shards on a logical hash ring. Instead of recalculating every key against a new shard count, each key maps to a point on the ring and belongs to the next shard clockwise. When you add a new shard, only a portion of the key space moves to the new shard.

For example, imagine shards A, B, and C on a ring. User 123 hashes to a point between A and B, so it belongs to B. If we add shard D between A and B, only the keys in that specific interval move to D. The rest of the data stays where it is.

**Virtual Nodes:** In real systems, each physical shard is often represented by many virtual nodes on the ring. This improves balance. If shard A has 100 virtual positions and shard B has 100 virtual positions, the distribution is smoother than if each shard appears only once.

This helps avoid hotspots, but it does not magically solve every problem. If one tenant is responsible for 40 percent of all writes, hashing by `tenant_id` may still create a hot shard. In that case, you may need a compound key such as `hash(tenant_id + user_id)` or a write bucketing strategy such as `hash(user_id) + time_bucket`.

The key lesson is that hash design is workload design. You need to choose a distribution key that spreads the actual traffic, not just the number of rows."

---

## Slide 9: Cloud Spanner: Distributed Consistency
**Title: Cloud Spanner: Distributed Consistency**
"Cloud Spanner exists because many teams do not want to build all of that manual sharding logic themselves.

Spanner automatically splits data into ranges called splits and distributes those splits across nodes. It gives you horizontal scale, strong consistency, and high availability without asking the application to manually route every record to a shard.

However, Spanner is not magic. The schema design still matters a lot.

**The Primary Key Pitfall:** Spanner stores rows ordered by primary key. If your primary key is sequential, such as an increasing timestamp or an auto-incrementing ID, new writes may concentrate at the end of the key range. That creates a hotspot because one split receives most of the new writes.

To avoid that, you can use strategies like `BIT_REVERSE_POSITIVE`, UUIDs, hash-prefixed keys, or other key designs that spread writes more evenly. The goal is to avoid sending every new transaction to the same physical area of the database.

**Interleaving and Locality:** Spanner also supports interleaving related tables. For example, if `Orders` are interleaved under `Customers`, rows for the same customer can be stored close together. This can make customer-order joins more local and efficient.

The important distinction is this: Spanner removes a large part of the operational burden of manual sharding, but it does not remove the need for thoughtful data modeling. You still need to design keys and relationships with distribution and locality in mind."

---

## Slide 10: BigQuery: The Dremel Engine Architecture
**Title: BigQuery: The Dremel Engine Architecture**
"Now let's move from OLTP to OLAP and talk about BigQuery.

BigQuery is designed for analytical workloads. That means it is optimized for scanning, aggregating, filtering, and joining large volumes of data. Its architecture separates storage from compute.

**Storage:** BigQuery stores data in Colossus, Google's distributed storage system. The data is stored in a columnar format called Capacitor. Columnar storage is powerful for analytics because a query usually does not need every column. If the query only reads three columns from a table with one hundred columns, BigQuery can avoid reading unnecessary data.

**Capacitor Storage:** Capacitor uses compression, encoding, and metadata to reduce the amount of data scanned. When filters are applied, BigQuery can use metadata to skip blocks that cannot contain matching values. This is where clustering becomes important.

**Clustering:** Clustering organizes data around selected columns. If a table is clustered by `customer_id` or `event_date`, BigQuery can often skip more data when queries filter by those columns. This reduces latency and cost.

**The Slot Model:** Compute is handled by slots. A slot is a unit of BigQuery compute capacity. If a query is slow, the problem may not only be the amount of data scanned. It may also be shuffle, which is the movement of data between workers. Large joins and aggregations can create expensive shuffle stages.

The practical takeaway is that BigQuery performance depends on data layout, query shape, and how much data moves between workers."

---

## Slide 11: Under the Hood: How it Actually Works
**Title: Under the Hood: How it Actually Works**
"Let's connect the internals of Spanner and BigQuery, because both systems solve distributed problems, but they solve different types of distributed problems.

**TrueTime:** Spanner needs to answer a very hard OLTP question: in a globally distributed system, how do we know the correct order of transactions? Spanner uses TrueTime, which relies on tightly controlled clock uncertainty. This allows Spanner to provide external consistency, meaning the commit order matches real-world time order within the guarantees of the system.

This matters because transactional systems care deeply about correctness. If two users update the same account, or if an order and payment happen together, the system must know what happened first and commit consistently.

**Paxos Replication:** Spanner also uses Paxos replication. Each split is replicated, and writes require a quorum. This is why multi-region Spanner can survive failures, but it also explains why write latency can be higher in multi-region configurations. The data must coordinate across replicas.

**Dremel Tree:** BigQuery solves a different problem. It does not need to commit small transactions with global consistency. It needs to execute large analytical queries quickly. Dremel breaks a query into a tree of execution stages. Workers scan, aggregate, shuffle, and combine results.

If the data is well-partitioned and well-clustered, BigQuery can reduce unnecessary reads and shuffle. If the query joins huge unclustered datasets, BigQuery may need to move a lot of data between workers. That movement is where cost and latency can increase dramatically.

So Spanner is optimized for consistent distributed transactions. BigQuery is optimized for distributed analytical execution. They are both distributed systems, but their design goals are very different."

---

## Slide 12: The Glue: CDC & Zero-ETL
**Title: The Glue: CDC & Zero-ETL**
"Most real architectures need both OLTP and OLAP. The transactional system powers the application, while the analytical system powers reporting, dashboards, machine learning, and business decisions.

The difficult part is moving data from OLTP to OLAP reliably.

One anti-pattern is using cron jobs with timestamp filters. For example, running a query every five minutes that says, 'Give me all rows updated after the last run.' This looks simple, but it can miss deletes, duplicate updates, fail during clock issues, and put extra load on the production database.

**Log-based CDC:** A better approach is Change Data Capture. On GCP, Datastream can read from database logs like the WAL in PostgreSQL or the Binlog in MySQL. Instead of repeatedly querying the tables, it reads the stream of changes produced by the database engine.

This approach captures inserts, updates, and deletes. It is also out-of-band, meaning it has much less impact on the transactional workload than running heavy analytical queries directly against the OLTP database.

**Zero-ETL and Federated Queries:** In some cases, you can use BigQuery federated queries through `EXTERNAL_QUERY` to query systems like Spanner directly. This can be useful for operational analytics or lightweight reporting.

But there is an important rule: push filters down. If BigQuery asks Spanner for a huge dataset and filters later, you are moving too much data. The query should be written so Spanner can filter early and return only what BigQuery really needs.

The architecture goal is to keep OLTP fast and reliable, while making OLAP data fresh and useful."

---

## Slide 13: Senior Tweaks: The Query Plan
**Title: Senior Tweaks: The Query Plan**
"At senior level, you cannot treat the database as a black box. You need to look at query plans.

**Cloud SQL Bloat:** In PostgreSQL, look for dead tuples, table bloat, slow vacuum, and indexes that are larger than expected. If vacuum is not keeping up, your database is carrying dead data. That affects performance even if the application code has not changed.

You should also look at whether queries are using indexes correctly, whether sorts are spilling to disk, and whether transactions are staying open too long.

**Spanner Execution:** In Spanner, look for distributed execution patterns. If a query shows distributed cross-apply or too much remote work, it may mean the schema or query is forcing Spanner to jump across splits repeatedly.

That is often a sign that related data is not colocated, the primary key is not aligned with the access pattern, or the query is doing too much cross-partition work.

**BigQuery Nested Fields:** In BigQuery, joins can be expensive because they often require shuffle. One technique is to use nested fields with `STRUCT` and `ARRAY`. This can keep related data together and turn some joins into local unnesting operations.

The general principle is to inspect the physical plan, not just the SQL text. The SQL may look simple, but the execution plan tells you what the system actually has to do."

---

## Slide 14: Architectural Commandments
**Title: Architectural Commandments**
"Let's wrap the technical part with a few architectural commandments.

1. **Respect the Growth Wall:** A single relational database is a great starting point, but it is not an infinite scaling strategy. Plan early for the moment when coordination becomes the bottleneck.

2. **Choose Distribution Keys Carefully:** Hashing, range sharding, and Spanner primary keys are all about distribution. A bad key can create hotspots even in a powerful distributed system.

3. **Understand Consistency Costs:** Strong consistency across regions is valuable, but it has latency implications. TrueTime and Paxos are powerful, but physics still applies.

4. **Cluster for the Bill:** In BigQuery, clustering and partitioning are not only performance features. They are cost-control features because they reduce the amount of data scanned and shuffled.

5. **Do Not Use OLTP as OLAP:** Avoid running heavy analytics directly on the transactional system. Use CDC, replication, BigQuery, or federation carefully so each system does the job it was designed for.

6. **Physics Wins:** Data locality, network latency, disk behavior, and coordination overhead are the ultimate constraints. Good architecture works with those constraints instead of pretending they do not exist."

---

## Slide 15: Discussion, Deep Dive, and Repository
**Title: Discussion & Repository**
"We have covered a lot today: OLTP growth limits, Cloud SQL internals, indexing, manual sharding, hash and range distribution, consistent hashing, Spanner, BigQuery, CDC, and practical query-plan analysis.

The main message is that architecture at scale is not only about choosing a product. It is about understanding the behavior of the system under load. The database choice, the key design, the query shape, and the data movement pattern all matter.

Now I would like to open the discussion. If you have seen production issues with hot shards, slow queries, BigQuery shuffle, Spanner key design, or CDC pipelines, this is a good time to discuss them.

You can also download the repository and review the material here:

https://github.com/TheMasterRoot/Distributed-OLTP-vs-OLAP-on-GCP"
