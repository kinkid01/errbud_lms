"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiSearch,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiUserPlus,
  FiCopy,
  FiKey,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from "react-icons/fi";
import { useEffect, useState, useCallback } from "react";
import { User, UserProgress } from "@/types/admin";
import { adminApi } from "@/lib/adminApi";
import UserProgressModal from "./UserProgressModal";

export default function UserManagement() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();

  const [createForm, setCreateForm] = useState({ name: "", email: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<{ name: string; email: string; generatedPassword: string } | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [refreshingUsers, setRefreshingUsers] = useState<Set<string>>(new Set());
  const [pollingIntervals, setPollingIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [recentPasswordChanges, setRecentPasswordChanges] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async () => {
    try {
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Error loading users",
        description: "Failed to load user data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(user => user.lastLogin);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(user => !user.lastLogin);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleViewProgress = async (user: User) => {
    try {
      const progress = await adminApi.getUserProgress(user.id);
      setSelectedUser(user);
      setUserProgress(progress);
      onProgressModalOpen();
    } catch (error) {
      toast({
        title: "Error loading user progress",
        description: "Failed to load user progress data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateStudent = async () => {
    if (!createForm.name.trim() || !createForm.email.trim()) {
      toast({ title: "Name and email are required", status: "error", duration: 3000 });
      return;
    }
    setIsCreating(true);
    try {
      console.log('Creating student:', { name: createForm.name, email: createForm.email });
      const result = await adminApi.createStudent(createForm.name.trim(), createForm.email.trim());
      console.log('Student created successfully:', result);
      setCreatedStudent(result);
      setCreateForm({ name: "", email: "" });
      await loadUsers();
    } catch (err: any) {
      console.error('Create student error:', err);
      console.error('Error response:', err.response?.data);
      toast({ title: "Failed to create student", description: err.response?.data?.message ?? err.message, status: "error", duration: 4000 });
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendVerificationEmail = async (email: string, userId?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/send-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Verification email sent!",
          description: `Email sent to ${email}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Auto-refresh user status after sending verification email
        if (userId) {
          // Wait a moment then refresh to show any immediate status changes
          setTimeout(() => {
            handleRefreshUser(userId);
          }, 2000);
        }
      } else {
        throw new Error(data.message || "Failed to send verification email");
      }
    } catch (err: any) {
      toast({
        title: "Failed to resend",
        description: err.message || "Unable to send verification email",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const stopPolling = useCallback((userId: string) => {
    const interval = pollingIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      setPollingIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  }, [pollingIntervals]);

  const handleRefreshUser = useCallback(async (userId: string) => {
    setRefreshingUsers(prev => new Set(prev).add(userId));
    
    try {
      const freshData = await adminApi.refreshUserStatus(userId);
      
      // Check if password changed
      const currentUser = users.find(u => u.id === userId);
      const passwordChanged = currentUser && freshData.generatedPassword !== currentUser.generatedPassword;
      
      // Update specific user in the users array
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...freshData } : user
        )
      );
      
      // Also update filtered users if needed
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...freshData } : user
        )
      );
      
      // Track recent password changes
      if (passwordChanged) {
        setRecentPasswordChanges(prev => new Set(prev).add(userId));
        // Remove from recent changes after 10 seconds
        setTimeout(() => {
          setRecentPasswordChanges(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }, 10000);
        
        toast({
          title: "Password Updated!",
          description: `${freshData.name} has changed their password`,
          status: "info",
          duration: 4000,
          isClosable: true,
        });
      }
      
      // Stop polling for this user if they're now verified
      if (freshData.emailVerified && freshData.isAccountActive) {
        stopPolling(userId);
      }
      
      if (!passwordChanged) {
        toast({
          title: "Status refreshed",
          description: "User status has been updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to refresh",
        description: error.message || "Unable to refresh user status",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setRefreshingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [stopPolling, toast, users]);

  const startPolling = useCallback((userId: string) => {
    // Clear existing interval for this user
    stopPolling(userId);
    
    // Start new interval - poll every 15 seconds for more responsive updates
    const interval = setInterval(() => {
      handleRefreshUser(userId);
    }, 15000);
    
    setPollingIntervals(prev => new Map(prev).set(userId, interval));
  }, [stopPolling, handleRefreshUser]);

  // Clear all intervals immediately and on unmount
  useEffect(() => {
    // Clear all existing intervals right away
    pollingIntervals.forEach(interval => clearInterval(interval));
    setPollingIntervals(new Map());
    
    return () => {
      pollingIntervals.forEach(interval => clearInterval(interval));
    };
  }, [pollingIntervals]);

  // Polling disabled to prevent continuous API calls
  // useEffect(() => {
  //   users.forEach(user => {
  //     if (user.emailVerified && user.isAccountActive) {
  //       startPolling(user.id);
  //     } else {
  //       stopPolling(user.id);
  //     }
  //   });
  // }, [users, startPolling, stopPolling]);

  const getVerificationStatusBadge = (user: User) => {
    if (user.emailVerified && user.isAccountActive) {
      return <Badge colorScheme="green">Verified & Active</Badge>;
    } else if (!user.emailVerified) {
      return <Badge colorScheme="orange">Email Pending</Badge>;
    } else if (!user.isAccountActive) {
      return <Badge colorScheme="red">Inactive</Badge>;
    }
    return <Badge colorScheme="gray">Unknown</Badge>;
  };

  const getActivityStatusBadge = (user: User) => {
    if (!user.emailVerified || !user.isAccountActive) {
      return <Badge colorScheme="gray">Not Active</Badge>;
    }
    
    if (user.lastLogin) {
      const lastLoginDate = new Date(user.lastLogin);
      const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin <= 7) {
        return <Badge colorScheme="green">Active</Badge>;
      } else if (daysSinceLogin <= 30) {
        return <Badge colorScheme="yellow">Recent</Badge>;
      } else {
        return <Badge colorScheme="orange">Inactive</Badge>;
      }
    }
    return <Badge colorScheme="gray">Never Logged In</Badge>;
  };

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <VStack spacing={4} align="center">
          <Text>Loading users...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" mb={1}>User Management</Heading>
            <Text color="gray.600">Monitor and manage student accounts</Text>
          </Box>
          <Button leftIcon={<FiUserPlus />} colorScheme="blue" borderRadius="xl" onClick={() => { setCreatedStudent(null); onCreateModalOpen(); }}>
            Create Student
          </Button>
        </Flex>

        {/* Stats Overview */}
        <Flex gap={4} flexWrap="wrap">
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiUsers} boxSize={8} color="blue.500" />
                <Stat>
                  <StatLabel fontSize="sm">Total Users</StatLabel>
                  <StatNumber fontSize="lg">{users.length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiTrendingUp} boxSize={8} color="green.500" />
                <Stat>
                  <StatLabel fontSize="sm">Active Users</StatLabel>
                  <StatNumber fontSize="lg">{users.filter(u => u.lastLogin).length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiCalendar} boxSize={8} color="purple.500" />
                <Stat>
                  <StatLabel fontSize="sm">New This Month</StatLabel>
                  <StatNumber fontSize="lg">
                    {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        </Flex>

        {/* Filters */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={4}>
            <Flex gap={3} direction={{ base: "column", sm: "row" }}>
              <Box flex={1}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                w={{ base: "full", sm: "200px" }}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Flex>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={0} overflowX="auto">
            <Table variant="simple" minW="700px">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Password</Th>
                  <Th>Verification</Th>
                  <Th>Activity</Th>
                  <Th>Joined</Th>
                  <Th>Last Login</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Box
                          w="10"
                          h="10"
                          borderRadius="full"
                          bg="blue.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Box>
                        <Text fontWeight="medium">{user.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Icon as={FiMail} color="gray.400" />
                        <Text>{user.email}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {user.generatedPassword ? (
                        <HStack spacing={2}>
                          <Icon as={FiKey} color="gray.400" boxSize={3} />
                          <Text 
                            fontFamily="mono" 
                            fontSize="xs" 
                            color={recentPasswordChanges.has(user.id) ? "blue.600" : "gray.600"}
                            userSelect={visiblePasswords[user.id] ? "text" : "none"}
                            fontWeight={recentPasswordChanges.has(user.id) ? "bold" : "normal"}
                          >
                            {visiblePasswords[user.id] ? user.generatedPassword : "········"}
                          </Text>
                          {recentPasswordChanges.has(user.id) && (
                            <Badge colorScheme="blue" fontSize="xs" variant="solid">Updated</Badge>
                          )}
                          <Icon
                            as={visiblePasswords[user.id] ? FiEyeOff : FiEye}
                            boxSize={3}
                            color="gray.400"
                            cursor="pointer"
                            onClick={() => togglePasswordVisibility(user.id)}
                          />
                          <Icon
                            as={FiCopy}
                            boxSize={3}
                            color="blue.400"
                            cursor="pointer"
                            onClick={() => { navigator.clipboard.writeText(user.generatedPassword!); toast({ title: "Password copied", status: "success", duration: 1500 }); }}
                          />
                        </HStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        {getVerificationStatusBadge(user)}
                        {!user.emailVerified && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => handleResendVerificationEmail(user.email, user.id)}
                          >
                            Resend Email
                          </Button>
                        )}
                      </VStack>
                    </Td>
                    <Td>{getActivityStatusBadge(user)}</Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiEye} />}
                          onClick={() => handleViewProgress(user)}
                          colorScheme="blue"
                          variant="outline"
                        >
                          View Progress
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiRefreshCw} />}
                          onClick={() => handleRefreshUser(user.id)}
                          colorScheme="gray"
                          variant="outline"
                          isLoading={refreshingUsers.has(user.id)}
                          loadingText="Refreshing"
                        >
                          Refresh
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* User Progress Modal */}
        <UserProgressModal
          isOpen={isProgressModalOpen}
          onClose={onProgressModalClose}
          user={selectedUser}
          userProgress={userProgress}
        />

        {/* Create Student Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="md">
          <ModalOverlay />
          <ModalContent borderRadius="2xl">
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={FiUserPlus} color="blue.500" />
                <Text>Create Student Account</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={2}>
              {createdStudent ? (
                /* Success state - show generated password */
                <VStack spacing={5} align="stretch" py={2}>
                  <Box bg="green.50" border="1px solid" borderColor="green.200" borderRadius="xl" p={5}>
                    <Text fontWeight="700" color="green.700" mb={1}>Account created!</Text>
                    <Text fontSize="sm" color="green.600">
                      Share these credentials with <strong>{createdStudent.name}</strong>
                    </Text>
                  </Box>
                  <Box bg="gray.50" borderRadius="xl" p={5}>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Email</Text>
                        <Text fontWeight="600">{createdStudent.email}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Generated Password</Text>
                        <HStack spacing={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" px={4} py={3}>
                          <Icon as={FiKey} color="blue.400" />
                          <Text fontFamily="mono" fontWeight="700" fontSize="lg" flex={1} letterSpacing="widest">
                            {createdStudent.generatedPassword}
                          </Text>
                          <Button
                            size="xs"
                            leftIcon={<FiCopy />}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => { navigator.clipboard.writeText(createdStudent.generatedPassword); toast({ title: "Password copied!", status: "success", duration: 1500 }); }}
                          >
                            Copy
                          </Button>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    This password is also saved on the student&apos;s row in the Users table.
                  </Text>
                </VStack>
              ) : (
                /* Form state */
                <VStack spacing={4} align="stretch" py={2}>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" mb={1} color="gray.700">Full Name</Text>
                    <Input
                      placeholder="e.g. John Doe"
                      value={createForm.name}
                      onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                      borderRadius="lg"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" mb={1} color="gray.700">Email Address</Text>
                    <Input
                      type="email"
                      placeholder="student@email.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                      borderRadius="lg"
                    />
                  </Box>
                  <Box bg="blue.50" borderRadius="lg" p={3}>
                    <Text fontSize="xs" color="blue.700">
                      A secure password will be automatically generated and stored on the account.
                    </Text>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              {createdStudent ? (
                <Button colorScheme="blue" borderRadius="xl" w="full" onClick={() => { setCreatedStudent(null); onCreateModalClose(); }}>
                  Done
                </Button>
              ) : (
                <HStack spacing={3} w="full">
                  <Button variant="outline" borderRadius="xl" flex={1} onClick={onCreateModalClose}>Cancel</Button>
                  <Button colorScheme="blue" borderRadius="xl" flex={1} isLoading={isCreating} loadingText="Creating..." onClick={handleCreateStudent}>
                    Create Account
                  </Button>
                </HStack>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

      </VStack>
    </Box>
  );
}
