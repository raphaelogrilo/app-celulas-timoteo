# 📖 MEMORIAL DO PROJETO · APP DE CÉLULAS TIMÓTEO
**Igreja Atos — Timóteo / MG**  
*Registro Histórico de Desenvolvimento e Arquitetura do Sistema*

---

## 📌 1. Visão Geral do Projeto

O **App de Células Timóteo** é uma Progressive Web Application (PWA) e plataforma web interativa moderna, mobile-first e responsiva para desktop, desenvolvida sob medida para a **Igreja Atos** na cidade de Timóteo - MG.

### Objetivos Principais:
1. **Para o Visitante / Membro:** Permitir encontrar de forma visual, rápida e intuitiva a célula mais próxima de sua casa através de um mapa interativo com geolocalização, filtros por perfil (Jovens, Casais, Família, Homens, Mulheres, Teens, Misto), cálculo de distância em km e contato direto com o líder via WhatsApp.
2. **Para o Líder de Célula:** Painel de controle restrito e seguro (login Google) onde gerencia suas próprias células, ativa/pausa grupos no mapa e cadastra a rota de múltiplos endereços para células itinerantes, atualizando a localização da semana em 1 clique.
3. **Para a Liderança / Administrador:** Painel geral com visão 360° de todas as células da igreja, autorização de novos líderes e monitoramento em tempo real.

---

## 🛠️ 2. Stack Tecnológica e Infraestrutura

* **Frontend:** React 19 + TypeScript + Vite 8
* **Estilização & Design:** TailwindCSS v4 + CSS Tokens customizados (Dark Mode imersivo, Glassmorphism, Mobile-first Viewport Locked `100dvh`)
* **Animações e Micro-interações:** Framer Motion + Lucide React Icons
* **Mapas & GIS:** React-Leaflet + Leaflet 1.9 + **Esri ArcGIS World Imagery (Satélite de Alta Resolução)** + **Esri Reference Overlay (Ruas e Bairros)** com interpolação de zoom suave (`maxNativeZoom={18}`, `maxZoom={20}`)
* **Backend & Banco de Dados:** **Supabase (PostgreSQL 15)**
  * Autenticação via **Google OAuth 2.0**
  * **Supabase Realtime (WebSockets)** para sincronização instantânea de células e status
  * **Row Level Security (RLS)** para proteção de dados e permissões
* **Geocodificação e CEP:** Integração com base de bairros de Timóteo e busca automática de CEP (ViaCEP API)
* **Controle de Versão & CI/CD:** GitHub (`raphaelogrilo/app-celulas-timoteo`) com Deploy Contínuo automático na **Vercel**

---

## 🗺️ 3. Linha do Tempo e Evolução do Desenvolvimento

### Fase 1: Arquitetura Base e Experiência do Usuário
* Criação da estrutura base em Vite + React + TypeScript.
* Implementação do layout responsivo com visual escuro elegante, drawer expansível e barra de filtros horizontais.
* Integração do catálogo de **26+ bairros oficiais de Timóteo - MG** com suas coordenadas geográficas precisas.

### Fase 2: Marcador Fixo da Sede da Igreja Atos
* Inclusão do **Pin Dourado / Amarelo da Sede da Igreja Atos**:
  * *Endereço:* Rua 95, nº 6F — Bairro João XXIII, Timóteo / MG (CEP: 35180-368).
  * Ao clicar no marcador amarelo ou no botão de sede, abre modal exclusivo com foto, horários dos cultos e botão de rota no Google Maps / Waze.

### Fase 3: Identidade Visual e Categorização de Perfis
* Criação do sistema de paleta de cores por ministério/perfil:
  * **Jovens (flamma):** Laranja vibrante
  * **Casais (hope):** Rosa / Carmim
  * **Família:** Azul ciano
  * **Homens (Homens de Atos):** Azul escuro
  * **Mulheres (Mulheres de Atitude):** Violeta / Roxo
  * **Teens (flick):** Verde esmeralda
  * **Misto:** Amarelo âmbar
* Cards dinâmicos com distância calculada em tempo real via GPS do usuário (fórmula de Haversine).

### Fase 4: Células Fixas vs. Células Itinerantes
* Implementação de suporte duplo a modelos de reunião:
  1. **Célula Fixa:** Reúne-se sempre no mesmo bairro/CEP.
  2. **Célula Itinerante:** Alterna os encontros semanalmente entre as casas dos membros.
* Marcadores itinerantes com badge visual `🚶 Itinerante` e suporte a atualização semanal com data e observação.

### Fase 5: Autenticação Segura com Google e Controle de Acesso
* Implementação de autenticação via **Google OAuth (Supabase)**.
* Sistema de autorização em lista branca (`whitelist` na tabela `lideres`), garantindo que apenas líderes previamente cadastrados pela liderança possam acessar áreas restritas.
* Detecção automática de perfil Admin vs. Líder Comum.

### Fase 6: Painel Administrativo Geral (`/admin`)
* Visão 360° de todas as células ativas e inativas da igreja.
* Gestão completa de líderes autorizados (adicionar novo líder Google, revogar acessos, promover a Admin).
* Estatísticas em tempo real com filtros por status e busca inteligente.

### Fase 7: Painel do Líder Comum Multi-Células (`/lider/dashboard`)
* Reformulação do painel do líder para suportar **múltiplas células gerenciadas pelo mesmo líder**.
* Escopo estrito de permissão: o líder comum visualiza e edita exclusivamente as células vinculadas a ele.
* Botão de ligar/desligar célula (soft-delete / ativação imediata no mapa).
* Ações rápidas: Editar Informações, Atualizar Semana e Cadastrar Nova Célula.

