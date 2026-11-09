
# FRIOVALE | Web Dashboard

<p align="center">
  <strong>Cold Chain Monitoring Dashboard for Fruit Logistics</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61dafb" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue" />
  <img src="https://img.shields.io/badge/Vite-5.4.0-646cff" />
  <img src="https://img.shields.io/badge/PWA-Enabled-5a0fc8" />
</p>

<details open>
<summary><strong>🇺🇸 English version</strong></summary>

## 1. About the project

FrioVale is an IoT-based solution designed to monitor environmental conditions throughout the cold chain used for fruit storage and transportation in the São Francisco Valley, Brazil.

This repository contains the web frontend of the FrioVale platform.

The application is designed to provide users with an interface for monitoring environmental information, accessing telemetry data and supporting logistics decisions related to fruit preservation.

## 2. Objectives

- Provide a web interface for the FrioVale platform.
- Present environmental monitoring information.
- Support access to backend services.
- Display temperature and humidity information.
- Support the monitoring of device availability.
- Provide a foundation for historical data visualization.
- Support responsive access through desktop and mobile browsers.
- Provide Progressive Web App capabilities.

## 3. Technologies

| Technology | Purpose |
|---|---|
| React 18 | User interface development |
| TypeScript | Static typing |
| Vite | Development server and build tool |
| React Router DOM | Application navigation |
| Lucide React | Interface icons |
| vite-plugin-pwa | Progressive Web App support |
| CSS | Interface styling |
| Fetch/API integration | Backend communication |

## 4. Architecture

```text
User
 |
 v
FrioVale Web Application
 |
 +----> React Components
 |
 +----> Application Routes
 |
 +----> Monitoring Interface
 |
 v
Backend API (Spring Boot)
 |
 v
MySQL Database
 |
 v
IoT Telemetry Data
```

The frontend is designed to consume backend services through the configured API address.

The actual integration of each screen with real API data must be verified against the implemented application.

## 5. Requirements

- Node.js.
- npm.
- Git.
- A running FrioVale backend for API integration.
- A compatible web browser.

## 6. Installation

Clone the repository:

```bash
git clone https://github.com/FrioVale/Front_FrioVale.git
cd Front_FrioVale
```

Install dependencies:

```bash
npm install
```

## 7. Environment configuration

The project contains an `.env.example` file.

Current variable:

```env
VITE_API_URL=http://localhost:8080
```

This variable defines the backend API address.

For local development, the backend must be available at the configured URL.

For production, replace the local address with the public HTTPS backend URL.

Example:

```env
VITE_API_URL=https://your-public-api-domain
```

The example above is a configuration template, not an existing deployment URL.

Do not store passwords, private tokens or production secrets in frontend environment variables. Variables prefixed with `VITE_` are exposed to the browser.

## 8. Running the application

Start the development server:

```bash
npm run dev
```

Vite will display the local address in the terminal.

Open the displayed address in a browser.

## 9. Production build

Generate the production build:

```bash
npm run build
```

The generated files are placed in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## 10. Progressive Web App (PWA)

The project includes `vite-plugin-pwa`.

The current Vite configuration defines:

- Application name: FrioVale.
- Short name: FrioVale.
- Standalone display mode.
- Application theme color.
- Background color.
- Application icon references.
- Automatic update registration.

The PWA configuration provides the foundation for installing the application on compatible devices.

Offline data access and offline synchronization must be implemented and tested separately before being considered complete.

## 11. Backend integration

The frontend uses the following configuration:

```env
VITE_API_URL=http://localhost:8080
```

The backend is responsible for providing the data and services consumed by the application.

The final integration must support:

- Retrieving sensor readings.
- Displaying temperature and humidity.
- Displaying device status.
- Showing the last device contact.
- Retrieving historical readings.
- Filtering monitoring information.
- Displaying alerts.
- Authentication and authorization.

API routes must be documented using the actual backend controllers and OpenAPI specification.

