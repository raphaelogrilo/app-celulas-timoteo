# 📖 MEMORIAL DO PROJETO · APP DE CÉLULAS TIMÓTEO
**Igreja Atos — Timóteo / MG**  
*Registro Histórico de Desenvolvimento, Arquitetura e Memória do Sistema*

---

## 📌 1. Visão Geral do Projeto

O **App de Células Timóteo** é uma Progressive Web Application (PWA) e plataforma web interativa moderna, mobile-first e responsiva para desktop, desenvolvida sob medida para a **Igreja Atos** na cidade de Timóteo - MG.

### Objetivos Principais:
1. **Para o Visitante / Membro:** Permitir encontrar de forma visual, rápida e intuitiva a célula mais próxima de sua casa através de um mapa interativo com geolocalização, filtros pelos 5 ministérios oficiais (Homens, Mulheres, Casais, Jovens e Adolescentes), cálculo de distância em km e contato direto com o líder via WhatsApp.
2. **Para o Líder de Célula:** Painel de controle restrito e seguro (login Google) onde gerencia suas próprias células, edita dados cadastrais com botão de edição de endereço, ativa/pausa grupos no mapa e cadastra a rota de múltiplos endereços para células itinerantes, além de gerenciar membros e realizar chamada com pontualidade.
3. **Para a Liderança / Administrador:** Painel geral com visão 360° de todas as células da igreja, autorização de novos líderes, configuração da Sede Central e monitoramento em tempo real.

---

## 🛠️ 2. Stack Tecnológica e Infraestrutura

* **Frontend:** React 19 + TypeScript + Vite 8
* **Estilização & Design:** TailwindCSS v4 + CSS Tokens customizados (Dark Mode imersivo, Glassmorphism, Mobile-first Viewport Locked `100dvh`)
* **Mapas & GIS:** React-Leaflet + Leaflet 1.9 + **OpenStreetMap (Tile Layer gratuito sem limite de chaves)**
* **Identidade Visual dos Marcadores:** Pins Vetoriais SVG Oficiais da Igreja Atos (`/pins/*.svg`) sem poluição de texto
* **Backend & Banco de Dados:** **Supabase** (PostgreSQL na nuvem com índices de performance)
  * Autenticação via **Google OAuth 2.0**
  * **Supabase Realtime (WebSockets)** para sincronização instantânea de células e status
  * **Row Level Security (RLS)** para proteção de dados e permissões
* **Geocodificação e Endereçamento:** Sistema de normalização e busca com suporte a Nominatim/OpenStreetMap + Base oficial de 26+ bairros de Timóteo - MG
* **Controle de Versão & CI/CD:** GitHub (`raphaelogrilo/app-celulas-timoteo`) com Deploy Contínuo automático na **Vercel**

---

## 🗺️ 3. Linha do Tempo e Evolução do Desenvolvimento

### Fase 1: Arquitetura Base e Experiência do Usuário
* Criação da estrutura base em Vite + React + TypeScript.
* Implementação do layout responsivo com visual escuro elegante, drawer expansível e barra de filtros horizontais.
* Integração do catálogo de **26+ bairros oficiais de Timóteo - MG** com suas coordenadas geográficas precisas.

### Fase 2: Marcador Fixo da Sede da Igreja Atos
* Inclusão do **Marcador Dourado da Sede da Igreja Atos**:
  * *Endereço Oficial:* Rua 95 – Bairro João XXIII, Timóteo / MG (Coordenadas: `-19.55409, -42.64819`).
  * Modal exclusivo com foto, horários dos cultos e botão de rota no Google Maps / Waze.

### Fase 3: Identidade Visual Oficial e Marcadores Vetoriais SVG
* Importação e renderização dos **5 vetores oficiais de Pins** da pasta `pins/` (sem rótulos de texto sobrepostos no mapa):
  * 🟤 **Homens de Atos (Homens):** `/pins/homens.svg` (Marrom `#3E1F11`)
  * 🟣 **Mulheres de Atitude (Mulheres):** `/pins/mulheres.svg` (Bordeaux/Magenta `#B14468`)
  * 🟡 **Ministério Hope (Casais):** `/pins/hope.svg` (Dourado `#C69248`)
  * 🟠 **Ministério Flamma (Jovens):** `/pins/flamma.svg` (Laranja `#CB3F1C`)
  * 🔴 **Ministério Flick (Adolescentes):** `/pins/flick.svg` (Vermelho Rubro `#8C111D`)
