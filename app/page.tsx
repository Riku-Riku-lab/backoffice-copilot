import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[500px]">
        <h1 className="text-4xl font-bold text-center mb-2">
          BackOffice Copilot
        </h1>

        <p className="text-center text-gray-500 mb-8">
          事務作業をもっとラクに。
        </p>

        <div className="space-y-4">
        <Link
          href="/mail"
          className="block w-full rounded-xl bg-blue-600 p-4 text-center text-white transition hover:bg-blue-700"
        >
          ✉️ メール作成
        </Link>
          <button className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition">
            📄 文書作成
          </button>

          <button className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition">
            📝 日報作成
          </button>
        </div>
      </div>
    </main>
  );
}