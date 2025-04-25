import Quiz from "./quiz/Quiz";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-black">
      <h1 className="text-4xl font-bold mb-6">Quiz Game</h1>
      <Quiz />
    </main>
  );
}
