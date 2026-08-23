# PokéDeck

Plataforma web para explorar cartas do **Pokémon TCG**, montar e analisar decks competitivos, e gerenciar uma coleção pessoal de cartas — tudo em uma interface moderna, rápida e totalmente responsiva.

> Projeto pessoal construído com React + TypeScript, consumindo a [Pokémon TCG API](https://pokemontcg.io/). Não possui vínculo com a Pokémon Company, Nintendo, Game Freak ou Creatures Inc.

---

## Índice

- [Visão geral](#visão-geral)
- [Screenshots](#screenshots)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como instalar](#como-instalar)
- [Configurando a API Key](#configurando-a-api-key)
- [Como executar](#como-executar)
- [Como fazer build](#como-fazer-build)
- [Como publicar](#como-publicar)
- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Visão geral

O PokéDeck nasceu da vontade de ter uma ferramenta única para três tarefas que qualquer jogador de Pokémon TCG faz separadamente: **explorar cartas**, **montar decks** e **controlar a própria coleção**. A proposta é entregar isso com a qualidade visual e de UX de um produto real — não um protótipo de consumo de API.

Todo o estado da aplicação (decks, coleção, favoritos, wishlist, preferências) é persistido localmente no navegador via `localStorage`, então o app funciona de forma completa sem necessidade de backend ou autenticação — mas foi desenhado para que um backend possa ser plugado no futuro sem reescrever a camada de dados (veja [Decisões de arquitetura](#decisões-de-arquitetura)).

## Screenshots

> As imagens abaixo são referências para as capturas de tela do projeto. Ao publicar no GitHub, adicione seus próprios prints em `docs/screenshots/` (Dashboard, Explorar Cartas, Deck Builder e Análise de Deck são boas opções) e atualize os links abaixo.

| Dashboard | Deck Builder |
|---|---|
| `docs/screenshots/dashboard.png` | `docs/screenshots/deck-builder.png` |

| Explorar Cartas | Análise de Deck |
|---|---|
| `docs/screenshots/cards-explorer.png` | `docs/screenshots/deck-analysis.png` |

## Funcionalidades

### Exploração de cartas
- Busca por nome, número ou tipo com *debounce* e histórico de pesquisas recentes
- Filtros combináveis: categoria, tipo de energia, raridade, série, set e faixa de HP
- Ordenação por nome, data de lançamento, número ou preço aproximado
- *Infinite scroll* com skeleton loading
- Catálogo completo da Pokémon TCG API (dezenas de milhares de cartas)

### Detalhes da carta
- Imagem em alta resolução, ataques, habilidades, fraquezas, resistências e custo de recuo
- Preços aproximados (TCGPlayer / Cardmarket, quando disponíveis)
- Cartas relacionadas do mesmo set
- Ações rápidas: favoritar, adicionar à coleção, adicionar a um deck, comparar e compartilhar

### Deck Builder
- Criação de deck com nome, descrição, formato (Standard, Expanded, Unlimited, GLC ou Casual), cor, capa e tags
- Busca de cartas integrada ao construtor, com adição em um clique
- Contador de cartas em tempo real (`24 / 60`), organizado por Pokémon / Treinadores / Energias
- Controle de quantidade por carta respeitando o limite de cópias de cada formato (energias básicas ilimitadas)
- Layout adaptado para mobile (abas "Buscar" / "Meu deck" em vez de colunas lado a lado)

### Analisador de deck
- **Deck Score** (0–100) com detalhamento por critério: tamanho, proporção de energias, treinadores, consistência de tipos, quantidade de Pokémon e curva de recuo
- Gráficos: Pokémon × Treinadores × Energias, distribuição de tipos, curva de custo de recuo, distribuição de raridade
- Recomendações heurísticas (ex.: *"seu deck possui poucas cartas de energia"*) — deixadas explicitamente como sugestões informais, não regras oficiais
- Sugestões de cartas relacionadas ao deck ("Talvez você goste destas cartas")

### Coleção pessoal
- Status por carta: possuo, quero comprar ou repetida
- Quantidade, condição (Mint → Poor) e observações por carta
- Estatísticas agregadas: total de cartas, cartas únicas, repetidas e progresso de coleção por set

### Favoritos, Wishlist e Comparador
- Favoritos organizados em pastas personalizadas
- Wishlist com prioridade, preço desejado e status (quero comprar / encontrada / comprada)
- Comparador lado a lado de até 4 cartas, com destaque automático de maiores/menores valores

### Gerenciamento de decks
- Duplicar, favoritar, arquivar, excluir e reordenar decks
- Compartilhamento local via link único (`/decks/shared/:id`) com página pública somente leitura
- Exportação em JSON, TXT e CSV; importação de decks via arquivo JSON com validação

### Estatísticas e conquistas
- Painel com totais de cartas, decks, favoritos e maior Deck Score já alcançado
- Gráficos de cartas por tipo, raridade e set
- Sistema de conquistas (ex.: *Primeiro Deck*, *Colecionador*, *Mestre dos Sets*)

### Experiência do usuário
- Dark mode completo (claro / escuro / sistema) com preferência persistida
- Atalhos de teclado: `Ctrl+K` pesquisa, `N` novo deck, `F` favoritos, `D` meus decks, `Esc` fecha modais
- Toasts de sucesso/erro, diálogos de confirmação, estados vazios com call-to-action e *skeleton loading* em toda a aplicação
- Perfil de usuário simulado localmente (nome, avatar, bio), pronto para futura integração com um provedor de autenticação

## Tecnologias

| Camada | Escolha | Motivo |
|---|---|---|
| Build tool | **Vite** | Dev server instantâneo e build otimizado com code-splitting |
| Linguagem | **TypeScript (strict mode)** | Segurança de tipos em toda a aplicação |
| UI | **React 19** | Componentização e ecossistema maduro |
| Estilo | **Tailwind CSS** | Design system consistente sem CSS solto pelo projeto |
| Roteamento | **React Router** | Padrão de mercado para SPAs em React |
| Cache de API | **TanStack Query** | Cache, *retry*, *infinite scroll* e invalidação de requisições |
| Estado do app | **Zustand** (com `persist`) | Stores simples e sem boilerplate, com persistência automática em `localStorage` |
| Ícones | **Lucide React** | Ícones consistentes e leves |
| Gráficos | **Recharts** | Gráficos declarativos para os painéis de análise |
| HTTP | **Axios** | Interceptors centralizados para API key e tratamento de erros |

Nenhuma biblioteca fora dessa lista foi necessária.

## Estrutura do projeto

```
pokedeck/
├── src/
│   ├── api/               # Camada única de comunicação com a Pokémon TCG API
│   │   ├── client.ts       # Instância axios + interceptors de erro/API key
│   │   └── pokemonTcgApi.ts
│   ├── components/
│   │   ├── ui/             # Design system: Button, Modal, Drawer, Toast, Input...
│   │   ├── layout/         # AppShell, Sidebar, MobileNav, CommandPalette...
│   │   ├── cards/          # Componentes de carta (tile, filtros, badges...)
│   │   ├── decks/          # Componentes do deck builder e análise
│   │   └── charts/         # Wrappers do Recharts usados na análise de deck
│   ├── hooks/              # useDebounce, useCards, useDeckRecommendations...
│   ├── lib/                # Regras de negócio puras (analisador, export/import, etc.)
│   ├── pages/              # Uma página por rota
│   ├── store/              # Stores Zustand (decks, coleção, favoritos, wishlist...)
│   ├── types/              # Tipos e interfaces compartilhados
│   ├── App.tsx             # Definição de rotas (com lazy loading por página)
│   └── main.tsx
├── .env.example
└── README.md
```

A comunicação com a API está isolada em `src/api` — nenhum componente faz `fetch`/`axios` diretamente. Regras de negócio (pontuação de deck, export/import, limites de cópias por formato) vivem em `src/lib`, puras e testáveis, separadas da camada visual.

## Como instalar

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
git clone https://github.com/seu-usuario/pokedeck.git
cd pokedeck
npm install
```

## Configurando a API Key

O projeto funciona **sem nenhuma configuração** — a Pokémon TCG API aceita requisições sem chave, com um limite de taxa compartilhado mais baixo.

Para uma cota maior, gere uma chave gratuita em [dev.pokemontcg.io](https://dev.pokemontcg.io/) e configure:

```bash
cp .env.example .env
```

```env
# .env
VITE_POKEMON_TCG_API_KEY=sua_chave_aqui
```

A chave nunca é exposta no código-fonte nem commitada — `.env` está no `.gitignore`.

## Como executar

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Como fazer build

```bash
npm run build
```

Gera os arquivos otimizados em `dist/`, com *code-splitting* por rota e por biblioteca (vendor chunks separados para React, gráficos e camada de dados).

Para pré-visualizar o build de produção localmente:

```bash
npm run preview
```

## Como publicar

O `dist/` gerado é um site estático — pode ser publicado em qualquer host de arquivos estáticos:

- **Vercel / Netlify**: conecte o repositório, comando de build `npm run build`, diretório de saída `dist`
- **GitHub Pages**: publique o conteúdo de `dist/` na branch `gh-pages`
- **Servidor próprio**: sirva `dist/` com qualquer servidor HTTP (Nginx, Caddy, etc.)

Como as rotas usam `BrowserRouter`, configure o host para redirecionar todas as rotas para `index.html` (SPA fallback).

## Decisões de arquitetura

- **Sem backend próprio**: todo o estado do usuário vive no `localStorage` via Zustand `persist`. As stores (`src/store/*.ts`) já isolam essa lógica, então trocar a persistência local por chamadas a um backend (Firebase, Supabase, uma API própria) significa alterar apenas os *actions* de cada store — os componentes não seriam afetados.
- **Compartilhamento de decks é local**: o link `/decks/shared/:id` funciona lendo um snapshot salvo no `localStorage` do próprio navegador que gerou o link. Isso significa que, hoje, um link só abre corretamente no dispositivo/navegador onde foi criado — é uma simulação da funcionalidade, documentada aqui para transparência. Um backend real resolveria isso trivialmente.
- **Login simulado**: o "perfil" (`useUserStore`) representa um usuário local único por navegador. A estrutura já separa "estado do usuário" de "estado dos dados", preparando o terreno para autenticação real.
- **Deck Score é heurístico**: a pontuação e as recomendações do analisador de deck são regras de bom senso (proporção de energias, curva de recuo, etc.), não regras oficiais do Pokémon TCG nem um modelo de machine learning — isso é deixado claro na própria interface.

## Limitações conhecidas

- A Pokémon TCG API pública tem limite de requisições por minuto; sem uma API key, picos de uso (várias buscas simultâneas) podem retornar erros temporários — a aplicação trata isso com mensagens de erro e permite tentar novamente.
- Preços de cartas dependem do que a própria API retorna (TCGPlayer/Cardmarket) e podem estar desatualizados ou ausentes para cartas mais raras.
- O compartilhamento de decks (ver acima) é local ao navegador enquanto não houver backend.

## Roadmap

- [ ] Backend opcional (Supabase/Firebase) para sincronizar dados entre dispositivos
- [ ] Autenticação real de usuários
- [ ] Compartilhamento de decks via servidor (link universal)
- [ ] Tradução completa da interface (i18n pt-BR / en-US)
- [ ] Testes automatizados (unitários para `src/lib`, E2E para os fluxos principais)
- [ ] PWA com suporte offline

## Licença

Este projeto é disponibilizado sob a licença MIT. Os dados de cartas, imagens e nomes do Pokémon TCG são fornecidos pela [Pokémon TCG API](https://pokemontcg.io/) e pertencem aos seus respectivos detentores de direitos autorais.
