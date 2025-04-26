import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';

interface Question {
    conteudo: string;
    opcoes: string[];
    respostaCorreta: string;
}

interface QuestionsByTheme {
    [theme: string]: Question[];
}

const questionsByTheme: QuestionsByTheme = JSON.parse(readFileSync('questions.json', 'utf-8'));

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
    perguntasRestantes: Question[];
}

const players: { [id: string]: Player } = {};

function embaralhar<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
    console.log(`Novo jogador conectado: ${socket.id}`);

    socket.on('escolherTema', (tema: string) => {
        console.log(`Tema escolhido por ${socket.id}: ${tema}`);
        let perguntasSelecionadas: Question[] = [];

        if (tema === 'Geral') {
            const todasPerguntas = Object.values(questionsByTheme).flat();
            perguntasSelecionadas = embaralhar(todasPerguntas).slice(0, 10);
        } else if (questionsByTheme[tema]) {
            perguntasSelecionadas = embaralhar([...questionsByTheme[tema]]).slice(0, 10);
        } else {
            socket.emit('erro', 'Tema inválido');
            return;
        }

        players[socket.id] = {
            id: socket.id,
            score: 0,
            perguntasRestantes: perguntasSelecionadas,
        };

        enviarProximaPergunta(socket);
    });

    socket.on('resposta', (data) => {
        const player = players[socket.id];
        if (!player) return;

        const perguntaAtual = player.perguntasRestantes[0];
        if (!perguntaAtual) return;

        if (data.resposta === perguntaAtual.respostaCorreta) {
            player.score += 1;
        }

        player.perguntasRestantes.shift();

        if (player.perguntasRestantes.length > 0) {
            enviarProximaPergunta(socket);
        } else {
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
        respostaCorreta: pergunta.respostaCorreta // Manda a resposta correta junto
    });
}

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Servidor de quiz rodando na porta ${PORT}`);
});
