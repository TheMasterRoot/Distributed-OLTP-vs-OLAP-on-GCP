# Banco de Preguntas — Cloud Data Architecture at Scale

---

## Costo & Dimensionamiento

### Q1. ¿Cuándo Spanner es más barato que Cloud SQL shardado?
En infraestructura, Spanner regional empieza cerca de US$ 650/mes por nodo + storage. Cloud SQL shardado es N pares HA (~US$ 350/mes cada uno) más router, balanceo y operación. Solo en factura, el cruce aparece cerca de 5–6 shards.

El factor real es ingeniería. Postgres shardado suele requerir DBA, tooling de rebalanceo y guardia para migraciones. Por encima de ~10K TPS o ~2 TB, Spanner suele ganar en TCO cuando se cuenta ingeniería. Debajo de 5K TPS y una región, Cloud SQL HA suele ser más barato.

### Q2. BigQuery on-demand vs Editions — ¿cómo decido?
On-demand cobra por scan: ~US$ 6,25/TB en us-central1. Editions cobra por slot-hour: Standard ~US$ 0,04/slot-hora y Enterprise ~US$ 0,06.

Regla práctica: arriba de ~50 TB escaneados por mes o ~400 slot-hours/mes, Editions suele ganar en costo y previsibilidad. Debajo, on-demand es más simple.

Mide 30 días de `bytes_billed` en `INFORMATION_SCHEMA.JOBS_BY_*` antes de cambiar.

### Q3. ¿Cómo dimensionar Spanner inicialmente?
Empieza con 1 nodo regional y prueba con una mezcla realista de transacciones.

Monitorea CPU por nodo, p99 de latencia y crecimiento de splits. Mantén CPU steady-state bajo 65%. Escala cuando CPU supere eso por 24h o cuando p99 degrade.

Usa autoscaling para picos diarios. Spanner agrega nodos online.

### Q4. ¿Cuándo vale BI Engine?
BI Engine cuesta cerca de US$ 30/GB-mes y cachea datos calientes para dashboards subsegundo.

Vale cuando un dashboard se ejecuta muchas veces por día, el working set cabe en pocos GB y los usuarios sufren refresh de 5–15 segundos.

No vale para queries ad-hoc. Si menos de 40% de las queries de dashboard usan cache, prioriza clustering y materialized views.

---

## Migración & Operaciones

### Q5. ¿Cómo migrar de Cloud SQL a Spanner con poco downtime?
Cinco pasos: rediseñar schema; replicar en vivo con Datastream/Dataflow; correr dual-write o read-shadow; cortar reads antes de writes; reconciliar con checksums.

Spanner no es drop-in. Rediseña primary keys para evitar hotspots, revisa foreign keys y elimina dependencias específicas de PostgreSQL.

Timeline realista: 3–6 meses para schemas no triviales.

### Q6. AlloyDB vs Cloud SQL para PostgreSQL existente — ¿drop-in?
En gran parte sí para aplicación: mismo protocolo y superficie SQL. `pg_dump`/restore o Database Migration Service ayudan.

Difieren HA, read pools, pricing y algunas configuraciones.

El mayor valor aparece cuando hay analytics inline sobre el DB operacional. Para point reads transaccionales, el delta es menor pero relevante.

### Q7. ¿Cómo debuggear hotspot en Spanner?
Mira CPU por nodo, lock stats y Key Visualizer.

Un nodo caliente con otros ociosos sugiere hotspot. `spanner_sys.lock_stats_top_minute` muestra filas conflictivas. Key Visualizer muestra bandas oscuras por key range.

La corrección suele ser la clave: hash prefix, `BIT_REVERSE_POSITIVE`, salting o buckets.

### Q8. ¿Limitaciones de Datastream?
PostgreSQL requiere `wal_level=logical`; MySQL requiere binlog row-based. DDL no se replica automáticamente. El backfill inicial presiona la fuente. `MERGE` en BigQuery tiene límites.

La latencia p99 bajo carga puede ser minutos. No prometas frescura subsegundo.

---

## Arquitectura & Modelado

### Q9. ¿Cuándo vale Spanner multi-región?
Cuando el negocio necesita tolerar caída regional sin pérdida: pagos, identidad, inventario global o regulación.

El costo es latencia: writes multi-región rondan 100 ms p50 y 150–300 ms p99. No sirve para APIs sub-50 ms p99 o transacciones muy chatty.

### Q10. ¿Interleaving vale para queries analíticas?
Vale cuando el patrón es "dame el padre y todos sus hijos": customer + orders, account + transactions.

No vale para agregaciones globales sobre todos los hijos. Eso pertenece a BigQuery.

Regla: padre + hijos interleaved bajo ~8 GB.

### Q11. ¿BigQuery puede reemplazar OLTP?
No.

BigQuery no tiene locking por fila, updates puntuales eficientes, baja latencia de lookup por clave ni transacciones multi-fila como OLTP. Puede recibir ingestión append-only vía Storage Write API, pero no es transaccional.

Para lookup por PK bajo 100 ms, usa Cloud SQL, AlloyDB, Spanner, Bigtable o Firestore.

### Q12. Storage Write API vs streaming inserts?
Streaming inserts es simple, pero más caro y usa streaming buffer. Storage Write API es más barata en volumen, tiene exactly-once y funciona bien con Dataflow/Beam.

Arriba de ~10K filas/s o ~10 GB/día, Storage Write API suele ganar.

### Q13. ¿Cuándo pagan materialized views en BigQuery?
Cuando la misma agregación corre muchas veces sobre datos relativamente estables: KPIs diarios y dashboards.

No pagan cuando los filtros cambian mucho o el refresh cuesta más que el ahorro.

---

## Casos Especiales

### Q14. Spanner change streams vs Datastream
Usa change streams si la fuente es Spanner. Usa Datastream si la fuente es Cloud SQL, AlloyDB u Oracle.

No compiten directamente. En arquitecturas mixtas, usas ambos.

### Q15. ¿Cómo se cobra BigQuery search index?
Search indexes aceleran `SEARCH()` sobre texto.

Pagas storage del índice y mantenimiento incremental. Vale para logs, seguridad y búsquedas repetidas. No vale para exploración única.

Combínalo con partitioning por `event_date` para limitar rangos calientes.
