# 🚀 Guia de Deploy no GitHub

## Pré-requisitos
- Git instalado
- Conta no GitHub
- Repositório criado no GitHub

## 📋 Passo a Passo

### 1. Inicializar Git (se ainda não foi feito)
```bash
cd c:\Users\brunosoares.sup.pack\Desktop\TCC\Tcc-EcoSphere
git init
```

### 2. Verificar arquivos que serão enviados
```bash
git status
```

### 3. Adicionar todos os arquivos
```bash
git add .
```

### 4. Fazer o primeiro commit
```bash
git commit -m "Initial commit: EcoSphere - Plataforma de Sustentabilidade"
```

### 5. Conectar ao repositório remoto
```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/Brun05ouza/ecosphere.git
```

### 6. Verificar a conexão
```bash
git remote -v
```

### 7. Enviar para o GitHub
```bash
git branch -M main
git push -u origin main
```

## 🔐 Segurança - IMPORTANTE!

### Arquivos já protegidos pelo .gitignore:
- ✅ `.env` (credenciais)
- ✅ `node_modules/` (dependências)
- ✅ `serviceAccountKey.json` (Firebase)
- ✅ Arquivos de build

### Antes de fazer push, verifique:
```bash
# Certifique-se que .env não está sendo enviado
git status | findstr .env
```

## 🔄 Comandos Úteis

### Atualizar repositório após mudanças
```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

### Criar nova branch para features
```bash
git checkout -b feature/nova-funcionalidade
git push -u origin feature/nova-funcionalidade
```

### Ver histórico de commits
```bash
git log --oneline
```

## 📝 Configuração Inicial do Repositório

### 1. No GitHub, adicione:
- **Description:** Plataforma web de sustentabilidade com IA, gamificação e monitoramento ambiental
- **Topics:** `react`, `nodejs`, `firebase`, `tensorflow`, `sustainability`, `ai`, `gamification`
- **README.md:** Já está configurado!

### 2. Configure GitHub Pages (opcional)
- Settings → Pages
- Source: Deploy from branch
- Branch: main → /docs ou /frontend/build

### 3. Adicione Secrets (para CI/CD futuro)
- Settings → Secrets and variables → Actions
- Adicione as variáveis de ambiente necessárias

## 🌐 URLs Importantes

- **Repositório:** https://github.com/Brun05ouza/ecosphere
- **Issues:** https://github.com/Brun05ouza/ecosphere/issues
- **Pull Requests:** https://github.com/Brun05ouza/ecosphere/pulls

## 🎯 Próximos Passos

1. ✅ Enviar código para GitHub
2. 📝 Adicionar badges no README (build status, license)
3. 🚀 Configurar CI/CD (GitHub Actions)
4. 📦 Deploy automático (Vercel/Railway)
5. 📖 Adicionar Wiki com documentação detalhada

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/Brun05ouza/ecosphere.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --rebase
git push -u origin main
```

### Arquivo grande demais
```bash
# Adicione ao .gitignore e remova do staging
echo "arquivo_grande.zip" >> .gitignore
git rm --cached arquivo_grande.zip
```

## 📞 Suporte

Se encontrar problemas, abra uma issue no repositório!
