"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Icon,
  Card,
  CardBody,
  Avatar,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Badge,
} from "@chakra-ui/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiEdit2,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  // ── Profile form ───────────────────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password form ──────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setProfileLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setEditingProfile(false);
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch {
      toast({
        title: "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setEditingProfile(false);
  };

  const handleChangePassword = async () => {
    setPwError("");

    if (!currentPw || !newPw || !confirmPw) {
      setPwError("Please fill in all password fields.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast({
        title: "Password changed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} w="full">
      <VStack spacing={6} align="stretch">
        {/* Page title */}
        <Box>
          <Heading size="lg" color="gray.800">
            My Profile
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Manage your personal information and security settings.
          </Text>
        </Box>

        {/* ── Single card ── */}
        <Card borderRadius="2xl" boxShadow="sm">
          <CardBody p={0}>
            {/* Avatar header */}
            <Box
              h="90px"
              bgGradient="linear(to-r, blue.400, blue.600)"
              borderTopRadius="2xl"
            />
            <Box px={6} pb={8}>
              <HStack justify="space-between" align="flex-end" mt="-40px" mb={6}>
                <Avatar
                  size="xl"
                  name={user?.name}
                  bg="white"
                  color="blue.500"
                  border="4px solid white"
                  boxShadow="md"
                  fontSize="2xl"
                />
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  Student
                </Badge>
              </HStack>

              <VStack spacing={4} align="stretch">
                {/* Name */}
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Full Name
                  </FormLabel>
                  {editingProfile ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                      placeholder="Your full name"
                    />
                  ) : (
                    <HStack spacing={3} py={2}>
                      <Icon as={FiUser} color="gray.400" boxSize={4} />
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {user?.name || "—"}
                      </Text>
                    </HStack>
                  )}
                </FormControl>

                {/* Email (read-only) */}
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Email Address
                  </FormLabel>
                  <HStack spacing={3} py={2}>
                    <Icon as={FiMail} color="gray.400" boxSize={4} />
                    <Text fontSize="sm" color="gray.700">
                      {user?.email}
                    </Text>
                    <Badge colorScheme="gray" borderRadius="full" fontSize="10px">
                      Cannot change
                    </Badge>
                  </HStack>
                </FormControl>

                {/* Phone */}
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Phone Number
                  </FormLabel>
                  {editingProfile ? (
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                      placeholder="+44 7700 900000"
                      type="tel"
                    />
                  ) : (
                    <HStack spacing={3} py={2}>
                      <Icon as={FiPhone} color="gray.400" boxSize={4} />
                      <Text fontSize="sm" color={user?.phone ? "gray.700" : "gray.400"}>
                        {user?.phone || "Not set"}
                      </Text>
                    </HStack>
                  )}
                </FormControl>

                {/* Profile action buttons */}
                {editingProfile ? (
                  <HStack spacing={3}>
                    <Button
                      colorScheme="blue"
                      borderRadius="xl"
                      leftIcon={<FiSave />}
                      onClick={handleSaveProfile}
                      isLoading={profileLoading}
                      loadingText="Saving…"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      borderRadius="xl"
                      onClick={handleCancelEdit}
                      isDisabled={profileLoading}
                    >
                      Cancel
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    borderRadius="xl"
                    leftIcon={<FiEdit2 />}
                    alignSelf="flex-start"
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                )}

                <Divider />

                {/* Change password section */}
                <HStack spacing={3}>
                  <Box
                    w="36px"
                    h="36px"
                    borderRadius="lg"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={FiLock} color="blue.500" boxSize={4} />
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                      Change Password
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Use a strong password you don&apos;t use elsewhere.
                    </Text>
                  </Box>
                </HStack>

                {/* Current password */}
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">
                    Current Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                      placeholder="Enter current password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="toggle visibility"
                        icon={<Icon as={showCurrent ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrent((p) => !p)}
                        color="gray.400"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* New password */}
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">
                    New Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                      placeholder="Min. 6 characters"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="toggle visibility"
                        icon={<Icon as={showNew ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNew((p) => !p)}
                        color="gray.400"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Confirm new password */}
                <FormControl isInvalid={!!pwError}>
                  <FormLabel fontSize="sm" color="gray.600">
                    Confirm New Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                      placeholder="Repeat new password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="toggle visibility"
                        icon={<Icon as={showConfirm ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirm((p) => !p)}
                        color="gray.400"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {pwError && <FormErrorMessage>{pwError}</FormErrorMessage>}
                </FormControl>

                <Button
                  colorScheme="blue"
                  borderRadius="xl"
                  leftIcon={<FiLock />}
                  alignSelf="flex-start"
                  onClick={handleChangePassword}
                  isLoading={pwLoading}
                  loadingText="Updating…"
                >
                  Update Password
                </Button>
              </VStack>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
