"use client";

interface ScoreBoardProps {
  pontuacao: number;
}

export default function ScoreBoard({ pontuacao }: ScoreBoardProps) {
  return (
    <div className="text-lg font-semibold">Pontuação: {pontuacao} de 10</div>
  );
}
