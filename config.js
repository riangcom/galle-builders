// ÚNICO lugar de configuração do app (usado pela página e pelo service worker).
// REGRA: aumentar VERSAO a cada mudança em qualquer arquivo do app (lição do projeto antigo:
// sem isso o aparelho fica preso na cópia velha).
var CONFIG = {
  NOME_APP: "Galle Builders",
  VERSAO: "0.1.8-onda1a",
  // Rótulos das funções das peças (valores de "funcao" nos JSON). Valor desconhecido: ver rotuloFuncao().
  FUNCOES: {
    viga: "Viga", eixo: "Eixo", pino: "Pino", conector: "Conector", engrenagem: "Engrenagem", roda: "Roda",
    mecanismo: "Mecanismo", correia: "Correia", ferramenta: "Ferramenta", placa: "Placa", tijolo: "Tijolo",
    painel: "Painel", pecas_especiais: "Peças especiais", telha: "Telha", peca_impressa: "Peça impressa", motor: "Motor", sensor: "Sensor", cabo: "Cabo",
    matriz_luz: "Matriz de luz", hub_bateria: "Hub e bateria", outro: "Outro"
  },
  KITS: [
    { id: "ev3", arquivo: "ev3_45544.json", nome: "LEGO MINDSTORMS EV3", set: "45544", faixa: "6º ao 9º ano", aviso: null },
    { id: "prime", arquivo: "spike_prime_45678.json", nome: "SPIKE Prime", set: "45678", faixa: "6º ao 9º ano", aviso: null },
    { id: "essential", arquivo: "spike_essential_45345.json", nome: "SPIKE Essential", set: "45345", faixa: "somente 1º ao 5º ano", aviso: "Atenção: o SPIKE Essential é só para o 1º ao 5º ano. Do 6º ao 9º use EV3 ou SPIKE Prime." }
  ]
};
CONFIG.rotuloFuncao = function (v) {
  if (v == null || v === "") return "Outro";
  if (Object.prototype.hasOwnProperty.call(CONFIG.FUNCOES, v)) return CONFIG.FUNCOES[v];
  var t = String(v).replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
if (typeof self !== "undefined") self.CONFIG = CONFIG;
