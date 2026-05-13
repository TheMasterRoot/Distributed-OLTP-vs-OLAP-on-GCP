# Roteiro da Apresentação: Cloud Data Architecture at Scale (Nível Sênior)

> Meta do apresentador: 28 minutos de fala (~3.000 palavras) + 2 minutos de margem. Mais 30 minutos de Q&A — veja `presentation_qa.pt.md`.

## Slide 1: Introdução
**Título: Deep Dive: Dominando Decisões Arquiteturais (Nível Especialista)**
"Olá, pessoal. Hoje vamos além da definição de livro: OLTP é para transações e OLAP é para analytics. A maioria aqui já sabe isso. A pergunta difícil começa quando o sistema cresce.

Em produção, as perguntas mudam. O que acontece com a latência de escrita quando o volume dobra? O que acontece com a fatura do BigQuery quando alguém escreve um `SELECT *` ruim? Quando um banco deixa de ser suficiente? E como conectamos o mundo transacional ao analítico sem quebrar nenhum dos dois?

No GCP, Cloud SQL, AlloyDB, Cloud Spanner, BigQuery e Datastream respondem a essas perguntas de formas diferentes. O objetivo desta sessão é sair com números, trade-offs e um framework de decisão aplicável na segunda-feira."

---

## Slide 2: Roadmap
**Título: O Que Vamos Cobrir Hoje**
"Roteiro rápido antes do deep dive.

Começamos na camada OLTP com o growth wall — por que um banco relacional único eventualmente deixa de escalar, mesmo na maior instância. Depois abrimos o capô do Cloud SQL: MVCC, bloat e Write Ahead Log, porque esses mecanismos explicam muitos incidentes reais.

Daí passamos por indexação, pela decisão entre Cloud SQL, AlloyDB, Postgres shardado e Spanner, depois hash versus range sharding e consistent hashing com virtual nodes. Isso leva ao Spanner como alternativa gerenciada.

Depois vamos para BigQuery: Dremel, slots, clustering e modelo de custo. Conectamos os mundos com CDC, change streams e continuous queries, vemos três micro-casos reais e fechamos com uma árvore de decisão."

---

## Slide 3: Camada OLTP: O Growth Wall
**Título: Camada OLTP: O Limite de Crescimento**
"A maioria dos sistemas começa igual: um nó relacional único.

No início isso funciona muito bem. Cloud SQL entrega transações, índices, joins, backups e simplicidade operacional. O time anda rápido porque o modelo é familiar e tudo está local.

Depois as transações crescem. Escalar verticalmente compra tempo. Cloud SQL hoje chega a 128 vCPU e cerca de 864 GB de RAM no Enterprise Plus. É bastante capacidade, mas não é infinito. E o muro raramente é CPU.

**O mecanismo.** Em PostgreSQL, cada `UPDATE` cria uma nova versão da linha por causa do MVCC — Multi-Version Concurrency Control. Excelente para concorrência, caro sob pressão. Se a taxa de escrita supera a capacidade do autovacuum de limpar dead tuples, você acumula bloat, locks disputam recursos e adicionar CPU deixa de ajudar. Na prática, Cloud SQL começa a bater nesse muro entre três e cinco mil write TPS sustentados em uma instância pesada — antes disso se a carga for muito contenciosa.

**A bifurcação.** Esse é o growth wall: o gargalo deixa de ser hardware e vira coordenação. Antes do Spanner existe uma parada intermediária — AlloyDB. A mesma API PostgreSQL, storage redesenhado e cerca de quatro vezes o throughput de escrita do Cloud SQL. Voltaremos a essa decisão."

---

## Slide 4: Cloud SQL Deep Dive: MVCC, Bloat e WAL
**Título: Cloud SQL: MVCC & WAL**
"O overhead de coordenação é o problema visível. Mas há outro mais silencioso dentro do engine.

Quando uma instância Cloud SQL fica lenta, a reação comum é culpar disco ou tamanho da instância. Às vezes é isso. Muitas vezes a causa real são dois mecanismos internos do PostgreSQL.

**MVCC e bloat.** Um `UPDATE` não substitui a linha no lugar. O PostgreSQL mantém a versão antiga e escreve uma nova. O `autovacuum` limpa isso, mas apenas versões invisíveis para transações ativas. Se um export, relatório ou query analítica mantém uma transação aberta, o horizonte de visibilidade congela e o autovacuum não consegue recuperar espaço.

O sinal a observar é `n_dead_tup` sobre `n_live_tup` em `pg_stat_user_tables`. Acima de 20% em tabela de alta mutação, você já perde performance para bloat. Se `last_autovacuum` está há mais de 24 horas nessa tabela, você não está perdendo — está sangrando.

