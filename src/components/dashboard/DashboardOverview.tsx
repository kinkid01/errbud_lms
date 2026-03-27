"use client";

import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  useColorModeValue,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  FiBook,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminStats, User, Course, Certificate } from "@/types/admin";
import { adminApi } from "@/lib/adminApi";

interface DashboardOverviewProps {
  isAdmin?: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ isAdmin = false }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, usersData, certificatesData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getUsers(),
          adminApi.getCertificates(),
        ]);
        
        setStats(statsData);
        setRecentUsers(usersData.slice(0, 5));
        setRecentCertificates(certificatesData.slice(0, 5));
      } catch (error) {
        toast({
          title: "Error loading dashboard",
          description: "Failed to load dashboard data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, toast]);

  // Mock data for student view
  const studentStats = {
    enrolledCourses: 4,
    completedCourses: 2,
    inProgressCourses: 2,
    avgProgress: 65,
    totalHours: 24,
  };

  const recentActivity = [
    {
      id: 1,
      type: "course_completed",
      title: "Introduction to Web Development",
      time: "2 hours ago",
      icon: <FiCheckCircle color="green" />,
    },
    {
      id: 2,
      type: "quiz_passed",
      title: "JavaScript Fundamentals Quiz",
      time: "5 hours ago",
      icon: <FiAward color="blue" />,
    },
    {
      id: 3,
      type: "course_started",
      title: "Advanced React & Next.js",
      time: "1 day ago",
      icon: <FiPlay color="purple" />,
    },
    {
      id: 4,
      type: "achievement",
      title: "7-Day Streak Achievement",
      time: "2 days ago",
      icon: <FiTrendingUp color="orange" />,
    },
  ];

  if (isAdmin && isLoading) {
    return (
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Loading Admin Dashboard...</Heading>
            <Text color="gray.600">Fetching latest data</Text>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </Heading>
          <Text color="gray.600">
            {isAdmin 
              ? "Monitor user progress and module performance"
              : "Track your learning progress and achievements"
            }
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          {isAdmin && stats ? (
            <>
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiUsers} boxSize={10} color="blue.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Total Users</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{stats.totalUsers.toLocaleString()}</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">+12% from last month</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiBook} boxSize={10} color="green.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Total Modules</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{stats.totalCourses}</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">2 new this week</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiActivity} boxSize={10} color="orange.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Active Learners</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{stats.activeLearners.toLocaleString()}</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">+8% this week</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiAward} boxSize={10} color="purple.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Certificates Issued</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{stats.totalCertificatesIssued}</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">+15 this month</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </>
          ) : (
            <>
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiBook} boxSize={10} color="blue.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Enrolled Modules</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{studentStats.enrolledCourses}</StatNumber>
                        <StatHelpText fontSize="xs" color="gray.500">Total enrolled</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiCheckCircle} boxSize={10} color="green.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Completed</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{studentStats.completedCourses}</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">50% completion rate</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiPlay} boxSize={10} color="yellow.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">In Progress</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{studentStats.inProgressCourses}</StatNumber>
                        <StatHelpText fontSize="xs" color="gray.500">Currently learning</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiTrendingUp} boxSize={10} color="purple.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Avg Progress</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{studentStats.avgProgress}%</StatNumber>
                        <StatHelpText fontSize="xs" color="green.600">On track</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <HStack spacing={3}>
                    <Icon as={FiClock} boxSize={10} color="orange.500" />
                    <VStack align="start" spacing={1}>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">Learning Hours</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">{studentStats.totalHours}</StatNumber>
                        <StatHelpText fontSize="xs" color="gray.500">This month</StatHelpText>
                      </Stat>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </>
          )}
        </Grid>

        {/* Recent Activity */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={6}>
              <Heading size="md" mb={4}>
                {isAdmin ? "Recent Users" : "Recent Activity"}
              </Heading>
              <VStack spacing={3} align="stretch">
                {isAdmin ? (
                  recentUsers.map((user) => (
                    <HStack
                      key={user.id}
                      p={3}
                      borderRadius="md"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      spacing={3}
                    >
                      <Icon as={FiUsers} color="blue.500" />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {user.email}
                        </Text>
                      </VStack>
                      <Text fontSize="xs" color="gray.400">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  ))
                ) : (
                  recentActivity.map((activity) => (
                    <HStack
                      key={activity.id}
                      p={3}
                      borderRadius="md"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      spacing={3}
                    >
                      <Box color="gray.600">
                        {activity.icon}
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {activity.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {activity.time}
                        </Text>
                      </VStack>
                    </HStack>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={6}>
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <VStack spacing={3} align="stretch">
                <Link href="/courses">
                  <Button
                    leftIcon={<FiBook />}
                    colorScheme="blue"
                    variant="solid"
                    w="full"
                    justifyContent="flex-start"
                  >
                    Browse Modules
                  </Button>
                </Link>
                
                {!isAdmin && (
                  <>
                    <Link href="/certificates">
                      <Button
                        leftIcon={<FiAward />}
                        colorScheme="green"
                        variant="outline"
                        w="full"
                        justifyContent="flex-start"
                      >
                        View Certificates
                      </Button>
                    </Link>
                    
                    <Link href="/profile">
                      <Button
                        leftIcon={<FiUsers />}
                        colorScheme="gray"
                        variant="outline"
                        w="full"
                        justifyContent="flex-start"
                      >
                        Update Profile
                      </Button>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link href="/admin/courses">
                      <Button
                        leftIcon={<FiBook />}
                        colorScheme="purple"
                        variant="outline"
                        w="full"
                        justifyContent="flex-start"
                      >
                        Manage Modules
                      </Button>
                    </Link>
                    
                    <Link href="/admin/users">
                      <Button
                        leftIcon={<FiUsers />}
                        colorScheme="orange"
                        variant="outline"
                        w="full"
                        justifyContent="flex-start"
                      >
                        View Users
                      </Button>
                    </Link>

                    <Link href="/admin/certificates">
                      <Button
                        leftIcon={<FiAward />}
                        colorScheme="green"
                        variant="outline"
                        w="full"
                        justifyContent="flex-start"
                      >
                        Manage Certificates
                      </Button>
                    </Link>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
};

export default DashboardOverview;
