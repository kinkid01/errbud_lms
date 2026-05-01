"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Progress,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import api, { normalize } from "@/lib/api";

interface StudentRow {
  id: string;
  name: string;
  email: string;
  progress: number;
  status: string;
}

interface Stats {
  totalStudents: number;
  activeModules: number;
  certificatesIssued: number;
  completionRate: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, activeModules: 0, certificatesIssued: 0, completionRate: 0 });
  const [recentActivity, setRecentActivity] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, modulesRes, certsRes] = await Promise.all([
          api.get('/users'),
          api.get('/modules'),
          api.get('/certificates'),
        ]);

        const allUsers: any[] = usersRes.data.data.map((u: any) => normalize(u));
        const students = allUsers.filter((u) => u.role === 'student');
        const activeModules = modulesRes.data.data.filter((m: any) => m.status === 'active');
        const certs: any[] = certsRes.data.data;

        const certifiedStudentIds = new Set(certs.map((c: any) => c.userId));
        const completionRate = students.length > 0
          ? Math.round((certifiedStudentIds.size / students.length) * 100)
          : 0;

        setStats({
          totalStudents: students.length,
          activeModules: activeModules.length,
          certificatesIssued: certs.length,
          completionRate,
        });

        // Fetch progress for the 5 most recent students in parallel
        const first5 = students.slice(0, 5);
        const progressResults = await Promise.all(
          first5.map((s) =>
            api.get(`/progress/user/${s.id}`)
              .then((r) => r.data.data as any[])
              .catch(() => [])
          )
        );

        const rows: StudentRow[] = first5.map((student, i) => {
          const progressList = progressResults[i];
          const totalLessons = progressList.reduce(
            (sum: number, p: any) => sum + (p.lessonProgress?.length ?? 0), 0
          );
          const completedLessons = progressList.reduce(
            (sum: number, p: any) =>
              sum + (p.lessonProgress?.filter((lp: any) => lp.status === 'completed').length ?? 0),
            0
          );
          const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const allCompleted = progressList.length > 0 && progressList.every((p: any) => p.status === 'completed');
          const anyInProgress = progressList.some((p: any) => p.status === 'in_progress');
          const status = allCompleted ? 'completed' : anyInProgress ? 'in_progress' : 'not_started';

          return { id: student.id, name: student.name, email: student.email, progress: pct, status };
        });

        setRecentActivity(rows);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATS = [
    { label: "Total Students", value: stats.totalStudents, sub: "registered students", icon: FiUsers, color: "blue", bg: "blue.50" },
    { label: "Active Modules", value: stats.activeModules, sub: "published modules", icon: FiBookOpen, color: "purple", bg: "purple.50" },
    { label: "Certificates Issued", value: stats.certificatesIssued, sub: "certificates earned", icon: FiAward, color: "green", bg: "green.50" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, sub: "students certified", icon: FiTrendingUp, color: "orange", bg: "orange.50" },
  ];

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>Admin Dashboard</Heading>
          <Text color="gray.500" fontSize="sm">
            Welcome back, {user?.name}. Here's an overview of your platform.
          </Text>
        </Box>

        {/* Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={5}>
          {STATS.map((s) => (
            <Card key={s.label} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <HStack spacing={4}>
                  <Box bg={s.bg} borderRadius="xl" p={3}>
                    <Icon as={s.icon} boxSize={5} color={`${s.color}.500`} />
                  </Box>
                  <Stat>
                    <StatLabel fontSize="xs" color="gray.500">{s.label}</StatLabel>
                    <StatNumber fontSize="2xl">{s.value}</StatNumber>
                    <StatHelpText fontSize="xs" color="gray.400" mb={0}>{s.sub}</StatHelpText>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Recent Student Activity */}
        <Card borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Heading size="sm" color="gray.700" mb={5}>Recent Student Activity</Heading>
            {recentActivity.length === 0 ? (
              <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
                No students have enrolled yet.
              </Text>
            ) : (
              <TableContainer overflowX="auto">
                <Table variant="simple" size="sm" minW="500px">
                  <Thead>
                    <Tr>
                      <Th color="gray.400" fontSize="xs" textTransform="uppercase">Student</Th>
                      <Th color="gray.400" fontSize="xs" textTransform="uppercase">Email</Th>
                      <Th color="gray.400" fontSize="xs" textTransform="uppercase">Progress</Th>
                      <Th color="gray.400" fontSize="xs" textTransform="uppercase">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentActivity.map((u) => (
                      <Tr key={u.id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="xs" name={u.name} bg="blue.500" color="white" />
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">{u.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">{u.email}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Progress
                              value={u.progress}
                              colorScheme={u.status === 'completed' ? 'green' : 'blue'}
                              borderRadius="full"
                              size="xs"
                              w="80px"
                            />
                            <Text fontSize="xs" color="gray.500">{u.progress}%</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              u.status === 'completed' ? 'green'
                              : u.status === 'in_progress' ? 'blue'
                              : 'gray'
                            }
                            borderRadius="full"
                            fontSize="xs"
                            px={2}
                            textTransform="uppercase"
                          >
                            {u.status.replace('_', ' ')}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
