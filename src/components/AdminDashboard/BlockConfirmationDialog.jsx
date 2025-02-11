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
            블록 {memberName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            {memberName}를 차단하시겠습니까?
            <br />
            이렇게 하면 해당 회원이 플랫폼에 접근할 수 없습니다."
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="w-full h-10 sm:w-auto mt-2 sm:mt-0 rounded-md">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto h-10 bg-red-600 hover:bg-red-700 rounded-md"
          >
            차단 회원
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
