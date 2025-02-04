import { BanIcon, EditIcon, MessageSquareIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MessageDrawer } from "./MessageDrawer";
import { EditMemberDrawer } from "./EditMemberDrawer";
import { BlockConfirmationDialog } from "./BlockConfirmationDialog";
import { BlockedUsersDrawer } from "./BlockedUsersDrawer";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function MemberManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isBlockedUsersDrawerOpen, setIsBlockedUsersDrawerOpen] =
    useState(false);
  const [userRole, setUserRole] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, membership_level, is_blocked");

      if (error) throw error;

      setMembers(data.filter((member) => !member.is_blocked));
      setBlockedUsers(data.filter((member) => member.is_blocked));
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchMembers();
      await checkUserRole();
      setIsLoading(false);
    };
    fetchData();
  }, [fetchMembers]);

  const checkUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error.message);
      } else {
        setUserRole(data.role);
        console.log("User role fetched:", data.role);
      }
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setIsEditDrawerOpen(true);
  };

  const handleMessageClick = (member) => {
    setSelectedMember(member);
    setIsMessageDrawerOpen(true);
  };

  const handleBlockClick = (member) => {
    setSelectedMember(member);
    setIsBlockDialogOpen(true);
  };

  const handleUpdateMember = async (updatedMember) => {
    console.log("Received updated member:", updatedMember);
    if (updatedMember && updatedMember.id) {
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === updatedMember.id
            ? { ...member, ...updatedMember }
            : member
        )
      );
      await fetchMembers(); // Refresh the list to ensure we have the latest data
    } else {
      console.error("Invalid updatedMember object:", updatedMember);
    }
  };

  const handleBlockMember = async () => {
    if (selectedMember) {
      try {
        const { error } = await supabase
          .from("users")
          .update({ is_blocked: true })
          .eq("id", selectedMember.id);

        if (error) throw error;

        toast.success(`${selectedMember.name} has been blocked`);
        setIsBlockDialogOpen(false);
        await fetchMembers();
      } catch (error) {
        console.error("Error blocking member:", error);
        toast.error("Failed to block member");
      }
    }
  };

  const handleUnblockMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_blocked: false })
        .eq("id", memberId);

      if (error) throw error;

      toast.success("User has been unblocked");
      await fetchMembers();
    } catch (error) {
      console.error("Error unblocking member:", error);
      toast.error("Failed to unblock member");
    }
  };

  const handleSendMessage = (name, message) => {
    console.log(`Sending message to ${name}: ${message}`);
  };

  if (isLoading) {
    return <div className="p-4 h-full">Loading...</div>;
  }

  if (userRole !== "admin" && userRole !== "super_admin") {
    return (
      <div className="p-4 h-full">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Input
          type="search"
          placeholder="Search Members..."
          className="border border-gray-300 h-10 w-full text-sm shadow-none rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          onClick={() => setIsBlockedUsersDrawerOpen(true)}
          variant="outline"
          className="bg-white hover:bg-gray-100 text-xs px-2 py-1 flex items-center gap-1 h-10"
        >
          <span>Blocked Users</span>
          <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
            {blockedUsers.length}
          </span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Name
              </TableHead>

              <TableHead className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Membership
              </TableHead>
              <TableHead className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedMembers.map((member) => (
              <TableRow
                key={member.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                <TableCell className="py-3 px-2 border-r">
                  <span
                    className="truncate max-w-[125px] block"
                    title="{member.name}"
                  >
                    {member.name}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 border-r text-center">
                  {member.membership_level}
                </TableCell>
                <TableCell className="py-3 px-2">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(member)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-full"
                    >
                      <EditIcon className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageClick(member)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full"
                    >
                      <MessageSquareIcon className="w-4 h-4" />
                      <span className="sr-only">Message</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBlockClick(member)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full"
                    >
                      <BanIcon className="w-4 h-4" />
                      <span className="sr-only">Block</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <EditMemberDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        member={selectedMember}
        onUpdate={handleUpdateMember}
        onBlock={handleBlockMember}
      />

      <MessageDrawer
        isOpen={isMessageDrawerOpen}
        onClose={() => setIsMessageDrawerOpen(false)}
        initialName={selectedMember?.name || ""}
        recipientId={selectedMember?.id}
      />

      <BlockConfirmationDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        onConfirm={handleBlockMember}
        memberName={selectedMember?.name || ""}
      />
      <BlockedUsersDrawer
        isOpen={isBlockedUsersDrawerOpen}
        onClose={() => setIsBlockedUsersDrawerOpen(false)}
        blockedUsers={blockedUsers}
        onUnblock={handleUnblockMember}
      />
    </div>
  );
}
