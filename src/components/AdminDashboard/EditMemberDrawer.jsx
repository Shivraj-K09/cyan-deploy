import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";

const membershipLevels = ["Free", "Paid", "Gold", "Supporter"];

export function EditMemberDrawer({ isOpen, onClose, member, onUpdate }) {
  const [editedMember, setEditedMember] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      console.log("Setting initial editedMember:", member);
      setEditedMember({ ...member });
    }
  }, [isOpen, member]);

  const handleClose = () => {
    console.log("Closing drawer");
    setEditedMember(null);
    onClose();
  };

  const handleUpdate = async () => {
    if (!editedMember) {
      console.error("No editedMember to update");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        throw new Error(`Failed to fetch user role: ${userError.message}`);
      }

      console.log("Current user role:", userData.role);

      setIsUpdating(true);
      console.log("Starting update for member:", editedMember);

      // First, let's check if we can read the user data
      const { data: userData2, error: readError } = await supabase
        .from("users")
        .select("*")
        .eq("id", editedMember.id)
        .single();

      if (readError) {
        console.error("Error reading user data:", readError);
        throw new Error(`Failed to read user data: ${readError.message}`);
      }

      console.log("Current user data:", userData2);

      // Now, let's perform the update
      console.log("Attempting to update user:", editedMember.id);
      console.log("Current user ID:", user.id);
      console.log("Current user role:", userData.role);
      console.log("New membership level:", editedMember.membership_level);
      let { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ membership_level: editedMember.membership_level })
        .eq("id", editedMember.id)
        .select();
      console.log("Update operation result:", {
        data: updateData,
        error: updateError,
      });

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Failed to update user: ${updateError.message}`);
      }

      console.log("Supabase update response:", updateData);

      if (!updateData || updateData.length === 0) {
        // If no data is returned, let's fetch the user data again to confirm the update
        const { data: verifyData, error: verifyError } = await supabase
          .from("users")
          .select("*")
          .eq("id", editedMember.id)
          .single();

        if (verifyError) {
          console.error("Error verifying update:", verifyError);
          throw new Error(`Failed to verify update: ${verifyError.message}`);
        }

        console.log("Verified user data after update:", verifyData);

        if (verifyData.membership_level !== editedMember.membership_level) {
          console.error("Membership level mismatch:", {
            expected: editedMember.membership_level,
            actual: verifyData.membership_level,
          });
          throw new Error(
            "Update verification failed - membership level mismatch"
          );
        }

        updateData = [verifyData];
      }

      const updatedUser = updateData[0];
      console.log("Member updated successfully:", updatedUser);
      toast.success("Member updated successfully");
      onUpdate(updatedUser);
      handleClose();
    } catch (error) {
      console.error("Error in update process:", error);
      toast.error(`Failed to update member: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !editedMember) return null;

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-lg font-semibold">
            회원 편집 {editedMember.name}
          </DrawerTitle>
          <VisuallyHidden>
            <DrawerDescription></DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              이름
            </Label>
            <Input
              id="name"
              value={editedMember.name}
              readOnly
              className="w-full text-sm h-10 pointer-events-none shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              이메일
            </Label>
            <Input
              id="name"
              value={editedMember.email}
              readOnly
              className="w-full text-sm h-10 pointer-events-none shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              회원등급
            </Label>
            <Select
              value={editedMember.membership_level}
              onValueChange={(value) => {
                console.log("Changing membership level to:", value);
                setEditedMember((prev) => ({
                  ...prev,
                  membership_level: value,
                }));
              }}
            >
              <SelectTrigger className="w-full h-10 shadow-none">
                <SelectValue placeholder="Select membership level" />
              </SelectTrigger>
              <SelectContent>
                {membershipLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button className="text-sm" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button
              className="text-sm"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "업데이트 중..." : "변경 사항 저장"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
