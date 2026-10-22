# 💧 Sistema de Monitoramento Hídrico

Dashboard web para consulta e monitoramento de informações meteorológicas e hidrológicas, com foco na precipitação, nas condições do solo, na previsão do tempo e na estimativa de vazão dos rios.

O projeto utiliza as APIs gratuitas da **Open-Meteo** para consultar dados meteorológicos e previsões hidrológicas, apresentando as informações em uma interface com gráficos, indicadores, alertas informativos, histórico de consultas, cidade favorita e temas claro e escuro.

---

## 📋 Sobre o projeto

O Sistema de Monitoramento Hídrico permite consultar diferentes cidades e visualizar informações relacionadas às condições climáticas e à previsão de precipitação.

A aplicação também consulta dados de previsão de vazão dos rios, quando disponíveis para a localização selecionada. O sistema diferencia as estimativas dos modelos meteorológicos e hidrológicos das medições realizadas por estações oficiais.

Após consultar uma cidade, são exibidas informações como:

- 🌧️ Chuva atual
- 💧 Acumulado de precipitação previsto para o dia
- 📊 Probabilidade de chuva
- 🕒 Projeção de precipitação para as próximas 24 horas
- 🌱 Umidade do solo
- 💦 Umidade relativa do ar
- 🌡️ Temperatura do ar
- 💨 Velocidade do vento
- 🌊 Estimativa de vazão dos rios, quando disponível
- 🕓 Data e hora da última atualização meteorológica
- ⚠️ Alertas informativos baseados na previsão do tempo

Os dados meteorológicos também são apresentados em gráficos de precipitação e temperatura, facilitando a visualização das variações previstas ao longo das próximas horas.

---

## ✨ Funcionalidades

### 🌦️ Consulta meteorológica

O usuário pode informar o nome de uma cidade e selecionar o país para consultar as informações disponíveis.

A aplicação oferece suporte aos seguintes códigos de país:

- `BR` — Brasil
- `PT` — Portugal
- `AR` — Argentina
- `US` — Estados Unidos
- `ES` — Espanha

A localização é identificada por meio da API de geocodificação da Open-Meteo. Em seguida, a aplicação utiliza as coordenadas encontradas para consultar a previsão meteorológica.

### 📊 Gráfico de precipitação

O sistema utiliza a biblioteca **Chart.js** para apresentar um gráfico de barras com a previsão de precipitação para as próximas 24 horas.

O gráfico apresenta:

- 🌧️ Horários da previsão
- 💧 Quantidade de precipitação prevista em milímetros (mm)
- 📈 Variação da precipitação ao longo do período

### 🌡️ Gráfico de temperatura

A aplicação apresenta um gráfico de linhas com a variação prevista da temperatura do ar nas próximas 24 horas.

O gráfico permite visualizar as mudanças de temperatura ao longo do período consultado, com valores expressos em graus Celsius (°C).

### 🌊 Monitoramento hidrológico

O sistema realiza uma consulta à API de previsão de vazão da Open-Meteo para tentar obter informações hidrológicas relacionadas às coordenadas da cidade selecionada.

Quando os dados estão disponíveis, a interface apresenta a vazão prevista em metros cúbicos por segundo (m³/s).

O painel também apresenta informações sobre a cota do rio, a estação hidrológica e a data da medição. Entretanto, esses campos não são preenchidos como medições oficiais quando não há uma estação fluviométrica identificada e conectada.

**Importante:** a vazão fornecida por um modelo é uma estimativa, não uma medição física realizada em uma estação. A aplicação não inventa valores de nível de rio quando esses dados não estão disponíveis.

O sistema também disponibiliza links para consulta ao Sistema de Alerta de Eventos Críticos (SACE), do Serviço Geológico do Brasil (SGB), e à Agência Nacional de Águas e Saneamento Básico (ANA).

### ⚠️ Alertas meteorológicos

O sistema gera mensagens informativas com base nos dados de previsão meteorológica.

Entre as condições consideradas estão:

- Acumulado de chuva previsto igual ou superior a 10 mm.
- Acumulado de chuva previsto igual ou superior a 30 mm.
- Probabilidade máxima de chuva igual ou superior a 70%.
- Indicação de precipitação nas condições meteorológicas atuais.

Os alertas ajudam o usuário a acompanhar as condições previstas, mas não substituem os comunicados oficiais da Defesa Civil ou dos órgãos responsáveis pelo monitoramento hidrológico.

### 📅 Previsão diária

A aplicação apresenta uma previsão para os dias disponibilizados pela consulta, incluindo:

- Temperatura mínima prevista.
- Temperatura máxima prevista.
- Precipitação acumulada prevista.
- Probabilidade máxima de chuva.

### ⭐ Cidade favorita

O usuário pode salvar a cidade consultada como favorita e carregá-la novamente quando desejar.

A funcionalidade utiliza o `localStorage` do navegador para armazenar as informações da cidade favorita.

### 🕒 Histórico de consultas

As cidades consultadas são registradas no histórico da aplicação.

O histórico armazena até dez registros e pode ser limpo por meio do botão correspondente na interface.

Os dados são armazenados localmente no navegador, utilizando o `localStorage`.

### 🌓 Tema claro e escuro

A interface possui alternância entre tema claro e tema escuro.

A preferência escolhida pelo usuário é armazenada no `localStorage`, permitindo que seja mantida entre acessos no mesmo navegador.

### 📱 Interface responsiva

O projeto utiliza HTML, CSS e JavaScript para apresentar as informações em uma interface organizada por painéis, indicadores e gráficos.

