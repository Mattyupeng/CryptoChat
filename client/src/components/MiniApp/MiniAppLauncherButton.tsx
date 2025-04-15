import { useMiniApp } from './MiniAppContext';
import { Grid3x3 } from 'lucide-react';

export function MiniAppLauncherButton() {
  const { toggleLauncher } = useMiniApp();
  
  return (
    <button
      onClick={toggleLauncher}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
      title="Open MiniApps"
    >
      <Grid3x3 className="w-5 h-5 text-app-muted" />
    </button>
  );
}