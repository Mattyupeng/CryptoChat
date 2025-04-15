import { useMiniApp } from './MiniAppContext';
import { MiniAppCard as MiniAppCardType } from './MiniAppData';

interface MiniAppCardProps {
  card: MiniAppCardType;
  isSelf: boolean;
}

export function MiniAppCardComponent({ card, isSelf }: MiniAppCardProps) {
  const { openMiniApp } = useMiniApp();
  
  const handleOpenApp = () => {
    openMiniApp(card.appId);
  };
  
  return (
    <div 
      className={`flex flex-col rounded-lg border border-app-border bg-app-surface/75 backdrop-blur-sm overflow-hidden
        shadow-sm hover:shadow transition max-w-xs ${isSelf ? 'ml-auto' : 'mr-auto'}`}
    >
      {/* Card thumbnail */}
      <div className="w-full h-32 bg-app-hover flex items-center justify-center">
        {card.thumbnail.startsWith('ri-') ? (
          <i className={`${card.thumbnail} text-5xl text-primary`}></i>
        ) : (
          <img 
            src={card.thumbnail} 
            alt={card.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Card content */}
      <div className="p-3">
        <h3 className="font-medium">{card.title}</h3>
        <p className="text-xs text-app-muted mt-1 line-clamp-2">{card.description}</p>
        
        {/* CTA button */}
        <button
          onClick={handleOpenApp}
          className="mt-3 w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition"
        >
          {card.ctaText || 'Open'}
        </button>
      </div>
    </div>
  );
}