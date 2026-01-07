# 📁 Pasta de Modelos de IA

## ⚠️ IMPORTANTE

Esta pasta deve conter o modelo treinado do Google Teachable Machine.

## 📋 Arquivos Necessários

Você precisa adicionar 3 arquivos aqui:

1. **model.json** - Arquitetura do modelo
2. **weights.bin** - Pesos treinados do modelo
3. **metadata.json** - Metadados e labels (já incluído)

## 🎓 Como Obter o Modelo

### Opção 1: Treinar Seu Próprio Modelo (Recomendado)

Siga o guia completo em: `TEACHABLE_MACHINE_GUIDE.md`

Resumo rápido:
1. Acesse https://teachablemachine.withgoogle.com
2. Crie um projeto de imagem
3. Adicione 6 classes: Plástico, Metal, Vidro, Papel, Orgânico, Eletrônico
4. Adicione 50-100 imagens por classe
5. Treine o modelo
6. Exporte como TensorFlow.js
7. Baixe e extraia os arquivos aqui

### Opção 2: Usar Modelo Pré-treinado (Desenvolvimento)

Enquanto você não treina seu modelo, o sistema usa uma classificação simulada baseada em análise de cores.

## 📂 Estrutura Final

```
waste-classifier/
├── model.json          ← Adicione este arquivo
├── weights.bin         ← Adicione este arquivo
├── metadata.json       ← Já incluído
└── README.md          ← Este arquivo
```

## ✅ Verificação

Após adicionar os arquivos:

1. Reinicie o servidor React
2. Abra o console do navegador (F12)
3. Acesse o Classificador Inteligente
4. Você deve ver: "✅ Modelo Teachable Machine carregado com sucesso"

Se ver "⚠️ Modelo não encontrado", o sistema usará classificação simulada.

## 🔗 Links Úteis

- **Teachable Machine**: https://teachablemachine.withgoogle.com
- **Guia Completo**: ../TEACHABLE_MACHINE_GUIDE.md
- **Documentação Técnica**: ../AI_IMPLEMENTATION.md

## 📊 Tamanho dos Arquivos

- model.json: ~50-200 KB
- weights.bin: ~2-4 MB
- metadata.json: ~1 KB

**Total**: ~2-5 MB

## 🚀 Status Atual

- [x] Estrutura criada
- [x] Metadata configurado
- [ ] Modelo treinado (adicione model.json e weights.bin)

---

**Desenvolvido para o EcoSphere** 🌍♻️