* Efeito suave de destaque (*glow / drop-shadow*) e animação ao tocar/selecionar qualquer pin no mapa.

### Fase 4: Padronização dos Filtros de Público
* Unificação do seletor de públicos na tela principal para exibir **exclusivamente**:
  1. `Todos` (panorâmico)
  2. `Homens` (Homens de Atos)
  3. `Mulheres` (Mulheres de Atitude)
  4. `Casais` (Ministério Hope)
  5. `Jovens` (Ministério Flamma)
  6. `Adolescentes` (Ministério Flick)
* Remoção de filtros legados (*Teens*, *Família*, *Misto*) alinhando 100% o app com a visão dos ministérios da igreja.

### Fase 5: Geolocalização Exata de Todas as 13 Células Oficiais
* Geocodificação completa e posicionamento de 100% das células da igreja com coordenadas precisas:
  1. **Forja 1 · Homens de Atos:** Rua 31 de Março, 120, Centro Sul (`-19.53809, -42.64872`)
  2. **Forja 2 · Homens de Atos:** Rua Oito de Novembro, 05, Centro (`-19.53733, -42.64773`)
  3. **Celeiro 1 · Mulheres de Atitude:** Rua Costa Rica, 145, Ana Rita (`-19.58913, -42.64639`)
  4. **Celeiro 2 · Mulheres de Atitude:** Praça 29 de Abril, 80 (Próx. Prefeitura), Centro (`-19.58229, -42.64630`)
  5. **Celeiro 3 · Mulheres de Atitude:** Rua São Paulo, 180, São José (`-19.54829, -42.65943`)
  6. **Celeiro 4 · Mulheres de Atitude:** Avenida Almir de Souza Ameno, 420, Funcionários (`-19.54586, -42.64544`)
  7. **Celeiro 5 · Mulheres de Atitude:** Rua Centauro, 95 (Quadra do Alvorada), Alvorada (`-19.54246, -42.62312`)
  8. **Célula Mista 1 · Hope:** Rua 135, 150, Eldorado (`-19.54489, -42.62648`)
  9. **Célula Mista 2 · Hope:** Rua Belo Horizonte, 210, Quitandinha (Cel. Fabriciano) (`-19.51909, -42.61380`)
  10. **Tocha (25+) · Flamma:** Rua 19 de Novembro, 160, Apto 201, Centro Norte (`-19.53880, -42.64990`)
  11. **Fuego · Flamma:** Avenida Jovino Augusto da Silva, 509, Bromélias (`-19.54438, -42.65270`)
  12. **Brasa · Flick:** Rua Cruzeiro do Sul, 310 (Próx. Depósito Alvorada), Alvorada (`-19.55534, -42.66636`)
  13. **Fire · Flick:** Rua Honduras, 180 (Próx. Posto de Saúde), Ana Rita (`-19.58925, -42.64944`)

### Fase 6: Campo de Endereço Inteligente & Botão "Editar"
* No formulário de edição/criação de células (`/lider/editar` e `/lider/cadastro`):
  * Se a célula já possui endereço cadastrado pelo líder, o texto é preenchido diretamente no campo.
  * Se a célula não possui endereço, permanece limpo com placeholder de exemplo.
  * Botão de ação **"Editar"** com ícone de lápis e foco automático no input para alterações rápidas.

### Fase 7: Autenticação Segura com Google e Controle de Acesso
* Implementação de autenticação via **Google OAuth (Supabase)**.
* Sistema de autorização em lista branca (`whitelist` na tabela `lideres`), garantindo que apenas líderes autorizados acessem áreas restritas.
* Detecção automática de perfil Admin vs. Líder Comum.

### Fase 8: Gestão de Membros e Sistema de Chamada com Pontualidade
* **Módulo de Cadastro de Membros (`/lider/membros`):**
  * Cadastro de Nome, Data de Aniversário, Endereço e WhatsApp.
  * Destaque automático para aniversariantes do mês atual.
  * Botão de conversa direta no WhatsApp com mensagem de boas-vindas/parabéns pré-formatada.
* **Módulo de Chamada e Frequência do Encontro (`/lider/chamada`):**
  * Registro de presença e ausência com 1 toque.
  * **Nível de Pontualidade:** escala graduada em passos de 5 em 5 minutos (`0 min (Pontual)`, `+5m`, `+10m`, `+15m`, ... até `+60m ou mais`).
  * **Sessão de Visitantes:** registro dedicado de visitantes com indicação de quem convidou e horário de chegada.
  * Contadores em tempo real e histórico de relatórios.

