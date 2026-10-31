"use strict";
/* Galle Builders: catálogo e provas FIRA (Onda 3, 31/10/2026). Sem dependências externas, sem coleta de dados. */
const $ = s => document.querySelector(s);
const el = (tag, attrs, ...filhos) => { const e = document.createElement(tag);
  for (const k in (attrs || {})) k === "texto" ? e.textContent = attrs[k] : e.setAttribute(k, attrs[k]);
  filhos.forEach(f => e.append(f)); return e; };
const norm = s => (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const cache = {};

async function lerJSON(arq) {
  if (!cache[arq]) {
    const r = await fetch("dados/" + arq);
    if (!r.ok) throw new Error("Não foi possível ler " + arq);
    cache[arq] = await r.json();
  }
  return cache[arq];
}
const semRede = e => el("p", { class: "nota", texto: e.message + ". Se estiver sem internet, abra o app uma vez com internet." });
// Preferência só deste aparelho (kits marcados). Pode sumir se o navegador limpar os dados: o app continua funcionando.
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const recuperar = (k, padrao) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; } };
const nomeKit = set => (CONFIG.KITS.find(k => k.set === set) || {}).curto || set;
const mm = v => typeof v === "number" ? v + " mm" : (v || "não informado");
const segundos = s => s == null ? "não informado" : (s >= 60 ? Math.floor(s / 60) + " min" + (s % 60 ? " " + (s % 60) + " s" : "") : s + " s");

/* ---------- telas ---------- */
function telaInicio(raiz) {
  raiz.append(el("h2", { texto: "O que você quer ver?" }));
  raiz.append(el("div", { class: "grade" },
    el("a", { class: "cartao", href: "#/pecas" }, el("h3", { texto: "Peças" }),
      el("p", { texto: "Todas as peças do EV3, do SPIKE Prime e do SPIKE Essential, com busca e filtros." })),
    el("a", { class: "cartao", href: "#/provas" }, el("h3", { texto: "Provas FIRA" }),
      el("p", { texto: "Missão Impossível: tamanho máximo do robô, tempo e regras de montagem de cada prova de treino." })),
    el("a", { class: "cartao", href: "#/lab" }, el("h3", { texto: "Montagens" }),
      el("p", { texto: "Robôs de treino e mecanismos. Por enquanto estão em teste, no Laboratório." }))));
  raiz.append(el("p", { class: "nota", role: "note", texto: CONFIG.AVISO_EVENTO }));
}

