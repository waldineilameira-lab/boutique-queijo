# 🧀 Boutique do Queijo · Sistema de Gestão

Sistema web de gestão para uma loja de frios e laticínios, desenvolvido como **projeto freelance**. Centraliza produtos, vendas, estoque, validades e compras em uma única tela, com dashboard de indicadores.

## Para que serve

Pequenos comércios costumam controlar vendas e validades em cadernos ou planilhas soltas. O sistema substitui isso por uma ferramenta simples, que roda no navegador e não precisa de servidor, banco de dados nem instalação.

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Dashboard** | Quantidade de vendas, faturamento, ticket médio, total em compras e margem bruta; gráficos de vendas por categoria, por forma de pagamento e por produto |
| **Produtos** | Cadastro com categoria, unidade (kg, g, unidade, litro, caixa…), preço e código; edição e exclusão |
| **Vendas** | Registro de vendas com cálculo automático do total e forma de pagamento (PIX, débito, crédito, dinheiro) |
| **Estoque e validades** | Controle de quantidade, lote e validade, com alertas: **Vencido**, **Urgente** (até 7 dias), **Atenção** (até 30 dias) e **Ok** |
| **Compras** | Registro de compras por fornecedor, com número da nota fiscal |
| **Exportação** | Exporta todos os dados em CSV, para abrir no Excel ou Power BI |

## Como executar

Não precisa instalar nada.

1. Baixe o projeto: botão verde **Code → Download ZIP** (ou `git clone https://github.com/waldineilameira-lab/boutique-queijo.git`).
2. Abra o arquivo `src/index.html` no navegador (Chrome, Edge ou Firefox).

No VSCode, também dá para usar a extensão **Live Server**: clique com o botão direito em `src/index.html` → **Open with Live Server**.

## Como os dados são salvos

Os dados ficam embutidos no próprio arquivo HTML:

- **💾 Salvar arquivo** baixa uma cópia do sistema (`boutique_queijo.html`) com todos os dados registrados. Na próxima vez, abra esse arquivo.
- **↓ Exportar CSV** gera uma planilha com produtos, vendas, estoque e compras.

## Período de teste

O sistema tem um período de teste configurável. Ao terminar, a tela é bloqueada e mostra um botão de contato por WhatsApp. Para ajustar, edite o bloco `CFG` no início de `src/script.js`:

```js
var CFG = {
  trialDias: 30,            // duração do teste, em dias
  whatsapp: '55DDNUMERO',   // número de contato (DDI + DDD + número)
  mensagemWpp: '...',       // mensagem pré-preenchida
  nomeCliente: '...'        // nome exibido na tela de bloqueio
};
```

## Estrutura

```
src/
├── index.html   # telas e formulários
├── style.css    # visual e responsividade
└── script.js    # regras de negócio, gráficos, exportação e período de teste
```

## Tecnologias

HTML5 · CSS3 · JavaScript (ES6) · [Chart.js 4](https://www.chartjs.org/)

## Autor

**Waldinei Lameira** · [LinkedIn](https://www.linkedin.com/in/waldineilameira) · [GitHub](https://github.com/waldineilameira-lab)