A responsividade depende das regras de estilo definidas no arquivo `style.css`, que organiza os elementos para diferentes tamanhos de tela.

---

## 🛠️ Tecnologias utilizadas

- **HTML5:** estrutura da página.
- **CSS3:** estilização, temas e organização visual.
- **JavaScript:** lógica de consulta, processamento e apresentação dos dados.
- **Open-Meteo Geocoding API:** localização de cidades e obtenção de coordenadas.
- **Open-Meteo Forecast API:** consulta de dados meteorológicos e previsões.
- **Open-Meteo Flood API:** consulta de previsões hidrológicas de vazão.
- **Chart.js:** criação dos gráficos de precipitação e temperatura.
- **Fetch API:** comunicação com os serviços externos.
- **LocalStorage:** armazenamento local do histórico, da cidade favorita e da preferência de tema.

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

- Formulário de consulta de cidades.
- Indicadores meteorológicos.
- Painel de monitoramento hidrológico.
- Alertas meteorológicos.
- Gráficos.
- Previsão diária.
- Histórico de consultas.
- Cidade favorita.
- Botão de alternância de tema.

### `style.css`

Responsável pela aparência da aplicação, incluindo:

- Cores e gradientes.
- Tema claro e tema escuro.
- Cartões e indicadores.
- Botões e formulários.
- Organização dos gráficos.
- Cabeçalho e rodapé.
- Adaptação da interface a diferentes telas.

### `script.js`

Responsável pela lógica da aplicação, incluindo:

- Busca e localização de cidades.
- Consulta às APIs da Open-Meteo.
- Atualização dos indicadores meteorológicos.
- Criação e atualização dos gráficos.
- Consulta à previsão de vazão dos rios.
- Exibição de alertas informativos.
- Geração da previsão diária.
- Gerenciamento do histórico.
- Armazenamento da cidade favorita.
- Alternância entre os temas claro e escuro.
- Tratamento de erros nas consultas.

---

## 🚀 Como executar o projeto

### 1. Baixe ou clone o projeto

Mantenha os arquivos principais no mesmo diretório:

```text
index.html
style.css
script.js
README.md
```

### 2. Confira os links das bibliotecas

No arquivo `index.html`, carregue o Chart.js antes do arquivo `script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
<script src="script.js" defer></script>
```

Os dois arquivos devem ser carregados apenas uma vez.

### 3. Execute a aplicação

Recomenda-se utilizar um servidor web local, como o Live Server do Visual Studio Code.

Outra opção é utilizar o Python, caso esteja instalado:

```bash
python -m http.server 8000
```

Em seguida, acesse o endereço:

```text
http://localhost:8000
```

### 4. Consulte uma cidade

1. Digite o nome da cidade no campo de consulta.
2. Selecione o país correspondente.
3. Clique em **Consultar**.
4. Aguarde o carregamento das informações meteorológicas.
5. Confira os indicadores, os gráficos e a previsão diária.
6. Consulte o painel hidrológico para verificar se há dados de vazão disponíveis.

---

## 🌐 APIs utilizadas

### Open-Meteo Geocoding API

Utilizada para localizar cidades e obter informações como latitude, longitude, nome e país.

```text
https://geocoding-api.open-meteo.com/v1/search
```

### Open-Meteo Forecast API

Utilizada para obter informações meteorológicas atuais, dados horários e previsões diárias.

```text
https://api.open-meteo.com/v1/forecast
```

### Open-Meteo Flood API

Utilizada para consultar previsões hidrológicas, incluindo dados de vazão quando disponíveis para a localização consultada.

```text
https://flood-api.open-meteo.com/v1/flood
```

As informações apresentadas dependem da disponibilidade dos dados fornecidos pelas APIs para cada localização.

---

## ⚠️ Tratamento de erros e limitações

A aplicação possui tratamento para situações como:

- Cidade não encontrada.
- País selecionado incompatível com a cidade localizada.
- Falhas nas consultas às APIs.
- Indisponibilidade de dados hidrológicos.
- Ausência de informações para a criação dos gráficos.
- Falhas na conexão com a Internet.

Algumas limitações devem ser consideradas:

- A previsão meteorológica não equivale a uma medição local realizada por uma estação.
- A disponibilidade de previsão de vazão varia conforme a localização e os dados oferecidos pela API.
- O nível físico do rio não é calculado a partir da vazão estimada.
- A aplicação não identifica automaticamente uma estação fluviométrica oficial para cada cidade.
- Os alertas são informativos e não substituem os alertas oficiais de emergência.

Em situações de risco, recomenda-se consultar a Defesa Civil e os órgãos oficiais responsáveis pelo monitoramento de rios e eventos hidrológicos.

---

## 🎨 Interface

A interface do Sistema de Monitoramento Hídrico é organizada em painéis de consulta, indicadores meteorológicos, monitoramento hidrológico, gráficos e previsão diária.

O usuário pode alternar entre os temas claro e escuro, consultar diferentes localidades, acompanhar as previsões e verificar a disponibilidade de informações de vazão.

O objetivo é reunir informações meteorológicas e hidrológicas em um único ambiente, facilitando a visualização e o acompanhamento das condições previstas.

---

## 👨‍💻 Projeto

### Sistema de Monitoramento Hídrico

Projeto desenvolvido como uma aplicação web para consulta e acompanhamento de informações meteorológicas e previsões hidrológicas, utilizando APIs gratuitas, gráficos interativos e armazenamento local no navegador.

A proposta é facilitar o acesso a dados de precipitação, temperatura, condições do solo e estimativas de vazão, mantendo a distinção entre previsões de modelos e medições oficiais.
