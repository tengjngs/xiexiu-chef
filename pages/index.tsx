import { Chat } from "@/components/Chat/Chat";
import { ChatInput } from "@/components/Chat/ChatInput";
import { Footer } from "@/components/Layout/Footer";
import { Message } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: updatedMessages
      })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: chunkValue
          }
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  // 专门给 ChatInput 用的包装函数：把字符串转成 Message
  const handleSendFromInput = (text: string) => {
    handleSend({ role: "user", content: text });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `我是邪修大厨。冰箱里有啥？丢给我，我给你整三个离谱但好吃的方案。`
      }
    ]);
  }, []);

  return (
    <>
      <Head>
        <title>邪修大厨</title>
        <meta name="description" content="冰箱剩菜的第二人生" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen bg-[#FAFAFA]">
        <div className="flex-1 overflow-hidden sm:px-10 py-4 sm:py-8">
          <div className="max-w-[800px] mx-auto h-full flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Chat
                messages={messages}
                loading={loading}
              />
            </div>
            <div className="border-t border-neutral-100">
              <ChatInput onSend={handleSendFromInput} />
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}