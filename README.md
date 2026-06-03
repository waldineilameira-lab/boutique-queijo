# 🧀 Boutique do Queijo — Sistema de Gestão Integrado

Bem-vindo ao repositório oficial da **Boutique do Queijo**, um sistema de gestão ERP em tela única (SPA) de alta performance, desenvolvido especificamente para estabelecimentos comerciais de frios, laticínios, embutidos e acompanhamentos finos.

Este sistema centraliza o controle operacional de **Produtos, Vendas, Estoque, Validades, Compras** e extrai indicadores de inteligência analítica (*Business Intelligence*) por meio de dashboards visuais interativos.

---

## 📌 Sumário
1. [Arquitetura e Recursos do Sistema](#1-arquitetura-e-recursos-do-sistema)
2. [Interface e Estrutura de Arquivos](#2-interface-e-estrutura-de-arquivos)
3. [Guia de Utilização por Módulo](#3-guia-de-utilização-por-módulo)
4. [Gestão de Validades e Alertas Inteligentes](#4-gestão-de-validades-e-alertas-inteligentes)
5. [Análise de BI e Dashboards](#5-análise-de-bi-e-dashboards)
6. [Persistência, Exportação e Salvamento de Dados](#6-persistência-exportação-e-salvamento-de-dados)
7. [Como Executar a Aplicação](#7-como-executar-a-aplicação)
8. [Configuração do Período de Teste (Trial Mode)](#8-configuração-do-período-de-teste-trial-mode)

---

## 1. Arquitetura e Recursos do Sistema

A aplicação adota o conceito de **Single Page Application (SPA)** puramente *client-side*, eliminando a dependência de servidores pesados ou bancos de dados externos na máquina do usuário.

### 🚀 Principais Tecnologias Implementadas:
* **HTML5 Semântico:** Estruturação otimizada para renderização ágil e acessibilidade.
* **CSS3 Avançado (Variáveis de Escopo Dinâmico):** Paleta de cores moderna inspirada no universo de queijos finos e charcutaria (tons terrosos, dourados e mates), com layout responsivo e transições suaves.
* **JavaScript Moderno (ES6+):** Motor operacional responsável pela computação dos dados, gerenciamento de estados em memória, persistência local e manipulação do DOM.
* **Chart.js (v4.4.1):** Biblioteca integrada via CDN para plotagem de gráficos dinâmicos de faturamento, vendas e fatias de mercado.

---

## 2. Interface e Estrutura de Arquivos

Para manter o sistema leve e de fácil manutenção, a aplicação é dividida em três arquivos fundamentais:

```text
boutique-queijo/
|---src/
    ├── index.html   # Estrutura visual, formulários e esqueleto dos módulos
    ├── style.css    # Design, tipografia, grid estrutural e responsividade
    └── script.js    # Lógica de negócio, cálculos, gráficos e persistência
```
## 3. Guia de Utilização por módulo

O coração estatístico do sistema. Ele é atualizado instantaneamente a cada venda ou compra inserida nos outros módulos.
* **KPI's Centrais:** Exibe os cartões com faturamento total em reais (R$), custo total de compras, lucro bruto estimado e volume de produtos cadastrados.
* **Fluxo de Trabalho:** Monitore os cartões no topo assim que abrir a aplicação para entender a saúde financeira atual do seu negócio antes de tomar decisões de compras.

## 4. Gestão de Validades e Alertas Inteligentes

Lorem ipsum orem ipsum lorem ipsum lorem ipsum

## 5. Análise de BI e Dashboards

Lorem ipsum orem ipsum lorem ipsum lorem ipsum

## 6. Persistência, Exportação e Salvamento de Dados

Lorem ipsum orem ipsum lorem ipsum lorem ipsum

## 7. Como Executar a Aplicação

Lorem ipsum orem ipsum lorem ipsum lorem ipsum

## 8. Configuração do Período de Teste

Lorem ipsum orem ipsum lorem ipsum lorem ipsum
