// Personas fixas do Nexo Treino. Nichos reais da Nexo (academias, delivery, stands de
// carros — _memoria/empresa.md), dores na linguagem da biblioteca da /r1, molde rico
// inspirado na R1 real da La-Pizza (clientes/La-Pizza/). Todo card traz memoria_r1 pra
// servir também ao modo R2 (persona "com R1 realizada").

import type { Persona } from '../../../shared/types.ts';

export const PERSONAS_FIXAS: Persona[] = [
  {
    slug: 'pizzaria-toni',
    nome: 'Toni',
    negocio: 'Forno do Toni Pizzaria',
    nicho: 'pizzaria/delivery',
    cidade: 'Serra Dourada - BA',
    numeros: {
      faturamento_mes: 'uns R$ 38 mil',
      ticket_medio: 'R$ 55 por pedido',
      movimento: '~160 pedidos/semana, sexta e sábado carregam tudo; terça e quarta quase mortas',
      meta: 'chegar em 220 pedidos/semana sem depender só do fim de semana',
    },
    dores: [
      'o robô do WhatsApp que instalaram trava o pedido — o povo desiste no meio e liga reclamando',
      'meu Google tá lá largado, tem foto velha e horário errado, nem sei a senha',
      'não tenho tempo de postar nada, o Instagram fica semanas parado',
    ],
    personalidade: 'falante',
    orcamento_implicito: 'entre R$ 400 e R$ 700 por mês, se enxergar retorno',
    memoria_r1: {
      dores_prioritarias: [
        'pedido travando no robô do WhatsApp (perde venda na hora)',
        'Google Meu Negócio abandonado com informação errada',
        'sem tempo pra conteúdo, Instagram parado',
      ],
      numeros_levantados:
        'fatura ~R$ 38 mil/mês, ticket R$ 55, ~160 pedidos/semana com meta de 220; estimou perder uns 10 pedidos por semana no robô travado (~R$ 550/semana, mais de R$ 2 mil/mês)',
      combinado:
        'ficou de receber uma proposta focada primeiro em destravar o WhatsApp e arrumar o Google, com conteúdo entrando depois; segunda reunião marcada pra apresentar',
    },
  },
  {
    slug: 'academia-carla',
    nome: 'Carla',
    negocio: 'Academia Corpo em Forma',
    nicho: 'academia',
    cidade: 'Tabocas do Brejo Velho - BA',
    numeros: {
      faturamento_mes: 'na casa dos R$ 30 mil',
      ticket_medio: 'plano de R$ 89/mês',
      movimento: '~340 alunos ativos, mas entra 25 e sai 30 por mês desde o começo do ano',
      meta: 'voltar pros 400 alunos que tinha ano passado',
    },
    dores: [
      'o movimento caiu — abriu uma academia nova do outro lado da cidade e ela vive cheia',
      'aluno some sem avisar, não renova, e eu só descubro quando olho a planilha no fim do mês',
      'a gente posta treino no Instagram mas não sei se isso traz aluno novo',
    ],
    personalidade: 'desconfiado',
    orcamento_implicito: 'no máximo uns R$ 500 por mês, e olhe lá',
    memoria_r1: {
      dores_prioritarias: [
        'evasão de alunos sem controle (sai mais do que entra)',
        'concorrente novo tomando espaço',
        'conteúdo sem direção — posta mas não sabe se converte',
      ],
      numeros_levantados:
        '340 alunos a R$ 89, meta 400; saldo de -5 alunos/mês, ou seja ~R$ 445/mês evaporando e piorando; a queda começou há uns 8 meses',
      combinado:
        'proposta focada em segurar aluno (réguas de contato/recompra) e prova social pra brigar com o concorrente; ela pediu pra ver preço porque "tá apertado"',
    },
  },
  {
    slug: 'stand-ze',
    nome: 'Zé Roberto',
    negocio: 'Zé Veículos',
    nicho: 'stand de carros',
    cidade: 'Santa Maria da Vitória - BA',
    numeros: {
      faturamento_mes: 'varia demais — mês bom passa de R$ 100 mil, mês ruim fica em 40',
      ticket_medio: 'carro médio de R$ 35 mil, margem de uns R$ 3 mil por carro',
      movimento: 'umas 40 mensagens por semana no WhatsApp, fecha 3-4 carros por mês',
      meta: 'vender 8 carros por mês, que é o que o pátio comporta',
    },
    dores: [
      'chega mensagem que é uma beleza, mas o povo pergunta o preço e some — não fecho nem 10%',
      'anuncio na OLX e no grupo da cidade, mas é eu mesmo respondendo tudo no meio da loja',
      'tem carro parado há 4 meses no pátio comendo dinheiro',
    ],
    personalidade: 'apressado',
    orcamento_implicito: 'se provar que vende carro, vai a R$ 1.000/mês; sem prova, R$ 300',
    memoria_r1: {
      dores_prioritarias: [
        'mensagem que não vira venda (pergunta preço e some)',
        'atendimento no braço, sem processo — ele mesmo responde tudo',
        'carro parado no pátio (custo de capital)',
      ],
      numeros_levantados:
        '40 mensagens/semana fechando 3-4 carros/mês com margem de R$ 3 mil; se subir a conversão pra 8/mês, são +R$ 12 mil de margem; decide junto com o irmão sócio',
      combinado:
        'proposta de organizar o atendimento do WhatsApp (respostas, catálogo, follow-up) e anúncio dos carros parados; irmão sócio talvez participe da segunda conversa',
    },
  },
  {
    slug: 'hamburgueria-dudu',
    nome: 'Dudu',
    negocio: 'Braseiro Burguer',
    nicho: 'hamburgueria/delivery',
    cidade: 'Serra Dourada - BA',
    numeros: {
      faturamento_mes: 'uns R$ 22 mil',
      ticket_medio: 'R$ 42 por pedido',
      movimento: '~120 pedidos/semana, quase tudo pelo iFood e WhatsApp',
      meta: 'bater R$ 35 mil/mês e depender menos do iFood',
    },
    dores: [
      'boto uns 300 conto por mês em anúncio no Instagram e sinceramente não vejo diferença nenhuma',
      'o iFood come 27% de tudo que eu vendo, tô trabalhando pros outros',
      'meu cardápio no WhatsApp é um PDF véio que ninguém abre',
    ],
    personalidade: 'falante',
    orcamento_implicito: 'os R$ 300 do anúncio + mais uns R$ 300 se alguém fizer valer a pena',
    memoria_r1: {
      dores_prioritarias: [
        'anúncio sem retorno (R$ 300/mês no escuro)',
        'dependência do iFood comendo a margem',
        'canal próprio (WhatsApp) mal aproveitado',
      ],
      numeros_levantados:
        'R$ 22 mil/mês, ticket R$ 42, ~120 pedidos/semana; iFood leva ~27% de boa parte disso (estimou uns R$ 3 mil/mês de taxa); anúncio de R$ 300/mês sem medição nenhuma',
      combinado:
        'pausar o anúncio até arrumar a base, montar canal direto no WhatsApp com cardápio decente e campanha pra migrar cliente do iFood; ficou animado mas quer ver o preço',
    },
  },
  {
    slug: 'academia-brito',
    nome: 'Brito',
    negocio: 'Brito Fitness Center',
    nicho: 'academia',
    cidade: 'Bom Jesus da Lapa - BA',
    numeros: {
      faturamento_mes: 'R$ 55 mil, mas era mais',
      ticket_medio: 'plano de R$ 110/mês',
      movimento: '~500 alunos, perdendo uns 15 por mês líquido há 6 meses',
      meta: 'estancar a sangria e voltar a crescer',
    },
    dores: [
      'já paguei agência uma vez, seis meses de contrato, e não vi UM aluno entrar por causa deles',
      'o pessoal entra em janeiro e some em abril, todo ano a mesma coisa',
      'a academia nova do shopping tá fazendo barulho e eu tô parado',
    ],
    personalidade: 'seco',
    orcamento_implicito: 'não fala em dinheiro enquanto não confiar; sob muita pressão admite que pagava R$ 800 pra outra agência',
    memoria_r1: {
      dores_prioritarias: [
        'evasão sazonal (entra em janeiro, some em abril)',
        'concorrente novo fazendo barulho',
        'trauma com agência anterior — precisa de prova, não promessa',
      ],
      numeros_levantados:
        '500 alunos a R$ 110, perdendo 15/mês líquido (~R$ 1.650/mês de receita recorrente indo embora, há 6 meses — mais de R$ 9 mil acumulados); a experiência anterior com agência custou R$ 800/mês por 6 meses sem resultado medido',
      combinado:
        'ele topou uma segunda conversa com MUITA ressalva: quer ver plano com resultado mensurável e sem contrato longo; qualquer cheiro de papo de agência ele desliga',
    },
  },
];

export function getPersonaFixa(slug: string): Persona | undefined {
  return PERSONAS_FIXAS.find((p) => p.slug === slug);
}
