import { Message } from "@/types";
import { IconUser, IconRobot } from "@tabler/icons-react";

interface Props {
  message: Message;
}

export const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 px-2`}>
      {/* AI 头像 */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 shrink-0">
          <span className="text-sm">👨‍🍳</span>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[#FF6B6B] text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
        }`}
      >
        {message.content}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 shrink-0">
          <IconUser size={16} className="text-gray-500" />
        </div>
      )}
    </div>
  );
};