**WAL.** Antes de tocar a tabela, o PostgreSQL escreve no Write Ahead Log. O WAL garante durabilidade e recuperação. Cada commit faz flush. Em SSD, cada `fsync` custa cerca de 1 a 3 ms. Com 5.000 commits por segundo, você satura fsync, não CPU. Por isso batch de pequenas escritas é uma das vitórias mais simples em OLTP.

Takeaway: performance de Cloud SQL não é só tamanho de instância. É disciplina transacional, saúde do vacuum e pressão no WAL."

---

## Slide 5: Indexação Avançada: Ordered vs Partial
**Título: Indexação Avançada: Além de B-Trees**
"Se MVCC e WAL são o coração do engine, índices são o volante. E mais volante não ajuda.

Índices parecem gratuitos. Não são. Cada índice consome storage, memória e write IO — exatamente o recurso mais disputado em OLTP.

Vejo sistemas com oito, dez, doze índices em uma tabela, muitos sem benefício real. Duas técnicas reduzem esse excesso: partial indexes e ordered indexes.

**Partial indexes.** Imagine uma tabela de pedidos com 500 milhões de linhas, mas os dashboards só consultam pedidos ativos, talvez 2% da tabela. Indexar tudo é desperdício. Em PostgreSQL, `CREATE INDEX ... WHERE status = 'ACTIVE'` cria índice apenas para essas linhas. Menor, mais cacheável e com menor overhead de escrita.

**Ordered indexes.** Muita latência OLTP vem de sorts. Se a query usa `ORDER BY created_at DESC`, o índice precisa combinar com esse acesso. Quando o sort estoura `work_mem`, ele vira external sort em disco — e milissegundos viram segundos.

A pergunta sênior não é 'tenho índice nessa coluna?'. É 'o índice combina com filtro, ordem e seletividade da query real?'"

---

## Slide 6: Decision Fork: Como Escalar?
**Título: Bifurcação de Decisão: Como Escalar?**
"Mesmo com bons índices e vacuum saudável, você pode superar um nó. Aqui aparece a decisão de arquitetura. Quatro opções reais no GCP.

**Cloud SQL HA.** Primary único com réplica síncrona. Teto prático em torno de 3–5K write TPS sustentados. Piso de custo perto de US$ 350/mês para um par HA pequeno. Escolha quando estiver abaixo desse orçamento de TPS, em uma região, e quiser superfície completa de PostgreSQL ou MySQL.

**AlloyDB.** Compatível com PostgreSQL, mas com storage redesenhado, separação storage/compute e engine columnar para queries analíticas no mesmo dado. Na prática entrega cerca de 4x o throughput do Cloud SQL, chega a 15–20K TPS sem sharding e roda regionalmente. Piso em torno de US$ 600/mês. Escolha quando quiser HTAP em PostgreSQL e puder ficar regional.

**Vitess ou Citus.** Extensões/proxies de sharding sobre MySQL ou PostgreSQL. Levam mais longe — 30–50K TPS é alcançável — mas você ainda possui a complexidade: shard maps, rebalanceamento e transações cross-shard. O custo é engenharia.

**Cloud Spanner.** Banco distribuído nativo. Cerca de 10K QPS por nó, escala linear, consistência forte externa e writes multi-região se necessário. Piso em torno de US$ 650/mês por nó regional. Escolha acima de 20K TPS, quando writes multi-região são requisito real, ou quando você não pode aceitar resharding manual.

Regra direta: inclua custo de engenharia. Um item barato na fatura com plantão permanente por trás não é barato."

---

## Slide 7: OLTP Distribuído: Hash vs Range Sharding
**Título: OLTP Distribuído: Hash vs Range Sharding**
"Se você segue o caminho manual, mesmo temporariamente, há uma decisão antes de todas: como dividir os dados. Duas estratégias dominam — hash e range.

**Hash sharding.** Uma função hash transforma uma chave em número de shard, algo como `hash(user_id) mod N`. O benefício é distribuição. IDs recentes não ficam todos no mesmo nó.

**Range sharding.** Dados são separados por intervalos ordenados: IDs, datas, regiões. É ótimo para range queries — todos os pedidos de março estão em poucos shards. O custo são hotspots: se todos os pedidos de hoje caem no shard de hoje, ele recebe quase toda a escrita.

Trade-off simples: hash é melhor para distribuir writes; range é melhor para acesso ordenado e scans. A carga escolhe a resposta."

---

## Slide 8: Evitando Hotspots com Consistent Hashing
**Título: Evitando Hotspots com Consistent Hashing**
"Hash sharding parece limpo até você precisar adicionar um shard. É aí que consistent hashing importa.

Hotspot é excesso de tráfego em um shard, key range ou partição física. IDs sequenciais, timestamps e tenants ruidosos são causas clássicas. Hash por módulo piora o resharding: mudar `N` de 10 para 11 muda o resultado para quase todas as chaves. Esse é o imposto do resharding.

