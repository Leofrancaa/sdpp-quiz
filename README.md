# Projeto Quiz Interativo - Análise e Documentação

## Visão Geral do Projeto
Este projeto consiste em uma aplicação distribuída de quiz de perguntas e respostas. Foi implementado um servidor (backend) que gerencia as regras do jogo e permite que múltiplas aplicações clientes (frontend) se conectem para participar. O sistema foi projetado com foco na interoperabilidade, permitindo, em tese, que clientes de diferentes equipes possam interagir com servidores de outras equipes, desde que sigam um padrão de comunicação comum.

## Arquitetura
A aplicação segue uma arquitetura cliente-servidor:

*   **Servidor (Backend):** Responsável por gerenciar a lógica do quiz, incluindo a seleção de temas, o fornecimento de perguntas, a validação de respostas e a contagem de pontuação dos jogadores. Comunica-se com os clientes em tempo real.
*   **Cliente (Frontend):** Interface com a qual o usuário interage. Permite ao jogador escolher um tema, receber perguntas, submeter respostas e visualizar sua pontuação e histórico.

## Tecnologias Utilizadas

*   **Backend (Servidor):**
    *   Node.js
    *   TypeScript
    *   Express.js (para a estrutura base do servidor HTTP)
    *   Socket.IO (para comunicação bidirecional em tempo real com os clientes)
*   **Frontend (Cliente):**
    *   Next.js (framework React)
    *   TypeScript
    *   React
    *   Socket.IO Client (para comunicação com o servidor)
    *   Tailwind CSS (para estilização)


## Como Executar o Projeto

### Pré-requisitos

*   Node.js e npm (ou yarn) instalados.

### Backend (Servidor)

1.  Navegue até o diretório `backend`:
    ```bash
    cd sdpp-quiz-master/backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Compile o TypeScript (se necessário, embora `ts-node` possa ser usado para execução direta) ou execute o servidor usando `ts-node` (geralmente configurado em `scripts` no `package.json`). Se não houver um script de `start` ou `dev` que use `ts-node`, você pode precisar adicionar um ou executar manualmente:
    ```bash
    npx ts-node server.ts
    ```
    Por padrão, o servidor iniciará na porta `3001`.

### Frontend (Cliente)

1.  Em um novo terminal, navegue até o diretório `frontend`:
    ```bash
    cd sdpp-quiz-master/frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do Next.js:
    ```bash
    npm run dev
    ```
4.  Abra o navegador e acesse `http://localhost:3000` (ou a porta indicada no terminal).

## Protocolo de Comunicação (Socket.IO)

A comunicação entre cliente e servidor é realizada via Socket.IO, utilizando os seguintes eventos e estruturas de payload (JSON):

### Eventos Emitidos pelo Cliente para o Servidor

1.  **`escolherTema`**: Quando o jogador seleciona um tema para o quiz.
    *   **Payload**: `string` - O nome do tema escolhido (ex: "Tecnologia", "Geral").

2.  **`resposta`**: Quando o jogador submete uma resposta para a pergunta atual.
    *   **Payload**: `object` - `{ "resposta": "string" }` (ex: `{ "resposta": "Paris" }`).

### Eventos Emitidos pelo Servidor para o Cliente

1.  **`pergunta`**: Envia a próxima pergunta para o jogador.
    *   **Payload**: `object` - 
        ```json
        {
          "tipo": "pergunta",
          "conteudo": "Qual a capital da França?",
          "opcoes": ["Londres", "Paris", "Berlim", "Madri"],
          "respostaCorreta": "Paris" 
        }
        ```
        *Nota: A inclusão da `respostaCorreta` no payload da pergunta enviada ao cliente é uma característica da implementação atual. Para cenários de interoperabilidade onde o cliente não deve conhecer a resposta antecipadamente, este campo poderia ser omitido ou tratado de forma diferente.*

2.  **`fim`**: Indica o final do quiz para o jogador, enviando a pontuação final.
    *   **Payload**: `object` - `{ "tipo": "fim", "pontuacao": number }` (ex: `{ "tipo": "fim", "pontuacao": 7 }`).

3.  **`erro`**: Envia uma mensagem de erro para o cliente (ex: tema inválido).
    *   **Payload**: `string` - A mensagem de erro (ex: "Tema inválido").

## Interoperabilidade
Para que diferentes clientes e servidores (desenvolvidos por equipes distintas) possam interagir, é crucial que todos sigam estritamente o protocolo de comunicação definido acima:
1.  **Endpoint do Servidor:** Todos os clientes devem ser configuráveis para se conectar ao endereço IP e porta corretos do servidor Socket.IO (nesta implementação, o cliente está configurado para `http://localhost:3001`).
2.  **Nomes dos Eventos:** Os nomes dos eventos Socket.IO (`escolherTema`, `resposta`, `pergunta`, `fim`, `erro`) devem ser idênticos.
3.  **Estrutura dos Payloads:** A estrutura dos objetos JSON enviados como payload para cada evento deve ser respeitada.

O uso de JSON como formato de serialização de dados e Socket.IO como camada de transporte oferece a flexibilidade necessária. A documentação clara e o compartilhamento deste padrão de comunicação são essenciais para o sucesso da interoperabilidade.
