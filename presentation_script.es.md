# Guion de la Presentación: Cloud Data Architecture at Scale (Nivel Senior)

> Meta del presentador: 28 minutos de exposición (~3.000 palabras) + 2 minutos de margen. Luego 30 minutos de Q&A — ver `presentation_qa.es.md`.

## Slide 1: Introducción
**Título: Deep Dive: Dominando Decisiones Arquitectónicas (Nivel Experto)**
"Hola a todos. Hoy vamos más allá de la definición de libro: OLTP para transacciones y OLAP para analytics. La mayoría ya lo sabe. La pregunta difícil aparece cuando el sistema crece.

En producción, las preguntas cambian. ¿Qué pasa con la latencia de escritura cuando el volumen se duplica? ¿Qué pasa con la factura de BigQuery cuando alguien escribe un mal `SELECT *`? ¿Cuándo deja de alcanzar un solo banco? ¿Y cómo conectamos lo transaccional con lo analítico sin romper ninguno?

En GCP, Cloud SQL, AlloyDB, Cloud Spanner, BigQuery y Datastream responden de formas distintas. El objetivo es salir con números, trade-offs y un framework de decisión para usar en proyectos reales."

---

## Slide 2: Roadmap
**Título: Qué Cubriremos Hoy**
"Roadmap rápido.

Empezamos en OLTP con el growth wall: por qué una base relacional única deja de escalar incluso en una instancia grande. Luego abrimos Cloud SQL: MVCC, bloat y Write Ahead Log, porque explican muchos incidentes reales.

Después vemos indexación, la decisión entre Cloud SQL, AlloyDB, Postgres shardado y Spanner, hash versus range sharding y consistent hashing con virtual nodes. Eso nos lleva a Spanner como alternativa gestionada.

Finalmente pasamos a BigQuery: Dremel, slots, clustering y modelo de costo. Conectamos ambos mundos con CDC, change streams y continuous queries, revisamos tres micro-casos reales y cerramos con un árbol de decisión."

---

## Slide 3: Capa OLTP: El Growth Wall
**Título: Capa OLTP: El Muro de Crecimiento**
"La mayoría de los sistemas empieza igual: un único nodo relacional.

Al principio funciona muy bien. Cloud SQL ofrece transacciones, índices, joins, backups y simplicidad operativa. El equipo avanza rápido porque el modelo es familiar y todo está local.

Luego las transacciones crecen. Escalar verticalmente compra tiempo. Cloud SQL llega a 128 vCPU y cerca de 864 GB de RAM en Enterprise Plus. Es mucho, pero no infinito. Y el muro casi nunca es CPU.

**El mecanismo.** En PostgreSQL, cada `UPDATE` crea una nueva versión de fila por MVCC — Multi-Version Concurrency Control. Excelente para concurrencia, costoso bajo presión. Si la tasa de escritura supera la capacidad de autovacuum, aparecen dead tuples, bloat, locks y más CPU deja de ayudar. En la práctica, Cloud SQL golpea ese muro entre tres y cinco mil write TPS sostenidos en una instancia fuerte.

**La bifurcación.** El cuello deja de ser hardware y pasa a ser coordinación. Antes de Spanner hay una parada: AlloyDB. Misma API PostgreSQL, storage rediseñado y alrededor de cuatro veces el throughput de escritura de Cloud SQL."

---

## Slide 4: Cloud SQL Deep Dive: MVCC, Bloat y WAL
**Título: Cloud SQL: MVCC & WAL**
"El overhead de coordinación es visible. Pero hay otro problema silencioso dentro del engine.

Cuando Cloud SQL se siente lento, muchos culpan al disco o al tamaño de instancia. A veces es verdad. Muchas veces la causa está en PostgreSQL.

**MVCC y bloat.** Un `UPDATE` no reemplaza la fila. PostgreSQL conserva la versión vieja y escribe una nueva. `autovacuum` limpia, pero solo versiones invisibles para transacciones activas. Si un export, reporte o query analítica mantiene una transacción abierta, el horizonte de visibilidad se congela.

La señal importante es `n_dead_tup / n_live_tup` en `pg_stat_user_tables`. Por encima de 20% en una tabla de alta mutación, ya hay pérdida de performance. Si `last_autovacuum` supera 24 horas, la situación es crítica.

