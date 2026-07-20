import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const recipient = body.recipient?.trim();
    const subject = body.subject?.trim();
    const content = body.content?.trim();

    if (!subject || !content) {
      return NextResponse.json(
        { error: "件名と内容を入力してください。" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const prompt = `
あなたは日本企業の事務・総務担当者を支援するアシスタントです。
以下の情報をもとに、丁寧で自然なビジネスメールを日本語で作成してください。

宛先: ${recipient || "指定なし"}
件名: ${subject}
伝えたい内容: ${content}

条件:
- 件名も含めて出力する
- 丁寧で簡潔な文章にする
- 不明な会社名や氏名を勝手に作らない
- 必要に応じて「〇〇株式会社」「〇〇様」などのプレースホルダーを使う
- 完成したメールだけを出力する
`;

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: prompt,
});
    const generatedText = response.text;

    if (!generatedText) {
      throw new Error("Geminiから文章が返されませんでした。");
    }

    return NextResponse.json({
      result: generatedText,
    });
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