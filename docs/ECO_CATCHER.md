# Eco Catcher — Como é feito

Este documento descreve como o minijogo **Eco Catcher** do EcoSphere é produzido: arquitetura, tecnologias, cenas e regras de jogo.

---

## Visão geral

O **Eco Catcher** é um jogo de ação no navegador em que o jogador controla uma **cesta** e deve **coletar itens de lixo reciclável** que caem do topo da tela, evitando lixo orgânico. A pontuação é convertida em **EcoPoints** e pode ser integrada à gamificação do app.

- **Arquivo principal:** `frontend/src/pages/EcoCatcher.js`
- **Rota:** `/eco-catcher`
- **Engine:** Phaser 3 (canvas/WebGL)
- **Interface em volta do jogo:** React + Framer Motion + Tailwind

---

## Stack técnica

| Tecnologia   | Uso |
|-------------|-----|
| **React**   | Página que envolve o jogo: tela inicial (instruções, botão “Começar”), container do canvas e botão “Sair do jogo”. |
| **Phaser 3**| Motor do jogo: cenas (menu, jogo, game over), física, input, sprites/retângulos, texto, timers. |
| **Framer Motion** | Animações leves na tela inicial (opacity, scale) e no botão “Começar Jogo!”. |
| **Tailwind CSS**  | Estilo da página (gradientes, cards, botões) fora do canvas. |

A dependência Phaser está em `frontend/package.json` (`"phaser": "^3.x"`).

---

## Arquitetura em duas camadas

### 1. Camada React (página)

- **Estado:**
  - `showGame`: se é a tela inicial (instruções) ou a tela com o canvas do jogo.
  - `gameInstance`: referência à instância do `Phaser.Game` para poder destruir ao sair.

- **Fluxo:**
  - Inicialmente `showGame === false`: é exibida a **tela inicial** (título “Eco Catcher”, texto “Colete Lixo Reciclável!”, como jogar, pontuação, botão “Começar Jogo!”).
  - Ao clicar em “Começar Jogo!”: `setShowGame(true)`.
  - Em um `useEffect` que depende de `showGame`: quando `showGame && !gameInstance`, é criado o `Phaser.Game` com `parent: 'game-container'` e as cenas `[MainMenu, GameScene, GameOver]`; a instância é guardada em `gameInstance`.
  - O canvas fica dentro de uma `div` com `id="game-container"` e tamanho fixo (800×600).
  - Botão “Sair do Jogo”: chama `gameInstance.destroy(true)`, zera `gameInstance` e faz `setShowGame(false)`, voltando para a tela inicial.

Ou seja: a **produção** do jogo em si (menu do jogo, gameplay, game over) é feita **inteiramente dentro do Phaser**; a página React só decide quando montar/desmontar o Phaser e o que mostrar ao redor (instruções e botão de sair).

### 2. Camada Phaser (três cenas)

O jogo é produzido como um projeto Phaser com três cenas em sequência:

1. **MainMenu** — menu interno do jogo (dentro do canvas).
2. **GameScene** — gameplay (cesta, itens caindo, colisões, pontuação, tempo, vidas).
3. **GameOver** — tela de fim de jogo (score final, EcoPoints, Jogar novamente, Menu principal).

Configuração usada na criação do `Phaser.Game`:

- `type: Phaser.AUTO` (WebGL ou Canvas).
- `width: 800`, `height: 600`, `backgroundColor: '#87CEEB'`.
- **Physics:** `arcade`, sem gravidade global (`gravity: { y: 0 }`); a queda dos itens é feita por velocidade no eixo Y.
- **Cenas:** `[MainMenu, GameScene, GameOver]`.

O Phaser inicia na cena **MainMenu**; de lá o jogador vai para **GameScene** e, ao terminar a partida, para **GameOver**; de GameOver pode voltar a GameScene ou ao MainMenu.

---

## Cena 1: MainMenu

- **Objetivo:** Tela inicial *dentro do jogo* (após o usuário já ter clicado em “Começar Jogo!” na página React).
- **Elementos:**
  - Fundo: retângulo azul céu (`0x87CEEB`).
  - Título: “Eco Catcher” (texto grande, centralizado).
  - Instruções: “Use ← → para mover a cesta”, “Colete lixo reciclável!”.
  - Lista de categorias e pontos: Plástico +10, Vidro +15, Metal +20, Orgânico -10.
  - Botão “COMEÇAR!”: retângulo verde clicável que, no `pointerdown`, chama `this.scene.start('GameScene')`.
- **Produção:** Tudo feito com `this.add.rectangle` e `this.add.text`; o botão usa `setInteractive` e eventos `pointerover`, `pointerout`, `pointerdown`.

---

## Cena 2: GameScene (gameplay)

É onde o jogo é de fato “produzido” em termos de mecânicas.

### Inicialização (`init`)

- `score = 0`, `lives = 3`, `timeLeft = 60` (segundos), `combo = 0`, `multiplier = 1`.

### Criação (`create`)

- **Cenário:**
  - Fundo: retângulo azul céu.
  - Chão: retângulo marrom na parte inferior (`height - 50`).
- **Jogador (cesta):**
  - Um retângulo laranja (`0xFF6B35`), posicionado em `(width/2, height - 100)`, largura 80, altura 60.
  - Corpo de física Arcade: `setCollideWorldBounds(true)`, `setImmovable(true)`.
