# 🌦️ Clima em Tempo Real

Dashboard web para consulta e monitoramento de informações meteorológicas em tempo real.

O projeto utiliza a **OpenWeatherMap API** para obter os dados climáticos e **MQTT** para comunicação e atualização das informações, com suporte a gráficos, histórico, cidade favorita, alertas e temas claro/escuro.

---

## 📋 Sobre o projeto

O sistema permite consultar o clima de diferentes cidades informando o nome da cidade e o código do país. Após a consulta, são exibidas informações como:

* 🌡️ Temperatura atual
* 🌡️ Sensação térmica
* 💧 Umidade relativa do ar
* 💨 Velocidade do vento
* ⏲️ Pressão atmosférica
* 📉 Temperatura mínima
* 📈 Temperatura máxima
* 🌧️ Condição/intensidade de chuva
* 🕒 Data e hora da última atualização

Os dados também podem ser visualizados em um gráfico de variação de **temperatura e umidade**, que mantém os últimos **20 pontos registrados**.

---

## ✨ Funcionalidades

### ☁️ Consulta meteorológica

O usuário pode informar uma cidade e selecionar o país para consultar os dados meteorológicos.

A interface possui suporte para códigos de país como:

* `BR`
* `US`
* `PT`
* `ES`
* `AR`

A consulta utiliza a API do **OpenWeatherMap** com unidades métricas e idioma português.

---

### 📊 Gráfico em tempo real

O projeto utiliza **Chart.js** para apresentar as variações de temperatura e umidade.

O gráfico possui dois conjuntos de dados:

* 🌡️ Temperatura em °C
* 💧 Umidade em %

Além disso, as cores do gráfico são adaptadas automaticamente conforme o tema escolhido.

---

### 📡 Comunicação MQTT

A aplicação utiliza MQTT através do broker:

```text
ws://broker.hivemq.com:8000/mqtt
```

São utilizados os seguintes tópicos:

```text
esp32/clima/temperatura
esp32/clima/umidade
esp32/clima/cidadeAtual
esp32/clima/cidade
```

O status da conexão MQTT também é apresentado na interface.

---

### ⭐ Cidade favorita

É possível salvar a cidade atualmente consultada como favorita utilizando `localStorage`.

Depois, a cidade pode ser carregada novamente através do botão **Consultar Favorita**.

---

### 🕒 Histórico

Cada consulta realizada é adicionada ao histórico da interface.

Um item do histórico pode ser selecionado para realizar novamente a consulta daquela cidade.

---

### ⚠️ Alertas climáticos

O sistema gera alertas quando determinadas condições são identificadas:

* 🌡️ Temperatura acima de **32 °C**
* ❄️ Temperatura abaixo de **12 °C**
* 🌵 Umidade abaixo de **30%**

---

### 🌓 Tema claro e escuro

A interface possui alternância entre **tema claro e tema escuro**.

A preferência do usuário é armazenada no `localStorage`, permitindo manter o tema escolhido entre acessos.

O CSS possui regras específicas para os dois temas.

---

### 📱 Interface responsiva

O layout foi desenvolvido para se adaptar a diferentes tamanhos de tela, incluindo dispositivos móveis.

O CSS utiliza *media queries* para reorganizar:

* Campos de busca
* Métricas
* Cards
* Rodapé
* Elementos da interface

---

## 🛠️ Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript
* OpenWeatherMap API
* MQTT
* HiveMQ
* Chart.js
* ESP32
* LocalStorage

As bibliotecas **MQTT** e **Chart.js** são carregadas diretamente no HTML por CDN.

---

## 📁 Estrutura do projeto

```text
/
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`

Responsável pela estrutura da aplicação e pelos elementos da interface, incluindo:

* Consulta de cidades
* Informações meteorológicas
* Histórico
* Cidade favorita
* Gráfico

### `style.css`

Contém toda a estilização da aplicação, incluindo:

