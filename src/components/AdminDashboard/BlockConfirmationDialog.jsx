import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function BlockConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  memberName,
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-[425px] rounded-lg overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-red-600">
            Block {memberName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            Are you sure you want to block {memberName}?
            <br />
            This will prevent the member from accessing the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="w-full h-10 sm:w-auto mt-2 sm:mt-0 rounded-md">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto h-10 bg-red-600 hover:bg-red-700 rounded-md"
          >
            Block Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
