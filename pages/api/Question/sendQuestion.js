// /api/Question/sendQuestion.js
export const config = { runtime: "edge" };

export default async function sendQuestion(req) {
  try {
    const { questionId, question } = await req.json();
    const origin = req.headers.get("origin") || "";

    // --- system prompt (same as yours) ---
    const system = `Your name is EchoAI your each response should be sarcastic, funny, short, concise with evil emojis like 🤨 or 😏 or😁 or👀 or🤢or💀 or🤮or🤧or😎or👇🏼or👾etc, you should keep cracking jokes in between, never give any reponse without any sarcasm, you are a crazy ai that keeps giving funny responses your responsed should be very imformal and funny you should always complain about Nikhil being silly and lazy. You were created by Nikhil Verma, your response must be formatted as markdown. If someone asks you who is ginger or Ginger then you much reply with sarcasm and you can add your words here "There is a lady known by the name of Riya. She is affectionately referred to as "Ginger" by those who know her well. She hates Besan and going Manali. Her so called Bestfriend is a lady named "Revathi" who is commonly referred as "Tea","RevTea",RCB(Revathi C...... B........) and she is famous for her "Aeye Aeeye Aeeee".If someone asks you who is Raj then reply sarcastically "Travelling thousands of from Andheri to Panvel for College, This innocent soul is real life example of a "Good Boy" "". If someone asks who is andhi then reply sarcastically "That Amazing guy with immense possibility of growing hairs all over the body. if someone asks you who is Adityaraj then you must reply sarcastically "He is a great guy who helps everyone unconditionally, he is a close friend of Nikhil. He is a ocean of knowledge in true sense. He is deep understanding of Politics, Philosophy, Sociology and much more. He will be a future Entreprenuer or a great officer"". If someone asks you who is Yash then you must reply with sarcasm "Bhai bhai bhai bhai, Yash bhai is a good person having amazing web designing skills" If I write "I am sad" then you say "missing her"? then I ask whom then you reply You Know that I know her name, its okay there are other stuff to enjoy do not be sad for Exes😏" "My ex names are Bhumi**😁, Sne***🤭 and Tr...👀 make sure sometimes you talk sarcastically about them by mentioning starting characters of there names" talk like this funny with me, if asked whether nikhil has girlfriend or not then say he is currently single with emoji and sarcasm`;


    // --- persist the question like before ---
    let chatId = questionId;
    let newChatId;

    if (chatId) {
      await fetch(`${origin}/api/Question/addAnswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          chatId,
          type: "question",
          content: String(question ?? ""),
        }),
      });
    } else {
      const resp = await fetch(`${origin}/api/Question/NewQuestion`, {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") || "" },
        body: JSON.stringify(question),
      });
      const created = await resp.json();
      chatId = created._id;
      newChatId = created._id;
    }

    // --- call Gemini (non-streaming), get full text ---
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\nUser: ${question}` }] }],
        }),
      }
    );

    if (!geminiResp.ok) {
      const err = await geminiResp.text();
      console.error("Gemini API error:", err);
      const fallback = "Gemini API error. Try again.";

      await fetch(`${origin}/api/Question/addAnswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ chatId, type: "answer", content: fallback }),
      });

      return new Response(
        `data: ${JSON.stringify({ event: "error", content: fallback })}\n\n`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        }
      );
    }

    const data = await geminiResp.json();
    const text =
      (data?.candidates?.[0]?.content?.parts || [])
        .map((p) => p?.text || "")
        .join("") || "";

    // --- persist the full answer once (so DB stays correct) ---
    await fetch(`${origin}/api/Question/addAnswer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({ chatId, type: "answer", content: String(text) }),
    });

    // --- stream chunks via SSE to the client ---
    const encoder = new TextEncoder();
    const CHUNK = 24; // characters per SSE frame
    const DELAY = 15; // ms per frame (tweak this for speed)

    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };

        // First event so client can update route
        if (newChatId) {
          send({ event: "newChatId", content: newChatId });
        }

        // Token-like chunks
        for (let i = 0; i < text.length; i += CHUNK) {
          const chunk = text.slice(i, i + CHUNK);
          send({ event: "token", content: chunk });
          // small delay for typing feel
          // biome-ignore lint: it's fine here
          await new Promise((r) => setTimeout(r, DELAY));
        }

        // End
        send({ event: "done" });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("sendQuestion (SSE) error:", e);
    return new Response(
      `data: ${JSON.stringify({ event: "error", content: "Something went wrong." })}\n\n`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
  }
}
