# App (PWA) - Onda 1A (esqueleto)

Nome: Galle Builders (definido pelo Rian em 24/10/2026); está só em `config.js` (`NOME_APP`). Versão: `config.js` (`VERSAO`), mostrada no rodapé e usada pelo service worker.
Escopo: EV3 45544, SPIKE Prime 45678, SPIKE Essential 45345 (só 1º-5º). Sem OBR. Sem CDN. Sem coleta de dados.

## Como rodar localmente
1. `python -I sincronizar_dados.py` (copia os JSON de `..\dados\pecas` para `app\dados`; não altera `dados\`).
2. `python -m http.server 8765` dentro de `app\` e abrir `http://localhost:8765`.
(`python -I gerar_icones.py` refaz os ícones, só stdlib.)

## Como atualizar a versão (OBRIGATÓRIO a cada mudança)
Lição do projeto antigo: sem nova versão o aparelho fica preso na cópia velha.
1. Mexeu em qualquer arquivo de `app\` (inclusive depois de sincronizar dados)? Aumente `VERSAO` em `config.js`.
2. Novo arquivo a guardar offline? Inclua em `ARQUIVOS` no `sw.js`.
3. Nos aparelhos: o app checa ao abrir/voltar à tela; aparece a faixa "Nova versão disponível. Toque para atualizar."; ao tocar, recarrega na versão nova. O `sw.js` é buscado sem cache (`updateViaCache: none`) e o cache novo é montado com `no-cache`.

## Estrutura
`index.html`, `styles.css`, `app.js` (telas e rotas por `#/`), `config.js`, `sw.js`, `manifest.webmanifest`, `icones/`, `dados/` (cópia), `vendor/three/` (three.js r160 MIT, ainda não usado; ver `LICENCAS.md`).
Rotas: `#/` kits, `#/kit/<id>` catálogo, `#/lab` Laboratório. Reservadas: `#/montagem/<id>`, `#/teste/<id>`, `#/relato`, `#/professor`. Pontos de extensão: `window.Extensoes` em `app.js` (visor 3D, modo Teste, "Não deu certo"/QR). Os esquemas de `..\validacao\esquemas\` ainda não existiam; o app não depende deles.

## Testado
No navegador embutido (desktop): as três telas carregam, busca (nome e código) e filtro por função funcionam, rodapé com versão. Console: único erro é a falha ao buscar o script do service worker (o navegador embutido não registra SW).

## [NÃO TESTADO em aparelho real] - falta testar
- Offline (abrir uma vez com internet, ativar modo avião, reabrir) no iPad A16 (Safari) e no Samsung (Chrome).
- Instalar na tela inicial (iPad: Compartilhar > Adicionar à Tela de Início; Samsung: Instalar app) e ícone.
- Fluxo de atualização: subir VERSAO, reabrir, ver a faixa, tocar e conferir a versão no rodapé.
- Retrato e paisagem, tamanho de toque e fonte, contraste em tela real; iPhone.
- Tamanho do pacote offline (RNF-04): hoje só shell e 3 JSON, pequeno; medir quando entrarem imagens e 3D.

## 0.2.0-onda3 (31/10/2026): catálogo unificado e provas FIRA
- Telas: Início (`#/`), **Peças** (`#/pecas`, 3 kits juntos, botões de kit, busca, função e cor), **Detalhe da peça** (`#/peca/<id>`), **Provas** (`#/provas` e `#/prova/M1`...), Montagens (= Laboratório, `#/lab`). Links antigos `#/kit/<kit>` abrem Peças só com aquele kit.
- Dados: `dados/catalogo.json` e `dados/provas.json`, gerados por `sincronizar_dados.py` (a partir de `..\dados\pecas\catalogo.json` e `..\dados\fira\provas\`). Os JSON por kit antigos ficam na pasta, sem uso.
- Sem campo "contada" (não há contagem de maleta) e sem aviso de série do Essential no catálogo (decisões de 31/10).
- Kits marcados ficam guardados só no aparelho (localStorage); se o navegador limpar, volta ao padrão EV3 + Prime.
- Testado no Chromium (celular 390 px e tablet 820 px): telas, busca, filtros, links antigos e modo offline sem erros no console. **Falta testar no iPad A16 e no Samsung.**
- Publicação: o repositório público `riangcom/galle-builders` recebe a pasta `app\` (fotos com rostos de alunos pixelados e sem metadados).
- 0.2.1 (31/10): 4 cores traduzidas no catálogo. 0.2.2 (31/10): botão **Atualizar** no rodapé (compara com a versão publicada; se o aparelho travar numa cópia velha, limpa o cache do app e recarrega); versão nova já baixada é aplicada sozinha ao reabrir o app; o service worker deixa passar as consultas `no-store`. Motivo: celular do Rian preso na 0.1.8.
