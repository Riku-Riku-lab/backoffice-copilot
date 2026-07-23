"use client";

import { useState } from "react";
import Link from "next/link";

const recipientTypes = ["上司", "取引先", "同僚", "先生", "その他"];
const tones = ["丁寧", "簡潔", "謝罪", "お礼", "やわらかめ"];
type MailMode = "new" | "reply";

export default function MailPage() {
  const [mailMode, setMailMode] = useState<MailMode>("new");
  const [recipient, setRecipient] = useState("");
  const [recipientType, setRecipientType] = useState("上司");
  const [tone, setTone] = useState("丁寧");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [receivedMail, setReceivedMail] = useState("");
  const [replyIntent, setReplyIntent] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  function changeMode(mode: MailMode) {
    setMailMode(mode);
    setResult("");
    setError("");
    setCopied(false);
  }

  async function generateMail() {
    setError("");
    setResult("");
    setCopied(false);

    if (mailMode === "new" && (!subject.trim() || !content.trim())) {
      setError("件名の要点と伝えたい内容を入力してください。");
      return;
    }

    if (mailMode === "reply" && !receivedMail.trim()) {
      setError("相手から届いたメールを入力してください。");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailMode,
          recipient,
          recipientType,
          tone,
          subject,
          content,
          receivedMail,
          replyIntent,
        }),
      });

      const data: { result?: string; error?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(data.error || "メールの生成に失敗しました。");
      }

      setResult(data.result ?? "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました。"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("コピーに失敗しました。");
    }
  }

  async function rewriteMail(style: string) {
    if (!result || isRewriting) return;

    setError("");
    setCopied(false);

    try {
      setIsRewriting(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailMode: "rewrite",
          rewriteStyle: style,
          originalMail: result,
        }),
      });

      const data: {
        result?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "メールの再編集に失敗しました。"
        );
      }

      setResult(data.result ?? "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "メールの再編集に失敗しました。"
      );
    } finally {
      setIsRewriting(false);
    }
  }

  function resetForm() {
    setRecipient("");
    setRecipientType("上司");
    setTone("丁寧");
    setSubject("");
    setContent("");
    setReceivedMail("");
    setReplyIntent("");
    setResult("");
    setError("");
    setCopied(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          ← ホームへ戻る
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10">
          <p className="mb-2 text-sm font-bold text-blue-600">
            Mail AI Ver1.2
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            ✉️ メール作成
          </h1>

          <p className="mb-8 mt-3 text-slate-500">
            新規メールも返信メールも、要点を入力するだけで作成できます。
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-2">
            <button
              type="button"
              onClick={() => changeMode("new")}
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                mailMode === "new"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ✍️ 新規メール
            </button>

            <button
              type="button"
              onClick={() => changeMode("reply")}
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                mailMode === "reply"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ↩️ 返信メール
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="font-semibold text-slate-700">送る相手</label>
                <select
                  value={recipientType}
                  onChange={(event) => setRecipientType(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500"
                >
                  {recipientTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">文章の雰囲気</label>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500"
                >
                  {tones.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">
                宛先
                <span className="ml-2 text-xs font-normal text-slate-400">任意</span>
              </label>
              <input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                placeholder="例：株式会社〇〇 営業部 田中様"
              />
            </div>

            {mailMode === "new" ? (
              <>
                <div>
                  <label className="font-semibold text-slate-700">件名の要点</label>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="例：請求書を送ってほしい"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">伝えたい内容</label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="mt-2 min-h-40 w-full resize-y rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="例：6月分の請求書がまだ届いていない。今週中に送ってほしい。"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="font-semibold text-slate-700">
                    相手から届いたメール
                  </label>
                  <textarea
                    value={receivedMail}
                    onChange={(event) => setReceivedMail(event.target.value)}
                    className="mt-2 min-h-52 w-full resize-y rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="返信したいメール本文をそのまま貼り付けてください。"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">
                    返信で伝えたいこと
                    <span className="ml-2 text-xs font-normal text-slate-400">任意</span>
                  </label>
                  <textarea
                    value={replyIntent}
                    onChange={(event) => setReplyIntent(event.target.value)}
                    className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="例：日程は問題ない。参加すると伝えたい。"
                  />
                </div>
              </>
            )}

            <button
              type="button"
              onClick={generateMail}
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 p-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "AIがメールを作成中..."
                : mailMode === "new"
                  ? "✨ 新規メールを作成"
                  : "✨ 返信メールを作成"}
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}

            {result && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4">
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    AIで再編集
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      ["polite", "✨ もっと丁寧"],
                      ["short", "✂️ 短く"],
                      ["soft", "😊 やわらかく"],
                      ["formal", "💼 フォーマル"],
                      ["apology", "🙏 謝罪寄り"],
                    ].map(([style, label]) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => void rewriteMail(style)}
                        disabled={isRewriting}
                        className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRewriting ? "再編集中..." : label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-800">生成結果</h2>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      新しく作る
                    </button>

                    <button
                      type="button"
                      onClick={copyResult}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {copied ? "コピーしました！" : "📋 コピー"}
                    </button>
                  </div>
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