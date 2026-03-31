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
  FiBookOpen,
  FiFileText,
  FiAward,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", icon: FiGrid, href: "/dashboard" },
  { label: "Modules", icon: FiBookOpen, href: "/courses" },
  { label: "Final Exam", icon: FiFileText, href: "/final-exam" },
  { label: "Certificate", icon: FiAward, href: "/certificate" },
  { label: "My Profile", icon: FiUser, href: "/profile" },
];

interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function StudentSidebar({ mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
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
        bg="white"
        borderRight="1px solid"
        borderColor="gray.100"
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
          borderColor="gray.100"
          flexShrink={0}
        >
          {!collapsed && (
            <Text fontSize="xl" fontWeight="bold" color="blue.600" letterSpacing="-0.5px">
              Errbud
            </Text>
          )}
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            color="gray.400"
            _hover={{ color: "blue.500", bg: "blue.50" }}
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
            color="gray.400"
            _hover={{ color: "gray.700", bg: "gray.50" }}
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
                    bg={active ? "blue.50" : "transparent"}
                    color={active ? "blue.600" : "gray.500"}
                    fontWeight={active ? "semibold" : "normal"}
                    cursor="pointer"
                    transition="all 0.15s"
                    _hover={{
                      bg: active ? "blue.50" : "gray.50",
                      color: active ? "blue.600" : "gray.700",
                    }}
                  >
                    <Icon as={item.icon} boxSize={5} flexShrink={0} />
                    {!collapsed && (
                      <Text fontSize="sm" noOfLines={1}>
                        {item.label}
                      </Text>
                    )}
                    {active && !collapsed && (
                      <Box
                        ml="auto"
                        w="4px"
                        h="4px"
                        borderRadius="full"
                        bg="blue.500"
                      />
                    )}
                  </Flex>
                </Link>
              </Tooltip>
            );
          })}
        </VStack>

        {/* Bottom: User + Logout */}
        <Box px={2} pb={4} flexShrink={0}>
          <Divider mb={4} />
          <Flex
            align="center"
            gap={3}
            px={collapsed ? 0 : 3}
            py={2}
            justify={collapsed ? "center" : "flex-start"}
          >
            <Avatar size="sm" name={user?.name} bg="blue.500" color="white" flexShrink={0} />
            {!collapsed && (
              <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="medium" color="gray.800" noOfLines={1}>
                  {user?.name}
                </Text>
                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                  Student
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
              _hover={{ bg: "red.50", color: "red.500" }}
              borderRadius="xl"
              w="full"
              justifyContent={collapsed ? "center" : "flex-start"}
              leftIcon={collapsed ? undefined : <Icon as={FiLogOut} />}
              mt={1}
            >
              {collapsed ? (
                <Icon as={FiLogOut} />
              ) : (
                <Text fontSize="sm">Logout</Text>
              )}
            </Button>
          </Tooltip>
        </Box>
      </Flex>
    </>
  );
}
