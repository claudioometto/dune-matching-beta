# Build and Deploy Guide

## 🏠 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Comandos
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 🚀 Deploy no Vercel

### Método 1: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Método 2: Via GitHub Integration
1. Conecte seu repositório GitHub ao Vercel
2. Configure as seguintes variáveis:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Método 3: Manual Upload
1. Execute `npm run build`
2. Faça upload da pasta `dist/` no painel do Vercel

## ⚙️ Configurações

### Variáveis de Ambiente (futuras)
```env
# Para versão com banco de dados
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

## 🔧 Troubleshooting

### Problemas Comuns

**Build falha com erro de TypeScript:**
```bash
npm run lint
# Corrija os erros reportados
```

**Erro de dependências:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problemas de roteamento no Vercel:**
- O arquivo `vercel.json` já está configurado para SPA
- Todas as rotas redirecionam para `index.html`

### Performance
- O projeto usa Vite para builds otimizados
- Tailwind CSS é purgado automaticamente
- Componentes são lazy-loaded quando possível

## 📊 Monitoramento

### Métricas Importantes
- **Lighthouse Score:** Objetivo 90+
- **Bundle Size:** Monitorar crescimento
- **Load Time:** < 3s em 3G

### Analytics (opcional)
- Google Analytics
- Vercel Analytics
- Hotjar para UX

---

**Nota:** Esta versão Beta usa localStorage para persistência. 
A versão de produção terá integração com Supabase.