"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function BlockedUsersDrawer({
  isOpen,
  onClose,
  blockedUsers,
  onUnblock,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = blockedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="h-[80vh] flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-lg font-semibold">
            차단된 사용자
          </DrawerTitle>
          <VisuallyHidden>
            <DrawerDescription></DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="search"
                placeholder="차단된 사용자 검색 중..."
                className="pl-10 pr-4 py-2 w-full h-10 text-sm shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 p-4">
                차단된 사용자가 없습니다.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead className="w-[40%]">Email</TableHead>
                    <TableHead className="w-[20%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onUnblock(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          차단 해제
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        <DrawerFooter className="border-t pt-4">
          <Button onClick={onClose} className="w-full h-10 text-sm">
            닫기
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
