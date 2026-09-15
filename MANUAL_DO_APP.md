# 📖 Manual e Guia Completo de Funcionalidades
## App de Localização e Gestão de Células · Igreja Atos (Timóteo - MG)

Este documento descreve de forma clara, completa e organizada todas as funcionalidades e regras do aplicativo, dividido em duas perspectivas: a do **Usuário Final (Visitante/Membro)** e a do **Líder & Administrador**.

---

## 🧭 1. Visão Geral do Aplicativo

O **App de Células da Igreja Atos** é uma plataforma web moderna, rápida e responsiva (adaptada para celulares e computadores) desenvolvida para conectar pessoas aos pequenos grupos nos lares da cidade de **Timóteo - MG**, além de oferecer um painel administrativo intuitivo para a liderança e administração da igreja.

---

## 👥 2. Funcionalidades para o Usuário Final (Pessoa que Procura uma Célula)

O visitante ou membro que acessa o app encontra uma interface intuitiva, acolhedora e rápida para localizar uma célula compatível com o seu perfil e próxima da sua residência.

### 📍 2.1. Mapa Interativo e Pins Minimalistas
- **Visual Limpo:** O mapa apresenta marcadores (*pills*) ultra-compactos contendo apenas o nome de cada célula, evitando poluição visual.
- **Identidade Visual por Ministério:** Cada perfil possui sua cor oficial e logotipo correspondente:
  - 🏛️ **Igreja Atos (Sede Central):** Marcador Amarelo Ouro (`#FAAB36`) fixado no endereço oficial (`Rua 95, nº 6F - João XXIII, Timóteo`).
  - 🔥 **Jovens (flamma):** Laranja Fogo (`#FA6400`).
  - 🌸 **Mulheres de Atitude:** Rosé Mauve (`#B75D74`).
  - ⚡ **Teens (flick):** Vermelho Centelha (`#E62129`).
  - 💍 **Casais (hope):** Salmão / Pêssego Dourado (`#F89E50`).
  - 👨‍👩‍👧‍👦 **Família / Homens / Misto:** Paletas corporativas exclusivas.

### 🔍 2.2. Busca Inteligente por Bairro e CEP
- **Busca por Bairro:** Digite o nome de qualquer bairro de Timóteo (ex: *Centro, Timirim, Primavera, Funcionários, Alegre, Eldorado, Bromélias, etc.*) para centralizar o mapa instantaneamente no local.
- **Busca por CEP com Auto-Localização:** Ao digitar os 8 dígitos de um CEP, o aplicativo consulta a base do ViaCEP, identifica o bairro correspondente e aproxima o mapa daquela região.

### 🏷️ 2.3. Filtros Rápidos
- **Filtro por Perfil:** Selecione facilmente entre *Jovens, Casais, Família, Mulheres, Homens, Teens ou Misto*.
- **Filtro por Dia da Semana:** Filtre os encontros por *Segunda, Terça, Quarta, Quinta, Sexta, Sábado ou Domingo*.
- **Botão Limpar Filtros:** Restaura rapidamente a visão panorâmica de todas as células da cidade.

### 🛰️ 2.4. Geolocalização (GPS do Usuário)
- Ao tocar no botão de mira/GPS, o app solicita permissão para identificar a localização exata do visitante e calcular a distância em quilômetros até cada célula.

### 📋 2.5. Alternância entre Mapa e Lista
- O visitante pode alternar entre a visão de **Mapa** e a visão de **Lista**, onde as células aparecem ordenadas da mais próxima para a mais distante.

### 🔒 2.6. Privacidade e Segurança das Famílias
- **Proteção do Endereço Residencial:** No mapa público, os visitantes visualizam apenas o **Bairro** e a **região do CEP** da célula. O número exato da residência não fica exposto publicamente na internet.
- **Contato Direto via WhatsApp:** Ao clicar no card de uma célula, abre-se uma janela com o botão **"Falar com o Líder no WhatsApp"**. O link já abre o WhatsApp com uma mensagem pré-preenchida, permitindo que o líder passe as orientações do encontro e acolha o visitante com segurança.

### 🏛️ 2.7. Modal da Sede da Igreja
- Ao tocar no marcador amarelo da **Igreja Atos**, abre-se o modal institucional com:
  - Endereço completo da sede no bairro João XXIII.
  - Grade de dias e horários de cultos oficiais.
  - Botão de rotas pelo **Google Maps** e **Waze**.
  - Canal direto com a secretaria da igreja.

---

## 🛡️ 3. Funcionalidades para o Líder de Célula

Área exclusiva para os líderes responsáveis pela condução semanal de cada grupo.

### 🔑 3.1. Acesso Seguro via Google OAuth
- **Sem senhas decoradas:** O líder acessa a plataforma clicando em **"Continuar com o Google"**.
- **Autorização Prévia:** Apenas líderes cujo e-mail Google foi previamente autorizado pelo Administrador conseguem acessar.