async function telaPecas(raiz, consulta) {
  raiz.append(el("h2", { texto: "Peças" }));
  let cat;
  try { cat = await lerJSON("catalogo.json"); } catch (e) { raiz.append(semRede(e)); return; }
  // ?k=45678 abre com só esse kit marcado (links antigos #/kit/...)
  const doLink = new URLSearchParams(consulta || "").get("k");
  let marcados = doLink ? [doLink] : recuperar("kits_marcados", CONFIG.KITS.filter(k => k.padrao).map(k => k.set));
  let impressas = recuperar("impressas_marcadas", true);
  const chips = el("div", { class: "chips", role: "group", "aria-label": "Kits" });
  const chip = (rotulo, ativo, aoTocar) => { const b = el("button", { type: "button", class: "chip", "aria-pressed": String(ativo), texto: rotulo });
    b.addEventListener("click", () => { aoTocar(); b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); desenhar(); }); return b; };
  CONFIG.KITS.forEach(k => chips.append(chip(k.curto, marcados.includes(k.set), () => {
    marcados = marcados.includes(k.set) ? marcados.filter(x => x !== k.set) : marcados.concat(k.set); guardar("kits_marcados", marcados); })));
  chips.append(chip("Impressas 3D", impressas, () => { impressas = !impressas; guardar("impressas_marcadas", impressas); }));
  const busca = el("input", { type: "search", id: "busca", placeholder: "Buscar por nome ou código", "aria-label": "Buscar por nome ou código", autocomplete: "off" });
  const opcoes = (vals, rot, todos) => { const s = el("select", { "aria-label": todos }, el("option", { value: "", texto: todos }));
    vals.sort((x, y) => rot(x).localeCompare(rot(y), "pt-BR")).forEach(v => s.append(el("option", { value: v, texto: rot(v) }))); return s; };
  const selF = opcoes([...new Set(cat.pecas.map(p => p.funcao))], CONFIG.rotuloFuncao, "Todas as funções");
  const selC = opcoes([...new Set(cat.pecas.map(p => p.cor))], c => c, "Todas as cores");
  const cont = el("p", { id: "contagem", "aria-live": "polite" });
  const lista = el("div", { class: "grade", id: "lista" });
  raiz.append(chips, el("div", { class: "ferramentas" }, busca, selF, selC),
    el("p", { class: "en", texto: "Quantidade = lista oficial de cada kit (sem sobressalentes)." }), cont, lista);
  function desenhar() {
    const q = norm(busca.value.trim()), f = selF.value, c = selC.value;
    const ach = cat.pecas.filter(p => (p.impressa ? impressas : Object.keys(p.kits).some(s => marcados.includes(s))) &&
      (!f || p.funcao === f) && (!c || p.cor === c) &&
      (!q || norm(p.nome_pt + " " + (p.nome_en || "") + " " + p.codigo).includes(q)));
    lista.replaceChildren(...ach.map(p => el("a", { class: "peca", href: "#/peca/" + p.id },
      el("div", { class: "foto", "aria-hidden": "true", texto: "sem imagem" }), // imagem (render 3D) virá do Catálogo
      el("div", {}, el("h3", { texto: p.nome_pt }), el("p", { class: "en", texto: "cód. " + p.codigo + " · " + p.cor }),
        el("div", { class: "qtds" },
          ...(p.impressa ? [el("span", { class: "selo", texto: "impressa em 3D" })] :
            Object.entries(p.kits).filter(([s]) => marcados.includes(s)).map(([s, n]) => el("span", {}, nomeKit(s) + ": ", el("b", { texto: n })))),
          el("span", { texto: CONFIG.rotuloFuncao(p.funcao) }))))));
    if (!ach.length) lista.append(el("div", { class: "vazio", texto: marcados.length || impressas ? "Nenhuma peça com esses filtros." : "Marque pelo menos um kit." }));
    cont.textContent = ach.length + (ach.length === 1 ? " peça" : " peças");
  }
  busca.addEventListener("input", desenhar); selF.addEventListener("change", desenhar); selC.addEventListener("change", desenhar); desenhar();
}

async function telaPeca(raiz, id) {
  raiz.append(el("a", { href: "#/pecas", texto: "‹ Peças" }));
  let cat;
  try { cat = await lerJSON("catalogo.json"); } catch (e) { raiz.append(semRede(e)); return; }
  const p = cat.pecas.find(x => x.id === id);
  if (!p) { raiz.append(el("p", { texto: "Peça não encontrada." })); return; }
  raiz.append(el("h2", { texto: p.nome_pt }),
    el("div", { class: "detalhe" },
      el("div", { class: "foto grande", "aria-hidden": "true", texto: "sem imagem" }),
      el("dl", {},
        el("dt", { texto: "Código" }), el("dd", { texto: p.codigo }),
        el("dt", { texto: "Cor" }), el("dd", { texto: p.cor }),
        el("dt", { texto: "Função" }), el("dd", { texto: CONFIG.rotuloFuncao(p.funcao) }),
        ...(p.nome_en ? [el("dt", { texto: "Nome em inglês" }), el("dd", { class: "en", texto: p.nome_en })] : []))));
  if (!p.impressa) {
    raiz.append(el("h3", { texto: "Em quais kits tem" }),
      el("table", { class: "tabela" }, el("thead", {}, el("tr", {}, el("th", { texto: "Kit" }), el("th", { texto: "Quantidade na lista do kit" }))),
        el("tbody", {}, ...CONFIG.KITS.map(k => el("tr", {}, el("td", { texto: k.nome + " (" + k.set + ")" }), el("td", { texto: p.kits[k.set] ? String(p.kits[k.set]) : "não tem" }))))));
  }
  if (p.observacoes && p.observacoes.length) {
    raiz.append(el("h3", { texto: "Observações" }), el("ul", {}, ...p.observacoes.map(o => el("li", {}, o.texto + " ", el("span", { class: "en", texto: "(fonte: " + o.fonte + ")" })))));
  }
  raiz.append(el("h3", { texto: "Montagens que usam esta peça" }), el("p", { texto: "Nenhuma montagem aprovada ainda." }),
    el("p", { class: "en", texto: "Origem do dado: " + p.origem + ". Classificação: " + p.funcao_fonte + "." }));
}

