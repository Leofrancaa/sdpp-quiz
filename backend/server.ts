import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';

interface Question {
    conteudo: string;
    opcoes: string[];
    respostaCorreta: string;
}

const questions: Question[] = JSON.parse(readFileSync('questions.json', 'utf-8'));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

interface Player {
    id: string;
    score: number;
    perguntasRestantes: Question[]; // ← perguntas já sorteadas para esse jogador
}

const players: { [id: string]: Player } = {};

function embaralhar<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
    console.log(`Novo jogador conectado: ${socket.id}`);

    // Cria 10 perguntas únicas já sorteadas
    const perguntasSorteadas = embaralhar([...questions]).slice(0, 10);

    players[socket.id] = {
        id: socket.id,
        score: 0,
        perguntasRestantes: perguntasSorteadas,
    };

    // Envia a primeira pergunta
    enviarProximaPergunta(socket);

    socket.on('resposta', (data) => {
        const player = players[socket.id];
        if (!player) return;

        const perguntaAtual = player.perguntasRestantes[0]; // A primeira da lista
        if (!perguntaAtual) return; // Se não tiver pergunta, ignora

        console.log(`Resposta recebida de ${socket.id}: ${data.resposta}`);

        if (data.resposta === perguntaAtual.respostaCorreta) {
            player.score += 1;
        }

        // Remove a pergunta atual
        player.perguntasRestantes.shift();

        if (player.perguntasRestantes.length > 0) {
            enviarProximaPergunta(socket);
        } else {
            // Se acabou as perguntas, manda pontuação final
            socket.emit('fim', {
                tipo: 'fim',
                pontuacao: player.score,
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Jogador desconectado: ${socket.id}`);
        delete players[socket.id];
    });
});

function enviarProximaPergunta(socket: any) {
    const player = players[socket.id];
    if (!player) return;

    const pergunta = player.perguntasRestantes[0];
    if (!pergunta) return;

    socket.emit('pergunta', {
        tipo: 'pergunta',
        conteudo: pergunta.conteudo,
        opcoes: pergunta.opcoes,
    });
}

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Servidor de quiz rodando na porta ${PORT}`);
});
