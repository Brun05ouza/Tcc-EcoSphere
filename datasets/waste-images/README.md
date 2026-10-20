# Imagens para treinar o classificador (Teachable Machine)

Fonte principal: **[TrashNet](https://github.com/garythung/trashnet)** (Gary Thung & Mindy Yang, Stanford CS229) — ~2.500 fotos em fundo claro.

Cite o TrashNet se usar no TCC.

## Pastas (ids iguais ao `wasteKnowledge.js`)

| Pasta | Imagens | Origem TrashNet |
|-------|--------:|-----------------|
| `embalagem_plastica` | 482 | plastic |
| `lata_aluminio` | 410 | metal |
| `garrafa_vidro` | 501 | glass |
| `papel` | 594 | paper |
| `papelao` | 403 | cardboard |
| `garrafa_pet` | 0 | *você coleta* |
| `organico` | 0 | *você coleta* |
| `pilha_bateria` | 0 | *você coleta* |
| `eletronico` | 0 | *você coleta* |
| `sem_objeto` | 0 | *você coleta* (mesa vazia, mão, fundo) |
| `_opcional_trash_misc` | 137 | trash (não use no TM — classe genérica) |

## Como usar no Teachable Machine

1. Abra https://teachablemachine.withgoogle.com → **Image Project**
2. Crie **10 classes** com os **mesmos nomes** das pastas (ex.: `garrafa_pet`, `papel`, …)
3. Em cada classe, faça upload das imagens da pasta correspondente
4. Complete as 5 classes vazias com fotos suas (~50+ por classe)
5. Treine → Export → **TensorFlow.js** → Download
6. Copie `model.json` + `weights.bin` (+ `metadata.json`) para  
   `frontend/public/models/waste-classifier/`
7. Reinicie o frontend com `REACT_APP_USE_MOCK_MODEL=false`

## Licença / aviso

- TrashNet: ver LICENSE do repositório original (MIT no código; cite o dataset).
- Imagens grandes estão no `.gitignore` — ficam só na sua máquina.