async function telaProvas(raiz) {
  raiz.append(el("h2", { texto: "Provas FIRA (Missão Impossível)" }), el("p", { class: "nota", role: "note", texto: CONFIG.AVISO_EVENTO }));
  let d;
  try { d = await lerJSON("provas.json"); } catch (e) { raiz.append(semRede(e)); return; }
  raiz.append(el("div", { class: "grade" }, ...d.provas.map(p => el("a", { class: "cartao", href: "#/prova/" + p.id },
    el("h3", { texto: p.id + " · " + p.nome }),
    el("p", { texto: "Robô: " + p.limite_robo.texto }),
    el("p", { texto: (p.quantidade_robos > 1 ? p.quantidade_robos + " robôs · " : "") + "Tempo: " + (p.tempo_texto || "não informado") }),
    ...(p.categorias ? [el("p", { class: "en", texto: "Categoria: " + p.categorias.join(", ") })] : [])))));
  // Conta feita com os limites das fichas (não é regra da FIRA): a menor largura, o menor comprimento e a menor altura informados.
  const menor = k => Math.min(...d.provas.map(p => p.limite_robo[k]).filter(v => typeof v === "number"));
  raiz.append(el("p", { class: "nota", texto: "Base de treino comum: um robô de até " + menor("largura_mm") + " x " + menor("comprimento_mm") +
    " mm e até " + menor("altura_mm") / 10 + " cm de altura cabe nos limites de todas estas provas. (Conta feita com os limites acima; não é regra da FIRA.)" }));
}

async function telaProva(raiz, id) {
  raiz.append(el("a", { href: "#/provas", texto: "‹ Provas" }));
  let d;
  try { d = await lerJSON("provas.json"); } catch (e) { raiz.append(semRede(e)); return; }
  const p = d.provas.find(x => x.id === id);
  if (!p) { raiz.append(el("p", { texto: "Prova não encontrada." })); return; }
  const lista = (titulo, itens, f) => itens.length ? [el("h3", { texto: titulo }), el("ul", {}, ...itens.map(i => el("li", { texto: f(i) })))] : [];
  const l = p.limite_robo;
  raiz.append(el("h2", { texto: p.id + " · " + p.nome }), el("p", { texto: p.objetivo }),
    el("h3", { texto: "Tamanho máximo do robô" }),
    el("table", { class: "tabela" }, el("tbody", {},
      el("tr", {}, el("th", { texto: "Largura" }), el("td", { texto: mm(l.largura_mm) })),
      el("tr", {}, el("th", { texto: "Comprimento" }), el("td", { texto: mm(l.comprimento_mm) })),
      el("tr", {}, el("th", { texto: "Altura" }), el("td", { texto: mm(l.altura_mm) })))),
    el("p", { class: "en", texto: "No regulamento: \u201c" + l.texto + "\u201d" }),
    el("p", {}, el("b", { texto: "Robôs: " }), String(p.quantidade_robos) + (p.autonomo ? " (autônomo)" : "")),
    el("p", {}, el("b", { texto: "Tempo: " }), p.tempo_texto || segundos(p.tempo_s)),
    ...(p.categorias ? [el("p", {}, el("b", { texto: "Categoria: " }), p.categorias.join(", "))] : []),
    ...lista("Objetos da prova", p.objetos, x => x),
    ...lista("O que importa para a montagem", p.restricoes_de_montagem, x => x.texto),
    ...lista("O que vale ponto", p.pontuacao, x => x.texto),
    ...lista("Desempate", p.desempate, x => x),
    el("h3", { texto: "Montagens para esta prova" }), el("p", { texto: "Nenhuma montagem aprovada ainda." }),
    el("p", { class: "nota", role: "note", texto: CONFIG.AVISO_EVENTO }),
    el("p", { class: "en", texto: "Fonte: " + p.fonte.arquivo.split("/").pop() + (p.fonte.ano_no_texto ? " · ano no texto: " + p.fonte.ano_no_texto : " · ano não informado no texto") +
      (p.fonte.observacao ? " · " + p.fonte.observacao : "") + ". Em caso de dúvida vale o PDF." }));
}

