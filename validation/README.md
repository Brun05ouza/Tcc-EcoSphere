# Validação do classificador de resíduos

Este diretório contém o script e os resultados da avaliação do classificador Gemini usado pelo EcoSphere. As imagens de teste não são versionadas: `validation/.gitignore` ignora `test-images/` e arquivos `.env` locais.

## Conjunto de imagens

Quatro das seis categorias foram populadas automaticamente com uma amostra aleatória reprodutível do TrashNet:

- `vidro/`: 8 imagens da classe `glass`;
- `papel/`: 4 imagens de `paper` e 4 de `cardboard`;
- `plastico/`: 8 imagens da classe `plastic`;
- `metal/`: 8 imagens da classe `metal`.

As classes `trash` do TrashNet não são usadas, pois não correspondem a uma categoria do EcoSphere.

Referência: THUNG, Gary; YANG, Mindy. *Classification of Trash for Recyclability Status*. CS229 Project Report, Stanford University, 2016. Dataset TrashNet, licença MIT. Disponível em: <https://github.com/garythung/trashnet>.

## Fotos próprias ainda necessárias

O TrashNet não cobre as categorias do EcoSphere abaixo. Adicione de 3 a 5 fotos próprias em cada pasta:

- `test-images/organico/`: casca de fruta, resto de comida ou outro resíduo orgânico;
- `test-images/eletronico/`: pilha, cabo, celular velho ou outro resíduo eletrônico.

O script pula pastas vazias sem falhar e registra “sem imagens de teste ainda” nos resultados.

## Configuração e execução

O script procura `REACT_APP_GEMINI_API_KEY` primeiro em `validation/.env` e depois em `frontend/.env`. O modelo é carregado da constante centralizada `GEMINI_MODEL` em `frontend/src/services/geminiConfig.js`.

Execute na raiz do projeto:

```powershell
node validation/run-validation.js
```

As saídas são salvas em `validation/resultado.json` e `validation/resultado.md`.

O script salva progresso local em `.validation-progress.json` e retoma as imagens já concluídas. Isso é útil no plano gratuito do Gemini, que pode impor uma cota diária menor que o conjunto completo. Ao detectar uma cota diária esgotada, o script para sem contabilizar a indisponibilidade como erro de classificação; execute-o novamente depois da renovação da cota ou habilite faturamento no projeto da API.
