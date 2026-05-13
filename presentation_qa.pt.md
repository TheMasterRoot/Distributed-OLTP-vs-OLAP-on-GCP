# Banco de Perguntas — Cloud Data Architecture at Scale

---

## Custo & Dimensionamento

### Q1. Quando Spanner fica mais barato que Cloud SQL shardado?
Na fatura pura, Spanner regional começa em cerca de US$ 650/mês por nó + storage. Cloud SQL shardado é N vezes um par HA (~US$ 350/mês cada) mais roteamento, balanceamento e operação. Só em infraestrutura, o cruzamento aparece perto de 5–6 shards.

O fator real é engenharia. Postgres shardado normalmente exige DBA dedicado, tooling de rebalanceamento e plantão para migrações de shard. Acima de ~10K TPS ou ~2 TB, Spanner costuma vencer em TCO quando engenharia entra na conta. Abaixo de 5K TPS e região única, Cloud SQL HA costuma ser mais barato.

### Q2. BigQuery on-demand vs Editions — como decidir?
On-demand cobra por scan: ~US$ 6,25/TB em us-central1, sem compromisso. Editions cobra por slot-hour: Standard ~US$ 0,04/slot-hora e Enterprise ~US$ 0,06.

Regra prática: acima de ~50 TB escaneados por mês ou ~400 slot-hours/mês, Editions começa a vencer por previsibilidade e custo. Abaixo disso, on-demand é mais simples.

Não decida por sensação. Meça 30 dias de `bytes_billed` em `INFORMATION_SCHEMA.JOBS_BY_*`.

### Q3. Como dimensionar um Spanner inicial?
Comece com 1 nó regional e teste carga realista, não apenas point reads.

Monitore CPU por nó, p99 de latência e crescimento de splits. Mantenha CPU steady-state abaixo de 65%. Escale quando CPU ficar acima disso por 24h ou quando p99 degradar.

Use autoscaling para picos diários em vez de dimensionar tudo pelo pico. Spanner adiciona nós online, então não compre capacidade de um ano no primeiro dia.

### Q4. Quando BI Engine vale o custo?
BI Engine custa cerca de US$ 30/GB-mês e cacheia dados quentes para dashboards subsegundo.

Vale quando o dashboard roda muitas vezes por dia, o working set cabe em poucos GB e usuários reclamam de 5–15 segundos de refresh. Não vale para queries analíticas ad-hoc.

Teste por uma semana e observe taxa de cache hit. Se menos de 40% das queries de dashboard usam cache, invista primeiro em clustering e materialized views.

---

## Migração & Operações

### Q5. Como migrar de Cloud SQL para Spanner com mínimo downtime?
Cinco passos: redesenhe schema primeiro; replique ao vivo com Datastream/Dataflow; rode dual-write ou read-shadow por algumas semanas; corte reads antes de writes; reconcilie com checksums.

Spanner não é drop-in. É preciso redesenhar primary keys para evitar hotspots, revisar foreign keys, remover dependências específicas do PostgreSQL e validar transações.

Timeline realista: 3–6 meses para schema não trivial.

### Q6. AlloyDB vs Cloud SQL para workload PostgreSQL existente — é drop-in?
Em grande parte, sim para código de aplicação: mesmo protocolo e SQL PostgreSQL. `pg_dump`/restore ou Database Migration Service resolvem boa parte da migração.

Diferenças: modelo de HA, read pools, pricing por nó/storage IO e algumas configurações não expostas.

O ganho forte aparece quando há analytics inline no banco operacional: relatórios, joins e dashboards no mesmo dado. Para workload puramente transacional, o ganho tende a ser menor, mas ainda relevante.

### Q7. Como debugar hotspot em Spanner?
Olhe três sinais: CPU por nó, lock stats e Key Visualizer.

Um nó quente com outros ociosos é sinal forte de hotspot. `spanner_sys.lock_stats_top_minute` mostra linhas com alto conflito. Key Visualizer mostra bandas escuras em ranges específicos.

A correção normalmente é chave, não nó: prefixo hash, `BIT_REVERSE_POSITIVE`, salting ou divisão por buckets.

### Q8. Quais são pegadinhas do Datastream?
PostgreSQL precisa `wal_level=logical`; MySQL precisa binlog row-based. DDL não é replicado automaticamente. Backfill inicial pode pressionar a origem. `MERGE` no BigQuery tem limites de concorrência.

E a latência p99 em carga real pode ser minutos, não segundos. Não prometa frescor subsegundo com Datastream.

---

## Arquitetura & Modelagem

### Q9. Quando Spanner multi-região vale a latência?
Vale quando o negócio realmente exige tolerância a falha regional sem perda de dados: pagamentos, identidade, inventário global ou requisitos regulatórios.

O custo é latência: writes multi-região ficam perto de 100 ms p50 e 150–300 ms p99. Não serve para APIs com orçamento sub-50 ms p99 ou transações muito chatty.

### Q10. Interleaving vale para queries analíticas?
Interleaving vale quando o padrão é "me dê o pai e todos os filhos": customer + orders, account + transactions por janela.

Não vale para analytics agregando todos os filhos do sistema. Nesse caso o dado pertence ao BigQuery.

Regra: pai + filhos interleaved devem ficar abaixo de ~8 GB.

### Q11. BigQuery pode substituir OLTP?
Não.

BigQuery não tem locking por linha, point updates eficientes, baixa latência para lookup por chave ou transações multi-linha como OLTP. Ele aceita ingestão append-only em alto volume via Storage Write API, mas isso não o transforma em banco transacional.

Se precisa de lookup por PK abaixo de 100 ms, use Cloud SQL, AlloyDB, Spanner, Bigtable ou Firestore.

### Q12. Storage Write API vs streaming inserts?
Streaming inserts é simples, mas mais caro e usa streaming buffer. Storage Write API é mais barata em volume, tem semântica exatamente uma vez e integra bem com Dataflow/Beam.

Regra prática: acima de ~10K linhas/s ou ~10 GB/dia, Storage Write API tende a ser melhor.

### Q13. Quando materialized views no BigQuery pagam?
Pagam quando a mesma agregação roda muitas vezes sobre dados relativamente estáveis: KPIs diários, dashboards executivos, agregações caras.

Não pagam quando os filtros são muito dinâmicos ou a base muda tanto que o refresh custa mais que a economia.

---

## Casos Especiais

### Q14. Spanner change streams vs Datastream?
Use change streams quando a origem é Spanner. Use Datastream quando a origem é Cloud SQL, AlloyDB ou Oracle.

Não são substitutos universais. Em arquiteturas mistas, você usa os dois.

### Q15. Como funciona custo de BigQuery search index?
Search indexes aceleram `SEARCH()` sobre texto e tokens estruturados.

Você paga storage do índice e manutenção incremental. Compensa para logs, segurança e buscas repetidas sobre texto. Não compensa para exploração única.

Dica: combine search index com partitioning por `event_date` para limitar o range quente.
