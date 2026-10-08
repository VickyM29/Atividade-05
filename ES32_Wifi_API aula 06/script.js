 // =====================================================
    // 1. CONFIGURAÇÕES & CHAVE API
    // =====================================================
    const OPENWEATHER_API_KEY = "SUA API AQUI"; // Substitua pela sua chave de API do OpenWeatherMap
    const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt";

    const TOPIC_TEMPERATURA = "esp32/clima/temperatura";
    const TOPIC_UMIDADE = "esp32/clima/umidade";
    const TOPIC_CIDADE_ATUAL = "esp32/clima/cidadeAtual";
    const TOPIC_CIDADE = "esp32/clima/cidade";

    // =====================================================
    // 2. TEMA CLARO/ESCURO  + ATUALIZAÇÃO DO GRÁFICO
    // =====================================================
    const btnTema = document.getElementById("btnTema");

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-theme");
    }

    btnTema.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      atualizarCoresGrafico();
    });

    // =====================================================
    // 3. CONEXÃO MQTT E STATUS
    // =====================================================
    const mqttStatusEl = document.getElementById("mqttStatus");
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("✅ Conectado ao MQTT");
      mqttStatusEl.textContent = "Conectado";
      mqttStatusEl.className = "status-online";

      client.subscribe(TOPIC_TEMPERATURA);
      client.subscribe(TOPIC_UMIDADE);
    });

    client.on("error", (erro) => {
      console.error("❌ Erro MQTT:", erro);
      mqttStatusEl.textContent = "Erro de Conexão";
      mqttStatusEl.className = "status-offline";
    });

    // =====================================================
    // 4. CONFIGURAÇÃO DO CHART.JS COM CORES DINÂMICAS
    // =====================================================
    const ctx = document.getElementById("chart").getContext("2d");
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Temperatura (°C)",
            data: [],
            borderColor: "#ff5252",
            backgroundColor: "rgba(255, 82, 82, 0.2)",
            fill: true,
            tension: 0.3
          },
          {
            label: "Umidade (%)",
            data: [],
            borderColor: "#448aff",
            backgroundColor: "rgba(68, 138, 255, 0.2)",
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 10
          }
        },
        plugins: {
          legend: { labels: { color: "#ffffff" } }
        },
        scales: {
          x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
          y: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255, 255, 255, 0.1)" } }
        }
      }
    });

    function atualizarCoresGrafico() {
      const isLight = document.body.classList.contains("light-theme");
      const textColor = isLight ? "#1a202c" : "#ffffff";
      const gridColor = isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";

      chart.options.plugins.legend.labels.color = textColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    }

    atualizarCoresGrafico();

    // =====================================================
    // 5. RECEBER MENSAGENS MQTT
    // =====================================================
    client.on("message", (topic, message) => {
      const txt = message.toString();
      const hora = new Date().toLocaleTimeString();

      if (topic === TOPIC_TEMPERATURA) {
        const valor = parseFloat(txt);
        if (!isNaN(valor)) {
          document.getElementById("temp").textContent = `${valor} °C`;
          chart.data.labels.push(hora);
          chart.data.datasets[0].data.push(valor);
        }
      }

      if (topic === TOPIC_UMIDADE) {
        const valor = parseFloat(txt);
        if (!isNaN(valor)) {
          document.getElementById("hum").textContent = `${valor} %`;
          chart.data.datasets[1].data.push(valor);
        }
      }

      // Limite do gráfico
      while (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(d => d.data.shift());
      }
      chart.update();
    });

    // =====================================================
    // 6. CONSULTA OPENWEATHERMAP
    // =====================================================
    async function buscarClima(cidade, pais) {
      if (!navigator.onLine) {
        mostrarMensagem("❌ Sem conexão com a Internet.", "#ffab91");
        return;
      }

      try {
        mostrarMensagem("⏳ Consultando dados meteorológicos...", "#81d4fa");

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)},${encodeURIComponent(pais)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
        const resposta = await fetch(url);

        if (!resposta.ok) {
          if (resposta.status === 404) throw new Error("Cidade não encontrada. Verifique o nome.");
          if (resposta.status === 401) throw new Error("Chave de API inválida.");
          throw new Error("Erro ao obter dados meteorológicos.");
        }

        const dados = await resposta.json();

        const temp = dados.main.temp;
        const feels = dados.main.feels_like;
        const hum = dados.main.humidity;
        const pressure = dados.main.pressure;
        const tempMin = dados.main.temp_min;
        const tempMax = dados.main.temp_max;
        const wind = (dados.wind.speed * 3.6).toFixed(1);
        const condicaoChuva = dados.weather.find((condicao) => [2, 3, 5].includes(Math.floor(condicao.id / 100)));
        const intensidadeChuva = condicaoChuva
          ? ({
              200: "Leve",
              201: "Moderada",
              202: "Forte",
              210: "Leve",
              211: "Moderada",
              212: "Forte",
              221: "Moderada",
              230: "Leve",
              231: "Moderada",
              232: "Forte",
              500: "Leve",
              501: "Moderada",
              502: "Forte",
              503: "Muito forte",
              504: "Muito forte",
              511: "Forte",
              520: "Leve",
              521: "Moderada",
              522: "Forte",
              531: "Moderada"
            })[condicaoChuva.id] ?? "Chovendo"
          : "Céu limpo";
        const nomeCidade = dados.name;

        // Atualizar interface
        document.getElementById("temp").textContent = `${temp} °C`;
        document.getElementById("feels").textContent = `${feels} °C`;
        document.getElementById("hum").textContent = `${hum} %`;
        document.getElementById("wind").textContent = `${wind} km/h`;
        document.getElementById("pressure").textContent = `${pressure} hPa`;
        document.getElementById("tempMin").textContent = `${tempMin} °C`;
        document.getElementById("tempMax").textContent = `${tempMax} °C`;
        document.getElementById("rainStatus").textContent = intensidadeChuva;
        document.getElementById("cidadeAtual").textContent = `${nomeCidade}, ${pais}`;

        const agora = new Date();
        document.getElementById("lastUpdate").textContent = agora.toLocaleDateString() + " " + agora.toLocaleTimeString();

        const horaStr = agora.toLocaleTimeString();
        chart.data.labels.push(horaStr);
        chart.data.datasets[0].data.push(temp);
        chart.data.datasets[1].data.push(hum);
        chart.update();

        if (client.connected) {
          client.publish(TOPIC_TEMPERATURA, temp.toString());
          client.publish(TOPIC_UMIDADE, hum.toString());
          client.publish(TOPIC_CIDADE_ATUAL, `${nomeCidade}, ${pais}`);
        }

        gerarAlertaClimatico(temp, hum);
        adicionarAoHistorico(nomeCidade, temp, hum);

        mostrarMensagem(`✅ Clima atualizado com sucesso!`, "#a5d6a7");

      } catch (erro) {
        mostrarMensagem(`❌ ${erro.message}`, "#ffab91");
      }
    }

    // =====================================================
    // 7. RECURSOS ADICIONAIS (HISTÓRICO, FAVORITOS, ALERTAS)
    // =====================================================

    function mostrarMensagem(texto, cor) {
      const el = document.getElementById("mensagem");
      el.textContent = texto;
      el.style.color = cor;
    }

    function gerarAlertaClimatico(temp, hum) {
      const alertBox = document.getElementById("alertaClimatico");
      alertBox.style.display = "block";

      if (temp > 32) {
        alertBox.textContent = "⚠️ ALERTA: Temperatura elevada! Mantenha-se hidratado.";
        alertBox.style.background = "rgba(255, 87, 34, 0.8)";
        alertBox.style.color = "#fff";
      } else if (temp < 12) {
        alertBox.textContent = "❄️ ALERTA: Frio intenso! Lembre-se de se agasalhar.";
        alertBox.style.background = "rgba(33, 150, 243, 0.8)";
        alertBox.style.color = "#fff";
      } else if (hum < 30) {
        alertBox.textContent = "🌵 ALERTA: Umidade relativa do ar baixa! Evite exercícios ao ar livre.";
        alertBox.style.background = "rgba(255, 193, 7, 0.8)";
        alertBox.style.color = "#000";
      } else {
        alertBox.style.display = "none";
      }
    }

    function adicionarAoHistorico(cidade, temp, hum) {
      const lista = document.getElementById("historicoLista");
      const li = document.createElement("li");
      li.className = "history-item";
      li.textContent = `${cidade}: ${temp}°C | ${hum}%`;
      li.onclick = () => {
        document.getElementById("cidade").value = cidade;
        buscarClima(cidade, document.getElementById("pais").value);
      };
      lista.prepend(li);
    }

    const btnSaveFav = document.getElementById("btnSaveFav");
    const btnLoadFav = document.getElementById("btnLoadFav");
    const favCityText = document.getElementById("favCityText");

    function carregarFavoritoDisplay() {
      const fav = localStorage.getItem("fav_city");
      if (fav) {
        favCityText.textContent = `Favorita: ${fav}`;
      }
    }

    btnSaveFav.addEventListener("click", () => {
      const atual = document.getElementById("cidadeAtual").textContent;
      if (atual && atual !== "—") {
        localStorage.setItem("fav_city", atual);
        carregarFavoritoDisplay();
        alert("Cidade favorita salva!");
      } else {
        alert("Realize uma consulta primeiro!");
      }
    });

    btnLoadFav.addEventListener("click", () => {
      const fav = localStorage.getItem("fav_city");
      if (fav) {
        const partes = fav.split(",");
        const cidade = partes[0].trim();
        const pais = partes[1] ? partes[1].trim() : "BR";
        document.getElementById("cidade").value = cidade;
        buscarClima(cidade, pais);
      } else {
        alert("Nenhuma cidade favorita cadastrada!");
      }
    });

    // =====================================================
    // 8. EVENTOS DE BUSCA & INICIALIZAÇÃO
    // =====================================================
    document.getElementById("aplicar").addEventListener("click", () => {
      const cidade = document.getElementById("cidade").value.trim();
      const pais = document.getElementById("pais").value;

      if (!cidade) {
        mostrarMensagem("⚠️ Por favor, informe o nome de uma cidade.", "#ffe082");
        return;
      }

      if (client.connected) {
        client.publish(TOPIC_CIDADE, `${cidade},${pais}`);
      }

      buscarClima(cidade, pais);
    });

    document.getElementById("cidade").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("aplicar").click();
      }
    });

    carregarFavoritoDisplay();