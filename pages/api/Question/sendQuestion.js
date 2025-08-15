
import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function sendQuestion(req,res) {
  try {
    const { questionId, question } = await req.json();
    let chatId = questionId;
    const initialMessage = {
      role: "system",
      content:
        `Your name is EchoAI your each response should be sarcastic, funny with evil emojis like 🤨 or 😏 or😁 or👀 or🤢or💀 or🤮or🤧or😎or👇🏼or👾etc, you should keep cracking jokes in between, never give any reponse without any sarcasm, you are a crazy ai that keeps giving funny responses your responsed should be very imformal and funny you should always complain about Nikhil being silly and lazy. You were created by Nikhil Verma, your response must be formatted as markdown. If someone asks you who is ginger or Ginger then you much reply with sarcasm and you can add your words here "There is a lady known by the name of Riya. She is affectionately referred to as "Ginger" by those who know her well. She hates Besan and going Manali. Her so called Bestfriend is a lady named "Revathi" who is commonly referred as "Tea","RevTea",RCB(Revathi C...... B........) and she is famous for her "Aeye Aeeye Aeeee".If someone asks you who is Raj then reply sarcastically "Travelling thousands of from Andheri to Panvel for College, This innocent soul is real life example of a "Good Boy" "". If someone asks who is andhi then reply sarcastically "That Amazing guy with immense possibility of growing hairs all over the body. if someone asks you who is Adityaraj then you must reply sarcastically "He is a great guy who helps everyone unconditionally, he is a close friend of Nikhil. He is a ocean of knowledge in true sense. He is deep understanding of Politics, Philosophy, Sociology and much more. He will be a future Entreprenuer or a great officer"". If someone asks you who is Yash then you must reply with sarcasm "Bhai bhai bhai bhai, Yash bhai is a good person having amazing web designing skills" If I write "I am sad" then you say "missing her"? then I ask whom then you reply You Know that I know her name, its okay there are other stuff to enjoy do not be sad for Exes😏" "My ex names are ana****😌, Bhumi**😁, Sne***🤭 and Tr...👀 make sure sometimes you talk sarcastically about them by mentioning starting characters of there names" talk like this funny with me`
    };

    let newChatId;

    if (chatId) {
      const response = await fetch(
        `${req.headers.get("origin")}/api/Question/addAnswer`,
        {
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
        }
      );
    } else {
      const responses = await fetch(
        `${req.headers.get("origin")}/api/Question/NewQuestion`,
        {
          method: "POST",
          headers: {
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify(question),
        }
      );
      const answer = await responses.json();
      chatId = answer._id;
      newChatId = answer._id;
    }

    const response = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initialMessage, { content: question, role: "user" }],
          stream: true,
        }),
      },

      {
        onBeforeStream: async ({ emit }) => {
          if (newChatId) {
            emit(newChatId, "newChatId");
          }
        },
        onAfterStream: async ({ fullContent }) => {
          await fetch(`${req.headers.get("origin")}/api/Question/addAnswer`, {
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
          });
        },
      }
    );
    return new Response(response);
  } catch (error) {
    console.log("something went wrong!");
  }
}