function telaLab(raiz) {
  raiz.append(el("h2", { texto: "Laboratório" }),
    el("p", { class: "nota", role: "note", texto: "Montagens ainda não aprovadas aparecem só aqui. A primeira será a base de treino comum no SPIKE Prime. Elas não passaram por teste físico: [NÃO TESTADO NO ROBÔ]. Alunos veem só as montagens aprovadas." }),
    el("p", {}, el("a", { href: "#/ref", texto: "Ver referências (robôs de apoio) ›" })),
    el("div", { class: "vazio", texto: "Nenhuma montagem ainda." }));
}

async function telaRefs(raiz) {
  raiz.append(el("a", { href: "#/lab", texto: "‹ Laboratório" }), el("h2", { texto: "Referências" }),
    el("p", { class: "nota", role: "note", texto: "Robôs e modelos de apoio. Não são montagens do app e não passaram por teste físico: [NÃO TESTADO NO ROBÔ]." }));
  let dados;
  try { const r = await fetch("dados/referencias.json"); if (!r.ok) throw new Error(); dados = await r.json(); }
  catch (e) { raiz.append(el("p", { class: "nota", texto: "Não foi possível ler as referências. Se estiver sem internet, abra o app uma vez com internet." })); return; }
  raiz.append(el("div", { class: "grade" }, ...dados.itens.map(it => el("article", { class: "cartao" },
    el("h3", { texto: it.nome }),
    el("p", { texto: ((CONFIG.KITS.find(k => k.set === it.kit_set) || {}).nome || it.kit) + " · código " + it.kit_set + " · " + it.tipo }),
    el("p", { texto: it.prova }),
    el("p", { texto: it.resultado }),
    el("p", { texto: it.resumo }),
    el("div", { class: "fotos" }, ...it.fotos.map(f => el("figure", {}, el("img", { src: f.arquivo, alt: f.legenda, loading: "lazy" }), el("figcaption", { texto: f.legenda })))),
    el("p", { class: "nota", texto: it.status }),
    el("p", { class: "en", texto: "Ficha completa no repositório: " + it.ficha })))));
}

/* ---------- PONTOS DE EXTENSÃO (ainda não implementados) ----------
 * window.Extensoes.visor3d(montagem, contêiner): three.js em vendor/three (MIT), carregar sob demanda.
 * window.Extensoes.modoTeste(montagem): testes T-01...; ler ficha_teste de ../validacao/esquemas/.
 * window.Extensoes.naoDeuCerto(montagem, passo): gera URL "#/relato?d=..." + QR (docs/especificacao_qr.md), sem dado pessoal.
 * Rotas reservadas: #/montagem/<id>, #/teste/<id>, #/relato, #/professor. */
window.Extensoes = { visor3d: null, modoTeste: null, naoDeuCerto: null };

