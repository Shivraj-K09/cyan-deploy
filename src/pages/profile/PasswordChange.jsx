import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const PasswordChanage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password change logic here
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/profile-settings" className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          비밀번호
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6">
        <div className="mt-8">
          <h2 className="text-base font-bold mb-2">현재 비밀번호</h2>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border-0 border-b border-gray-200 rounded-none px-0 h-12 text-sm tracking-[0.2em] shadow-none focus-visible:ring-0 focus-visible:border-black"
            placeholder="● ● ● ● ● ● ● ●"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-base font-bold mb-2">새 비밀번호</h2>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-0 border-b border-gray-200 rounded-none px-0 h-12 text-sm tracking-[0.2em] shadow-none focus-visible:ring-0 focus-visible:border-black"
            placeholder="● ● ● ● ● ● ● ●"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-base font-bold mb-2">새 비밀번호 확인</h2>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-0 border-b border-gray-200 rounded-none px-0 h-12 text-sm tracking-[0.2em] shadow-none focus-visible:ring-0 focus-visible:border-black"
            placeholder="● ● ● ● ● ● ● ●"
          />
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center">
          <Button
            type="submit"
            className="w-48 h-14 bg-[#008C1F] hover:bg-[#007819] text-white rounded-lg text-base font-medium"
          >
            변경완료
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChanage;
