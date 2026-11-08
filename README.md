# Adobe RPC

Mostra no Discord qual app Adobe você está usando (Rich Presence).

## 1. Criar o app no Discord
1. Acesse https://discord.com/developers/applications e clique em **New Application**.
2. Copie o **Application ID** (General Information).
3. Cole no campo **Client ID** dentro do Adobe RPC.

## 2. Art Assets
Em **Rich Presence → Art Assets**, suba uma imagem para cada app com a key EXATA:
`photoshop`, `illustrator`, `premiere`, `aftereffects`, `indesign`, `lightroom`, `acrobat`

## 3. Comandos
```bash
npm install
npm run dev        # desenvolvimento
npm run build:win  # instalador NSIS em dist/
npm run typecheck
```

## Observações
- O Discord **desktop** precisa estar aberto.
- Fechar a janela (X) minimiza para a bandeja.
- O Discord limita a 1 atualização de presença a cada 15s.

## Extensão Adobe (projeto + atividade dinâmica)
1. No Adobe RPC, clique em **Instalar extensão**.
2. Reinicie o app Adobe (Photoshop, Illustrator, Premiere, After Effects ou InDesign).
3. Abra **Janela → Extensões → Adobe RPC** (Photoshop recente: *Extensões (legado)*) e deixe o painel aberto/docado.
4. O painel envia projeto e atividade para o app via `127.0.0.1:47321` (com token local).

Lightroom e Acrobat usam só o título da janela.
