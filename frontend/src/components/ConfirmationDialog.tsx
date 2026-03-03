import { AlertTriangle, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  confirmationRequired?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  variant = 'default',
  confirmationRequired = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={`
                p-3 rounded-full shrink-0
                ${
                  variant === 'destructive'
                    ? 'bg-destructive/10'
                    : 'bg-primary/10'
                }
              `}
            >
              {variant === 'destructive' ? (
                <AlertTriangle className="w-6 h-6 text-destructive" />
              ) : (
                <CheckCircle className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <AlertDialogTitle className="text-left text-xl">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-2 text-base">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        {confirmationRequired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Hành động này không thể hoàn tác
            </p>
          </div>
        )}

        <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90 w-full sm:w-auto'
                : 'w-full sm:w-auto'
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