**WAL.** Antes de tocar la tabla, PostgreSQL escribe en el Write Ahead Log. Cada commit hace flush. En SSD, cada `fsync` cuesta 1–3 ms. Con 5.000 commits por segundo, el cuello es fsync, no CPU. Por eso agrupar escrituras pequeñas es una victoria simple.

Takeaway: Cloud SQL no depende solo del tamaño. Depende de disciplina transaccional, salud de vacuum y presión en WAL."

---

## Slide 5: Indexación Avanzada
**Título: Indexación Avanzada: Más Allá de B-Trees**
"Si MVCC y WAL son el corazón, los índices son el volante. Y más volante no ayuda.

Los índices no son gratis: consumen storage, memoria y write IO.

**Partial indexes.** Si una tabla de pedidos tiene 500 millones de filas, pero el dashboard solo consulta pedidos activos, indexar todo es desperdicio. `CREATE INDEX ... WHERE status = 'ACTIVE'` indexa solo lo necesario.

**Ordered indexes.** Mucha latencia viene de sorts. Si la query usa `ORDER BY created_at DESC`, el índice debe coincidir. Si el sort cae fuera de memoria, termina en disco.

La pregunta senior no es si existe un índice. Es si el índice coincide con filtro, orden y selectividad de la query real."

---

## Slide 6: Decision Fork: ¿Cómo Escalar?
**Título: Bifurcación de Decisión: ¿Cómo Escalar?**
"Incluso con buenos índices y vacuum sano, puedes superar un nodo. Ahí aparece la decisión.

**Cloud SQL HA.** Primary único con réplica síncrona. Techo práctico: 3–5K write TPS sostenidos. Piso cerca de US$ 350/mes. Elige esto para región única y SQL completo.

**AlloyDB.** Compatible con PostgreSQL, storage rediseñado y motor columnar para analytics sobre el mismo dato. Entrega cerca de 4x Cloud SQL y 15–20K TPS sin sharding. Piso cerca de US$ 600/mes. Elige esto para HTAP en PostgreSQL regional.

**Vitess o Citus.** Sharding sobre MySQL/PostgreSQL. Puede llegar a 30–50K TPS, pero tú operas shard maps, rebalanceo y transacciones cross-shard.

**Cloud Spanner.** Banco distribuido nativo. ~10K QPS por nodo, escala lineal y consistencia externa fuerte. Piso cerca de US$ 650/mes. Elige esto para más de 20K TPS, writes multi-región o cuando no puedes aceptar resharding manual.

Incluye costo de ingeniería: una factura barata con guardia permanente no es barata."

---

## Slide 7: OLTP Distribuido: Hash vs Range
**Título: OLTP Distribuido: Hash vs Range Sharding**
"Si eliges sharding manual, primero decides cómo dividir datos.

**Hash sharding.** `hash(user_id) mod N` distribuye usuarios entre shards. Es bueno para distribuir escrituras.

**Range sharding.** Divide por intervalos: IDs, fechas o regiones. Es bueno para queries por rango, pero crea hotspots si todo lo nuevo cae en el último rango.

Hash distribuye writes. Range favorece scans ordenados. El workload decide."

---

## Slide 8: Consistent Hashing
**Título: Evitando Hotspots con Consistent Hashing**
"Hash sharding parece simple hasta agregar un shard.

Con módulo, cambiar `N` de 10 a 11 mueve casi todas las claves. Consistent hashing pone claves y nodos en el mismo anillo lógico. Para guardar una clave, caminas en sentido horario hasta el siguiente nodo. Si un nodo falla, solo sus rangos se reasignan.

**Virtual nodes** hacen que cada nodo físico aparezca muchas veces. Así la carga se distribuye en intervalos pequeños y uniformes.

Advertencia senior: consistent hashing no arregla mal diseño de clave. Si un tenant genera 40% de los writes, hashear solo `tenant_id` sigue concentrando. Usa claves compuestas o buckets de escritura.

Diseño de hash es diseño de tráfico."

---

## Slide 9: Cloud Spanner
**Título: Cloud Spanner: Consistencia Distribuida**
"Spanner existe para no mantener anillos de sharding a las tres de la mañana.

