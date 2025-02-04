import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // 添加一个 mounted 状态

  // 确保只在客户端渲染后更新 isOpen 状态
  useEffect(() => {
    setMounted(true); // 客户端渲染时设置为 true
  }, []);

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
    setIsOpen(false);
  };

  // 只有在客户端渲染时才显示组件
  if (!mounted) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
        >
          <Smile size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {isOpen && (
          <Picker
            onEmojiSelect={handleEmojiSelect}
            theme="light"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
