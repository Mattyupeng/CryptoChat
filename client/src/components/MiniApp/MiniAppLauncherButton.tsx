import { useMiniApp } from './MiniAppContext';
// Using ri-apps-line icon from Remix icon set

interface MiniAppLauncherButtonProps {
  onClick?: () => void;
}

export function MiniAppLauncherButton({ onClick }: MiniAppLauncherButtonProps) {
  const { toggleLauncher } = useMiniApp();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleLauncher();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
      title="Open MiniApps"
    >
      <i className="ri-apps-line text-lg text-app-muted"></i>
    </button>
  );
}