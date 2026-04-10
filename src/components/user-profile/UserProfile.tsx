"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Flex,
  useColorModeValue,
  Button,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import {
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/adminApi";

export default function UserProfile() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const { isOpen: isPersonalInfoOpen, onOpen: onPersonalInfoOpen, onClose: onPersonalInfoClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();

  // State for form data
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "Musharof",
    lastName: "Chowdhury",
    email: "randomuser@pimjo.com",
    phone: "+09 363 398 46",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");

  const handlePersonalInfoSave = () => {
    console.log("Saving personal info:", personalInfo);
    onPersonalInfoClose();
  };

  const validatePasswords = () => {
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!validatePasswords()) {
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      // Call auth service to change password
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      console.log("Password change request:", passwordData);
      
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Changed Successfully!",
        description: "Your password has been updated and synced with the admin system.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Profile Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden">
          <CardBody p={0}>
            <Box
              bgGradient="linear(135deg, #4A90E2 0%, #357ABD 100%)"
              h="120px"
              position="relative"
            />
            <Stack direction={{ base: "column", md: "row" }} spacing={6} p={8} position="relative">
              <Avatar
                size="2xl"
                src="https://randomuser.me/api/portraits/men/52.jpg"
                name={`${personalInfo.firstName} ${personalInfo.lastName}`}
                border="4px"
                borderColor={cardBg}
                mt="-60px"
                shadow="lg"
              />
              <VStack align={{ base: "center", md: "start" }} spacing={2} flex={1}>
                <Heading size="lg" color={headingColor}>
                  {personalInfo.firstName} {personalInfo.lastName}
                </Heading>
              </VStack>
            </Stack>
          </CardBody>
        </Card>

        {/* Personal Information Card */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md" color={headingColor}>
                Personal Information
              </Heading>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="purple"
                variant="ghost"
                size="sm"
                onClick={onPersonalInfoOpen}
              >
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text color="gray.500" fontSize="sm" mb={2}>
                  First Name
                </Text>
                <Text fontWeight="medium" color={textColor}>
                  {personalInfo.firstName}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm" mb={2}>
                  Last Name
                </Text>
                <Text fontWeight="medium" color={textColor}>
                  {personalInfo.lastName}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm" mb={2}>
                  Email Address
                </Text>
                <HStack>
                  <FaEnvelope color="gray.400" />
                  <Text fontWeight="medium" color={textColor}>
                    {personalInfo.email}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm" mb={2}>
                  Phone
                </Text>
                <HStack>
                  <FaPhone color="gray.400" />
                  <Text fontWeight="medium" color={textColor}>
                    {personalInfo.phone}
                  </Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Change Password Card */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md" color={headingColor}>
                Change Password
              </Heading>
              <Button
                leftIcon={<FaLock />}
                colorScheme="blue"
                variant="ghost"
                size="sm"
                onClick={onPasswordOpen}
              >
                Change
              </Button>
            </Flex>
            
            {/* Success Message */}
            {passwordSuccess && (
              <Alert status="success" borderRadius="lg" mb={4}>
                <AlertIcon />
                <AlertTitle>Password Changed Successfully!</AlertTitle>
                <AlertDescription>
                  Your password has been updated. You can now use your new password to login.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {passwordError && (
              <Alert status="error" borderRadius="lg" mb={4}>
                <AlertIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isPasswordLoading}
                  loadingText="Changing Password..."
                  leftIcon={<FaLock />}
                >
                  Change Password
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>

      {/* Personal Information Edit Modal */}
      <Modal isOpen={isPersonalInfoOpen} onClose={onPersonalInfoClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Personal Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPersonalInfoClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handlePersonalInfoSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="lg" mb={4}>
                <AlertIcon />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                </AlertDescription>
              </Alert>
              
              <FormControl isRequired>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handlePasswordChange}
              isLoading={isPasswordLoading}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
