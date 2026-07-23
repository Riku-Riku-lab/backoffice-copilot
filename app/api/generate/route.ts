import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type RequestBody = {
  mailMode?: unknown;
  recipient?: unknown;
  subject?: unknown;
  content?: unknown;
  recipientType?: unknown;
  tone?: unknown;
  receivedMail?: unknown;
  replyIntent?: unknown;
};

const recipientTypes = ["上司", "取引先", "同僚", "先生", "その他"];
const tones = ["丁寧", "簡潔", "謝罪", "お礼", "やわらかめ"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const mailMode = body.mailMode === "reply" ? "reply" : "new";
    const recipient =
      typeof body.recipient === "string" ? body.recipient.trim() : "";
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const receivedMail =
      typeof body.receivedMail === "string" ? body.receivedMail.trim() : "";
    const replyIntent =
      typeof body.replyIntent === "string" ? body.replyIntent.trim() : "";

    const recipientType =
      typeof body.recipientType === "string" &&
      recipientTypes.includes(body.recipientType)
        ? body.recipientType
        : "その他";

    const tone =
      typeof body.tone === "string" &&
      tones.includes(body.tone)
        ? body.tone
        : "丁寧";

    if (mailMode === "new" && (!subject || !content)) {
      return NextResponse.json(
        { error: "件名の要点と伝えたい内容を入力してください。" },
        { status: 400 }
      );
    }

    if (mailMode === "reply" && !receivedMail) {
      return NextResponse.json(
        { error: "相手から届いたメールを入力してください。" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const prompt =
      mailMode === "new"
        ? `
あなたは日本企業の事務・総務担当者を支援する、
ビジネスメール作成の専門アシスタントです。

新規メールを作成してください。

送る相手の種類：${recipientType}
宛先：${recipient || "指定なし"}
希望する雰囲気：${tone}
件名の要点：${subject}
伝えたい内容：${content}

条件：
- 1行目に「件名：〇〇」と出力する
- 次に空行を入れ、本文を出力する
- 相手と雰囲気に合った敬語にする
- 丁寧だが回りくどくしすぎない
- 入力されていない会社名・氏名・日付・事情を勝手に作らない
- 不足箇所は「〇〇様」などのプレースホルダーを使う
- 完成したメールだけを出力する
`.trim()
        : `
あなたは日本企業の事務・総務担当者を支援する、
ビジネスメール返信の専門アシスタントです。

以下の受信メールに対する、自然な返信メールを作成してください。

送る相手の種類：${recipientType}
宛先：${recipient || "受信メールから判断"}
希望する雰囲気：${tone}

受信メール：
${receivedMail}

返信で伝えたいこと：
${replyIntent || "受信内容に対して自然に返信する"}

条件：
- 受信メールの内容を正確に読み取る
- 件名は受信メールに合う形で作成し、1行目に「件名：〇〇」と出力する
- 件名は必要に応じて「Re:」を使用する
- 次に空行を入れ、本文を出力する
- 相手と雰囲気に合った敬語にする
- 返信で伝えたいことが指定されている場合は必ず反映する
- 入力されていない承諾・拒否・日程・事実を勝手に決めない
- 判断できない内容はプレースホルダーを使う
- 完成した返信メールだけを出力する
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text?.trim();

    if (!generatedText) {
      throw new Error("Geminiから文章が返されませんでした。");
    }

    return NextResponse.json({ result: generatedText });
  } catch (error) {
    console.error("メール生成エラー:", error);

    const message =
      error instanceof Error
        ? error.message
        : "メールの生成に失敗しました。";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}