# Modelo do classificador local (Teachable Machine)

Coloque aqui os arquivos exportados como **TensorFlow.js**:

1. `model.json`
2. `weights.bin`
3. `metadata.json` (já incluso — os `labels` devem bater com os `id` de `frontend/src/data/wasteKnowledge.js`)

## Labels esperadas (ordem do metadata)

`garrafa_pet`, `embalagem_plastica`, `lata_aluminio`, `garrafa_vidro`, `papel`, `papelao`, `organico`, `pilha_bateria`, `eletronico`, `sem_objeto`

Sem `model.json`, a página mostra **Modelo indisponível** (sem classificação inventada).

Para testar a UI sem modelo: `REACT_APP_USE_MOCK_MODEL=true` no frontend (nunca em produção).
