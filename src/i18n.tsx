import React from 'react';

export type Language = 'en' | 'pt' | 'es';

export const LANGUAGES: Array<{ code: Language; label: string; name: string }> = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'es', label: 'ES', name: 'Español' },
];

const STORAGE_KEY = 'presentation-language';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'pt' || stored === 'es' || stored === 'en') {
    return stored;
  }

  return 'en';
}

export function persistLanguage(language: Language) {
  window.localStorage.setItem(STORAGE_KEY, language);
}

export const uiCopy = {
  en: {
    backToSlides: 'Back to slides',
    presentationScript: 'Presentation Script',
    qaBank: 'Q&A Bank',
    scriptIntro:
      'This page exposes the full speaker notes from presentation_script.md, so attendees can follow the detailed speech during or after the session.',
    qaIntro:
      'This page exposes the prepared Q&A from presentation_qa.md, so attendees can review anticipated questions and answers after the session.',
  },
  pt: {
    backToSlides: 'Voltar aos slides',
    presentationScript: 'Roteiro da Apresentação',
    qaBank: 'Banco de Perguntas',
    scriptIntro:
      'Esta página exibe as notas completas do apresentador em presentation_script.md, para que os participantes possam acompanhar o roteiro detalhado durante ou após a sessão.',
    qaIntro:
      'Esta página exibe o Q&A preparado em presentation_qa.md, para que os participantes possam revisar perguntas e respostas esperadas após a sessão.',
  },
  es: {
    backToSlides: 'Volver a los slides',
    presentationScript: 'Guion de la Presentación',
    qaBank: 'Banco de Preguntas',
    scriptIntro:
      'Esta página muestra las notas completas del presentador desde presentation_script.md, para que los asistentes puedan seguir el guion detallado durante o después de la sesión.',
    qaIntro:
      'Esta página muestra el Q&A preparado desde presentation_qa.md, para que los asistentes puedan revisar preguntas y respuestas esperadas después de la sesión.',
  },
} satisfies Record<Language, Record<string, string>>;

