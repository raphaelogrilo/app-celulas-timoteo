# 📍 App de Células Timóteo — Igreja Atos

Plataforma Web & PWA interativa desenvolvida para a **Igreja Atos** (Timóteo - MG), conectando visitantes e membros aos pequenos grupos nos lares da cidade, com geolocalização precisa, pins vetoriais oficiais, gestão de membros e chamadas com métricas de pontualidade.

---

## 🚀 Tecnologias

- **Frontend:** React 19, TypeScript, Vite 8
- **Estilização:** TailwindCSS v4, Framer Motion, Lucide Icons
- **Mapas:** Leaflet 1.9, React-Leaflet, OpenStreetMap
- **Backend & Realtime:** Supabase (PostgreSQL, Realtime WebSockets, Google OAuth 2.0, Row Level Security)
- **Deploy:** Vercel (CI/CD automático a partir do GitHub)

---

## 📌 Principais Funcionalidades

1. **Mapa Interativo & Pins Oficiais:**
   - Pins vetoriais oficiais SVG para cada ministério:
     - 🟤 **Homens de Atos** (`homens.svg`)
     - 🟣 **Mulheres de Atitude** (`mulheres.svg`)
     - 🟡 **Ministério Hope / Casais** (`hope.svg`)
     - 🟠 **Ministério Flamma / Jovens** (`flamma.svg`)
     - 🔴 **Ministério Flick / Adolescentes** (`flick.svg`)
     - 🏛️ **Sede da Igreja Atos** (Marcador Dourado no Bairro João XXIII)
2. **Filtros Rápidos Padronizados:** Filtro exclusivo pelos 5 ministérios oficiais e dias da semana.
3. **Geolocalização & Rotas:** Cálculo de distância em km e links diretos para rotas no Google Maps e Waze.
4. **Painel do Líder (`/lider/dashboard`):**
   - Gestão das próprias células e endereços com botão de edição rápida.
   - Atualização semanal de rota itinerante.
   - Gestão de Membros com aniversários e WhatsApp.
   - Chamada e Frequência com escala de pontualidade (passos de 5 em 5 min) e cadastro de visitantes.
5. **Painel do Administrador (`/admin`):**
   - Visão 360° de todas as células ativas e inativas.
   - Gestão de líderes autorizados (Google OAuth).
   - Configuração da Sede Central.

---

## 🛠️ Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor local de desenvolvimento
npm run dev

# Compilar build de produção
npm run build
```

---

## 📖 Documentação Adicional

- Consulte [`MEMORIAL_DO_PROJETO.md`](./MEMORIAL_DO_PROJETO.md) para a memória histórica e arquitetura técnica detalhada.
- Consulte [`MANUAL_DO_APP.md`](./MANUAL_DO_APP.md) para o manual de uso de membros, líderes e administradores.
