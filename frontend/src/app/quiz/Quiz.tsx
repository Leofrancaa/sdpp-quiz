"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import QuestionCard from "./QuestionCard";
import ScoreBoard from "./ScoreBoard";

interface Pergunta {
  conteudo: string;
  opcoes: string[];
  respostaCorreta: string; // Agora Pergunta também tem resposta correta
}

interface RespostaUsuario {
  pergunta: string;
  respostaUsuario: string;
  respostaCorreta: string;
  acertou: boolean;
}

const temas = [
  "Tecnologia",
  "História",
  "Esportes",
  "Ciência",
  "Entretenimento",
  "Geografia",
  "Geral",
];

export default function Quiz() {
  const { socket, connected } = useSocket();
  const [temaEscolhido, setTemaEscolhido] = useState<string | null>(null);
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [pontuacao, setPontuacao] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [respostas, setRespostas] = useState<number>(0);
  const [jogoFinalizado, setJogoFinalizado] = useState(false);
  const [historicoRespostas, setHistoricoRespostas] = useState<
    RespostaUsuario[]
  >([]);
  const totalPerguntas = 10;

  useEffect(() => {
    if (!socket) return;

    socket.on("pergunta", (data: Pergunta) => {
      setPergunta({
        conteudo: data.conteudo,
        opcoes: data.opcoes,
        respostaCorreta: data.respostaCorreta,
      });
      setCarregando(false);
    });

    socket.on("pontuacao", (data: { pontuacao: number }) => {
      setPontuacao(data.pontuacao);
    });

    socket.on("fim", (data: { pontuacao: number }) => {
      setPontuacao(data.pontuacao);
      setJogoFinalizado(true);
    });

    socket.on("erro", (mensagem: string) => {
      alert(mensagem);
    });

    return () => {
      socket.off("pergunta");
      socket.off("pontuacao");
      socket.off("fim");
      socket.off("erro");
    };
  }, [socket]);

  const escolherTema = (tema: string) => {
    if (!socket) return;
    socket.emit("escolherTema", tema);
    setTemaEscolhido(tema);
    setCarregando(true);
    setPontuacao(0);
    setRespostas(0);
    setHistoricoRespostas([]);
    setJogoFinalizado(false);
  };

  const enviarResposta = (resposta: string) => {
    if (!socket || jogoFinalizado || !pergunta) return;

    setHistoricoRespostas((prev) => [
      ...prev,
      {
        pergunta: pergunta.conteudo,
        respostaUsuario: resposta,
        respostaCorreta: pergunta.respostaCorreta,
        acertou: resposta === pergunta.respostaCorreta,
      },
    ]);

    setCarregando(true);
    socket.emit("resposta", { resposta });
    setRespostas((prev) => prev + 1);
  };

  const voltarInicio = () => {
    setTemaEscolhido(null);
    setPergunta(null);
    setPontuacao(0);
    setRespostas(0);
    setJogoFinalizado(false);
    setHistoricoRespostas([]);
  };

  if (!connected) {
    return (
      <div className="text-center p-6 text-lg">Conectando ao servidor...</div>
    );
  }

  if (!temaEscolhido) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h1 className="text-3xl font-bold mb-4">
          Escolha um tema para começar:
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {temas.map((tema) => (
            <button
              key={tema}
              onClick={() => escolherTema(tema)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition cursor-pointer"
            >
              {tema}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (jogoFinalizado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Fim de Jogo!</h1>
        <ScoreBoard pontuacao={pontuacao} />
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Seu desempenho:
          </h2>
          <ul className="space-y-4">
            {historicoRespostas.map((item, index) => (
              <li key={index} className="p-4 border rounded-lg">
                <p className="font-semibold">{item.pergunta}</p>
                <p
                  className={`mt-1 ${
                    item.acertou ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Sua resposta: {item.respostaUsuario} (
                  {item.acertou ? "Acertou" : "Errou"})
                </p>
                {!item.acertou && (
                  <p className="mt-1 text-gray-600">
                    Resposta correta: {item.respostaCorreta}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={voltarInicio}
          className="mt-8 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition cursor-pointer"
        >
          Voltar para o Início
        </button>
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
          Carregando pergunta...
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
