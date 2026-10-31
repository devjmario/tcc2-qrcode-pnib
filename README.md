# Sistema Móvel de Registro de Eventos Individuais de Bovinos com QR Code

**Trabalho de Conclusão de Curso II — Engenharia de Software**

Universidade Tecnológica Federal do Paraná (UTFPR) — Campus Dois Vizinhos

## 📋 Sobre o projeto

Este projeto tem como objetivo desenvolver e avaliar um protótipo de aplicativo móvel para auxiliar pequenos produtores rurais no registro e na consulta de informações individuais de bovinos, utilizando a tecnologia **QR Code (Quick Response Code)**.

A solução busca facilitar o acesso aos cadastros dos animais por meio da leitura de códigos QR utilizando a câmera do smartphone, reduzindo a necessidade de buscas manuais e simplificando o registro de eventos de manejo.

O sistema adota uma abordagem **offline-first**, permitindo que informações sejam armazenadas localmente e sincronizadas posteriormente com um servidor quando houver conexão com a internet.

O trabalho considera o contexto da rastreabilidade bovina no Brasil e as diretrizes do Plano Nacional de Identificação Individual de Bovinos e Búfalos (PNIB).

> **Importante:** O aplicativo é uma ferramenta complementar para organização de registros individuais de bovinos, não substituindo os mecanismos oficiais de identificação animal.

## 🎯 Objetivos

### Objetivo geral

Desenvolver e avaliar um protótipo funcional de aplicativo móvel que utilize QR Code para facilitar a identificação, consulta e registro de eventos individuais de bovinos, incluindo operações em ambientes sem conectividade.

### Objetivos específicos

- Desenvolver um aplicativo móvel utilizando React Native e TypeScript.
- Implementar a leitura de QR Codes utilizando a câmera do smartphone.
- Associar códigos QR aos cadastros individuais dos bovinos.
- Permitir a consulta ao histórico de eventos de cada animal.
- Implementar o registro de vacinação, pesagem e movimentação.
- Armazenar dados localmente utilizando SQLite.
- Desenvolver uma API REST com Node.js e Express.
- Implementar sincronização entre SQLite e PostgreSQL.
- Avaliar o desempenho, a confiabilidade e a viabilidade técnica do protótipo.

## 🛠️ Tecnologias

| Tecnologia | Finalidade |
|---|---|
| React Native | Aplicativo móvel |
| TypeScript | Desenvolvimento mobile |
| Expo | Ambiente e ferramentas de desenvolvimento |
| Expo Camera | Leitura de QR Codes |
| QR Code | Identificação e acesso aos registros |
| SQLite | Persistência local |
| Node.js | Backend |
| Express | API REST |
| PostgreSQL | Banco de dados central |
| Git e GitHub | Controle de versão |

## 🏗️ Arquitetura proposta

O sistema utiliza uma arquitetura cliente-servidor com armazenamento local e sincronização posterior.

```text
          Etiqueta QR Code
                 |
                 v
       +-------------------+
       | Câmera Smartphone |
       +-------------------+
                 |
                 v
       +-------------------+
       | Aplicativo Mobile |
       | React Native      |
       +-------------------+
                 |
                 v
       +-------------------+
       | SQLite            |
       | Banco Local       |
       +-------------------+
```

A leitura do QR Code permite localizar o cadastro associado ao animal. As informações são armazenadas localmente e poderão ser sincronizadas com o servidor.

## 📱 Funcionalidades previstas

### Cadastro de animais
- Cadastro individual de bovinos.
- Associação de identificadores QR Code.
- Consulta e atualização de informações.

### Leitura de QR Code
- Leitura utilizando a câmera do smartphone.
- Identificação do animal associado ao código.
- Acesso ao histórico individual.

### Registro de eventos
- Vacinação.
- Pesagem.
- Movimentação e transferência.
- Entrada e saída de animais.

### Operação offline
- Armazenamento local de registros.
- Consulta sem conexão com a internet.
- Sincronização posterior.
- Tratamento de falhas e prevenção de duplicidade.

## 📂 Estrutura do projeto

```text
/
├── mobile/          # Aplicativo React Native
└── README.md
```

A estrutura será atualizada conforme o desenvolvimento.

## 🧪 Metodologia e avaliação

O desenvolvimento utiliza uma abordagem incremental, permitindo implementar e validar progressivamente as funcionalidades.

Os testes serão realizados inicialmente em ambiente controlado, utilizando cadastros fictícios de bovinos e códigos QR associados aos registros.

| Métrica | Objetivo |
|---|---|
| Tempo de leitura | Medir o acesso ao cadastro via QR Code |
| Taxa de sucesso | Verificar a confiabilidade da leitura |
| Tempo de registro | Avaliar a duração do registro de eventos |
| Busca manual × QR Code | Comparar os métodos de acesso |
| Operação offline | Verificar o funcionamento sem internet |
| Integridade dos dados | Validar a sincronização dos registros |

## 🚧 Status do desenvolvimento

**Em desenvolvimento — TCC II (2026).**

O protótipo está em implementação, com foco inicial na interface mobile e na leitura de QR Codes.

As demais funcionalidades serão desenvolvidas e validadas progressivamente.

## 🎓 Informações acadêmicas

**Instituição:** Universidade Tecnológica Federal do Paraná (UTFPR)

**Campus:** Dois Vizinhos — Paraná

**Curso:** Engenharia de Software

**Trabalho:** Trabalho de Conclusão de Curso II

**Autor:** José Mário da Silva Santos

**Ano:** 2026

## 📄 Licença

Projeto desenvolvido para fins acadêmicos. Nenhuma licença de reutilização foi definida até o momento.