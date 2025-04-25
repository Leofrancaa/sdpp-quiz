"use client";

interface QuestionCardProps {
  conteudo: string;
  opcoes: string[];
  onResposta: (resposta: string) => void;
}

export default function QuestionCard({
  conteudo,
  opcoes,
  onResposta,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-black">
      <h2 className="text-2xl font-bold mb-4">{conteudo}</h2>
      <div className="flex flex-col gap-2">
        {opcoes.map((opcao, index) => (
          <button
            key={index}
            onClick={() => onResposta(opcao)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition cursor-pointer"
          >
            {opcao}
          </button>
        ))}
      </div>
    </div>
  );
}
