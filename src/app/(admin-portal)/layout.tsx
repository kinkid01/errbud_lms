"use client";

import { Flex, Box, Icon, Button, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user?.role === "student" ? "/dashboard" : "/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <Flex h="100vh" overflow="hidden">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Flex flex={1} direction="column" overflow="hidden" bg="gray.50">
        {/* Mobile top header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          align="center"
          h="56px"
          px={4}
          bg="gray.900"
          borderBottom="1px solid"
          borderColor="gray.700"
          flexShrink={0}
          gap={3}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            p={2}
            borderRadius="lg"
            color="gray.400"
            _hover={{ bg: "gray.800", color: "white" }}
            minW="auto"
          >
            <Icon as={FiMenu} boxSize={5} />
          </Button>
          <Text fontSize="xl" fontWeight="bold" color="purple.300" letterSpacing="-0.5px">
            Errbud Admin
          </Text>
        </Flex>

        <Flex flex={1} direction="column" overflow="auto" bg="gray.50">
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}