/* ---------- rotas ---------- */
async function rotear() {
  const [caminho, consulta] = (location.hash.replace(/^#/, "") || "/").split("?");
  const raiz = $("#conteudo"); raiz.replaceChildren();
  const p = caminho.split("/").map(decodeURIComponent);
  const marcar = id => { document.querySelectorAll("nav a").forEach(a => a.removeAttribute("aria-current")); if (id) $(id).setAttribute("aria-current", "page"); };
  if (p[1] === "lab") { marcar("#nav-lab"); telaLab(raiz); }
  else if (p[1] === "ref") { marcar("#nav-lab"); await telaRefs(raiz); }
  else if (p[1] === "pecas") { marcar("#nav-pecas"); await telaPecas(raiz, consulta); }
  else if (p[1] === "peca") { marcar("#nav-pecas"); await telaPeca(raiz, p[2]); }
  else if (p[1] === "provas") { marcar("#nav-provas"); await telaProvas(raiz); }
  else if (p[1] === "prova") { marcar("#nav-provas"); await telaProva(raiz, p[2]); }
  else if (p[1] === "kit") { // links da 0.1.x: #/kit/ev3|prime|essential
    const set = { ev3: "45544", prime: "45678", essential: "45345" }[p[2]];
    location.replace("#/pecas" + (set ? "?k=" + set : "")); return;
  }
  else { marcar(null); telaInicio(raiz); }
  window.scrollTo(0, 0);
}

/* ---------- offline e atualização ---------- */
function rede() { $("#rodape-rede").textContent = navigator.onLine ? "online" : "sem internet"; }
function iniciarSW() {
  if (!("serviceWorker" in navigator)) { $("#btn-verificar").hidden = true; return; }
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
    const aplicar = w => w.postMessage("PULAR_ESPERA");
    const avisar = w => { $("#aviso-atualizacao").hidden = false; $("#btn-atualizar").onclick = () => aplicar(w); };
    // Versão nova já baixada numa visita anterior: aplica direto ao abrir (o app não guarda nada que se perca).
    if (reg.waiting && navigator.serviceWorker.controller) aplicar(reg.waiting);
    reg.addEventListener("updatefound", () => { const n = reg.installing;
      n.addEventListener("statechange", () => {
        if (n.state === "installed" && navigator.serviceWorker.controller) avisar(n);
        if (n.state === "redundant") estado("Não consegui baixar a versão nova. Toque em \u201cAtualizar\u201d de novo com internet."); }); });
    const verificar = () => reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (!document.hidden) verificar(); });
    setInterval(verificar, 30 * 60 * 1000);
    $("#btn-verificar").onclick = () => verificarAgora(reg);
  }).catch(e => estado("Modo sem internet indisponível neste navegador (" + e.message + ")."));
  let recarregou = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!recarregou) { recarregou = true; location.reload(); } });
}
function estado(t) { $("#rodape-estado").textContent = t; }
/* Botão "Atualizar" do rodapé: compara com a versão publicada e, se o aparelho travar numa cópia velha, limpa e recarrega. */
async function verificarAgora(reg) {
  if (!navigator.onLine) { estado("Sem internet: conecte e toque de novo."); return; }
  estado("Verificando...");
  let publicada = null;
  try { const t = await (await fetch("config.js?v=" + Date.now(), { cache: "no-store" })).text();
    publicada = (t.match(/VERSAO:\s*"([^"]+)"/) || [])[1] || null; } catch (e) {}
  if (!publicada) { estado("Não consegui falar com o servidor. Tente de novo."); return; }
  if (publicada === CONFIG.VERSAO) { estado("Você já está na versão mais nova (" + publicada + ")."); return; }
  estado("Baixando a versão " + publicada + "...");
  try {
    await reg.update();
    const w = reg.waiting || await new Promise((ok, falha) => { const n = reg.installing; if (!n) return falha(new Error("sem instalação"));
      n.addEventListener("statechange", () => { if (n.state === "installed") ok(n); if (n.state === "redundant") falha(new Error("falhou")); }); });
    w.postMessage("PULAR_ESPERA");
  } catch (e) { // último recurso: tira o service worker e o cache velho; o app recarrega da internet
    estado("Limpando a cópia antiga...");
    await reg.unregister().catch(() => {});
    if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
    // renova também o cache comum do navegador, senão ele pode devolver os arquivos velhos
    await Promise.all(["./", "index.html", "config.js", "app.js", "styles.css", "sw.js"].map(u => fetch(u, { cache: "reload" }).catch(() => {})));
    location.reload();
  }
}

document.title = CONFIG.NOME_APP;
$("#titulo-app").textContent = CONFIG.NOME_APP;
$("#rodape-versao").textContent = "Versão " + CONFIG.VERSAO + " · rascunho";
rede(); addEventListener("online", rede); addEventListener("offline", rede);
addEventListener("hashchange", rotear); rotear(); iniciarSW();
