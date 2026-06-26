# NexoIAos

> IA que conecta negócio local com resultado. Não tecnologia — entrega.

Você acabou de instalar o NexoIAos. Em alguns minutos, sua operação vai
ter memória própria, um fluxo de vendas consultiva pronto pra usar, e
skills que fazem o trabalho pesado — de diagnosticar a dor do cliente até
entregar o relatório mensal.

Sem enrolação. Vamos ao que importa.

---

## Ligando o sistema

Dois caminhos. Escolhe o que combina contigo.

### Pelo Claude (mais rápido)

Abre o Claude Code em qualquer pasta e cola:

```
Clona o https://github.com/mariochegou-creator/NexoIAos.git na pasta atual,
entra nela e roda o /setup.
```

Ele clona, entra na pasta e dispara a configuração. Você só responde.

### Pelo terminal (mais previsível)

```
git clone https://github.com/mariochegou-creator/NexoIAos.git
cd NexoIAos
code .
```

Na janela do VS Code que abrir: terminal integrado → `claude` → `/setup`.

---

Quando o `/setup` terminar, renomeia a pasta `NexoIAos/` pro nome do teu
negócio ou da empresa onde você atua. A pasta não fica como "NexoIAos" —
ela é a sua operação agora.

O `/setup` roda uma vez só. Te entrevista, descobre se você é agência,
freelancer ou atua dentro de uma empresa — e configura o sistema pro seu
contexto. Depois disso, é só operar.

---

## O sistema

**Núcleo** — o jeito de operar o dia a dia
`/abrir` carrega o contexto antes de cada sessão · `/salvar` faz commit
+ push no GitHub · `/atualizar` varre o projeto e atualiza a memória ·
`/novo-projeto` cria pasta isolada pra cada cliente ou iniciativa ·
`/mapear-rotinas` descobre o que você repete e transforma em skill.

**Prospecção** — chegar até o decisor
Antes de qualquer reunião, existe o trabalho de abrir porta. O `playbook-vendas`
e os `scripts-prospeccao` (em `saidas/`) cobrem esse terreno: como abordar
presencialmente sem falar em IA logo de cara, scripts de WhatsApp e DM com
gancho de resultado, como identificar se o cara é o decisor, e quando avançar.
A regra central: **não vendemos IA — vendemos o que a ausência de IA está custando.**

**Funil de vendas consultiva** — do diagnóstico ao fechamento
`/r1` analisa a transcrição da primeira reunião com SPIN Selling e entrega
o mapa de dores com duas rotas de solução (enxuta e robusta) · `/apn`
transforma o diagnóstico em proposta personalizada nas palavras do cliente ·
`/r2` monta o roteiro da reunião de fechamento e analisa a transcrição depois
· `/follow-up` gera a mensagem certa pra cada objeção que ficou na mesa.

**Entrega e recorrência** — depois que fecha
`/onboarding` estrutura a primeira semana com o cliente novo, com checklist
integrado à dashboard · `/relatorio-cliente` gera o relatório mensal em
linguagem humana, pra dono de negócio entender e renovar.

**Conteúdo** — presença que gera cliente
`/roteiro-viral` busca o que tá em alta no nicho do cliente e entrega
roteiro + legendas + guia de filmagem + guia de edição, pronto pra modelo
· `/carrossel` cria carrosséis com identidade da marca · `/seo` roda fluxo
completo de presença local (GMB, on-page, conteúdo, monitoramento) ·
`/responder-avaliacoes` escreve respostas humanas pras reviews do Google.

**Anúncios** — quando a base orgânica já tá de pé
`/anuncio-google` monta campanha em CSV pronto pro Google Ads Editor ·
`/relatorio-ads` lê exports de Google + Meta e devolve relatório semanal
com alertas.

**Manutenção** — manter o sistema atualizado
`/sync-mazyos` verifica se saíram atualizações no repositório base e mostra
o que mudou antes de qualquer merge. Você decide o que absorver.

---

## A tese

Negócio local não precisa de tecnologia. Precisa de resultado.

A maioria das agências de IA vende ferramenta. Apresentação bonita, contrato
assinado, e três meses depois o dono não consegue medir se valeu.

O NexoIAos nasce do avesso: cada skill existe porque resolve um problema
real de negócio local — cliente que some no WhatsApp, Instagram parado,
Google que não aparece, proposta que não fecha. A IA é o meio, nunca o argumento.

Quem usa isso não entrega software. Entrega ponteiro de faturamento.

---

## Como o NexoIAos pensa

`_memoria/` é o cérebro. Quem é o negócio, como ele fala, o que está em
foco. O Claude lê isso antes de cada resposta. Quanto melhor a memória,
mais cirúrgico o sistema.

`identidade/` é o rosto. Cores, fontes, padrão visual. Todo carrossel,
proposta e peça que o sistema gera respeita isso.

`saidas/` e `dados/` são o resultado. O sistema produz, versiona no GitHub,
fica tudo seu.

---

## Base

Construído sobre o [MazyOS](https://github.com/mazzeoia/MazyOS) com camada
de vendas consultiva, onboarding de cliente e fluxo de resultado para
negócio local.
