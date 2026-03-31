"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Progress,
  Badge,
  Button,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiArrowRight,
  FiPlay,
} from "react-icons/fi";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api, { normalize } from "@/lib/api";

interface Module {
  id: string;
  title: string;
}

interface ProgressRecord {
  moduleId: string;
  moduleName: string;
  status: string;
  lessonProgress: { status: string }[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [progressList, setProgressList] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [modulesRes, progressRes] = await Promise.all([
          api.get('/modules'),
          api.get('/progress/me'),
        ]);

        setModules(modulesRes.data.data.map((m: any) => normalize(m)));

        const list: ProgressRecord[] = progressRes.data.data.map((p: any) => ({
          moduleId: p.moduleId?._id ?? p.moduleId,
          moduleName: p.moduleId?.title ?? '',
          status: p.status,
          lessonProgress: p.lessonProgress ?? [],
        }));
        setProgressList(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getProgressPct(p: ProgressRecord) {
    if (p.lessonProgress.length === 0) return 0;
    const done = p.lessonProgress.filter((lp) => lp.status === 'completed').length;
    return Math.round((done / p.lessonProgress.length) * 100);
  }

  const completed = progressList.filter((p) => p.status === 'completed').length;
  const inProgress = progressList.filter((p) => p.status === 'in_progress').length;
  const recentProgress = progressList.slice(0, 3);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Here's where you left off. Keep going!
          </Text>
        </Box>

        {/* Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5}>
          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <HStack spacing={4}>
                <Flex bg="blue.50" borderRadius="xl" p={3} align="center" justify="center">
                  <Icon as={FiBookOpen} boxSize={5} color="blue.500" />
                </Flex>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">Total Modules</StatLabel>
                  <StatNumber fontSize="2xl">{modules.length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <HStack spacing={4}>
                <Flex bg="green.50" borderRadius="xl" p={3} align="center" justify="center">
                  <Icon as={FiCheckCircle} boxSize={5} color="green.500" />
                </Flex>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">Completed</StatLabel>
                  <StatNumber fontSize="2xl">{completed}</StatNumber>
                  {modules.length > 0 && (
                    <StatHelpText fontSize="xs" color="green.500">
                      {Math.round((completed / modules.length) * 100)}% done
                    </StatHelpText>
                  )}
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <HStack spacing={4}>
                <Flex bg="orange.50" borderRadius="xl" p={3} align="center" justify="center">
                  <Icon as={FiClock} boxSize={5} color="orange.400" />
                </Flex>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">In Progress</StatLabel>
                  <StatNumber fontSize="2xl">{inProgress}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Recent modules + Quick Actions */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <HStack justify="space-between" mb={5}>
                <Heading size="sm" color="gray.700">Modules</Heading>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" colorScheme="blue" rightIcon={<FiArrowRight />}>
                    View all
                  </Button>
                </Link>
              </HStack>

              {recentProgress.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>
                  You haven't started any modules yet.{" "}
                  <Link href="/courses">
                    <Text as="span" color="blue.500" cursor="pointer">Browse modules</Text>
                  </Link>
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {recentProgress.map((p) => (
                    <Box
                      key={p.moduleId}
                      p={4}
                      border="1px solid"
                      borderColor="gray.100"
                      borderRadius="xl"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" noOfLines={1}>
                          {p.moduleName}
                        </Text>
                        <Badge
                          colorScheme={
                            p.status === 'completed' ? 'green' : p.status === 'in_progress' ? 'blue' : 'gray'
                          }
                          borderRadius="full"
                          fontSize="xs"
                          px={2}
                        >
                          {p.status.replace('_', ' ')}
                        </Badge>
                      </HStack>
                      {p.status !== 'not_started' && (
                        <Box>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.400">Progress</Text>
                            <Text fontSize="xs" color="gray.500">{getProgressPct(p)}%</Text>
                          </HStack>
                          <Progress
                            value={getProgressPct(p)}
                            colorScheme={p.status === 'completed' ? 'green' : 'blue'}
                            borderRadius="full"
                            size="xs"
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <Heading size="sm" color="gray.700" mb={5}>Quick Actions</Heading>
              <VStack spacing={3} align="stretch">
                <Link href="/courses">
                  <Button
                    w="full"
                    colorScheme="blue"
                    leftIcon={<FiPlay />}
                    borderRadius="xl"
                    justifyContent="flex-start"
                  >
                    Continue Learning
                  </Button>
                </Link>
                <Link href="/final-exam">
                  <Button
                    w="full"
                    variant="outline"
                    colorScheme="purple"
                    leftIcon={<FiBookOpen />}
                    borderRadius="xl"
                    justifyContent="flex-start"
                  >
                    Take Final Exam
                  </Button>
                </Link>
                <Link href="/certificate">
                  <Button
                    w="full"
                    variant="outline"
                    colorScheme="green"
                    leftIcon={<FiAward />}
                    borderRadius="xl"
                    justifyContent="flex-start"
                  >
                    View Certificate
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
}