## 12. Dashboard requirements

The final dashboard must support the following monitoring capabilities:

| Feature | Expected behavior |
|---|---|
| Temperature | Display current environmental temperature |
| Humidity | Display relative humidity |
| Device status | Show online/offline status |
| Last contact | Display the latest device heartbeat |
| Historical data | Display previous measurements |
| Filters | Filter readings by device and time |
| Alerts | Highlight values outside configured limits |
| AI results | Display prediction or anomaly results |
| Authentication | Restrict access to authorized users |

These items are final project requirements. Their implementation must be verified in the application before being marked as completed.

## 13. User experience and responsiveness

The interface should be accessible through:

- Desktop browsers.
- Mobile browsers.
- Compatible devices supporting PWA installation.

The final project must also include:

- Heuristic usability evaluation.
- Testing with at least five users.
- System Usability Scale (SUS) calculation.
- SUS target of at least 68.

The evaluation results must be documented.

## 14. Security

The frontend must follow the security requirements of the FrioVale project.

Important practices:

- Never expose private API keys in frontend code.
- Never store production secrets in VITE_ variables.
- Use HTTPS for production API communication.
- Validate user input.
- Handle expired authentication tokens.
- Restrict access to authenticated users.
- Respect backend authorization rules.
- Avoid exposing personal data unnecessarily.
- Follow applicable LGPD requirements.

Authentication and authorization must be enforced by the backend, not only by frontend navigation controls.

## 15. Resilience requirements

The final frontend must support controlled behavior when backend services or devices become unavailable.

| Requirement | Expected behavior |
|---|---|
| Device offline | Display offline status |
| Backend unavailable | Display service unavailability |
| Old readings | Show the actual last update time |
| Missing data | Avoid displaying outdated values as current |
| AI unavailable | Keep the remaining dashboard operational |
| Network interruption | Provide an appropriate offline state |
| Recovery | Refresh information when connectivity returns |

## 16. Repository structure

Current repository structure:

```text
Front_FrioVale/
├── public/
├── src/
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Suggested organization as the application grows:

```text
Front_FrioVale/
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── routes/
│   ├── types/
│   ├── assets/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The suggested folders should be created according to the actual application organization.

## 17. Final delivery checklist

- [ ] Application builds successfully.
- [ ] Backend URL configured.
- [ ] Public backend integration.
- [ ] Real sensor data displayed.
- [ ] Temperature and humidity monitoring.
- [ ] Device online/offline status.
- [ ] Last contact information.
- [ ] Historical readings.
- [ ] Filters.
- [ ] Threshold alerts.
- [ ] AI results displayed.
- [ ] Authentication.
- [ ] Responsive interface.
- [ ] PWA installation tested.
- [ ] Offline state implemented.
- [ ] Usability evaluation.
- [ ] Five-user test.
- [ ] SUS score documented.
- [ ] HTTPS deployment.

## 18. Academic context

This repository is part of the FrioVale Integrative Project.

It contributes to the Internet of Things, Cloud Computing, Mobile Development, Software Quality, Information Security and Artificial Intelligence requirements of the project.

</details>

<details>
<summary><strong>🇧🇷 Versão em português</strong></summary>

## 1. Sobre o projeto

O FrioVale é uma solução baseada em IoT desenvolvida para monitorar as condições ambientais ao longo da cadeia do frio utilizada no armazenamento e transporte de frutas no Vale do São Francisco.

Este repositório contém o front-end web da plataforma FrioVale.

A aplicação foi projetada para fornecer aos usuários uma interface de acompanhamento das condições ambientais, acesso às informações de telemetria e apoio às decisões logísticas relacionadas à preservação das frutas.

## 2. Objetivos

- Disponibilizar uma interface web para a plataforma FrioVale.
- Apresentar informações de monitoramento ambiental.
- Permitir acesso aos serviços do back-end.
- Exibir informações de temperatura e umidade.
- Apoiar o monitoramento da disponibilidade dos dispositivos.
- Fornecer uma base para visualização de dados históricos.
- Permitir acesso responsivo por computadores e celulares.
- Oferecer recursos de Progressive Web App.