- **Grupo de itens:** `this.items = this.physics.add.group()` para os objetos que caem.
- **HUD (texto):**
  - Score, tempo restante, vidas, e um texto de combo (ex.: “COMBO x2!”).
- **Controles:** `this.cursors = this.input.keyboard.createCursorKeys()` (setas).
- **Timers:**
  - **Spawn:** a cada 1500 ms chama `spawnItem` (gera um novo item caindo).
  - **Jogo:** a cada 1000 ms chama `updateTimer` (decrementa `timeLeft`).
- **Colisão:** `this.physics.add.overlap(this.player, this.items, this.collectItem, null, this)` — quando a cesta sobrepõe um item, `collectItem` é chamado.

### Atualização (`update`)

- **Movimento:** se seta esquerda/direita pressionada, move o jogador em X (±8). Posição X é limitada com `Phaser.Math.Clamp` para não sair da tela.
- **Limpeza:** itens cujo `y` passou da altura da tela são destruídos (não coletados).

### Spawn de itens (`spawnItem`)

- Posição X aleatória entre 50 e `width - 50`.
- Tipos fixos:
  - Plástico: azul, +10 pts.
  - Vidro: verde, +15 pts.
  - Metal: amarelo, +20 pts.
  - Orgânico: marrom, -10 pts (penalidade).
- Cada item é um retângulo colorido com um texto (label) em cima; recebe corpo de física e velocidade Y aleatória (ex.: 150–250). Dados guardados com `setData`: `points`, `type`, `label`.
- **Dificuldade:** quando `timeLeft < 40` o intervalo de spawn diminui (ex.: 1200 ms); quando `timeLeft < 20`, spawn mais rápido (ex.: 900 ms) e velocidade Y maior.

### Coleta (`collectItem`)

- Remove o label do item e usa `getData('points')`.
- Se **points > 0** (reciclável):
  - Incrementa combo; se combo ≥ 5, ativa `multiplier = 2` e mostra “COMBO x2!”.
  - Soma `points * multiplier` ao score.
  - Efeito visual: flash verde na câmera.
- Se **points &lt; 0** (orgânico):
  - Perde uma vida, zera combo e multiplier.
  - Atualiza texto de vidas; efeito: shake da câmera.
  - Se vidas ≤ 0, chama `gameOver()`.
- Atualiza o texto do score e destrói o item.

### Timer e fim de jogo

- `updateTimer` decrementa `timeLeft` e atualiza o HUD. Se `timeLeft <= 0`, chama `gameOver()`.
- `gameOver()` para os timers de spawn e de jogo, e inicia a cena GameOver passando o score: `this.scene.start('GameOver', { score: this.score })`.

---

## Cena 3: GameOver

- **init(data):** guarda `data.score` em `this.finalScore`.
- **create:**
  - Fundo azul céu.
  - Textos: “Fim de Jogo!”, “Score: …”, “EcoPoints Ganhos: …” (EcoPoints = `Math.floor(finalScore / 10)`).
  - Botão “JOGAR NOVAMENTE”: inicia `GameScene` de novo.
  - Botão “MENU PRINCIPAL”: inicia `MainMenu`.
  - Se existir `window.saveGameScore`, chama `window.saveGameScore(finalScore, ecoPoints)` para integração com o restante do app (ex.: enviar para backend ou contexto de gamificação).

No código atual, o React define `window.saveGameScore` como um `console.log`; a **produção** do salvamento de pontos no backend ou no estado global do EcoSphere seria feita ao substituir essa função.

---

## Resumo do fluxo de produção

1. **Página React** exibe a tela de boas-vindas (“Eco Catcher”, instruções, “Começar Jogo!”).
2. Usuário clica em **“Começar Jogo!”** → React monta a `div#game-container` e cria uma instância de `Phaser.Game` com as três cenas.
3. **Phaser** inicia em **MainMenu** (tela dentro do canvas); usuário clica em “COMEÇAR!” → **GameScene**.
4. Em **GameScene** são produzidos: movimento da cesta (teclado), spawn periódico de itens, física e colisão, pontuação, combo, vidas e tempo. Ao acabar o tempo ou as vidas → **GameOver**.
5. Em **GameOver** são produzidos: exibição do score e EcoPoints, botões “Jogar novamente” e “Menu principal”, e chamada opcional a `window.saveGameScore`.
6. Usuário clica em **“Sair do Jogo”** (botão React) → React chama `game.destroy(true)` e volta a `showGame = false`, exibindo de novo a tela inicial da página.

---

## Pontos importantes para manutenção

- **Canvas fixo:** 800×600; o layout responsivo é feito pela página React (container centralizado, etc.).
- **EcoPoints:** conversão feita em GameOver (`Math.floor(score / 10)`); o envio para o backend ou para a gamificação depende de implementar `window.saveGameScore` na página.
- **Dados do jogo:** não há persistência de score entre sessões no código atual; isso seria feito no backend ou em contexto React/global ao usar `saveGameScore`.
- **Cleanup:** ao sair do jogo, `gameInstance.destroy(true)` evita vazamento de memória e listeners do Phaser.

Este é o fluxo completo de como o Eco Catcher é produzido: React para a página e o ciclo de vida do canvas, Phaser para todo o jogo (menu, gameplay e game over) e uma ponte opcional via `window.saveGameScore` para integrar a pontuação ao resto do EcoSphere.
