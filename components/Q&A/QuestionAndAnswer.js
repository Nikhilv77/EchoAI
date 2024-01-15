import { useUser } from "@auth0/nextjs-auth0/client";
import ReactMarkdown from "react-markdown";
import React from "react";
import Image from "next/image";

export const QuestionAndAnswer = React.memo(({ type, content }) => {
  const { user } = useUser();

  return (
    <div className={type === 'question' ? 'chat-section' : 'chat-section-answer'}>
      <div className="QorA">
        {type === 'question' && user && (
          <div className="question">
            <Image src={user.picture} alt="" />
            <span>{user.name}</span>
          </div>
        )}
        {type === 'answer' && (
          <div className="answer">
            <Image src='/favicon.png' alt="" />
            <span>EchoAI</span>
          </div>
        )}
        <div className={type === 'answer' ? "answer-content answer-content-margin" : "answer-content"}>
          <ReactMarkdown className="">
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.content === nextProps.content;
});