## 3. Tecnologias

| Tecnologia | Finalidade |
|---|---|
| React 18 | Desenvolvimento da interface |
| TypeScript | Tipagem estática |
| Vite | Servidor de desenvolvimento e build |
| React Router DOM | Navegação da aplicação |
| Lucide React | Ícones da interface |
| vite-plugin-pwa | Suporte a Progressive Web App |
| CSS | Estilização da interface |
| Fetch/integração API | Comunicação com o back-end |

## 4. Arquitetura

```text
Usuário
 |
 v
Aplicação Web FrioVale
 |
 +----> Componentes React
 |
 +----> Rotas da aplicação
 |
 +----> Interface de monitoramento
 |
 v
API Back-end (Spring Boot)
 |
 v
Banco de dados MySQL
 |
 v
Dados de telemetria IoT
```

O front-end foi preparado para consumir os serviços do back-end por meio do endereço de API configurado.

A integração efetiva de cada tela com dados reais da API precisa ser verificada na aplicação implementada.

## 5. Requisitos

- Node.js.
- npm.
- Git.
- Back-end FrioVale em execução para integração com a API.
- Navegador compatível.

## 6. Instalação

Clone o repositório:

```bash
git clone https://github.com/FrioVale/Front_FrioVale.git
cd Front_FrioVale
```

Instale as dependências:

```bash
npm install
```

## 7. Configuração do ambiente

O projeto possui o arquivo `.env.example`.

Variável atual:

```env
VITE_API_URL=http://localhost:8080
```

Essa variável define o endereço da API do back-end.

No desenvolvimento local, o back-end deverá estar disponível no endereço configurado.

Em produção, substitua o endereço local pela URL pública HTTPS do back-end.

Exemplo:

```env
VITE_API_URL=https://seu-dominio-publico-da-api
```

O exemplo acima é um modelo de configuração, não uma URL de implantação existente.

Não armazene senhas, tokens privados ou segredos de produção em variáveis do front-end. Variáveis com prefixo `VITE_` ficam expostas ao navegador.

## 8. Execução da aplicação

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá o endereço local no terminal.

Abra o endereço apresentado no navegador.

## 9. Build de produção

Gere a versão de produção:

```bash
npm run build
```

Os arquivos gerados serão armazenados na pasta `dist/`.

Para visualizar localmente a versão de produção:

```bash
npm run preview
```

## 10. Progressive Web App (PWA)

O projeto possui o `vite-plugin-pwa`.

A configuração atual do Vite define:

- Nome da aplicação: FrioVale.
- Nome curto: FrioVale.
- Modo de exibição standalone.
- Cor do tema.
- Cor de fundo.
- Referências aos ícones da aplicação.
- Registro de atualização automática.

A configuração PWA fornece a base para instalação da aplicação em dispositivos compatíveis.

O acesso offline aos dados e a sincronização offline precisam ser implementados e testados separadamente antes de serem considerados concluídos.

## 11. Integração com o back-end

O front-end utiliza a seguinte configuração:

```env
VITE_API_URL=http://localhost:8080
```

O back-end é responsável por fornecer os dados e serviços consumidos pela aplicação.

A integração final deverá permitir:

- Consultar leituras dos sensores.
- Exibir temperatura e umidade.
- Exibir status dos dispositivos.
- Mostrar o último contato do dispositivo.
- Consultar histórico de leituras.
- Filtrar informações de monitoramento.
- Exibir alertas.
- Apresentar resultados da inteligência artificial.
- Implementar autenticação e autorização.

As rotas da API devem ser documentadas utilizando os controllers reais do back-end e a especificação OpenAPI.

## 12. Requisitos do dashboard

O dashboard final deverá oferecer os seguintes recursos:

