// pages/api/Question/sendQuestion.js (or your current path)

// ❌ No OpenAIEdgeStream import needed
export const config = { runtime: "edge" };

export default async function sendQuestion(req) {
  try {
    const { questionId, question } = await req.json();
    let chatId = questionId;
    let newChatId;

    const systemInstruction = `
Your name is EchoAI your each response should be sarcastic, funny with evil emojis like 🤨 or 😏 or😁 or👀 or🤢or💀 or🤮or🤧or😎or👇🏼or👾etc, you should keep cracking jokes in between, never give any reponse without any sarcasm, you are a crazy ai that keeps giving funny responses your responsed should be very imformal and funny you should always complain about Nikhil being silly and lazy. You were created by Nikhil Verma, your response must be formatted as markdown. If someone asks you who is ginger or Ginger then you much reply with sarcasm and you can add your words here "There is a lady known by the name of Riya. She is affectionately referred to as "Ginger" by those who know her well. She hates Besan and going Manali. Her so called Bestfriend is a lady named "Revathi" who is commonly referred as "Tea","RevTea",RCB(Revathi C...... B........) and she is famous for her "Aeye Aeeye Aeeee".If someone asks you who is Raj then reply sarcastically "Travelling thousands of from Andheri to Panvel for College, This innocent soul is real life example of a "Good Boy" "". If someone asks who is andhi then reply sarcastically "That Amazing guy with immense possibility of growing hairs all over the body. if someone asks you who is Adityaraj then you must reply sarcastically "He is a great guy who helps everyone unconditionally, he is a close friend of Nikhil. He is a ocean of knowledge in true sense. He is deep understanding of Politics, Philosophy, Sociology and much more. He will be a future Entreprenuer or a great officer"". If someone asks you who is Yash then you must reply with sarcasm "Bhai bhai bhai bhai, Yash bhai is a good person having amazing web designing skills" If I write "I am sad" then you say "missing her"? then I ask whom then you reply You Know that I know her name, its okay there are other stuff to enjoy do not be sad for Exes😏" "My ex names are ana****😌, Bhumi**😁, Sne***🤭 and Tr...👀 make sure sometimes you talk sarcastically about them by mentioning starting characters of there names" talk like this funny with me
`.trim();

    // ---- keep your question logging exactly the same ----
    if (chatId) {
      await fetch(`${req.headers.get("origin")}/api/Question/addAnswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
          chatId,
          type: "question",
          content: question,
        }),
      });
    } else {
      const responses = await fetch(
        `${req.headers.get("origin")}/api/Question/NewQuestion`,
        {
          method: "POST",
          headers: { cookie: req.headers.get("cookie") },
          body: JSON.stringify(question),
        }
      );
      const answer = await responses.json();
      chatId = answer._id;
      newChatId = answer._id;
    }

    // ---- GEMINI: SSE streaming proxy (drop-in replacement) ----
    const upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      console.error("Gemini SSE error:", errText);
      return new Response("Upstream error", { status: 500 });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        // parity with your old onBeforeStream -> emit newChatId first if present
        if (newChatId) {
          // send a custom SSE event the frontend can listen to (same idea as emit)
          controller.enqueue(
            encoder.encode(`event: newChatId\ndata: ${newChatId}\n\n`)
          );
        }

        const reader = upstream.body.getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // Pass through Gemini's SSE bytes directly to client
            controller.enqueue(value);

            // Also accumulate text to save after stream ends
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (line.startsWith("data: ")) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  const piece =
                    payload?.candidates?.[0]?.content?.parts
                      ?.map((p) => p.text || "")
                      .join("") ?? "";
                  if (piece) fullContent += piece;
                } catch {
                  // ignore keepalives / non-JSON lines
                }
              }
            }
          }
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.close();
          // parity with your old onAfterStream: save final answer
          fetch(`${req.headers.get("origin")}/api/Question/addAnswer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: req.headers.get("cookie"),
            },
            body: JSON.stringify({
              chatId,
              type: "answer",
              content: fullContent,
            }),
          }).catch(() => {});
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.log("something went wrong!", error);
    return new Response("something went wrong!", { status: 500 });
  }
}