**Consistent hashing.** Chaves e nós vivem no mesmo anel lógico. Para posicionar uma chave, você a hasheia no anel e caminha em sentido horário até o próximo nó. Se um nó falha, as chaves afetadas caminham para o próximo saudável. A propriedade importante: apenas ranges próximos ao nó alterado se movem.

**Virtual nodes.** Um nó físico aparece várias vezes no anel — A1, A2, A3. Sem isso, um nó pode ficar dono de uma fatia grande demais do anel. Com virtual nodes, a posse é dividida em intervalos menores e mais uniformes.

Aviso sênior: consistent hashing resolve mecânica de distribuição, não design de chave. Se um tenant gera 40% dos writes, hash apenas por `tenant_id` ainda concentra carga. Use chave composta como `hash(tenant_id + user_id)` ou write buckets como `hash(user_id + time_bucket)`.

Design de hash é design de workload. Você não hasheia linhas; hasheia tráfego."

---

## Slide 9: Cloud Spanner: Consistência Distribuída
**Título: Cloud Spanner: Consistência Distribuída**
"Consistent hashing é elegante no quadro branco. Mas quem quer manter esse anel às três da manhã em incidente? Spanner existe porque alguém disse não.

Spanner dá escala horizontal, consistência forte e disponibilidade global sem você manter o ring. Ele divide dados em ranges chamados splits, distribui entre nós e rebalanceia automaticamente.

Números práticos: um nó Spanner lida com cerca de 10K QPS em teoria; na prática dimensione 5–7K para workloads transacionais realistas. Storage custa cerca de US$ 0,30/GB-mês regional e US$ 0,50 multi-região. Um nó regional custa perto de US$ 650/mês.

Spanner não é mágica. Schema ainda manda.

**Armadilha da primary key.** Spanner armazena linhas ordenadas pela primary key. Chave monotônica — auto-incremento ou timestamp — concentra writes no último split. Adicionar nós não resolve porque os writes continuam indo para o mesmo lugar. Use `BIT_REVERSE_POSITIVE`, UUIDs ou prefixos hash.

**Interleaving.** Permite co-localizar filhos sob o pai. Customers e Orders juntos tornam joins locais. Regra: pai + filhos interleaved devem ficar abaixo de 8 GB; acima disso a localidade colapsa.

**Multi-região.** Spanner multi-região replica via Paxos entre continentes. Isso dá resiliência, mas a física aparece: writes têm piso de latência perto de 100 ms p50.

Spanner remove o imposto operacional do sharding. Não remove o imposto de modelagem."

---

## Slide 10: BigQuery: Arquitetura do Engine Dremel
**Título: BigQuery: A Arquitetura do Engine Dremel**
"Agora atravessamos para analytics, onde a física inverte. BigQuery é feito para scan, agregação e join em escala, com storage separado de compute.

**Storage.** Dados vivem no Colossus em formato columnar chamado Capacitor. Columnar torna analytics barato: uma query que usa três colunas de cem lê apenas essas três. Capacitor adiciona compressão, encoding e metadados para pular blocos irrelevantes.

**Partitioning e clustering.** Partitioning divide por coluna como `event_date`. Clustering ordena dentro da partição por colunas como `customer_id`. Juntos decidem quanto BigQuery precisa ler.

**Slots.** Compute é medido em slots. On-demand cobra por scan — cerca de US$ 6,25/TB em us-central1. Editions cobra por slot-hour — Standard cerca de US$ 0,04/slot-hora, Enterprise cerca de US$ 0,06. O breakeven fica em torno de 50 TB/mês: acima disso, Editions quase sempre vence.

**BI Engine.** Para dashboards subsegundo, BI Engine cacheia dados quentes em memória. Cerca de US$ 30/GB-mês entrega latência interativa em agregações cacheadas.

Verdade prática: custo em BigQuery não é volume de dados; é formato da query. Duas queries na mesma tabela podem diferir por 50x."

---

## Slide 11: Duas Físicas: OLTP vs OLAP
**Título: Duas Físicas: Primitivas OLTP vs OLAP**
"Dois sistemas, duas físicas.

Spanner e BigQuery resolvem problemas distribuídos, mas objetivos opostos.

Spanner coordena writes. **TrueTime** dá consistência externa: a ordem de commit acompanha a ordem real dos eventos. **Paxos** faz essa ordem sobreviver a falhas. O custo é latência, especialmente entre regiões.

BigQuery coordena reads. A **árvore Dremel** quebra a query em estágios, distribui para workers que leem Capacitor e agrega de volta. Não há transação global para commitar. O custo é **shuffle**, a movimentação de resultados intermediários entre workers.

Frase para levar: OLTP coordena escritas; OLAP coordena leituras. Os sistemas são moldados por essa diferença."