| Funcionalidade | Comportamento esperado |
|---|---|
| Temperatura | Exibir a temperatura ambiental atual |
| Umidade | Exibir a umidade relativa |
| Status do dispositivo | Mostrar online/offline |
| Último contato | Exibir o último heartbeat recebido |
| Dados históricos | Exibir medições anteriores |
| Filtros | Filtrar leituras por dispositivo e período |
| Alertas | Destacar valores fora dos limites configurados |
| Resultados de IA | Exibir previsões ou resultados de anomalias |
| Autenticação | Restringir o acesso a usuários autorizados |

Esses itens são requisitos da entrega final. A implementação deverá ser verificada na aplicação antes de serem marcados como concluídos.

## 13. Experiência do usuário e responsividade

A interface deverá ser acessível por:

- Navegadores de computadores.
- Navegadores de celulares.
- Dispositivos compatíveis com instalação PWA.

O projeto final também deverá incluir:

- Avaliação heurística de usabilidade.
- Testes com pelo menos cinco usuários.
- Cálculo da System Usability Scale (SUS).
- Meta SUS de pelo menos 68 pontos.

Os resultados da avaliação deverão ser documentados.

## 14. Segurança

O front-end deverá seguir os requisitos de segurança do projeto FrioVale.

Práticas importantes:

- Nunca expor chaves privadas da API no código do front-end.
- Nunca armazenar segredos de produção em variáveis VITE_.
- Utilizar HTTPS na comunicação com a API em produção.
- Validar entradas dos usuários.
- Tratar tokens de autenticação expirados.
- Restringir o acesso a usuários autenticados.
- Respeitar as regras de autorização do back-end.
- Evitar exposição desnecessária de dados pessoais.
- Seguir os requisitos aplicáveis da LGPD.

A autenticação e a autorização devem ser aplicadas pelo back-end, não apenas pelos controles de navegação do front-end.

## 15. Requisitos de resiliência

O front-end final deverá apresentar comportamento controlado quando os serviços do back-end ou os dispositivos estiverem indisponíveis.

| Requisito | Comportamento esperado |
|---|---|
| Dispositivo offline | Exibir status offline |
| Back-end indisponível | Informar indisponibilidade do serviço |
| Leituras antigas | Mostrar o horário real da última atualização |
| Dados ausentes | Não exibir valores antigos como atuais |
| IA indisponível | Manter o restante do dashboard funcionando |
| Interrupção de rede | Apresentar estado offline adequado |
| Recuperação | Atualizar as informações quando a conexão retornar |

## 16. Estrutura do repositório

Estrutura atual:

```text
Front_FrioVale/
├── public/
├── src/
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Organização sugerida para evolução:

```text
Front_FrioVale/
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── routes/
│   ├── types/
│   ├── assets/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

As pastas sugeridas devem ser criadas de acordo com a organização real da aplicação.

## 17. Checklist da entrega final

- [ ] Aplicação compilando corretamente.
- [ ] URL do back-end configurada.
- [ ] Integração com back-end público.
- [ ] Exibição de dados reais dos sensores.
- [ ] Monitoramento de temperatura e umidade.
- [ ] Status online/offline.
- [ ] Informação do último contato.
- [ ] Histórico de leituras.
- [ ] Filtros.
- [ ] Alertas por limiar.
- [ ] Exibição dos resultados de IA.
- [ ] Autenticação.
- [ ] Interface responsiva.
- [ ] Instalação PWA testada.
- [ ] Estado offline implementado.
- [ ] Avaliação de usabilidade.
- [ ] Teste com cinco usuários.
- [ ] Resultado SUS documentado.
- [ ] Implantação HTTPS.

## 18. Contexto acadêmico

Este repositório faz parte do Projeto Integrador FrioVale.

Ele contribui para os requisitos de Internet das Coisas, Cloud Computing, Desenvolvimento Mobile, Qualidade de Software, Segurança da Informação e Inteligência Artificial do projeto.

</details>
