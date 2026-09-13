import { IconSend } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  loading?: boolean;
}

export const ChatInput = ({ onSend, loading }: Props) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3">
      <div className="max-w-2xl mx-auto flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="冰箱里有啥？丢给我，邪修一下"
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF6B6B]/30"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <IconSend size={18} />
        </button>
      </div>
    </div>
  );
};