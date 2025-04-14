import { Button } from '@/components/ui/button';

export default function ChatPlaceholder() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-dark-bg text-center">
      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
        <div className="text-4xl text-primary">💬</div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">Hushline</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Select a conversation from the sidebar or start a new chat by adding a contact.
      </p>
      <div className="max-w-xs w-full">
        <Button 
          className="w-full bg-primary hover:bg-primary-hover py-2 px-4 rounded-xl font-medium"
        >
          Create New Chat
        </Button>
      </div>
    </div>
  );
}