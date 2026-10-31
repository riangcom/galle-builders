"use strict";
/* Plataforma de Montagem: shell da Onda 1A. Sem dependências externas, sem coleta de dados. */
const $ = s => document.querySelector(s);
const el = (tag, attrs, ...filhos) => { const e = document.createElement(tag);
  for (const k in (attrs || {})) k === "texto" ? e.textContent = attrs[k] : e.setAttribute(k, attrs[k]);
  filhos.forEach(f => e.append(f)); return e; };
const norm = s => (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const cacheKits = {};

async function carregarKit(k) {
  if (!cacheKits[k.id]) {
    const r = await fetch("dados/" + k.arquivo);
    if (!r.ok) throw new Error("Não foi possível ler " + k.arquivo);
    cacheKits[k.id] = await r.json();
  }
  return cacheKits[k.id];
}

/* ---------- telas ---------- */
function telaKits(raiz) {
  raiz.append(el("h2", { texto: "Escolha o seu kit" }));
  const g = el("div", { class: "grade" });
  CONFIG.KITS.forEach(k => g.append(el("a", { class: "cartao", href: "#/kit/" + k.id },
    el("h3", { texto: k.nome }), el("div", { texto: "Código " + k.set }), el("div", { texto: "Faixa: " + k.faixa }))));
  raiz.append(g);
  raiz.append(el("p", { class: "nota", texto: "Provisório: as montagens ainda estão em teste. Veja o Laboratório." }));
}

async function telaCatalogo(raiz, id) {
  const k = CONFIG.KITS.find(x => x.id === id);
  if (!k) { raiz.append(el("p", { texto: "Kit não encontrado." }), el("a", { href: "#/", texto: "Voltar aos kits" })); return; }
  raiz.append(el("a", { href: "#/", texto: "‹ Outros kits" }), el("h2", { texto: k.nome + " (" + k.set + ")" }));
  if (k.aviso) raiz.append(el("p", { class: "nota", role: "note", texto: k.aviso }));
  let dados;
  try { dados = await carregarKit(k); } catch (e) { raiz.append(el("p", { class: "nota", texto: e.message + ". Se estiver sem internet, abra o app uma vez com internet." })); return; }
  raiz.append(el("p", {}, el("span", { class: "selo", texto: "RASCUNHO" }),
    document.createTextNode(" Quantidades segundo o Rebrickable; ninguém contou a maleta ainda.")));
  const busca = el("input", { type: "search", id: "busca", placeholder: "Buscar por nome ou código", "aria-label": "Buscar por nome ou código", autocomplete: "off" });
  const funcoes = [...new Set(dados.pecas.map(p => p.funcao))].sort();
  const sel = el("select", { id: "filtro", "aria-label": "Filtrar por função" }, el("option", { value: "", texto: "Todas as funções" }));
  funcoes.sort((x, y) => CONFIG.rotuloFuncao(x).localeCompare(CONFIG.rotuloFuncao(y), "pt-BR"));
  funcoes.forEach(f => sel.append(el("option", { value: f, texto: CONFIG.rotuloFuncao(f) })));
  const cont = el("p", { id: "contagem", "aria-live": "polite" });
  const lista = el("div", { class: "grade", id: "lista" });
  raiz.append(el("div", { class: "ferramentas" }, busca, sel), cont, lista);
  function desenhar() {
    const q = norm(busca.value.trim()), f = sel.value;
    const ach = dados.pecas.filter(p => (!f || p.funcao === f) &&
      (!q || norm(p.nome_pt + " " + p.nome_en + " " + p.codigo).includes(q)));
    lista.replaceChildren(...ach.map(p => el("article", { class: "peca" },
      el("div", { class: "foto", "aria-hidden": "true", texto: "sem imagem" }), // PONTO DE EXTENSÃO: imagem local virá do Catálogo
      el("div", {}, el("h3", { texto: p.nome_pt }), el("p", { class: "en", texto: p.nome_en + " · cód. " + p.codigo + " · " + p.cor }),
        el("div", { class: "qtds" },
          el("span", {}, "Rebrickable: ", el("b", { texto: p.qtd_rebrickable })),
          el("span", {}, "Contada: ", el("b", { texto: p.qtd_contada == null ? "—" : p.qtd_contada }), " ", el("span", { class: "selo", texto: "rascunho" })),
          el("span", { texto: "Função: " + CONFIG.rotuloFuncao(p.funcao) }))))));
    cont.textContent = ach.length + " de " + dados.pecas.length + " peças";
  }
  busca.addEventListener("input", desenhar); sel.addEventListener("change", desenhar); desenhar();
}

function telaLab(raiz) {
  raiz.append(el("h2", { texto: "Laboratório" }),
    el("p", { class: "nota", role: "note", texto: "Montagens ainda não aprovadas aparecem só aqui. Elas não passaram por teste físico: [NÃO TESTADO NO ROBÔ]. Alunos veem só as montagens aprovadas." }),
    el("p", {}, el("a", { href: "#/ref", texto: "Ver referências (robôs de apoio) ›" })),
    el("div", { class: "vazio", texto: "Nenhuma montagem ainda." }));
}

async function telaRefs(raiz) {
  raiz.append(el("a", { href: "#/lab", texto: "‹ Laboratório" }), el("h2", { texto: "Referências" }),
    el("p", { class: "nota", role: "note", texto: "Robôs e modelos de apoio. Não são montagens do app e não passaram por teste físico: [NÃO TESTADO NO ROBÔ]." }));
  let dados;
  try { const r = await fetch("dados/referencias.json"); if (!r.ok) throw new Error(); dados = await r.json(); }
  catch (e) { raiz.append(el("p", { class: "nota", texto: "Não foi possível ler as referências. Se estiver sem internet, abra o app uma vez com internet." })); return; }
  const nomeKit = id => (CONFIG.KITS.find(k => k.id === id) || {}).nome || id;
  raiz.append(el("div", { class: "grade" }, ...dados.itens.map(it => el("article", { class: "cartao" },
    el("h3", { texto: it.nome }),
    el("p", { texto: nomeKit(it.kit) + " · código " + it.kit_set + " · " + it.tipo }),
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
  const h = location.hash.replace(/^#/, "") || "/";
  const raiz = $("#conteudo"); raiz.replaceChildren();
  const p = h.split("/");
  document.querySelectorAll("nav a").forEach(a => a.removeAttribute("aria-current"));
  if (p[1] === "lab") { $("#nav-lab").setAttribute("aria-current", "page"); telaLab(raiz); }
  else if (p[1] === "ref") { $("#nav-lab").setAttribute("aria-current", "page"); await telaRefs(raiz); }
  else if (p[1] === "kit") { $("#nav-kits").setAttribute("aria-current", "page"); await telaCatalogo(raiz, p[2]); }
  else { $("#nav-kits").setAttribute("aria-current", "page"); telaKits(raiz); }
  window.scrollTo(0, 0);
}

/* ---------- offline e atualização ---------- */
function rede() { $("#rodape-rede").textContent = navigator.onLine ? "online" : "sem internet"; }
function iniciarSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
    const avisar = w => { $("#aviso-atualizacao").hidden = false;
      $("#btn-atualizar").onclick = () => w.postMessage("PULAR_ESPERA"); };
    if (reg.waiting && navigator.serviceWorker.controller) avisar(reg.waiting);
    reg.addEventListener("updatefound", () => { const n = reg.installing;
      n.addEventListener("statechange", () => { if (n.state === "installed" && navigator.serviceWorker.controller) avisar(n); }); });
    const verificar = () => reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (!document.hidden) verificar(); });
    setInterval(verificar, 30 * 60 * 1000);
  }).catch(() => {});
  let recarregou = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!recarregou) { recarregou = true; location.reload(); } });
}

document.title = CONFIG.NOME_APP;
$("#titulo-app").textContent = CONFIG.NOME_APP;
$("#rodape-versao").textContent = "Versão " + CONFIG.VERSAO + " · rascunho";
rede(); addEventListener("online", rede); addEventListener("offline", rede);
addEventListener("hashchange", rotear); rotear(); iniciarSW();
