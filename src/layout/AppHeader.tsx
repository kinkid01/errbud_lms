"use client";
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  useColorModeValue,
  Heading,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Badge,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiSettings,
  FiLogOut,
  FiUser,
  FiLock,
} from "react-icons/fi";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isOpen: isNotificationOpen, onToggle: onNotificationToggle } = useDisclosure();
  const { isOpen: isProfileOpen, onToggle: onProfileToggle } = useDisclosure();

  const headerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      w="full"
      bg={headerBg}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex={40}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="center"
        justify="space-between"
        w="full"
        px={{ base: 4, lg: 6 }}
        py={{ base: 3, lg: 4 }}
        gap={4}
      >
        {/* Left Section */}
        <Flex align="center" gap={4} w={{ base: "full", lg: "auto" }}>
          {/* Mobile Menu Toggle */}
          <IconButton
            aria-label="Toggle Sidebar"
            icon={isMobileOpen ? <FiX /> : <FiMenu />}
            onClick={handleToggle}
            variant="ghost"
            size="md"
            display={{ base: "flex", lg: "flex" }}
          />

          {/* Mobile Logo */}
          {/* <Link href="/" display={{ base: "block", lg: "none" }}>
            <Image
              width={40}
              height={40}
              src="/images/logo/og-image.png"
              alt="errbudE-Learning Logo"
            />
          </Link> */}

          {/* Search Bar - Desktop */}
          <InputGroup
            maxW={{ base: "full", lg: "430px" }}
            display={{ base: "none", lg: "block" }}
          >
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search courses, topics..."
              bg={inputBg}
              borderRadius="lg"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px blue.500",
              }}
            />
            <InputRightElement width="auto">
              <Button
                size="xs"
                variant="ghost"
                fontSize="xs"
                fontWeight="medium"
                px={2}
                py={1}
                borderRadius="md"
              >
                <Text as="span" mr={1}>⌘</Text>
                <Text as="span">K</Text>
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>

        {/* Right Section */}
        <Flex
          align="center"
          gap={3}
          w={{ base: "full", lg: "auto" }}
          justify={{ base: "space-between", lg: "flex-end" }}
        >
          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Application Menu"
            icon={<FiMenu />}
            onClick={toggleApplicationMenu}
            variant="ghost"
            size="md"
            display={{ base: "flex", lg: "none" }}
          />

          {/* Desktop Actions */}
          <HStack spacing={3} display={{ base: "none", lg: "flex" }}>
            {/* Theme Toggle */}
            <ThemeToggleButton />

            {/* Notifications */}
            <Menu isOpen={isNotificationOpen} onOpen={onNotificationToggle} onClose={onNotificationToggle}>
              <MenuButton
                as={IconButton}
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                size="md"
                position="relative"
              >
                <Badge
                  position="absolute"
                  top={-1}
                  right={-1}
                  colorScheme="red"
                  borderRadius="full"
                  boxSize={3}
                />
              </MenuButton>
              <MenuList>
                <MenuItem>
                  <HStack>
                    <FiBell />
                    <Text>New course available</Text>
                  </HStack>
                </MenuItem>
                <MenuItem>
                  <HStack>
                    <FiBell />
                    <Text>Quiz reminder</Text>
                  </HStack>
                </MenuItem>
                <Divider />
                <MenuItem>
                  <Text fontSize="sm" color="gray.600">
                    View all notifications
                  </Text>
                </MenuItem>
              </MenuList>
            </Menu>

            {/* User Profile */}
            <Menu isOpen={isProfileOpen} onOpen={onProfileToggle} onClose={onProfileToggle}>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                px={2}
                py={1}
                borderRadius="lg"
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name="John Doe"
                    src="https://bit.ly/broken-link"
                  />
                  <Text display={{ base: "none", md: "block" }}>John Doe</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>
                  <HStack>
                    <Avatar size="sm" name="John Doe" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">John Doe</Text>
                      <Text fontSize="xs" color="gray.600">
                        john.doe@example.com
                      </Text>
                    </VStack>
                  </HStack>
                </MenuItem>
                <Divider />
                <MenuItem>
                  <HStack>
                    <FiSettings />
                    <Text>Settings</Text>
                  </HStack>
                </MenuItem>
                <MenuItem as={Link} href="/change-password">
                  <HStack>
                    <FiLock />
                    <Text>Change Password</Text>
                  </HStack>
                </MenuItem>
                <Divider />
                <MenuItem>
                  <HStack>
                    <FiLogOut />
                    <Text>Logout</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Mobile Actions */}
          {isApplicationMenuOpen && (
            <HStack spacing={3} display={{ base: "flex", lg: "none" }}>
              <ThemeToggleButton />
            </HStack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AppHeader;