---

## 📁 4. Estrutura de Pastas do Projeto

```
app-celulas-timoteo/
├── public/                     # Favicons, manifesto e pins vetoriais
│   └── pins/                   # SVGs oficiais (homens, mulheres, hope, flamma, flick)
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── AtosLogo.tsx        # Logotipo geométrico oficial da Igreja Atos
│   │   ├── BottomSheet.tsx     # Gaveta deslizante com detalhes da célula e WhatsApp
│   │   ├── ChurchModal.tsx     # Modal da Sede da Igreja Atos (cultos e rotas)
│   │   ├── FilterChips.tsx     # Chips dos 5 ministérios oficiais + dias da semana
│   │   ├── Header.tsx          # Cabeçalho com contadores e acesso à liderança
│   │   ├── InfoModal.tsx       # Modal explicativo "O que é uma Célula?"
│   │   ├── ListView.tsx        # Visualização em lista ordenada por proximidade
│   │   ├── MapContainer.tsx    # Leaflet + OpenStreetMap + Pins Vetoriais Oficiais
│   │   ├── MiniMapPreview.tsx  # Mini-mapa interativo para conferência de endereço exato
│   │   └── PrivateRoute.tsx    # Guardião de rotas autenticadas (Google OAuth)
│   ├── contexts/
│   │   └── AuthContext.tsx     # Estado global de autenticação e permissões
│   ├── data/
│   │   ├── bairrosTimoteo.ts   # Catálogo dos 26+ bairros de Timóteo e Sede Oficial
│   │   └── celulas.ts          # Seed com as 13 células oficiais geocodificadas
│   ├── lib/
│   │   └── supabase.ts         # Cliente Supabase inicializado
│   ├── pages/
│   │   ├── AdminPanel.tsx      # Painel Geral do Administrador
│   │   ├── CelulaForm.tsx      # Formulário de Cadastro/Edição com botão Editar
│   │   ├── ChamadaEncontro.tsx # Chamada com pontualidade e visitantes
│   │   ├── ItineranteUpdate.tsx# Atualização semanal de rota itinerante
│   │   ├── LeaderDashboard.tsx # Painel do Líder Comum (Multi-células)
│   │   ├── LeaderLogin.tsx     # Tela de login Google com orientações
│   │   ├── MembrosGestao.tsx   # Gestão e cadastro de membros da célula
│   │   └── PublicMap.tsx       # Tela principal do mapa público
│   ├── services/
│   │   ├── authService.ts      # Funções de login, líderes e permissões
│   │   ├── celulaService.ts    # CRUD, Realtime e Reconciliação com base oficial
│   │   ├── churchService.ts    # Gestão da Sede da Igreja
│   │   └── membroService.ts    # Gestão de membros e histórico de chamadas
│   ├── types/
│   │   ├── celula.ts           # Definições TypeScript (Celula, PerfilCelula, Coords)
│   │   └── membro.ts           # Definições TypeScript (MembroCelula, ChamadaCelula)
│   ├── utils/
│   │   └── geo.ts              # Distância Haversine, estilos de ministérios e geocoding
│   ├── index.css               # Design System TailwindCSS v4
│   └── main.tsx                # Roteador principal do React Router
├── supabase/
│   ├── schema.sql              # Script SQL base de tabelas, índices e RLS
│   └── schema_membros_chamadas.sql # Script SQL para membros e chamadas
├── AGENTS.md                   # Regras de desenvolvimento do projeto
├── MANUAL_DO_APP.md            # Manual do usuário e líderes
├── MEMORIAL_DO_PROJETO.md      # Este memorial atualizado
└── package.json                # Dependências do projeto
```

---

## 🎯 5. Status Atual de Produção

* **Repositório Git:** `https://github.com/raphaelogrilo/app-celulas-timoteo.git` (Branch: `main`)
* **Build:** 100% aprovado, 0 erros TypeScript.
* **Ambiente de Teste Local:** `http://localhost:5173`
* **Deploy:** Vercel integrado com deploy automático a cada push.

---

*Memorial atualizado em 15 de Setembro de 2026.*  
*Desenvolvido com excelência técnica para a expansão do Reino e das células da Igreja Atos em Timóteo - MG.*
