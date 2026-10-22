const API_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const API_PREVISAO = "https://api.open-meteo.com/v1/forecast";
const API_RIOS = "https://flood-api.open-meteo.com/v1/flood";

let graficoChuva = null;
let graficoTemperatura = null;
let cidadeMonitorada = null;
let dadosUltimaConsulta = null; // Guarda os últimos dados para atualizar os gráficos ao trocar de tema

const $ = (id) => document.getElementById(id);

function mostrarMensagem(texto) {
  const elemento = $("mensagem");
  if (elemento) elemento.textContent = texto;
}

function atualizarTexto(id, texto) {
  const elemento = $(id);
  if (elemento) elemento.textContent = texto;
}

function formatarNumero(valor, casas = 1) {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
    return "Sem dados";
  }

  return Number(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: casas,
    minimumFractionDigits: casas
  });
}

function formatarDataHora(data) {
  if (!data) return "Sem dados";

  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}

async function buscarJSON(url) {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar a API (HTTP ${resposta.status}).`);
  }

  return resposta.json();
}

// =====================================================
// 1. TEMA CLARO E ESCURO (COM ATUALIZAÇÃO DOS GRÁFICOS)
// =====================================================

const btnTema = $("btnTema");

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-theme");
}

if (btnTema) {
  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const temaClaro = document.body.classList.contains("light-theme");
    localStorage.setItem("theme", temaClaro ? "light" : "dark");

    // Redesenha os gráficos com as cores do novo tema se houver dados carregados
    if (dadosUltimaConsulta) {
      atualizarGraficoChuva(dadosUltimaConsulta);
      atualizarGraficoTemperatura(dadosUltimaConsulta);
    }
  });
}

// =====================================================
// 2. LOCALIZAR CIDADE
// =====================================================

async function localizarCidade(nome, pais) {
  const parametros = new URLSearchParams({
    name: nome,
    count: "10",
    language: "pt",
    format: "json"
  });

  const dados = await buscarJSON(`${API_GEOCODING}?${parametros}`);

  if (!dados.results || dados.results.length === 0) {
    throw new Error("Cidade não encontrada. Confira o nome.");
  }

  const resultado = dados.results.find(
    item => item.country_code?.toUpperCase() === pais.toUpperCase()
  );

  if (!resultado) {
    throw new Error("Não encontrei essa cidade no país selecionado.");
  }

  return resultado;
}

// =====================================================
// 3. CONSULTAR PREVISÃO DO TEMPO E DA CHUVA
// =====================================================

async function consultarPrevisao(cidade) {
  const parametros = new URLSearchParams({
    latitude: String(cidade.latitude),
    longitude: String(cidade.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "showers",
      "wind_speed_10m",
      "pressure_msl"
    ].join(","),
    hourly: [
      "precipitation",
      "precipitation_probability",
      "temperature_2m",
      "soil_moisture_0_to_7cm"
    ].join(","),
    daily: [
      "precipitation_sum",
      "precipitation_probability_max",
      "temperature_2m_max",
      "temperature_2m_min"
    ].join(","),
    forecast_days: "3",
    timezone: "auto"
  });

  return buscarJSON(`${API_PREVISAO}?${parametros}`);
}

// =====================================================
// 4. CONSULTAR PREVISÃO DE VAZÃO DO RIO
// =====================================================

async function consultarDadosRio(cidade) {
  const parametros = new URLSearchParams({
    latitude: String(cidade.latitude),
    longitude: String(cidade.longitude),
    daily: [
      "river_discharge",
      "river_discharge_mean",
      "river_discharge_max",
      "river_discharge_min"
    ].join(","),
    forecast_days: "3",
    past_days: "1"
  });

  try {
    const dados = await buscarJSON(`${API_RIOS}?${parametros}`);
    atualizarDadosRio(dados);
  } catch (erro) {
    console.warn("Não foi possível consultar a vazão:", erro);
    atualizarDadosRio(null);
  }
}

function atualizarDadosRio(dados) {
  atualizarTexto("estacaoRio", "Modelo de previsão regional");
  atualizarTexto("nivelRio", "Sem dados de nível medido");

  if (!dados?.daily?.time) {
    atualizarTexto("vazaoRio", "Sem dados de vazão");
    atualizarTexto("dataRio", "Data indisponível");
    atualizarTexto(
      "alertaRio",
      "Não foi possível obter a previsão de vazão para esta localização. Consulte os órgãos oficiais."
    );
    return;
  }

  const diario = dados.daily;
  const indice = diario.time.findIndex(
    data => data >= new Date().toISOString().slice(0, 10)
  );
  const i = indice >= 0 ? indice : 0;

  const vazao = diario.river_discharge?.[i];
  const maxima = diario.river_discharge_max?.[i];

  atualizarTexto(
    "vazaoRio",
    vazao == null ? "Sem dados de vazão" : `${formatarNumero(vazao)} m³/s`
  );

  atualizarTexto("dataRio", diario.time[i] || "Data indisponível");

  if (maxima != null && Number.isFinite(Number(maxima))) {
    atualizarTexto(
      "alertaRio",
      `Previsão de vazão máxima para a data consultada: ${formatarNumero(maxima)} m³/s. Este valor é uma estimativa do modelo, não uma medição de estação nem um alerta oficial de enchente.`
    );
  } else {
    atualizarTexto(
      "alertaRio",
      "A API não forneceu uma vazão máxima para a data consultada. Isso não significa ausência de risco."
    );
  }
}

// =====================================================
// 5. GRÁFICO DE CHUVA (CORES CORRIGIDAS CONFORME O TEMA)
// =====================================================

function atualizarGraficoChuva(dados) {
  const canvas = $("graficoChuva");

  if (!canvas || typeof Chart === "undefined") {
    console.error("Canvas ou Chart.js não encontrado.");
    return;
  }

  if (!dados?.hourly?.time || !dados?.hourly?.precipitation) {
    console.error("Dados de chuva indisponíveis.");
    return;
  }

  const horas = dados.hourly.time.slice(0, 24);
  const chuvas = dados.hourly.precipitation.slice(0, 24);
  const labels = horas.map(hora => hora.substring(11, 16));

  const graficoExistente = Chart.getChart(canvas);
  if (graficoExistente) {
    graficoExistente.destroy();
  }

  const isTemaClaro = document.body.classList.contains("light-theme");
  const corTexto = isTemaClaro ? "#0f172a" : "#f0f4f8";
  const corGrelha = isTemaClaro ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";

  graficoChuva = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Precipitação prevista (mm)",
        data: chuvas,
        backgroundColor: "#2563eb",
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: corTexto
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: corTexto
          },
          grid: {
            color: corGrelha
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Milímetros (mm)",
            color: corTexto
          },
          ticks: {
            color: corTexto
          },
          grid: {
            color: corGrelha
          }
        }
      }
    }
  });
}

// =====================================================
// 6. GRÁFICO DE TEMPERATURA (CORES CORRIGIDAS CONFORME O TEMA)
// =====================================================

function atualizarGraficoTemperatura(dados) {
  const canvas = $("graficoTemperatura");

  if (!canvas || typeof Chart === "undefined") {
    console.error("Canvas ou Chart.js não encontrado.");
    return;
  }

  if (!dados?.hourly?.time || !dados?.hourly?.temperature_2m) {
    console.error("Dados de temperatura indisponíveis.");
    return;
  }

  const horas = dados.hourly.time.slice(0, 24);
  const temperaturas = dados.hourly.temperature_2m.slice(0, 24);
  const labels = horas.map(hora => hora.substring(11, 16));

  const graficoExistente = Chart.getChart(canvas);
  if (graficoExistente) {
    graficoExistente.destroy();
  }

  const isTemaClaro = document.body.classList.contains("light-theme");
  const corTexto = isTemaClaro ? "#0f172a" : "#f0f4f8";
  const corGrelha = isTemaClaro ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";

  graficoTemperatura = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperatura prevista (°C)",
        data: temperaturas,
        borderColor: "#0284c7",
        backgroundColor: "rgba(2, 132, 199, 0.12)",
        fill: true,
        tension: 0.2,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: corTexto
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: corTexto
          },
          grid: {
            color: corGrelha
          }
        },
        y: {
          title: {
            display: true,
            text: "Graus Celsius (°C)",
            color: corTexto
          },
          ticks: {
            color: corTexto
          },
          grid: {
            color: corGrelha
          }
        }
      }
    }
  });
}

// =====================================================
// 7. INDICADORES METEOROLÓGICOS
// =====================================================

function atualizarIndicadores(dados) {
  dadosUltimaConsulta = dados; // Salva a referência global

  const atual = dados.current;
  const horario = dados.hourly;
  const diario = dados.daily;

  const chuva24 = horario.precipitation
    .slice(0, 24)
    .reduce((total, valor) => total + (Number(valor) || 0), 0);

  atualizarTexto("chuvaAtual", `${formatarNumero(atual.precipitation)} mm`);
  atualizarTexto("chuvaHoje", `${formatarNumero(diario.precipitation_sum[0])} mm`);
  atualizarTexto(
    "probChuva",
    `${formatarNumero(horario.precipitation_probability[0], 0)}%`
  );
  atualizarTexto("chuva24h", `${formatarNumero(chuva24)} mm`);

  const solo = horario.soil_moisture_0_to_7cm?.[0];
  atualizarTexto(
    "umidadeSolo",
    solo == null ? "Sem dados" : `${formatarNumero(solo, 3)} m³/m³`
  );

  atualizarTexto("umidadeAr", `${formatarNumero(atual.relative_humidity_2m, 0)}%`);
  atualizarTexto("temperatura", `${formatarNumero(atual.temperature_2m)} °C`);
  atualizarTexto("vento", `${formatarNumero(atual.wind_speed_10m)} km/h`);
  atualizarTexto("apiStatus", "Consulta concluída");
  atualizarTexto("lastUpdate", formatarDataHora(atual.time));

  atualizarGraficoChuva(dados);
  atualizarGraficoTemperatura(dados);
  atualizarPrevisaoDiaria(dados);
}

// =====================================================
// 8. PREVISÃO PARA OS PRÓXIMOS DIAS
// =====================================================

function atualizarPrevisaoDiaria(dados) {
  const container = $("previsaoDiaria");
  if (!container) return;

  container.replaceChildren();

  dados.daily.time.forEach((data, i) => {
    const cartao = document.createElement("article");
    cartao.className = "day-card";

    const titulo = document.createElement("h3");
    titulo.textContent = formatarData(data);

    const minima = document.createElement("p");
    minima.textContent =
      `Mínima: ${formatarNumero(dados.daily.temperature_2m_min[i])} °C`;

    const maxima = document.createElement("p");
    maxima.textContent =
      `Máxima: ${formatarNumero(dados.daily.temperature_2m_max[i])} °C`;

    const chuva = document.createElement("p");
    chuva.textContent =
      `Precipitação prevista: ${formatarNumero(dados.daily.precipitation_sum[i])} mm`;

    const probabilidade = document.createElement("p");
    probabilidade.textContent =
      `Probabilidade máxima: ${formatarNumero(dados.daily.precipitation_probability_max[i], 0)}%`;

    cartao.append(titulo, minima, maxima, chuva, probabilidade);
    container.appendChild(cartao);
  });
}

// =====================================================
// 9. HISTÓRICO DE CONSULTAS
// =====================================================

function carregarHistorico() {
  const lista = $("historicoLista");
  if (!lista) return;

  let historico = [];

  try {
    historico = JSON.parse(localStorage.getItem("historicoAgua") || "[]");
  } catch {
    historico = [];
  }

  lista.replaceChildren();

  if (historico.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhuma consulta registrada.";
    lista.appendChild(item);
    return;
  }

  historico.forEach(registro => {
    const item = document.createElement("li");
    item.textContent = `${registro.cidade} — ${registro.data}`;
    lista.appendChild(item);
  });
}

function salvarNoHistorico(cidade) {
  let historico = [];

  try {
    historico = JSON.parse(localStorage.getItem("historicoAgua") || "[]");
  } catch {
    historico = [];
  }

  historico.unshift({
    cidade,
    data: new Date().toLocaleString("pt-BR")
  });

  localStorage.setItem("historicoAgua", JSON.stringify(historico.slice(0, 10)));
  carregarHistorico();
}

// =====================================================
// 10. CIDADE FAVORITA
// =====================================================

function atualizarFavoritoTexto() {
  const elemento = $("favCityText");
  if (!elemento) return;

  const salvo = localStorage.getItem("cidadeFavorita");

  if (!salvo) {
    elemento.textContent = "Nenhuma localidade salva.";
    return;
  }

  try {
    const favorito = JSON.parse(salvo);
    elemento.textContent = `${favorito.nome}, ${favorito.pais}`;
  } catch {
    elemento.textContent = "Favorito salvo, mas não foi possível ler os dados.";
  }
}

function carregarCidadeFavorita() {
  const salvo = localStorage.getItem("cidadeFavorita");

  if (!salvo) {
    mostrarMensagem("Você ainda não salvou uma cidade favorita.");
    return;
  }

  try {
    const favorito = JSON.parse(salvo);
    if ($("cidade")) $("cidade").value = favorito.nome;
    if ($("pais")) $("pais").value = favorito.pais;
    consultarCidade(favorito.nome, favorito.pais);
  } catch {
    mostrarMensagem("Não foi possível carregar a cidade favorita.");
  }
}

const favCityTextEl = $("favCityText");
const btnSaveFav = $("btnSaveFav");
const btnDeleteFav = $("btnDeleteFav");

if (favCityTextEl) {
  favCityTextEl.addEventListener("click", () => {
    carregarCidadeFavorita();
  });
}

if (btnSaveFav) {
  btnSaveFav.addEventListener("click", () => {
    if (!cidadeMonitorada) {
      mostrarMensagem("Consulte uma cidade antes de salvar.");
      return;
    }

    localStorage.setItem("cidadeFavorita", JSON.stringify(cidadeMonitorada));
    atualizarFavoritoTexto();
    mostrarMensagem("Cidade favorita salva.");
  });
}

if (btnDeleteFav) {
  btnDeleteFav.addEventListener("click", () => {
    const salvo = localStorage.getItem("cidadeFavorita");

    if (!salvo) {
      mostrarMensagem("Nenhuma cidade favorita para excluir.");
      return;
    }

    localStorage.removeItem("cidadeFavorita");
    atualizarFavoritoTexto();
    mostrarMensagem("Cidade favorita removida.");
  });
}

atualizarFavoritoTexto();

// =====================================================
// 11. CONSULTAR CIDADE
// =====================================================

async function consultarCidade(nome, pais) {
  const botao = $("aplicar");
  if (botao) botao.disabled = true;

  atualizarTexto("apiStatus", "Consultando...");
  mostrarMensagem("Buscando cidade e dados meteorológicos...");

  try {
    const cidade = await localizarCidade(nome, pais);

    const dados = await consultarPrevisao(cidade);

    cidadeMonitorada = {
      nome: cidade.name,
      pais: cidade.country_code,
      latitude: cidade.latitude,
      longitude: cidade.longitude
    };

    atualizarTexto("cidadeAtual", `${cidade.name}, ${cidade.country}`);
    atualizarIndicadores(dados);

    await consultarDadosRio(cidadeMonitorada);

    mostrarMensagem("Dados meteorológicos carregados com sucesso.");
    salvarNoHistorico(`${cidade.name}, ${cidade.country}`);
    atualizarFavoritoTexto();
  } catch (erro) {
    console.error(erro);
    atualizarTexto("apiStatus", "Falha na consulta");
    mostrarMensagem(
      erro.message || "Não foi possível consultar os dados. Tente novamente."
    );
  } finally {
    if (botao) botao.disabled = false;
  }
}

// =====================================================
// 12. EVENTOS DA PÁGINA
// =====================================================

const formBusca = $("formBusca");

if (formBusca) {
  formBusca.addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = $("cidade").value.trim();
    const pais = $("pais").value;

    if (!nome) {
      mostrarMensagem("Informe o nome de uma cidade.");
      return;
    }

    consultarCidade(nome, pais);
  });
}

const btnLimparHistorico = $("limparHistorico");

if (btnLimparHistorico) {
  btnLimparHistorico.addEventListener("click", () => {
    localStorage.removeItem("historicoAgua");
    carregarHistorico();
    mostrarMensagem("Histórico apagado.");
  });
}

// =====================================================
// 13. INICIALIZAÇÃO
// =====================================================

carregarHistorico();
atualizarFavoritoTexto();
atualizarTexto("apiStatus", "Aguardando consulta");
atualizarTexto("nivelRio", "Sem dados de nível medido");
atualizarTexto("vazaoRio", "Aguardando consulta");
atualizarTexto("estacaoRio", "Nenhuma estação identificada");
atualizarTexto("dataRio", "Sem dados");