---

## Slide 12: A Cola: CDC & Zero-ETL
**Título: A Cola: CDC & Zero-ETL**
"Duas físicas, um negócio. O sistema transacional roda a aplicação; o analítico roda as decisões. Precisamos conectá-los sem matar nenhum.

Anti-pattern clássico: cron job a cada cinco minutos buscando linhas atualizadas. Parece simples e falha em três pontos: perde deletes, duplica com drift de relógio e coloca scan em produção.

Há quatro padrões:

**Federated query.** BigQuery `EXTERNAL_QUERY` lê de Spanner ou Cloud SQL em tempo real. Frescor instantâneo, mas você pode afogar a origem se não fizer pushdown de filtros.

**Continuous queries no BigQuery.** SQL streaming dentro do BigQuery, lendo Pub/Sub ou outra fonte. Latência de subsegundos a poucos segundos para agregações simples.

**CDC.** Datastream lê WAL ou binlog e escreve no BigQuery. Latência p50 em 10–30 segundos, p99 em minutos sob carga. Spanner tem change streams, capturados por templates Dataflow.

**Batch agendado.** Ainda faz sentido quando frescor em horas é aceitável e custo domina.

A meta não é escolher um padrão universal; é escolher por tabela, conforme a necessidade real de frescor."

---

## Slide 13: Ajustes Sênior: Três Incidentes Reais
**Título: Ajustes Sênior: Três Incidentes Reais**
"Chega de teoria. Três incidentes reais, um por engine.

**Cloud SQL.** Tabela de pedidos com 1,5 TB. Em seis meses, queries foram de 200 ms para 4 s. Diagnóstico: export noturno segurava transação por 90 minutos, congelando o autovacuum. Dead tuples em 38%. Correção: export para read replica e redução do threshold de autovacuum. Resultado: p95 voltou a 250 ms e 600 GB foram recuperados.

**Spanner.** Alerta de hot shard em 30K QPS, mas só um de oito nós estava quente; média do cluster em 12%. Diagnóstico: primary key monotônica. Correção: chave composta com `BIT_REVERSE_POSITIVE(order_id)` como prefixo. Resultado: distribuição uniforme e headroom restaurado sem adicionar nó.

**BigQuery.** Relatório diário escaneava 4,2 TB e custava US$ 26 por execução, três vezes ao dia. Diagnóstico: `SELECT *` sem filtro de partição. Correção: clustering em `user_id`, filtro obrigatório de partição e projeção reduzida a oito colunas. Resultado: 180 GB por execução, US$ 1,10, 24x mais barato.

Três engines, três modos de falha, mesma lição: olhe o plano, não confie apenas no SQL."

---

## Slide 14: Mandamentos Arquiteturais
**Título: Mandamentos Arquiteturais & Árvore de Decisão**
"O plano é a verdade. O SQL é o marketing. Fechamos com seis mandamentos e uma árvore.

**Um. Respeite o growth wall.** Um nó relacional é ótimo começo e péssima estratégia infinita.

**Dois. Escolha chaves para tráfego, não para linhas.** Chave ruim cria hotspot em qualquer sistema distribuído.

**Três. Consistência tem preço.** TrueTime e Paxos são poderosos, mas writes multi-região custam cerca de 100 ms p50.

**Quatro. Clusterize pela fatura.** No BigQuery, clustering e partitioning são controle de custo.

**Cinco. Não use OLTP como OLAP.** Use CDC, change streams ou federation. Cada sistema mantém seu trabalho.

**Seis. A física vence.** Rede, disco e coordenação são os limites reais.

Árvore de decisão: se precisa de writes multi-região ou mais de 20K TPS — **Cloud Spanner**. Se quer PostgreSQL com analytics no mesmo dado e está em uma região — **AlloyDB**. Se está abaixo de 5K TPS, região única e SQL comum — **Cloud SQL HA**. Para analytics acima de 1 TB de scan — **BigQuery**, com Editions acima de 50 TB/mês."

---

## Slide 15: Discussão e Repositório
**Título: Discussão & Repositório**
"Cobrimos growth wall OLTP, internos do Cloud SQL, indexação, a decisão com AlloyDB, sharding, consistent hashing, Spanner, BigQuery, CDC, três incidentes reais e uma árvore de decisão.

A mensagem é: arquitetura em escala não é escolher produto; é entender comportamento sob carga. Chaves, planos, frescor e custo são as quatro alavancas.

Agora abrimos para discussão. Se vocês já viram hotspots, bloat, custos altos no BigQuery, problemas de chave no Spanner ou dor com CDC, este é o momento.

Repositório, slides e speaker notes estão nos links. O banco de perguntas está em `presentation_qa.pt.md`.

https://github.com/TheMasterRoot/Distributed-OLTP-vs-OLAP-on-GCP"
