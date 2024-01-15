import Head from "next/head";
import { ChatHistory } from "components/ChatHistory";
import { useMemo, useContext, useEffect, useState, useRef } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from "uuid";
import { QuestionAndAnswer } from "components/Q&A/QuestionAndAnswer";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import { Navbar } from "components/Navbar";
import { ThemeContext } from "context/context";

export default function Home({ questionId, title, questions = [] }) {
  const { theme, toggleDark, toggleLight } = useContext(ThemeContext);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionArray, setQuestionArray] = useState([]);
  const [allContent, setAllContent] = useState("");
  const [activeStream, setActiveStream] = useState(null);

  useEffect(() => {
    setQuestionArray([]);
    setId(null);
  }, [questionId]);

  useEffect(() => {
    if (!loading && allContent) {
      setQuestionArray((prev) => [
        ...prev,
        {
          _id: uuid(),
          type: "answer",
          content: allContent,
        },
      ]);
      setAllContent("");
    }
  }, [loading, allContent]);

  useEffect(() => {
    if (!loading && id) {
      setId(null);
      router.push(`/chat/${id}`);
    }
  }, [loading, id, router]);

  const submitQuestionHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setQuestionArray((prev) => [
      ...prev,
      {
        _id: uuid(),
        type: "question",
        content: userQuestion,
      },
    ]);

    setUserQuestion("");

    const response = await fetch("/api/Question/sendQuestion", {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        questionId,
        question: userQuestion,
      }),
    });
    const answer = response.body;

    if (!answer) {
      return;
    }

    const reader = answer.getReader();
    let value = "";
    setActiveStream(reader);

    await streamReader(reader, (ans) => {
      if (ans.event === "newChatId") {
        setId(ans.content);
      } else {
        setAnswer((prev) => `${prev}${ans.content}`);
        value = value + ans.content;
      }
    });

    setAllContent(value);
    setAnswer("");
    setLoading(false);
  };

  const handleDeleteChat = async () => {
    const response = await fetch("/api/Delete/DeleteChat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(questionId),
    });

    if (response.status === 200) {
      router.push("/chat");
    } else {
      alert("Could not delete, something went wrong!");
    }

    stopActiveStream();
  };

  const routeToChatHistory = (historyId) => {
    router.push(`/chat/${historyId}`);
    stopActiveStream();
  };

  const routeToNewChat = () => {
    router.push("/chat");
    stopActiveStream();
  };

  const stopActiveStream = () => {
    if (activeStream) {
      activeStream.cancel();
      setActiveStream(null);
    }
  };
  const messagesContainerRef = useRef();
  const [userScrolled, setUserScrolled] = useState(false);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    const isUserScrolled =
      container.scrollTop + container.clientHeight <
      container.scrollHeight - 10;

    setUserScrolled(isUserScrolled);
  };
  const allQuestions = [...questions, ...questionArray];
 
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!userScrolled) {
      container.scrollTop = container.scrollHeight;
    }
  }, [allQuestions, answer, userScrolled, loading]);

  return (
    <div className="chatpage-body">
      <Head>
        <title>EchoAI</title>
      </Head>
      <div>
        <ChatHistory
          id={questionId}
          routeToChatHistory={routeToChatHistory}
          routeToNewChat={routeToNewChat}
        />
      </div>

      <div className="chatpage-window">
        <Navbar questionId={questionId} onDeleteChat={handleDeleteChat} />
        <div
          className="chatpage-messages"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {allQuestions.map((question) => (
            <QuestionAndAnswer
              key={question._id}
              type={question.type}
              content={question.content}
            />
          ))}
          {answer && <QuestionAndAnswer type="answer" content={answer} />}
        </div>
        {!allQuestions.length && !answer && (
          <div className="chatpage-main">
            <div className="chatpage-main-logo">
              <img src="/favicon.png" alt="" />
              <h3 className="logo-behind-h3">How can I help you today?</h3>
            </div>
            <div className="chatpage-main-questions">
              <div className="chatpage-main-question-cards">
                <div className="question-card">
                  <h2>
                    <span id="typing-text">Who is EchoAI?</span>
                  </h2>
                  <form onSubmit={submitQuestionHandler}>
                    <button
                      title="ask"
                      onClick={() => {
                        setUserQuestion("Who is EchoAI?");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="aliceblue"
                        height="20"
                        width="20"
                        viewBox="0 0 512 512"
                      >
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                      </svg>
                    </button>
                  </form>
                </div>
                <div className="question-card">
                  <h2>
                    <span id="typing-text">Best Marketing Ideas.</span>
                  </h2>
                  <form onSubmit={submitQuestionHandler}>
                    <button
                      title="ask"
                      onClick={() => {
                        setUserQuestion("Best Marketing Ideas.");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="aliceblue"
                        height="20"
                        width="20"
                        viewBox="0 0 512 512"
                      >
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
              <div className="chatpage-main-question-cards">
                <div className="question-card">
                  <h2>
                    <span id="typing-text">Can Chess be solved?</span>
                  </h2>
                  <form onSubmit={submitQuestionHandler}>
                    <button
                      title="ask"
                      onClick={() => {
                        setUserQuestion("Can Chess be solved?");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="aliceblue"
                        height="20"
                        width="20"
                        viewBox="0 0 512 512"
                      >
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                      </svg>
                    </button>
                  </form>
                </div>
                <div className="question-card">
                  <h2>
                    <span id="typing-text">Best Movies to watch.</span>
                  </h2>
                  <form onSubmit={submitQuestionHandler}>
                    <button
                      title="ask"
                      onClick={() => {
                        setUserQuestion("Best Movies to watch.");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="aliceblue"
                        height="20"
                        width="20"
                        viewBox="0 0 512 512"
                      >
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="chatpage-bottom">
        <form onSubmit={submitQuestionHandler}>
          <input
            value={userQuestion}
            onChange={(e) => {
              setUserQuestion(e.target.value);
            }}
            type="text"
            placeholder={loading ? "" : "ask something..."}
          />
          <div className="chatpage-bottom-svg">
            <button title="Send" disabled={loading}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={theme === "dark" ? "aliceblue" : "#484848"}
                height="20"
                width="20"
                viewBox="0 0 512 512"
              >
                <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
export const getServerSideProps = async (ctx) => {
  const questionId = ctx.params?.chat?.[0] || null;
  if (questionId) {
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("EchoAI");
    const chat = await db.collection("chats").findOne({
      _id: new ObjectId(questionId),
      userId: user.sub,
    });
    return {
      props: {
        questionId,
        title: chat.title,
        questions: chat.questions.map((question) => {
          return {
            ...question,
            _id: uuid(),
          };
        }),
      },
    };
  } else {
    return {
      props: {},
    };
  }
};
