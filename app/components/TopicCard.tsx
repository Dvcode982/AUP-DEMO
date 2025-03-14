import Link from 'next/link';

interface TopicCardProps {
  topic: string;
  colors: {
    border: string;
    glow: string;
  };
  sizeClass: string;
  fontSize?: string; // 添加可选的字体大小属性
}

export default function TopicCard({ topic, colors, sizeClass, fontSize = "text-[30px]" }: TopicCardProps) {
  return (
    <Link href={`/topic-block/${encodeURIComponent(topic)}`}>
      <div
        className={`group relative p-6 bg-[#1A1A1A] rounded-2xl border-2 
                  transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.25)]
                  hover:shadow-[0_8px_32px_var(--glow)] ${sizeClass}
                  hover:transform hover:scale-[1.02] duration-300`}
        style={{
          borderColor: colors.border,
          '--glow': colors.glow,
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--glow)] blur-xl" />
        
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className={`text-center font-semibold ${fontSize} group-hover:scale-105 transition-transform break-words w-full`}>
            {topic}
          </div>
          <div className="text-[12px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
            点击进入讨论
          </div>
        </div>
      </div>
    </Link>
  );
}