Divide datos en splits, los distribuye y rebalancea automáticamente. Un nodo maneja ~10K QPS en teoría; en práctica dimensiona 5–7K. Storage cuesta cerca de US$ 0,30/GB-mes regional y US$ 0,50 multi-región. Un nodo regional ronda US$ 650/mes.

Spanner no es magia. El schema importa.

PK monotónica crea hotspot en el último split. Usa `BIT_REVERSE_POSITIVE`, UUID o prefijo hash. Interleaving co-localiza hijos bajo el padre, pero mantén padre + hijos bajo ~8 GB. Multi-región replica con Paxos y paga alrededor de 100 ms p50 de latencia de escritura.

Spanner quita el impuesto operativo del sharding, no el impuesto de modelado."

---

## Slide 10: BigQuery
**Título: BigQuery: Arquitectura del Motor Dremel**
"En analytics, la física cambia. BigQuery separa storage y compute.

Storage vive en Colossus con formato columnar Capacitor. Si consultas 3 columnas de 100, BigQuery lee solo esas 3. Partitioning y clustering deciden cuánto dato se escanea.

Compute se mide en slots. On-demand cobra ~US$ 6,25/TB escaneado. Editions cobra slot-hour: Standard ~US$ 0,04, Enterprise ~US$ 0,06. Breakeven cerca de 50 TB/mes.

BI Engine cachea datos calientes en memoria por ~US$ 30/GB-mes.

El costo de BigQuery no depende solo del volumen: depende de la forma de la query."

---

## Slide 11: Dos Físicas
**Título: Dos Físicas: OLTP vs OLAP**
"Spanner coordina writes. TrueTime da consistencia externa y Paxos la replica. El costo es latencia.

BigQuery coordina reads. Dremel divide la query en etapas y agrega resultados. El costo es shuffle.

OLTP coordina escrituras. OLAP coordina lecturas. Esa diferencia moldea ambos sistemas."

---

## Slide 12: CDC & Zero-ETL
**Título: El Pegamento: CDC & Zero-ETL**
"El sistema transaccional corre la app; el analítico corre decisiones.

Cron jobs con timestamp son anti-pattern: pierden deletes, duplican con drift y cargan producción.

Patrones: federated query para tiempo real con cuidado de pushdown; continuous queries para segundos dentro de BigQuery; CDC con Datastream o Spanner change streams para decenas de segundos; batch cuando la frescura puede ser de horas.

Elige por tabla, no por dogma."

---

## Slide 13: Tres Incidentes Reales
**Título: Ajustes Senior: Tres Incidentes Reales**
"Cloud SQL: tabla de 1,5 TB pasó de 200 ms a 4 s. Export nocturno mantenía una transacción 90 min y bloqueaba autovacuum. Se movió a réplica, se ajustó autovacuum y se recuperaron 600 GB.

Spanner: alerta de hotspot en 30K QPS, pero solo un nodo caliente. PK monotónica. Se corrigió con `BIT_REVERSE_POSITIVE(order_id)` y se recuperó headroom sin agregar nodos.

BigQuery: reporte escaneaba 4,2 TB por ejecución. `SELECT *` sin filtro de partición. Con clustering, filtro obligatorio y proyección de columnas bajó a 180 GB y 24x menos costo.

Misma lección: mira el plan, no confíes solo en SQL."

---

## Slide 14: Mandamientos
**Título: Mandamientos Arquitectónicos & Árbol de Decisión**
"Respeta el growth wall. Diseña claves para tráfico. La consistencia tiene precio. Clusteriza para la factura. No uses OLTP como OLAP. La física gana.

Árbol: writes multi-región o más de 20K TPS → **Cloud Spanner**. PostgreSQL + HTAP regional → **AlloyDB**. Menos de 5K TPS y una región → **Cloud SQL HA**. Analytics con scans mayores de 1 TB → **BigQuery**, Editions por encima de 50 TB/mes."

---

## Slide 15: Discusión
**Título: Discusión & Repositorio**
"Cubrimos OLTP, Cloud SQL, AlloyDB, sharding, Spanner, BigQuery, CDC, incidentes y decisión.

Arquitectura en escala no es elegir producto; es entender comportamiento bajo carga. Claves, planes, frescura y costo son las palancas.

Abrimos la discusión.

https://github.com/TheMasterRoot/Distributed-OLTP-vs-OLAP-on-GCP"