* Temas claro e escuro
* Cards
* Responsividade
* Botões
* Métricas
* Gráfico
* Histórico
* Cabeçalho
* Rodapé

### `script.js`

Implementa a lógica da aplicação, incluindo:

* Conexão MQTT
* Consulta à OpenWeatherMap
* Atualização dos dados
* Gráfico
* Alertas
* Histórico
* Cidade favorita
* Alternância de tema

---

## 🚀 Como executar

### 1. Clone ou baixe o projeto

Baixe os arquivos do projeto e mantenha os três arquivos principais no mesmo diretório:

```text
index.html
style.css
script.js
```

---

### 2. Configure a chave da OpenWeatherMap

No arquivo `script.js`, configure sua chave da API:

```javascript
const OPENWEATHER_API_KEY = "SUA_CHAVE_AQUI";
```

> ⚠️ **Importante:** não compartilhe uma chave de API real publicamente. Em projetos publicados, utilize uma estratégia segura para armazenar credenciais.

---

### 3. Execute o projeto

Como o projeto é composto por arquivos HTML, CSS e JavaScript, ele pode ser executado através de um servidor web local.

Por exemplo, utilizando Python:

```bash
python -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

---

### 4. Consulte uma cidade

1. Digite o nome da cidade.
2. Selecione o código do país.
3. Clique em **Aplicar cidade**.
4. Aguarde a consulta meteorológica.

Os dados serão exibidos no painel e também poderão ser enviados através do MQTT.

---

## 🔌 Integração com ESP32

O projeto foi preparado para integração com um dispositivo **ESP32** através do protocolo MQTT.

### Tópicos principais

```text
esp32/clima/temperatura
esp32/clima/umidade
esp32/clima/cidadeAtual
esp32/clima/cidade
```

A aplicação recebe mensagens de temperatura e umidade e atualiza os valores apresentados no dashboard e no gráfico.

Quando uma consulta meteorológica é realizada, os valores de temperatura e umidade também podem ser publicados no broker MQTT.

---

## 🌐 API utilizada

O projeto utiliza a **OpenWeatherMap** para obter os dados meteorológicos.

A consulta retorna informações utilizadas pelo dashboard, incluindo:

* 🌡️ Temperatura
* 🌡️ Sensação térmica
* 💧 Umidade
* ⏲️ Pressão
* 📉 Temperatura mínima
* 📈 Temperatura máxima
* 💨 Velocidade do vento
* 🌧️ Condições meteorológicas

---

## ⚠️ Tratamento de erros

O sistema possui tratamento para situações como:

* ❌ Ausência de conexão com a Internet
* ❌ Cidade não encontrada
* ❌ Chave de API inválida
* ❌ Erros gerais na consulta meteorológica
* ❌ Falha na conexão MQTT

---

## 🎨 Interface

A interface utiliza:

* Cards com efeito de transparência e desfoque
* Gradientes
* Layout responsivo
* Tema claro
* Tema escuro
* Gráficos interativos

O cabeçalho apresenta o nome **Clima em Tempo Real** e o botão para alternar entre os modos claro e escuro.

---

## 📌 Possíveis melhorias futuras

Algumas funcionalidades que podem ser adicionadas posteriormente:

* 🌤️ Previsão para os próximos dias
* 📍 Geolocalização automática
* 🌎 Mais países no seletor
* 💾 Persistência do histórico
* 📤 Exportação dos dados meteorológicos
* 🔐 Autenticação de usuários
* 📡 Dashboard para múltiplos dispositivos ESP32
* 🔒 Uso de MQTT sobre conexão segura (`wss://`)
* 🗄️ Armazenamento dos dados em banco de dados
* 🔔 Notificações de alertas climáticos

---

## 👨‍💻 Projeto

### Clima em Tempo Real

Projeto desenvolvido como uma aplicação web para **monitoramento meteorológico** e **integração com IoT através de MQTT e ESP32**.