### 📊 3.2. Painel do Líder Individual (`/lider/dashboard`)
- **Visualização Exclusiva:** Ao entrar, o líder enxerga apenas os dados da **sua própria célula**.
- **Status em Tempo Real:** Exibe se a célula está ativa e visível no mapa ou inativa.

### ✏️ 3.3. Edição de Dados Cadastrais (`/lider/editar`)
- Permite alterar o nome da célula, perfil, telefone de contato, faixa etária/público-alvo, dia fixo e horário de encontro.

### 🚶 3.4. Gestão de Célula Itinerante (`/lider/itinerante`)
- Para células que mudam de endereço a cada semana:
  - O líder acessa a tela de atualização semanal e informa a data do próximo encontro, dia da semana, horário, CEP e endereço completo da casa daquela semana.
  - O app atualiza as coordenadas e publica o novo ponto no mapa imediatamente.

### 🚫 3.5. Restrição de Segurança
- O líder comum não tem permissão para visualizar nem editar células de outros líderes. Se tentar forçar a alteração de ID na URL, o sistema bloqueia o acesso e redireciona para seu painel com aviso de segurança.

---

## 👑 4. Funcionalidades para o Administrador Geral (Plenos Poderes)

O usuário administrador (como `raphaelgfelipe@gmail.com`) possui controle master irrestrito sobre todo o ecossistema do app.

### 🎛️ 4.1. Painel Geral Admin (`/admin`)
- **Métricas e KPIs no Topo:** Indicadores com contagem em tempo real de *Total de Células*, *Células Ativas*, *Células Itinerantes* e *Líderes Autorizados*.
- **Layout Responsivo:** Grade adaptada para telas grandes de PC/Notebook (painel dividido) e smartphones.

### 👥 4.2. Gestão de Líderes Autorizados
- **Autorizar Novo Líder:** O admin informa o Nome Completo e o E-mail Google do líder e define se ele terá poderes de Admin.
- **Status de Conexão:** Mostra se o líder já fez o primeiro login com a conta Google vinculada ou se está aguardando primeiro acesso.
- **Revogar Acesso:** Permite remover a autorização de qualquer líder a qualquer momento com confirmação de segurança.

### 🗺️ 4.3. Gestão Master de Todas as Células
- **Listagem e Busca em Tempo Real:** Escuta tanto as células **ativas** quanto as **inativas**.
- **Filtros no Painel:** Busca por texto (nome, líder, bairro ou perfil) e filtros rápidos por status (*Todas, Ativas, Inativas, Itinerantes*).
- **Editar Qualquer Célula (`✏️`):** O administrador pode abrir e alterar qualquer dado de qualquer célula da cidade.
- **Vínculo e Transferência de Células:** No formulário de edição, o admin pode selecionar um líder cadastrado e transferir/atribuir a responsabilidade da célula com 1 clique.
- **Atualizar Semana Itinerante (`🔄`):** O admin pode atualizar o endereço da semana de qualquer célula itinerante.
- **Ativar / Inativar no Mapa (`⚡`):** Altera a visibilidade pública de qualquer célula instantaneamente com 1 clique (soft delete/toggle).
- **Excluir Permanentemente (`🗑️`):** Exclui a célula em definitivo do banco de dados após confirmação.
- **Cadastrar Nova Célula (`+ Nova Célula`):** Cadastra novas células diretamente pelo painel e atribui a qualquer líder.

---

## 💻 5. Arquitetura Técnica e Segurança

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion (animações fluidas) e Leaflet (mapas interativos).
- **Backend & Banco de Dados:** **Supabase** (PostgreSQL na nuvem com índices de performance).
- **Autenticação:** Supabase Auth via **Google OAuth 2.0**.
- **Segurança (RLS - Row Level Security):**
  - Leitura pública permitida apenas para células com `ativo = true`.
  - Escrita, atualização e deleção restritas a usuários autenticados e autorizados.
- **Sincronização em Tempo Real (Realtime):** Qualquer alteração feita no painel administrativo ou pelo líder reflete no mapa dos visitantes sem necessidade de recarregar a página.
- **Hospedagem & CI/CD:** Repositório no **GitHub** (`raphaelogrilo/app-celulas-timoteo`) com deploy contínuo automático na **Vercel** com CDN global e HTTPS/SSL ativado.

---

## 🚀 6. Guia Rápido de Acesso

| Perfil | Como Acessar | Link Direto |
| :--- | :--- | :--- |
| **Visitante / Membro** | Abrir o link principal do app no celular ou computador | `https://app-celulas-timoteo.vercel.app/` |
| **Líder de Célula** | Clicar no botão discreto de escudo (`🛡️`) no topo direito ou no rodapé do modal de info | `/lider/login` → `/lider/dashboard` |
| **Administrador Geral** | Fazer login com o e-mail Google autorizado como Admin | `/lider/login` → `/admin` |
