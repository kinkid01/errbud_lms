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
  FiX,
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

interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: Props) {
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
    <>
      {/* Mobile backdrop */}
      <Box
        display={{ base: mobileOpen ? "block" : "none", md: "none" }}
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex={199}
        onClick={onMobileClose}
      />

      <Flex
        direction="column"
        h="100vh"
        bg="gray.900"
        w={{ base: "240px", md: collapsed ? "72px" : "240px" }}
        position={{ base: "fixed", md: "relative" }}
        left={{ base: mobileOpen ? "0px" : "-240px", md: "auto" }}
        top={0}
        zIndex={{ base: 200, md: 1 }}
        transition="all 0.2s ease"
        flexShrink={0}
        overflowY="auto"
      >
        {/* Logo */}
        <Flex
          align="center"
          justify="space-between"
          px={collapsed ? 0 : 5}
          py={5}
          borderBottom="1px solid"
          borderColor="gray.700"
          flexShrink={0}
        >
          {!collapsed && (
            <Text fontSize="xl" fontWeight="bold" color="purple.300" letterSpacing="-0.5px">
              Errbud Admin
            </Text>
          )}
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            color="gray.500"
            _hover={{ color: "purple.300", bg: "gray.800" }}
            borderRadius="lg"
            minW="auto"
            p={2}
            display={{ base: "none", md: "flex" }}
          >
            <Icon as={collapsed ? FiChevronRight : FiChevronLeft} boxSize={4} />
          </Button>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            color="gray.500"
            _hover={{ color: "gray.200", bg: "gray.800" }}
            borderRadius="lg"
            minW="auto"
            p={2}
            display={{ base: "flex", md: "none" }}
          >
            <Icon as={FiX} boxSize={4} />
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
                <Link href={item.href} onClick={onMobileClose}>
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
        <Box px={2} pb={4} flexShrink={0}>
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
    </>
  );
}
