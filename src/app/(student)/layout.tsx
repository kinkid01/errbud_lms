"use client";

import { Flex, Box, Icon, Button, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StudentSidebar from "@/components/layout/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.replace(user?.role === "admin" ? "/admin" : "/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "student") return null;

  return (
    <Flex h="100vh" overflow="hidden">
      <StudentSidebar
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
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.100"
          flexShrink={0}
          gap={3}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            p={2}
            borderRadius="lg"
            color="gray.500"
            _hover={{ bg: "gray.50", color: "gray.700" }}
            minW="auto"
          >
            <Icon as={FiMenu} boxSize={5} />
          </Button>
          <Text fontSize="xl" fontWeight="bold" color="blue.600" letterSpacing="-0.5px">
            Errbud
          </Text>
        </Flex>

        <Flex flex={1} direction="column" overflow="auto">
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}
