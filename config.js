// ÚNICO lugar de configuração do app (usado pela página e pelo service worker).
// REGRA: aumentar VERSAO a cada mudança em qualquer arquivo do app (lição do projeto antigo:
// sem isso o aparelho fica preso na cópia velha).
var CONFIG = {
  NOME_APP: "Galle Builders",
  VERSAO: "0.2.2-onda3",
  // Rótulos das funções das peças (valores de "funcao" nos JSON). Valor desconhecido: ver rotuloFuncao().
  FUNCOES: {
    viga: "Viga", eixo: "Eixo", pino: "Pino", conector: "Conector", engrenagem: "Engrenagem", roda: "Roda",
    mecanismo: "Mecanismo", correia: "Correia", ferramenta: "Ferramenta", placa: "Placa", tijolo: "Tijolo",
    painel: "Painel", pecas_especiais: "Peças especiais", telha: "Telha", peca_impressa: "Peça impressa", motor: "Motor", sensor: "Sensor", cabo: "Cabo",
    matriz_luz: "Matriz de luz", hub_bateria: "Hub e bateria", outro: "Outro"
  },
  // Kits do catálogo (decisão de 31/10/2026: peças do Essential liberadas para os robôs FIRA; sem aviso de série no catálogo).
  // "padrao": marcado ao abrir a lista de peças pela primeira vez.
  KITS: [
    { set: "45544", nome: "LEGO MINDSTORMS EV3", curto: "EV3", padrao: true },
    { set: "45678", nome: "SPIKE Prime", curto: "Prime", padrao: true },
    { set: "45345", nome: "SPIKE Essential", curto: "Essential", padrao: false }
  ],
  // Lembrete fixo nas telas de provas (regra oficial MI-3.2 e decisão do Rian de 28/10/2026).
  AVISO_EVENTO: "No evento o robô é montado na hora, e os materiais e sensores permitidos só são informados no início. Use o app para treinar."
};
CONFIG.rotuloFuncao = function (v) {
  if (v == null || v === "") return "Outro";
  if (Object.prototype.hasOwnProperty.call(CONFIG.FUNCOES, v)) return CONFIG.FUNCOES[v];
  var t = String(v).replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
if (typeof self !== "undefined") self.CONFIG = CONFIG;
