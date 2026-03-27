"use client";

import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StudentSidebar from "@/components/layout/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.replace(user?.role === "admin" ? "/admin" : "/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "student") return null;

  return (
    <Flex h="100vh" overflow="hidden">
      <StudentSidebar />
      <Flex flex={1} direction="column" overflow="auto" bg="gray.50">
        {children}
      </Flex>
    </Flex>
  );
}
