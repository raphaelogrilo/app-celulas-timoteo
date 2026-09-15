# 📖 Manual e Guia Completo de Funcionalidades
## App de Localização e Gestão de Células · Igreja Atos (Timóteo - MG)

Este documento descreve de forma clara, completa e organizada todas as funcionalidades e regras do aplicativo, dividido em duas perspectivas: a do **Usuário Final (Visitante/Membro)** e a do **Líder & Administrador**.

---

## 🧭 1. Visão Geral do Aplicativo

O **App de Células da Igreja Atos** é uma plataforma web moderna, rápida e responsiva (adaptada para celulares e computadores) desenvolvida para conectar pessoas aos pequenos grupos nos lares da cidade de **Timóteo - MG**, além de oferecer um painel administrativo intuitivo para a liderança e administração da igreja.

---

## 👥 2. Funcionalidades para o Usuário Final (Pessoa que Procura uma Célula)

O visitante ou membro que acessa o app encontra uma interface intuitiva, acolhedora e rápida para localizar uma célula compatível com o seu perfil e próxima da sua residência.

### 📍 2.1. Mapa Interativo e Pins Vetoriais Oficiais
- **Visual Limpo e Gráfico:** O mapa apresenta exclusivamente os ícones vetoriais SVG oficiais de cada ministério, eliminando rótulos de texto sobrepostos para máxima legibilidade.
- **Identidade Visual por Ministério:** Cada perfil possui seu vetor SVG e paleta de cores correspondente:
  - 🏛️ **Igreja Atos (Sede Central):** Marcador Dourado fixado no endereço oficial (`Rua 95 – João XXIII, Timóteo - MG`).
  - 🟤 **Homens de Atos:** Pin Marrom (`/pins/homens.svg`).
  - 🟣 **Mulheres de Atitude:** Pin Bordeaux/Magenta (`/pins/mulheres.svg`).
  - 🟡 **Ministério Hope (Casais):** Pin Dourado (`/pins/hope.svg`).
  - 🟠 **Ministério Flamma (Jovens):** Pin Laranja (`/pins/flamma.svg`).
  - 🔴 **Ministério Flick (Adolescentes):** Pin Vermelho Rubro (`/pins/flick.svg`).

### 🏷️ 2.2. Filtros Rápidos Padronizados
- **Filtro por Ministério / Público:** Selecione diretamente entre:
  - `Todos` (exibe todas as células da cidade)
  - `Homens` (Homens de Atos)
  - `Mulheres` (Mulheres de Atitude)
  - `Casais` (Ministério Hope)
  - `Jovens` (Ministério Flamma)
  - `Adolescentes` (Ministério Flick)
- **Filtro por Dia da Semana:** Filtre os encontros por *Segunda, Terça, Quarta, Quinta, Sexta, Sábado ou Domingo*.
- **Botão Limpar Filtros:** Restaura rapidamente a visão panorâmica de todas as células da cidade.

### 🛰️ 2.3. Geolocalização (GPS do Usuário)
- Ao tocar no botão de mira/GPS, o app identifica a localização exata do visitante e calcula a distância em quilômetros até cada célula.

### 📋 2.4. Alternância entre Mapa e Lista
- O visitante pode alternar entre a visão de **Mapa** e a visão de **Lista**, onde as células aparecem ordenadas da mais próxima para a mais distante.

### 🔒 2.5. Privacidade e Segurança das Famílias
- **Proteção do Endereço Residencial:** No mapa público, os visitantes visualizam o **Bairro** da célula. O número exato da residência não fica exposto publicamente na internet.
- **Contato Direto via WhatsApp:** Ao clicar no card de uma célula, abre-se uma janela com o botão **"Falar com o Líder no WhatsApp"**. O link já abre o WhatsApp com uma mensagem pré-preenchida, permitindo que o líder passe as orientações do encontro e acolha o visitante com segurança.

### 🏛️ 2.6. Modal da Sede da Igreja
- Ao tocar no marcador dourado da **Igreja Atos**, abre-se o modal institucional com:
  - Endereço da sede no bairro João XXIII.
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
- **Visualização Exclusiva:** O líder enxerga apenas os dados das **suas próprias células**.
- **Status em Tempo Real:** Exibe se a célula está ativa e visível no mapa ou pausada.
- **Ativar / Pausar:** Botão de ativação imediata com 1 toque.

### ✏️ 3.3. Edição de Dados Cadastrais (`/lider/editar`)
- Permite alterar o nome da célula, ministério, telefone de contato, faixa etária/público-alvo, dia fixo e horário de encontro.
- **Campo de Endereço Inteligente:** Exibe o endereço já cadastrado e disponibiliza o botão **"Editar"** com foco automático para refinar a localização ou localizar no mapa.

### 🚶 3.4. Gestão de Célula Itinerante (`/lider/itinerante`)
- Para células que mudam de endereço a cada semana:
  - O líder cadastra a rota com múltiplas casas e seleciona com 1 clique a casa ativa da semana corrente.

### 👥 3.5. Gestão de Membros e Chamada (`/lider/membros` e `/lider/chamada`)
- **Membros:** Cadastro de membros com aniversários e WhatsApp.
- **Chamada:** Registro de presença, pontualidade (passos de 5 em 5 minutos) e cadastro de visitantes.

---

## 👑 4. Funcionalidades para o Administrador Geral

O usuário administrador (como `raphaelgfelipe@gmail.com`) possui controle master irrestrito sobre todo o ecossistema do app.

### 🎛️ 4.1. Painel Geral Admin (`/admin`)
- **Métricas e KPIs no Topo:** Indicadores com contagem em tempo real de *Total de Células*, *Células Ativas*, *Células Itinerantes* e *Líderes Autorizados*.
- **Gestão de Líderes:** Autorizar novos e-mails Google de líderes e promover a Admin.
- **Gestão Master de Células:** Cadastrar, editar, transferir liderança, alterar visibilidade ou excluir células.
- **Configuração da Sede:** Atualizar endereço, cultos e telefone da Sede da Igreja.

---

## 🚀 5. Guia Rápido de Acesso

| Perfil | Como Acessar | Link Direto |
| :--- | :--- | :--- |
| **Visitante / Membro** | Abrir o link principal do app no celular ou computador | `https://app-celulas-timoteo.vercel.app/` |
| **Líder de Célula** | Clicar no botão discreto de escudo no topo direito ou no rodapé do modal de info | `/lider/login` → `/lider/dashboard` |
| **Administrador Geral** | Fazer login com o e-mail Google autorizado como Admin | `/lider/login` → `/admin` |
