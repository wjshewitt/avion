'use client';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  conversationTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ 
  isOpen, 
  conversationTitle, 
  onConfirm, 
  onCancel 
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-50"
        onClick={onCancel}
      />
      
      {/* Dialog - Dieter Rams: straight edges, no shadows, minimal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border-2 border-border w-full max-w-md">
        <div className="p-6">
          <div className="text-sm font-semibold text-foreground mb-2">
            Delete Conversation
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            "{conversationTitle}"
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            This action cannot be undone.
          </div>
        </div>
        
        {/* Actions - straight line separator */}
        <div className="border-t border-border flex">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-r border-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm text-red hover:bg-red/10 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
