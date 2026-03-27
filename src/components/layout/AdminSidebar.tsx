"use client";

import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Button,
  Divider,
  Avatar,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiClipboard,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", icon: FiGrid, href: "/admin" },
  { label: "Users", icon: FiUsers, href: "/admin/users" },
  { label: "Modules", icon: FiBookOpen, href: "/admin/courses" },
  { label: "Exam", icon: FiClipboard, href: "/admin/exam" },
  { label: "Certificates", icon: FiAward, href: "/admin/certificates" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <Flex
      direction="column"
      h="100vh"
      bg="gray.900"
      w={collapsed ? "72px" : "240px"}
      transition="width 0.2s ease"
      flexShrink={0}
    >
      {/* Logo */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px={collapsed ? 0 : 5}
        py={5}
        borderBottom="1px solid"
        borderColor="gray.700"
      >
        {!collapsed && (
          <Text fontSize="xl" fontWeight="bold" color="purple.300" letterSpacing="-0.5px">
            Errbud Admin
          </Text>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          color="gray.500"
          _hover={{ color: "purple.300", bg: "gray.800" }}
          borderRadius="lg"
          minW="auto"
          p={2}
        >
          <Icon as={collapsed ? FiChevronRight : FiChevronLeft} boxSize={4} />
        </Button>
      </Flex>

      {/* Nav Items */}
      <VStack spacing={1} align="stretch" px={2} py={4} flex={1}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Tooltip
              key={item.href}
              label={collapsed ? item.label : ""}
              placement="right"
              hasArrow
            >
              <Link href={item.href}>
                <Flex
                  align="center"
                  gap={3}
                  px={collapsed ? 0 : 3}
                  py={3}
                  borderRadius="xl"
                  justify={collapsed ? "center" : "flex-start"}
                  bg={active ? "purple.600" : "transparent"}
                  color={active ? "white" : "gray.400"}
                  fontWeight={active ? "semibold" : "normal"}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{
                    bg: active ? "purple.600" : "gray.800",
                    color: "white",
                  }}
                >
                  <Icon as={item.icon} boxSize={5} flexShrink={0} />
                  {!collapsed && (
                    <Text fontSize="sm" noOfLines={1}>
                      {item.label}
                    </Text>
                  )}
                </Flex>
              </Link>
            </Tooltip>
          );
        })}
      </VStack>

      {/* Bottom: User + Logout */}
      <Box px={2} pb={4}>
        <Divider mb={4} borderColor="gray.700" />
        <Flex
          align="center"
          gap={3}
          px={collapsed ? 0 : 3}
          py={2}
          justify={collapsed ? "center" : "flex-start"}
        >
          <Avatar size="sm" name={user?.name} bg="purple.500" color="white" flexShrink={0} />
          {!collapsed && (
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <Text fontSize="sm" fontWeight="medium" color="gray.100" noOfLines={1}>
                {user?.name}
              </Text>
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                Administrator
              </Text>
            </VStack>
          )}
        </Flex>
        <Tooltip label={collapsed ? "Logout" : ""} placement="right" hasArrow>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            color="red.400"
            _hover={{ bg: "gray.800", color: "red.300" }}
            borderRadius="xl"
            w="full"
            justifyContent={collapsed ? "center" : "flex-start"}
            mt={1}
          >
            {collapsed ? (
              <Icon as={FiLogOut} />
            ) : (
              <Flex align="center" gap={2}>
                <Icon as={FiLogOut} />
                <Text fontSize="sm">Logout</Text>
              </Flex>
            )}
          </Button>
        </Tooltip>
      </Box>
    </Flex>
  );
}
