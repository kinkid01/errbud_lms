"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Button,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  AvatarBadge,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiSettings,
  FiEdit,
  FiCamera,
  FiLock,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminProfile() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { isOpen: isProfileModalOpen, onOpen: onProfileModalOpen, onClose: onProfileModalClose } = useDisclosure();
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUpdatingProfile(true);
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onProfileModalOpen();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Failed to update profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All password fields are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New password and confirmation do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (profileData.newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      onPasswordModalClose();
    } catch (error) {
      toast({
        title: "Error changing password",
        description: "Failed to change password. Please check your current password.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileFieldChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="center">
          <Text>Loading profile...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Admin Profile</Heading>
          <Text color="gray.600">Manage your profile information and security settings</Text>
        </Box>

        {/* Profile Overview */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <HStack spacing={6}>
                {/* Avatar */}
                <VStack spacing={2}>
                  <Avatar
                    size="2xl"
                    name={profileData.name}
                    src={profileData.avatar}
                    border="4px"
                    borderColor="blue.500"
                  >
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                  <Button
                    leftIcon={<FiCamera />}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                  >
                    Change Photo
                  </Button>
                </VStack>

                {/* Profile Info */}
                <VStack align="start" spacing={3} flex={1}>
                  <Heading size="md">{profileData.name}</Heading>
                  <HStack spacing={2}>
                    <Icon as={FiMail} color="gray.400" />
                    <Text color="gray.600">{profileData.email}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="gray.400" />
                    <Text color="gray.600">
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiSettings} color="gray.400" />
                    <Badge colorScheme="blue">Administrator</Badge>
                  </HStack>
                </VStack>

                {/* Actions */}
                <VStack spacing={2}>
                  <Button
                    leftIcon={<FiEdit />}
                    colorScheme="blue"
                    onClick={onProfileModalOpen}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    leftIcon={<FiLock />}
                    colorScheme="orange"
                    variant="outline"
                    onClick={onPasswordModalOpen}
                  >
                    Change Password
                  </Button>
                </VStack>
              </HStack>

              <Divider />

              {/* Account Stats */}
              <HStack spacing={6}>
                <Stat>
                  <StatLabel fontSize="sm">Account Type</StatLabel>
                  <StatNumber fontSize="lg">Admin</StatNumber>
                  <StatHelpText fontSize="xs">Full access</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel fontSize="sm">Account Status</StatLabel>
                  <StatNumber fontSize="lg">Active</StatNumber>
                  <StatHelpText fontSize="xs">All systems operational</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel fontSize="sm">Last Login</StatLabel>
                  <StatNumber fontSize="lg">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Today"}
                  </StatNumber>
                  <StatHelpText fontSize="xs">Most recent activity</StatHelpText>
                </Stat>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={6}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Security Settings</Heading>
              
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Email Address</Text>
                    <Text fontSize="sm" color="gray.600">{profileData.email}</Text>
                  </VStack>
                  <Button size="sm" variant="outline">
                    Change Email
                  </Button>
                </HStack>

                <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Password</Text>
                    <Text fontSize="sm" color="gray.600">Last changed recently</Text>
                  </VStack>
                  <Button size="sm" variant="outline" onClick={onPasswordModalOpen}>
                    Change Password
                  </Button>
                </HStack>

                <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="gray.600">Not enabled</Text>
                  </VStack>
                  <Button size="sm" colorScheme="green" variant="outline">
                    Enable 2FA
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Edit Profile Modal */}
        <Modal isOpen={isProfileModalOpen} onClose={onProfileModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleUpdateProfile}>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={profileData.name}
                      onChange={(e) => handleProfileFieldChange("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileFieldChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <Input
                      value={profileData.avatar}
                      onChange={(e) => handleProfileFieldChange("avatar", e.target.value)}
                      placeholder="Enter profile picture URL (optional)"
                    />
                  </FormControl>

                  {profileData.avatar && (
                    <Box textAlign="center">
                      <Avatar
                        size="lg"
                        name={profileData.name}
                        src={profileData.avatar}
                        border="2px"
                        borderColor="blue.500"
                      />
                    </Box>
                  )}
                </VStack>
              </ModalBody>

              <ModalFooter>
                <HStack spacing={3}>
                  <Button variant="outline" onClick={onProfileModalClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isUpdatingProfile}
                    loadingText="Updating..."
                  >
                    Update Profile
                  </Button>
                </HStack>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Change Password Modal */}
        <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Change Password</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleChangePassword}>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => handleProfileFieldChange("currentPassword", e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => handleProfileFieldChange("newPassword", e.target.value)}
                      placeholder="Enter your new password"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => handleProfileFieldChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your new password"
                    />
                  </FormControl>

                  <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.800">
                      <strong>Password Requirements:</strong>
                      <br />
                      • At least 8 characters long
                      <br />
                      • Include uppercase and lowercase letters
                      <br />
                      • Include at least one number
                      <br />
                      • Include at least one special character
                    </Text>
                  </Box>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <HStack spacing={3}>
                  <Button variant="outline" onClick={onPasswordModalClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="orange"
                    isLoading={isChangingPassword}
                    loadingText="Changing..."
                  >
                    Change Password
                  </Button>
                </HStack>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}
