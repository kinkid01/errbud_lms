"use client";

import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user?.role === "student" ? "/dashboard" : "/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <Flex h="100vh" overflow="hidden">
      <AdminSidebar />
      <Flex flex={1} direction="column" overflow="auto" bg="gray.50">
        {children}
      </Flex>
    </Flex>
  );
}