### Fase 8: Painel de Cadastro de Múltiplos Endereços na Rota Itinerante
* Ao marcar "Célula Itinerante", o sistema habilita o **Painel de Endereços da Rota**:
  * Cadastro de várias casas/locais (ex: *"Casa do Marcos"*, *"Família Silva"*, *"Espaço Jovem"*).
  * Seleção com 1 clique do local ativo para a semana corrente.
  * Tela de atualização rápida semanal com cartões de preenchimento automático.

### Fase 9: Transição para Mapa de Satélite Esri ArcGIS World Imagery
* Substituição do mapa vetorial padrão pelo **Esri ArcGIS World Imagery**:
  * Imagens de satélite reais e de altíssima definição da malha urbana de Timóteo.
  * Camada de sobreposição com os nomes das ruas, avenidas e bairros (*Reference Overlay*).
  * Correção de zoom profundo via `maxNativeZoom={18}` e `maxZoom={20}`, eliminando qualquer bloco cinza de erro.

### Fase 10: Privacidade e Otimizações Finais
* **Proteção de Privacidade Residencial:** Remoção dos campos de endereço completo (rua e número exato) nos formulários públicos, operando por Bairro + CEP e direcionando o visitante ao WhatsApp do líder para obter a localização detalhada.
* Correção de tipagem UUID no Supabase para busca de líderes por e-mail.
* Ajustes de scroll natural e usabilidade para Desktop (PC) e Mobile.

---

## 📁 4. Estrutura de Pastas e Arquivos Principais

```
app-celulas-timoteo/
├── public/                     # Favicons e manifest PWA
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── CelulaCard.tsx      # Card de exibição da célula no drawer
│   │   ├── FilterBar.tsx       # Filtros horizontais por perfil e dia
│   │   ├── MapContainer.tsx    # Leaflet + Esri World Imagery + Marcadores
│   │   ├── ModalIgreja.tsx     # Modal com detalhes da Sede Igreja Atos
│   │   └── PrivateRoute.tsx    # Guardião de rotas autenticadas
│   ├── contexts/
│   │   └── AuthContext.tsx     # Estado global de autenticação e permissões
│   ├── data/
│   │   ├── bairrosTimoteo.ts   # Catálogo geográfico dos bairros de Timóteo
│   │   └── celulas.ts          # Dados iniciais / fallback
│   ├── lib/
│   │   └── supabase.ts         # Cliente Supabase inicializado
│   ├── pages/
│   │   ├── AdminPanel.tsx      # Painel Geral do Administrador
│   │   ├── CelulaForm.tsx      # Formulário de Criação/Edição (Fixa e Itinerante)
│   │   ├── ItineranteUpdate.tsx# Atualização rápida semanal de endereço
│   │   ├── LeaderDashboard.tsx # Painel do Líder Comum (Multi-células)
│   │   ├── LeaderLogin.tsx     # Tela de login Google com orientações
│   │   └── PublicMap.tsx       # Tela principal do mapa público
│   ├── services/
│   │   ├── authService.ts      # Funções de login, líderes e permissões
│   │   └── celulaService.ts    # CRUD e Realtime das células no Supabase
│   ├── types/
│   │   └── celula.ts           # Definições TypeScript (Celula, EncontroAtual, LocalItinerante)
│   ├── utils/
│   │   └── geo.ts              # Funções de cálculo de distância e busca de CEP
│   ├── index.css               # Design System TailwindCSS v4
│   └── main.tsx                # Roteador principal do React Router
├── supabase/
│   └── schema.sql              # Script SQL completo de tabelas, índices e RLS
├── .env                        # Chaves de API do Supabase
├── package.json                # Dependências e scripts
└── MEMORIAL_DO_PROJETO.md      # Este arquivo memorial
```

---

## 🔐 5. Schema do Banco de Dados (Supabase)

### Tabela `public.lideres`
* `id` (UUID, PK)
* `user_id` (UUID, FK auth.users)
* `email` (TEXT, UNIQUE) — E-mail Google autorizado
* `nome` (TEXT)
* `is_admin` (BOOLEAN) — Define se é Administrador geral ou Líder comum
* `celula_id` (UUID, FK celulas)
* `criado_em`, `atualizado_em` (TIMESTAMPTZ)

### Tabela `public.celulas`
* `id` (UUID, PK)
* `nome` (TEXT) — Ex: "Forja 1 - Homens de Atos"
* `perfil` (TEXT) — 'Jovens', 'Casais', 'Família', 'Homens', 'Mulheres', 'Teens', 'Misto'
* `lider` (TEXT)
* `telefone` (TEXT) — WhatsApp com máscara
* `foto_lider`, `descricao`, `faixa_etaria` (TEXT)
* `ativo` (BOOLEAN) — Visível no mapa público
* `itinerante` (BOOLEAN)
* `dia`, `horario`, `cep`, `endereco`, `bairro` (TEXT)
* `lat`, `lng` (DOUBLE PRECISION)
* `encontro_atual` (JSONB) — Objeto com rota, locais pré-cadastrados e endereço da semana
* `lider_email` (TEXT), `lider_user_id` (UUID)

---

## 🎯 6. Status Atual de Produção

* **Repositório Git:** `https://github.com/raphaelogrilo/app-celulas-timoteo.git` (Branch: `main`)
* **Build:** 100% aprovado, 0 erros TypeScript.
* **Ambiente de Teste Local:** `http://localhost:5173`
* **Deploy:** Vercel integrado com deploy automático a cada push.

---

*Memorial registrado em 14 de Setembro de 2026.*  
*Desenvolvido com excelência técnica para abençoar a expansão das células da Igreja Atos em Timóteo.*