const translations: Record<Language, Record<string, string>> = {
  en: {},
  pt: {
    'Cloud Data Architecture at Scale': 'Arquitetura de Dados em Escala na Cloud',
    'Distributed OLTP ': 'OLTP Distribuído ',
    'vs OLAP on GCP': 'vs OLAP no GCP',
    'Deep Dive: Mastering Architectural Decisions ': 'Deep Dive: Dominando Decisões Arquiteturais ',
    '(Expert Level)': '(Nível Especialista)',
    'Senior Data Engineering Series • 2026': 'Série Sênior de Engenharia de Dados • 2026',
    'What We Will Cover Today': 'O Que Vamos Cobrir Hoje',
    'Session Roadmap': 'Roteiro da Sessão',
    'From OLTP Limits to OLAP Scale': 'Dos Limites de OLTP à Escala OLAP',
    'OLTP Growth Wall': 'O Limite de Crescimento do OLTP',
    'Cloud SQL internals, MVCC, WAL, bloat, indexes, and the moment vertical scaling stops helping.':
      'Internos do Cloud SQL, MVCC, WAL, bloat, índices e o momento em que escalar verticalmente deixa de ajudar.',
    'Distributed OLTP': 'OLTP Distribuído',
    'Manual sharding, hash vs range distribution, consistent hashing, hotspots, and Spanner key design.':
      'Sharding manual, distribuição por hash vs range, consistent hashing, hotspots e desenho de chaves no Spanner.',
    'OLAP with BigQuery': 'OLAP com BigQuery',
    'Dremel, slots, clustering, partitioning, shuffle, nested fields, and analytical cost control.':
      'Dremel, slots, clustering, partitioning, shuffle, campos aninhados e controle de custo analítico.',
    'Data Movement': 'Movimentação de Dados',
    'CDC, Datastream, Zero-ETL patterns, federated queries, and how to avoid hurting production.':
      'CDC, Datastream, padrões Zero-ETL, consultas federadas e como evitar impacto em produção.',
    'Under the Hood': 'Por Baixo do Capô',
    'TrueTime, Paxos, Dremel trees, query execution plans, and the real physics behind the services.':
      'TrueTime, Paxos, árvores Dremel, planos de execução e a física real por trás dos serviços.',
    'Practical Takeaways': 'Aprendizados Práticos',
    'Architecture rules you can reuse when choosing between Cloud SQL, Spanner, and BigQuery.':
      'Regras de arquitetura reutilizáveis ao escolher entre Cloud SQL, Spanner e BigQuery.',
    'OLTP Layer: The Growth Wall': 'Camada OLTP: O Limite de Crescimento',
    'When Single Node Fails': 'Quando Um Único Nó Falha',
    'Vertical Limit:': 'Limite Vertical:',
    ' Even with massive RAM, locking (MVCC bloat) and IOPS limits will eventually throttle you.':
      ' Mesmo com muita RAM, locks (MVCC bloat) e limites de IOPS eventualmente viram gargalo.',
    'The Dilemma:': 'O Dilema:',
    ' Do you try to shard your existing DB manually, or migrate to a globally distributed engine?':
      ' Você tenta shardear o banco atual manualmente ou migra para um engine globalmente distribuído?',
    'Connections:': 'Conexões:',
    ' Managed DBs solve management, but not the physics of single-node throughput bottlenecks.':
      ' Bancos gerenciados resolvem gestão, mas não a física dos gargalos de throughput em nó único.',
    'Point of No Return': 'Ponto Sem Retorno',
    'Writes/Sec': 'Writes/Sec',
    'Horizontal Limit': 'Limite Horizontal',
    '"Growth is a tax on infrastructure."': '"Crescimento é um imposto sobre a infraestrutura."',
    "In OLTP, performance is linear until it's not. Once you hit the locking overhead of a single disk writer, ":
      'Em OLTP, a performance é linear até deixar de ser. Quando você atinge o overhead de locks de um único writer em disco, ',
    "adding more CPU won't save you. You need to ": 'adicionar CPU não salva. Você precisa ',
    'distribute': 'distribuir',
    '.': '.',
    'Cloud SQL: MVCC & The WAL': 'Cloud SQL: MVCC & WAL',
    'Postgres Internals: MVCC': 'Internos do Postgres: MVCC',
    'Multi-Version Concurrency Control. Every UPDATE is a DELETE + INSERT.':
      'Multi-Version Concurrency Control. Cada UPDATE é um DELETE + INSERT.',
    'Table Bloat:': 'Table Bloat:',
    ' If autovacuum can\'t remove "Dead Tuples", your table grows physically, slowing down index scans and IO.':
      ' Se o autovacuum não remove "Dead Tuples", a tabela cresce fisicamente e degrada scans de índice e IO.',
    'WAL (Write Ahead Log):': 'WAL (Write Ahead Log):',
    ' Every change hits the log first. IOPS bottlenecks here kill commit speed.':
      ' Toda mudança passa primeiro pelo log. Gargalos de IOPS aqui matam a velocidade de commit.',
    'Detecting Bloat': 'Detectando Bloat',
    '"The reported size isn\'t always real."': '"O tamanho reportado nem sempre é real."',
    'A 100GB table might only have 40GB of "live" data. The rest is bloat. ':
      'Uma tabela de 100GB pode ter apenas 40GB de dados "live". O resto é bloat. ',
    'Senior Tip:': 'Dica Sênior:',
    ' Avoid long-running transactions on OLTP; they block the Vacuum horizon and rot the DB from the inside out.':
      ' Evite transações longas em OLTP; elas bloqueiam o horizonte do Vacuum e degradam o banco por dentro.',
    'Advanced Indexing: Beyond B-Trees': 'Indexação Avançada: Além de B-Trees',
    '01. Partial Indexes': '01. Índices Parciais',
    "Why index 100M rows if you only query 'ACTIVE' users? Save space and write IO.":
      "Por que indexar 100M de linhas se você só consulta usuários 'ACTIVE'? Economize espaço e write IO.",
    '02. Ordered (DESC) Indexes': '02. Índices Ordenados (DESC)',
    'Indexes are ordered. If you query `ORDER BY created_at DESC`, your index should match.':
      'Índices são ordenados. Se a query usa `ORDER BY created_at DESC`, o índice deve acompanhar.',
    '"Scanning is Losing"': '"Fazer Scan é Perder"',
    'Partial:': 'Partial:',
    ' Use for sparse columns or status-filtered queries.': ' Use para colunas esparsas ou queries filtradas por status.',
    'Ordered:': 'Ordered:',
    ' Use to avoid "External Sort" operations in RAM. ': ' Use para evitar operações de "External Sort" na RAM. ',
    'If the index is pre-sorted, the DB engine just reads the leaf nodes in order. Zero CPU cost.':
      'Se o índice já está ordenado, o engine lê os leaf nodes na ordem. Custo zero de CPU.',
    'Decision Fork: How to Scale?': 'Bifurcação de Decisão: Como Escalar?',
    'Dimension': 'Dimensão',
    'Cloud SQL HA': 'Cloud SQL HA',
    'AlloyDB': 'AlloyDB',
    'Vitess / Citus': 'Vitess / Citus',
    'Cloud Spanner': 'Cloud Spanner',
    'Sharding Model': 'Modelo de Sharding',
    'None (single primary)': 'Nenhum (primary único)',
    'Storage tier auto-scale': 'Auto-scale na camada de storage',
    'Extension / Sidecar': 'Extensão / Sidecar',
    'Native Transparent': 'Nativo Transparente',
    'Max Sustained Writes': 'Writes Sustentados Máximos',
    '~3–5K TPS': '~3–5K TPS',
    '~15–20K TPS': '~15–20K TPS',
    '~30–50K TPS': '~30–50K TPS',
    '~10K/node, linear': '~10K/nó, linear',
    'Cost Floor (regional)': 'Custo Mínimo (regional)',
    '~US$ 350/mo': '~US$ 350/mês',
    '~US$ 600/mo': '~US$ 600/mês',
    'infra + ops': 'infra + ops',
    '~US$ 650/mo': '~US$ 650/mês',
    'Consistency': 'Consistência',
    'Local strong': 'Forte local',
    'Strong per keyspace': 'Forte por keyspace',
    'Global (Paxos + TrueTime)': 'Global (Paxos + TrueTime)',
    'When to choose': 'Quando escolher',
    '<5K TPS, single region, full SQL surface': '<5K TPS, região única, superfície SQL completa',
    'HTAP on Postgres, regional only': 'HTAP em Postgres, apenas regional',
    "Already on Postgres, can't migrate keys": 'Já está em Postgres, não pode migrar chaves',
    '>20K TPS or multi-region writes': '>20K TPS ou writes multi-região',
    '"Include engineering cost in the comparison. A cheap line item with a permanent on-call rotation is not cheap."':
      '"Inclua custo de engenharia na comparação. Um item barato na fatura com plantão permanente não é barato."',
    'Distributed OLTP: Hash vs Range Sharding': 'OLTP Distribuído: Hash vs Range Sharding',
    'Sharding Logic: Hash vs Range': 'Lógica de Sharding: Hash vs Range',
    '01. Manual Hashing': '01. Hashing Manual',
    'Using `MOD(hash(key), N)` to distribute keys. Prevents hotspots but makes Range Scans (BETWEEN) impossible without hitting all shards.':
      'Usa `MOD(hash(key), N)` para distribuir chaves. Evita hotspots, mas torna range scans (BETWEEN) inviáveis sem consultar todos os shards.',
    '02. Application Complexity': '02. Complexidade na Aplicação',
    'The app must maintain a "Shard Map". Distributed transactions (2PC) become a performance nightmare.':
      'A aplicação precisa manter um "Shard Map". Transações distribuídas (2PC) viram pesadelo de performance.',
    'The Resharding Tax': 'O Imposto do Resharding',
    '"Scaling from 2 to 4 shards usually involves manual data migration, downtime, or building complex live-copy scripts. It is the silent killer of engineering velocity."':
      '"Escalar de 2 para 4 shards normalmente envolve migração manual, downtime ou scripts complexos de live-copy. É o assassino silencioso da velocidade de engenharia."',
    '// Manual Router Pseudo-code': '// Pseudocódigo de Roteador Manual',
    'Cons of Manual Path': 'Contras do Caminho Manual',
    '• No Global Referencial Integrity (Foreign Keys)': '• Sem integridade referencial global (Foreign Keys)',
    '• Backup/Restore consistency across shards is hard': '• Consistência de backup/restore entre shards é difícil',
    '• Complexity moves to the Developers': '• A complexidade vai para os desenvolvedores',
    'Avoiding Hotspots with Consistent Hashing': 'Evitando Hotspots com Consistent Hashing',
    'Hash Ring: Keys Move Clockwise': 'Hash Ring: Chaves Andam em Sentido Horário',
    'Every key and every node is hashed onto the same logical ring. To store a key,':
      'Cada chave e cada nó são hasheados no mesmo anel lógico. Para armazenar uma chave,',
    'move clockwise until you find the next node position. That node owns the data.':
      'ande em sentido horário até encontrar o próximo nó. Esse nó é dono dos dados.',
    'Why not ': 'Por que não ',
    '?': '?',
    'When ': 'Quando ',
    ' changes from 10 to 11, many keys calculate a different shard.':
      ' muda de 10 para 11, muitas chaves calculam um shard diferente.',
    'Consistent hashing avoids this by moving only the key range owned by the changed node.':
      'Consistent hashing evita isso movendo apenas o range de chaves pertencente ao nó alterado.',
    'Virtual Nodes Smooth the Load': 'Virtual Nodes Suavizam a Carga',
    'A physical node appears multiple times on the ring, like ': 'Um nó físico aparece várias vezes no anel, como ',
    ', and ': ', e ',
    'This prevents one unlucky node position from owning a huge portion of the key space.':
      'Isso evita que uma posição infeliz de nó seja dona de uma grande parte do espaço de chaves.',
    'Hotspot Reminder': 'Lembrete de Hotspot',
    'Hashing balances data positions, but the key must represent the real traffic.':
      'Hashing balanceia posições dos dados, mas a chave precisa representar o tráfego real.',
    'For a noisy tenant, prefer keys like ': 'Para um tenant ruidoso, prefira chaves como ',
    'instead of only ': 'em vez de apenas ',
    'Consistent Hashing': 'Consistent Hashing',
    'Ring Routing, Failure, and Virtual Nodes': 'Roteamento em Anel, Falha e Virtual Nodes',
    'Only affected ranges move': 'Apenas ranges afetados se movem',
    '1. Hash request': '1. Hash da requisição',
    '2. Walk clockwise': '2. Ande em sentido horário',
    '3. Use next healthy node': '3. Use o próximo nó saudável',
    'Cloud Spanner: Distributed Consistency': 'Cloud Spanner: Consistência Distribuída',
    'Throughput / node': 'Throughput / nó',
    '~10K QPS': '~10K QPS',
    '~5–7K in practice, linear scale': '~5–7K na prática, escala linear',
    'Storage cost': 'Custo de storage',
    '$0.30/GB': '$0.30/GB',
    'regional · $0.50 multi-region': 'regional · $0.50 multi-região',
    'Cost floor': 'Custo mínimo',
    '~$650/mo': '~$650/mês',
    '1 regional node minimum': 'mínimo de 1 nó regional',
    'Multi-region write p50': 'Write multi-região p50',
    '~100 ms': '~100 ms',
    'physics floor: Paxos quorum': 'limite físico: quorum Paxos',
    'Anti-Pattern: Monotonic PKs': 'Anti-pattern: PKs Monotônicas',
    'Incremental IDs concentrate writes on the last split — one node hot, the rest idle.':
      'IDs incrementais concentram writes no último split — um nó quente, o resto ocioso.',
    'Interleaving': 'Interleaving',
    'Co-locate child rows under parent. Joins become local. Rule: parent + children < 8 GB.':
      'Co-localize linhas filhas sob o pai. Joins viram locais. Regra: pai + filhos < 8 GB.',
    'Stored Columns': 'Stored Columns',
    'Add covering columns to indexes to avoid base-table lookups on hot read paths.':
      'Adicione colunas de cobertura aos índices para evitar lookups na tabela base em caminhos quentes de leitura.',
    'Spanner removes the sharding tax, not the modeling tax': 'Spanner remove o imposto do sharding, não o imposto de modelagem',
    'Even key distribution = linear scale with nodes. Monotonic keys = paying for N nodes, using one.':
      'Distribuição uniforme de chaves = escala linear com nós. Chaves monotônicas = pagar por N nós e usar um.',
    'BigQuery: The Dremel Engine Architecture': 'BigQuery: A Arquitetura do Engine Dremel',
    'Physical Layout: Partitioning vs Clustering': 'Layout Físico: Partitioning vs Clustering',
    'Partitioning:': 'Partitioning:',
    ' Logical slice (e.g., by Date). Stops BQ from scanning whole history.':
      ' Fatia lógica (ex.: por data). Impede o BQ de escanear todo o histórico.',
    'Clustering:': 'Clustering:',
    ' Physical sort within partition. Groups similar data together.':
      ' Ordenação física dentro da partição. Agrupa dados semelhantes.',
    'Standard DDL': 'DDL Padrão',
    'Slot Management': 'Gestão de Slots',
    'Slots are units of computation. Use ': 'Slots são unidades de computação. Use ',
    'Reservations': 'Reservations',
    ' for predictable runtime, or ': ' para runtime previsível, ou ',
    'On-Demand': 'On-Demand',
    ' for burst. Deeply monitor `avg_slot_ms` to find inefficient queries.':
      ' para picos. Monitore `avg_slot_ms` de perto para encontrar queries ineficientes.',
    'Anti-Pattern: The "Select *" Tax': 'Anti-pattern: O Imposto do "Select *"',
    'BQ is Columnar. Scanning unused columns is literal waste of money and throughput.':
      'BQ é columnar. Escanear colunas não usadas é desperdício literal de dinheiro e throughput.',
    'BI Engine & Search': 'BI Engine & Search',
    'For sub-second dashboard performance, activate ': 'Para dashboards subsegundo, ative ',
    'BI Engine': 'BI Engine',
    ' (In-memory analysis). ': ' (análise em memória). ',
    'For log analysis, leverage ': 'Para análise de logs, use ',
    'BigQuery Search Indexes': 'BigQuery Search Indexes',
    ' (`SEARCH` function).': ' (função `SEARCH`).',
    'Two Physics: OLTP vs OLAP Primitives': 'Duas Físicas: Primitivas OLTP vs OLAP',
    'Spanner: Paxos + TrueTime': 'Spanner: Paxos + TrueTime',
    'Spanner uses ': 'Spanner usa ',
    'Paxos': 'Paxos',
    ' for replication consistency and ': ' para consistência de replicação e ',
    'TrueTime': 'TrueTime',
    ' (Atomic clocks + GPS) to eliminate clock skew. ': ' (relógios atômicos + GPS) para eliminar clock skew. ',
    'This allows for "External Consistency" — the DB knows exactly when a transaction happened, globally.':
      'Isso permite "External Consistency" — o banco sabe exatamente quando uma transação aconteceu globalmente.',
    'BigQuery: Dremel Tree': 'BigQuery: Árvore Dremel',
    'BigQuery uses a ': 'BigQuery usa uma ',
    'Tree-structured execution': 'execução em árvore',
    '. Root server → Mixers → Leaf nodes (Slots). ': '. Servidor raiz → Mixers → Leaf nodes (Slots). ',
    'Data is stored in ': 'Dados são armazenados em ',
    'Capacitor': 'Capacitor',
    ' (Columnar), allowing for aggressive RLE compression and metadata-based filtering.':
      ' (columnar), permitindo compressão RLE agressiva e filtragem baseada em metadados.',
    'Cloud SQL: Multi-Version (MVCC)': 'Cloud SQL: Multi-Version (MVCC)',
    'Postgres uses ': 'Postgres usa ',
    '. Every update creates a new row version. ': '. Cada update cria uma nova versão da linha. ',
    'If your "Vacuum" can\'t keep up because of long transactions, you get ': 'Se o "Vacuum" não acompanha por causa de transações longas, você tem ',
    'Bloat': 'Bloat',
    '. Understanding WAL (Write Ahead Log) is key to recovery.': '. Entender WAL (Write Ahead Log) é chave para recuperação.',
    'The Glue: CDC & Zero-ETL': 'A Cola: CDC & Zero-ETL',
    'Syncing Without Killing Prod': 'Sincronizando Sem Matar Produção',
    'Input': 'Entrada',
    'CDC (Debezium/Datastream)': 'CDC (Debezium/Datastream)',
    'Reads DB logs (WAL) instead of querying tables. Zero impact on OLTP CPU.':
      'Lê logs do banco (WAL) em vez de consultar tabelas. Impacto zero na CPU do OLTP.',
    'Process': 'Processo',
    'Dataflow (Beam)': 'Dataflow (Beam)',
    'Stateful processing for deduplication and sessions. Handles late data.':
      'Processamento stateful para deduplicação e sessões. Lida com dados atrasados.',
    'Output': 'Saída',
    'BigQuery Write API': 'BigQuery Write API',
    'Storage-optimized ingest. High throughput, lower cost than traditional inserts.':
      'Ingestão otimizada para storage. Alto throughput, menor custo que inserts tradicionais.',
    'Cloud Spanner to BigQuery Federated Query': 'Cloud Spanner para BigQuery via Federated Query',
    'Need live data in BQ? Use `EXTERNAL_QUERY`. It pulls live data directly from Spanner into BQ memory for the JOIN, but be careful with pushdown filters!':
      'Precisa de dados live no BQ? Use `EXTERNAL_QUERY`. Ele puxa dados diretamente do Spanner para a memória do BQ para o JOIN, mas cuidado com pushdown de filtros!',
    'Senior Tweaks: Three Real Incidents': 'Ajustes Sênior: Três Incidentes Reais',
    'Case 01 · Cloud SQL': 'Caso 01 · Cloud SQL',
    'Silent bloat from a long transaction': 'Bloat silencioso por transação longa',
    'Symptom:': 'Sintoma:',
    ' 1.5 TB orders table; latency drifted 200 ms → 4 s over 6 months.':
      ' tabela de orders com 1,5 TB; latência foi de 200 ms → 4 s em 6 meses.',
    'Diagnosis:': 'Diagnóstico:',
    ' nightly export held a 90-min transaction, freezing the vacuum horizon. Dead tuples = 38%.':
      ' export noturno segurava transação de 90 min, congelando o horizonte do vacuum. Dead tuples = 38%.',
    'Fix:': 'Correção:',
    ' moved export to a read replica; lowered ': ' moveu export para read replica; reduziu ',
    'Result:': 'Resultado:',
    ' 250 ms p95 · 600 GB reclaimed': ' 250 ms p95 · 600 GB recuperados',
    'Case 02 · Spanner': 'Caso 02 · Spanner',
    '8 nodes paid, 1 node hot': '8 nós pagos, 1 nó quente',
    ' hot-shard alert at 30K QPS, cluster average utilization at 12%.':
      ' alerta de hot shard em 30K QPS, uso médio do cluster em 12%.',
    ' primary key was a monotonic ': ' primary key era monotônica ',
    ' — every write hit the last split.': ' — todo write caía no último split.',
    ' composite key prefixed with ': ' chave composta prefixada com ',
    ' even distribution · headroom restored · zero new nodes': ' distribuição uniforme · headroom restaurado · zero nós novos',
    'Case 03 · BigQuery': 'Caso 03 · BigQuery',
    '24x cheaper, same output': '24x mais barato, mesma saída',
    ' daily report scanned 4.2 TB · US$ 26/run · 3x/day.':
      ' relatório diário escaneava 4,2 TB · US$ 26/execução · 3x/dia.',
    ' with no partition filter on a partitioned-but-unclustered table.':
      ' sem filtro de partição em tabela particionada, mas sem clustering.',
    ' cluster on ': ' clusterizar por ',
    ', partition filter required, narrowed to 8 columns.': ', filtro de partição obrigatório, reduzido para 8 colunas.',
    ' 180 GB scanned · US$ 1.10/run · 24x cheaper': ' 180 GB escaneados · US$ 1,10/execução · 24x mais barato',
    'Senior Tweak Checklist': 'Checklist de Ajustes Sênior',
    'Always look at the plan. Never trust the SQL.': 'Sempre olhe o plano. Nunca confie apenas no SQL.',
    'Cloud SQL:': 'Cloud SQL:',
    ' watch ': ' observe ',
    'Spanner:': 'Spanner:',
    ' avoid transactions > 100 MB; they block Paxos.': ' evite transações > 100 MB; elas bloqueiam Paxos.',
    'BigQuery:': 'BigQuery:',
    ' nested/repeated fields beat massive self-joins.': ' campos nested/repeated vencem self-joins massivos.',
    'Architecture:': 'Arquitetura:',
    ' Storage Write API for high-throughput ingest.': ' Storage Write API para ingestão de alto throughput.',
    'Architectural Commandments & Decision Tree': 'Mandamentos Arquiteturais & Árvore de Decisão',
    'Six Commandments': 'Seis Mandamentos',
    'Respect the Growth Wall': 'Respeite o Limite de Crescimento',
    'One node is a great start, never a long-term strategy.': 'Um nó é um ótimo começo, nunca uma estratégia de longo prazo.',
    'Keys for Traffic, Not Rows': 'Chaves para Tráfego, Não Linhas',
    'A bad distribution key hot-spots any system.': 'Uma chave ruim cria hotspot em qualquer sistema.',
    'Consistency Has a Price': 'Consistência Tem Preço',
    'Multi-region writes ≈ 100 ms p50. Every time.': 'Writes multi-região ≈ 100 ms p50. Sempre.',
    'Cluster for the Bill': 'Clusterize pela Fatura',
    'In BQ, layout is cost control, not just performance.': 'No BQ, layout é controle de custo, não só performance.',
    "Don't Use OLTP as OLAP": 'Não Use OLTP como OLAP',
    'CDC, change streams, federation. Each system does its job.':
      'CDC, change streams, federação. Cada sistema faz seu trabalho.',
    'Physics Wins': 'A Física Vence',
    'Network, disk, and coordination set the ceiling.': 'Rede, disco e coordenação definem o teto.',
    'Decision Tree': 'Árvore de Decisão',
    'From workload signal to GCP service': 'Do sinal da carga ao serviço GCP',
    'Step 1 · Spanner': 'Passo 1 · Spanner',
    'Multi-region writes ': 'Writes multi-região ',
    'or': 'ou',
    ' > 20K TPS?': ' > 20K TPS?',
    'Choose ': 'Escolha ',
    ' — global consistency, linear scale.': ' — consistência global, escala linear.',
    'Step 2 · AlloyDB': 'Passo 2 · AlloyDB',
    'PostgreSQL features + HTAP, regional only?': 'Recursos PostgreSQL + HTAP, apenas regional?',
    ' — ~4x Cloud SQL writes, columnar engine.': ' — ~4x writes do Cloud SQL, engine columnar.',
    'Step 3 · Cloud SQL': 'Passo 3 · Cloud SQL',
    '< 5K TPS, single region, mainstream SQL?': '< 5K TPS, região única, SQL comum?',
    ' — simplest, ~US$ 350/mo floor.': ' — mais simples, piso ~US$ 350/mês.',
    'Step 4 · BigQuery': 'Passo 4 · BigQuery',
    'Analytical, > 1 TB scans?': 'Analítico, scans > 1 TB?',
    ' — Editions once > 50 TB/mo.': ' — Editions quando > 50 TB/mês.',
    "\"If you're not analyzing your query plans daily, you're not architecting — you're hoping.\"":
      '"Se você não analisa seus query plans diariamente, você não está arquitetando — está torcendo."',
    'Discussion & Repository': 'Discussão & Repositório',
    'Questions?': 'Perguntas?',
    "Let's discuss Slot management, Spanner split points, or Federation strategies.":
      'Vamos discutir gestão de slots, split points no Spanner ou estratégias de federação.',
    'Repository': 'Repositório',
    'Download the source and presentation material': 'Baixe o código-fonte e o material da apresentação',
    'Speaker Notes': 'Notas do Apresentador',
    'Open the full speech at /script': 'Abra o roteiro completo em /script',
    'Q&A Bank': 'Banco de Q&A',
    'Open prepared Q&A at /qa': 'Abra o Q&A preparado em /qa',
    'Query Plan Analysis': 'Análise de Query Plan',
    'Distributed Storage': 'Storage Distribuído',
    'Data Reliability': 'Confiabilidade de Dados',
    'Data Architecture Masterclass': 'Masterclass de Arquitetura de Dados',
    'Architectural Decisions & Real-World Pitfalls': 'Decisões Arquiteturais & Armadilhas Reais',
    'SESSION: POD GDC-02': 'SESSÃO: POD GDC-02',
    'Next: ': 'Próximo: ',
    'End of Presentation': 'Fim da Apresentação',
    'Horizontal Scaling': 'Escala Horizontal',
    'TrueTime Consistency': 'Consistência TrueTime',
    'Columnar Magic': 'Magia Columnar',
  },
  es: {
    'Cloud Data Architecture at Scale': 'Arquitectura de Datos en Escala en la Nube',
    'Distributed OLTP ': 'OLTP Distribuido ',
    'vs OLAP on GCP': 'vs OLAP en GCP',
    'Deep Dive: Mastering Architectural Decisions ': 'Deep Dive: Dominando Decisiones Arquitectónicas ',
    '(Expert Level)': '(Nivel Experto)',
    'Senior Data Engineering Series • 2026': 'Serie Senior de Ingeniería de Datos • 2026',
    'What We Will Cover Today': 'Qué Cubriremos Hoy',
    'Session Roadmap': 'Ruta de la Sesión',
    'From OLTP Limits to OLAP Scale': 'De Límites OLTP a Escala OLAP',
    'OLTP Growth Wall': 'El Muro de Crecimiento de OLTP',
    'Cloud SQL internals, MVCC, WAL, bloat, indexes, and the moment vertical scaling stops helping.':
      'Internos de Cloud SQL, MVCC, WAL, bloat, índices y el momento en que escalar verticalmente deja de ayudar.',
    'Distributed OLTP': 'OLTP Distribuido',
    'Manual sharding, hash vs range distribution, consistent hashing, hotspots, and Spanner key design.':
      'Sharding manual, distribución hash vs range, consistent hashing, hotspots y diseño de claves en Spanner.',
    'OLAP with BigQuery': 'OLAP con BigQuery',
    'Dremel, slots, clustering, partitioning, shuffle, nested fields, and analytical cost control.':
      'Dremel, slots, clustering, partitioning, shuffle, campos anidados y control de costo analítico.',
    'Data Movement': 'Movimiento de Datos',
    'CDC, Datastream, Zero-ETL patterns, federated queries, and how to avoid hurting production.':
      'CDC, Datastream, patrones Zero-ETL, consultas federadas y cómo evitar dañar producción.',
    'Under the Hood': 'Bajo el Capó',
    'TrueTime, Paxos, Dremel trees, query execution plans, and the real physics behind the services.':
      'TrueTime, Paxos, árboles Dremel, planes de ejecución y la física real detrás de los servicios.',
    'Practical Takeaways': 'Aprendizajes Prácticos',
    'Architecture rules you can reuse when choosing between Cloud SQL, Spanner, and BigQuery.':
      'Reglas de arquitectura reutilizables al elegir entre Cloud SQL, Spanner y BigQuery.',
    'OLTP Layer: The Growth Wall': 'Capa OLTP: El Muro de Crecimiento',
    'When Single Node Fails': 'Cuando Un Solo Nodo Falla',
    'Vertical Limit:': 'Límite Vertical:',
    ' Even with massive RAM, locking (MVCC bloat) and IOPS limits will eventually throttle you.':
      ' Incluso con mucha RAM, locks (MVCC bloat) y límites de IOPS eventualmente te frenan.',
    'The Dilemma:': 'El Dilema:',
    ' Do you try to shard your existing DB manually, or migrate to a globally distributed engine?':
      ' ¿Shardear manualmente el DB actual o migrar a un motor globalmente distribuido?',
    'Connections:': 'Conexiones:',
    ' Managed DBs solve management, but not the physics of single-node throughput bottlenecks.':
      ' Los DB gestionados resuelven gestión, pero no la física de un cuello de botella en un solo nodo.',
    'Point of No Return': 'Punto Sin Retorno',
    'Writes/Sec': 'Writes/Sec',
    'Horizontal Limit': 'Límite Horizontal',
    '"Growth is a tax on infrastructure."': '"El crecimiento es un impuesto sobre la infraestructura."',
    "In OLTP, performance is linear until it's not. Once you hit the locking overhead of a single disk writer, ":
      'En OLTP, el rendimiento es lineal hasta que deja de serlo. Al llegar al overhead de locks de un único writer en disco, ',
    "adding more CPU won't save you. You need to ": 'agregar CPU no te salva. Necesitas ',
    'distribute': 'distribuir',
    'Cloud SQL: MVCC & The WAL': 'Cloud SQL: MVCC & WAL',
    'Postgres Internals: MVCC': 'Internos de Postgres: MVCC',
    'Multi-Version Concurrency Control. Every UPDATE is a DELETE + INSERT.':
      'Multi-Version Concurrency Control. Cada UPDATE es un DELETE + INSERT.',
    'Table Bloat:': 'Table Bloat:',
    ' If autovacuum can\'t remove "Dead Tuples", your table grows physically, slowing down index scans and IO.':
      ' Si autovacuum no elimina "Dead Tuples", la tabla crece físicamente y degrada scans de índice e IO.',
    'WAL (Write Ahead Log):': 'WAL (Write Ahead Log):',
    ' Every change hits the log first. IOPS bottlenecks here kill commit speed.':
      ' Cada cambio pasa primero por el log. Cuellos de IOPS aquí matan la velocidad de commit.',
    'Detecting Bloat': 'Detectando Bloat',
    '"The reported size isn\'t always real."': '"El tamaño reportado no siempre es real."',
    'A 100GB table might only have 40GB of "live" data. The rest is bloat. ':
      'Una tabla de 100GB puede tener solo 40GB de datos "live". El resto es bloat. ',
    'Senior Tip:': 'Consejo Senior:',
    ' Avoid long-running transactions on OLTP; they block the Vacuum horizon and rot the DB from the inside out.':
      ' Evita transacciones largas en OLTP; bloquean el horizonte de Vacuum y degradan el DB desde adentro.',
    'Advanced Indexing: Beyond B-Trees': 'Indexación Avanzada: Más Allá de B-Trees',
    '01. Partial Indexes': '01. Índices Parciales',
    "Why index 100M rows if you only query 'ACTIVE' users? Save space and write IO.":
      "¿Por qué indexar 100M filas si solo consultas usuarios 'ACTIVE'? Ahorra espacio y write IO.",
    '02. Ordered (DESC) Indexes': '02. Índices Ordenados (DESC)',
    'Indexes are ordered. If you query `ORDER BY created_at DESC`, your index should match.':
      'Los índices son ordenados. Si consultas `ORDER BY created_at DESC`, el índice debe coincidir.',
    '"Scanning is Losing"': '"Escanear es Perder"',
    'Partial:': 'Partial:',
    ' Use for sparse columns or status-filtered queries.': ' Úsalo para columnas dispersas o queries filtradas por estado.',
    'Ordered:': 'Ordered:',
    ' Use to avoid "External Sort" operations in RAM. ': ' Úsalo para evitar operaciones de "External Sort" en RAM. ',
    'If the index is pre-sorted, the DB engine just reads the leaf nodes in order. Zero CPU cost.':
      'Si el índice ya está ordenado, el motor lee los leaf nodes en orden. Costo cero de CPU.',
    'Decision Fork: How to Scale?': 'Bifurcación de Decisión: ¿Cómo Escalar?',
    'Dimension': 'Dimensión',
    'Sharding Model': 'Modelo de Sharding',
    'None (single primary)': 'Ninguno (primary único)',
    'Storage tier auto-scale': 'Auto-scale en capa de storage',
    'Extension / Sidecar': 'Extensión / Sidecar',
    'Native Transparent': 'Nativo Transparente',
    'Max Sustained Writes': 'Writes Sustentados Máximos',
    'Cost Floor (regional)': 'Costo Mínimo (regional)',
    '~US$ 350/mo': '~US$ 350/mes',
    '~US$ 600/mo': '~US$ 600/mes',
    'infra + ops': 'infra + ops',
    '~US$ 650/mo': '~US$ 650/mes',
    'Consistency': 'Consistencia',
    'Local strong': 'Fuerte local',
    'Strong per keyspace': 'Fuerte por keyspace',
    'Global (Paxos + TrueTime)': 'Global (Paxos + TrueTime)',
    'When to choose': 'Cuándo elegir',
    '<5K TPS, single region, full SQL surface': '<5K TPS, región única, superficie SQL completa',
    'HTAP on Postgres, regional only': 'HTAP en Postgres, solo regional',
    "Already on Postgres, can't migrate keys": 'Ya está en Postgres, no puede migrar claves',
    '>20K TPS or multi-region writes': '>20K TPS o writes multi-región',
    '"Include engineering cost in the comparison. A cheap line item with a permanent on-call rotation is not cheap."':
      '"Incluye el costo de ingeniería. Un ítem barato con guardia permanente no es barato."',
    'Distributed OLTP: Hash vs Range Sharding': 'OLTP Distribuido: Hash vs Range Sharding',
    'Sharding Logic: Hash vs Range': 'Lógica de Sharding: Hash vs Range',
    '01. Manual Hashing': '01. Hashing Manual',
    '02. Application Complexity': '02. Complejidad en la Aplicación',
    'The Resharding Tax': 'El Impuesto del Resharding',
    'Avoiding Hotspots with Consistent Hashing': 'Evitando Hotspots con Consistent Hashing',
    'Hash Ring: Keys Move Clockwise': 'Hash Ring: Las Claves Avanzan en Sentido Horario',
    'Virtual Nodes Smooth the Load': 'Virtual Nodes Suavizan la Carga',
    'Hotspot Reminder': 'Recordatorio de Hotspot',
    'Consistent Hashing': 'Consistent Hashing',
    'Ring Routing, Failure, and Virtual Nodes': 'Ruteo en Anillo, Falla y Virtual Nodes',
    'Only affected ranges move': 'Solo se mueven los ranges afectados',
    '1. Hash request': '1. Hash de la request',
    '2. Walk clockwise': '2. Avanza en sentido horario',
    '3. Use next healthy node': '3. Usa el siguiente nodo sano',
    'Cloud Spanner: Distributed Consistency': 'Cloud Spanner: Consistencia Distribuida',
    'Throughput / node': 'Throughput / nodo',
    '~5–7K in practice, linear scale': '~5–7K en la práctica, escala lineal',
    'Storage cost': 'Costo de storage',
    'regional · $0.50 multi-region': 'regional · $0.50 multi-región',
    'Cost floor': 'Costo mínimo',
    '~$650/mo': '~$650/mes',
    '1 regional node minimum': 'mínimo de 1 nodo regional',
    'Multi-region write p50': 'Write multi-región p50',
    'physics floor: Paxos quorum': 'límite físico: quorum Paxos',
    'Anti-Pattern: Monotonic PKs': 'Anti-pattern: PKs Monotónicas',
    'Interleaving': 'Interleaving',
    'Stored Columns': 'Stored Columns',
    'Spanner removes the sharding tax, not the modeling tax': 'Spanner elimina el impuesto de sharding, no el de modelado',
    'BigQuery: The Dremel Engine Architecture': 'BigQuery: Arquitectura del Motor Dremel',
    'Physical Layout: Partitioning vs Clustering': 'Layout Físico: Partitioning vs Clustering',
    'Standard DDL': 'DDL Estándar',
    'Slot Management': 'Gestión de Slots',
    'Anti-Pattern: The "Select *" Tax': 'Anti-pattern: El Impuesto del "Select *"',
    'BI Engine & Search': 'BI Engine & Search',
    'Two Physics: OLTP vs OLAP Primitives': 'Dos Físicas: Primitivas OLTP vs OLAP',
    'The Glue: CDC & Zero-ETL': 'El Pegamento: CDC & Zero-ETL',
    'Syncing Without Killing Prod': 'Sincronizar Sin Matar Producción',
    'Input': 'Entrada',
    'Process': 'Proceso',
    'Output': 'Salida',
    'Cloud Spanner to BigQuery Federated Query': 'Cloud Spanner a BigQuery con Federated Query',
    'Senior Tweaks: Three Real Incidents': 'Ajustes Senior: Tres Incidentes Reales',
    'Case 01 · Cloud SQL': 'Caso 01 · Cloud SQL',
    'Silent bloat from a long transaction': 'Bloat silencioso por una transacción larga',
    'Symptom:': 'Síntoma:',
    'Diagnosis:': 'Diagnóstico:',
    'Fix:': 'Corrección:',
    'Result:': 'Resultado:',
    'Case 02 · Spanner': 'Caso 02 · Spanner',
    '8 nodes paid, 1 node hot': '8 nodos pagos, 1 nodo caliente',
    'Case 03 · BigQuery': 'Caso 03 · BigQuery',
    '24x cheaper, same output': '24x más barato, mismo resultado',
    'Senior Tweak Checklist': 'Checklist de Ajustes Senior',
    'Always look at the plan. Never trust the SQL.': 'Siempre mira el plan. Nunca confíes solo en el SQL.',
    'Architectural Commandments & Decision Tree': 'Mandamientos Arquitectónicos & Árbol de Decisión',
    'Six Commandments': 'Seis Mandamientos',
    'Respect the Growth Wall': 'Respeta el Muro de Crecimiento',
    'One node is a great start, never a long-term strategy.': 'Un nodo es un gran comienzo, nunca una estrategia a largo plazo.',
    'Keys for Traffic, Not Rows': 'Claves para Tráfico, No Filas',
    'A bad distribution key hot-spots any system.': 'Una mala clave de distribución crea hotspots en cualquier sistema.',
    'Consistency Has a Price': 'La Consistencia Tiene Precio',
    'Multi-region writes ≈ 100 ms p50. Every time.': 'Writes multi-región ≈ 100 ms p50. Siempre.',
    'Cluster for the Bill': 'Clusteriza por la Factura',
    'In BQ, layout is cost control, not just performance.': 'En BQ, el layout controla costo, no solo rendimiento.',
    "Don't Use OLTP as OLAP": 'No Uses OLTP como OLAP',
    'CDC, change streams, federation. Each system does its job.':
      'CDC, change streams, federación. Cada sistema hace su trabajo.',
    'Physics Wins': 'La Física Gana',
    'Network, disk, and coordination set the ceiling.': 'Red, disco y coordinación definen el techo.',
    'Decision Tree': 'Árbol de Decisión',
    'From workload signal to GCP service': 'De la señal de workload al servicio GCP',
    'Step 1 · Spanner': 'Paso 1 · Spanner',
    'Step 2 · AlloyDB': 'Paso 2 · AlloyDB',
    'Step 3 · Cloud SQL': 'Paso 3 · Cloud SQL',
    'Step 4 · BigQuery': 'Paso 4 · BigQuery',
    'Discussion & Repository': 'Discusión & Repositorio',
    'Questions?': '¿Preguntas?',
    "Let's discuss Slot management, Spanner split points, or Federation strategies.":
      'Hablemos de gestión de slots, split points de Spanner o estrategias de federación.',
    'Repository': 'Repositorio',
    'Download the source and presentation material': 'Descarga el código fuente y el material de la presentación',
    'Speaker Notes': 'Notas del Presentador',
    'Open the full speech at /script': 'Abre el guion completo en /script',
    'Q&A Bank': 'Banco de Q&A',
    'Open prepared Q&A at /qa': 'Abre el Q&A preparado en /qa',
    'Query Plan Analysis': 'Análisis de Query Plan',
    'Distributed Storage': 'Storage Distribuido',
    'Data Reliability': 'Confiabilidad de Datos',
    'Data Architecture Masterclass': 'Masterclass de Arquitectura de Datos',
    'Architectural Decisions & Real-World Pitfalls': 'Decisiones Arquitectónicas & Trampas Reales',
    'SESSION: POD GDC-02': 'SESIÓN: POD GDC-02',
    'Next: ': 'Siguiente: ',
    'End of Presentation': 'Fin de la Presentación',
    'Horizontal Scaling': 'Escalado Horizontal',
    'TrueTime Consistency': 'Consistencia TrueTime',
    'Columnar Magic': 'Magia Columnar',
  },
};

export function translateText(text: string, language: Language): string {
  if (language === 'en') {
    return text;
  }

  return translations[language][text] ?? text;
}

export function translateNode(node: React.ReactNode, language: Language): React.ReactNode {
  if (language === 'en') {
    return node;
  }

  if (typeof node === 'string') {
    return translateText(node, language);
  }

  if (Array.isArray(node)) {
    return node.map((child) => translateNode(child, language));
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    const children = node.props.children;
    if (children === undefined) {
      return node;
    }

    return React.cloneElement(node, {
      children: translateNode(children, language),
    });
  }

  return node;
}

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}

export function LanguageSelector({ language, onLanguageChange, className = '' }: LanguageSelectorProps) {
  return (
    <div className={`inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm ${className}`}>
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onLanguageChange(item.code)}
          aria-label={`Switch language to ${item.name}`}
          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition ${
            language === item.code
              ? 'bg-[#4285F4] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#1967D2]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
