import { useTranslation } from '../hooks/useTranslation'

interface TopicCardProps {
  topic: string;
  colors: {
    border: string;
    glow: string;
  };
  sizeClass: string;
  onClick: () => void;
  onMouseEnter?: () => void;
}

export default function TopicCard({ topic, colors, sizeClass, onClick, onMouseEnter }: TopicCardProps) {
  const { t } = useTranslation()
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group relative p-6 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-2xl border-2 
                transition-all cursor-pointer shadow-sm
                hover:shadow-[0_8px_32px_var(--glow)] ${sizeClass}
                hover:transform hover:scale-[1.02] duration-300 hover-lift`}
      style={{
        borderColor: colors.border,
        '--glow': colors.glow,
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--glow)] blur-xl" />
      
      <div className="relative flex flex-col items-center justify-center h-full">
        <div className="text-center font-semibold text-[17px] text-gray-800 dark:text-gray-200 group-hover:scale-105 transition-transform">
          {topic}
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {t('clickToEnterDiscussion')}
        </div>
      </div>
    </div>
  );
}
