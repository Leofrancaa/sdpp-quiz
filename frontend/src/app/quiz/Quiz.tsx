"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import QuestionCard from "./QuestionCard";
import ScoreBoard from "./ScoreBoard";

interface Pergunta {
  conteudo: string;
  opcoes: string[];
}

export default function Quiz() {
  const { socket, connected } = useSocket();
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [pontuacao, setPontuacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [respostas, setRespostas] = useState<number>(0); // Quantidade de perguntas já respondidas
  const totalPerguntas = 10; // fixo: 10 perguntas por partida
  const [jogoFinalizado, setJogoFinalizado] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("fim", (data: { pontuacao: number }) => {
      setPontuacao(data.pontuacao);
      setJogoFinalizado(true);
    });

    return () => {
      socket.off("fim");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("pergunta", (data: Pergunta) => {
      setPergunta(data);
      setCarregando(false);
    });

    socket.on("pontuacao", (data: { pontuacao: number }) => {
      setPontuacao(data.pontuacao);
    });

    return () => {
      socket.off("pergunta");
      socket.off("pontuacao");
    };
  }, [socket]);

  const enviarResposta = (resposta: string) => {
    if (!socket || jogoFinalizado) return;

    setCarregando(true);
    socket.emit("resposta", { resposta });
    setRespostas((prev) => {
      const novasRespostas = prev + 1;
      if (novasRespostas >= totalPerguntas) {
        setJogoFinalizado(true);
      }
      return novasRespostas;
    });
  };

  if (!connected)
    return (
      <div className="text-center p-6 text-lg">Conectando ao servidor...</div>
    );

  if (jogoFinalizado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Fim de Jogo!</h1>
        <ScoreBoard pontuacao={pontuacao} />
        <p className="mt-4 text-lg">
          Você respondeu {totalPerguntas} perguntas!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-sm font-medium text-gray-600">
        Pergunta {respostas + 1} de {totalPerguntas}
      </div>
      {carregando && (
        <div className="text-xl font-semibold animate-pulse">
          Carregando próxima pergunta...
        </div>
      )}
      {!carregando && pergunta && (
        <QuestionCard
          conteudo={pergunta.conteudo}
          opcoes={pergunta.opcoes}
          onResposta={enviarResposta}
        />
      )}
    </div>
  );
}
