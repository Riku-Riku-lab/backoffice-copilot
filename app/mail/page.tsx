"use client";

import { useState } from "react";
import Link from "next/link";

export default function MailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateMail() {
    setError("");
    setResult("");
    setCopied(false);

    if (!subject.trim() || !content.trim()) {
      setError("件名と内容を入力してください。");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          subject,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成に失敗しました。");
      }

      setResult(data.result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました。";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;

    await navigator.clipboard.writeText(result);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-4 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          ← ホームへ戻る
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">
            ✉️ メール作成
          </h1>

          <p className="mb-8 text-slate-500">
            要点を入力すると、AIがビジネスメールに整えます。
          </p>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="recipient"
                className="font-semibold text-slate-700"
              >
                宛先
              </label>

              <input
                id="recipient"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                placeholder="例：株式会社〇〇 営業部 田中様"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="font-semibold text-slate-700"
              >
                件名
              </label>

              <input
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                placeholder="例：請求書送付のお願い"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="font-semibold text-slate-700"
              >
                伝えたい内容
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="mt-2 min-h-40 w-full resize-y rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                placeholder="例：6月分の請求書がまだ届いていないため、今週中に送ってほしい"
              />
            </div>

            <button
              type="button"
              onClick={generateMail}
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 p-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "AIが作成中..." : "✨ AIでメール作成"}
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}

            {result && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-800">
                    生成結果
                  </h2>

                  <button
                    type="button"
                    onClick={copyResult}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {copied ? "コピーしました！" : "📋 コピー"}
                  </button>
                </div>

                <pre className="whitespace-pre-wrap font-sans leading-7 text-slate-800">
                  {result}
                </pre>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}