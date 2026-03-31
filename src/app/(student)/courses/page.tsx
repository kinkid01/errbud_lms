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
  Progress,
  Button,
  Icon,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiClock, FiBook, FiAward, FiUsers, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import api, { normalize } from "@/lib/api";

interface Module {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  enrollmentCount: number;
}

interface ProgressRecord {
  moduleId: string;
  status: string;
  lessonProgress: { status: string }[];
}

export default function CoursesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [modulesRes, progressRes] = await Promise.all([
          api.get('/modules'),
          api.get('/progress/me'),
        ]);

        setModules(modulesRes.data.data.map((m: any) => normalize(m)));

        const map: Record<string, ProgressRecord> = {};
        progressRes.data.data.forEach((p: any) => {
          const mid = p.moduleId?._id ?? p.moduleId;
          map[mid] = { moduleId: mid, status: p.status, lessonProgress: p.lessonProgress ?? [] };
        });
        setProgressMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getProgressPct(moduleId: string) {
    const p = progressMap[moduleId];
    if (!p || p.lessonProgress.length === 0) return 0;
    const done = p.lessonProgress.filter((lp) => lp.status === 'completed').length;
    return Math.round((done / p.lessonProgress.length) * 100);
  }

  function getStatus(moduleId: string) {
    return progressMap[moduleId]?.status ?? 'not_started';
  }

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  const completed = Object.values(progressMap).filter((p) => p.status === 'completed').length;
  const inProgress = Object.values(progressMap).filter((p) => p.status === 'in_progress').length;

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>Modules</Heading>
          <Text color="gray.500" fontSize="sm">
            Continue your learning journey and track your progress
          </Text>
        </Box>

        {modules.length === 0 ? (
          <Center py={16}>
            <Text color="gray.400">No modules available yet. Check back soon!</Text>
          </Center>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={5}>
            {modules.map((mod) => {
              const status = getStatus(mod.id);
              const pct = getProgressPct(mod.id);
              return (
                <Card
                  key={mod.id}
                  borderRadius="xl"
                  boxShadow="sm"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "md" }}
                >
                  <CardBody p={5}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="semibold" color="gray.800" mb={1} noOfLines={2}>
                          {mod.title}
                        </Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={2}>
                          {mod.description}
                        </Text>
                      </Box>

                      {status === 'in_progress' && (
                        <Box>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.400">Progress</Text>
                            <Text fontSize="xs" color="gray.500">{pct}%</Text>
                          </HStack>
                          <Progress value={pct} colorScheme="blue" borderRadius="full" size="xs" />
                        </Box>
                      )}

                      <HStack spacing={4} color="gray.400" fontSize="xs">
                        <HStack spacing={1}>
                          <Icon as={FiCalendar} boxSize={3} />
                          <Text>{new Date(mod.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FiUsers} boxSize={3} />
                          <Text>{mod.enrollmentCount}</Text>
                        </HStack>
                      </HStack>

                      <Link href={`/courses/${mod.id}`}>
                        <Button w="full" colorScheme="blue" borderRadius="xl" size="sm">
                          {status === 'not_started'
                            ? 'Start Course'
                            : status === 'completed'
                            ? 'Review'
                            : 'Continue'}
                        </Button>
                      </Link>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </Grid>
        )}

        {/* Stats bar */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {[
            { icon: FiBook, label: "Total", value: modules.length, color: "blue.500" },
            { icon: FiAward, label: "Completed", value: completed, color: "green.500" },
            { icon: FiClock, label: "In Progress", value: inProgress, color: "orange.400" },
          ].map((s) => (
            <Card key={s.label} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={s.icon} boxSize={6} color={s.color} />
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">{s.value}</Text>
                    <Text fontSize="xs" color="gray.500">{s.label}</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Final Exam CTA */}
        <Card borderRadius="xl" bg="blue.600" color="white" boxShadow="md">
          <CardBody p={6}>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="md">Ready for the Final Exam?</Heading>
                <Text fontSize="sm" opacity={0.85}>
                  Complete all modules, then take 20 questions to earn your certificate.
                </Text>
              </VStack>
              <Link href="/final-exam">
                <Button bg="white" color="blue.600" _hover={{ bg: "blue.50" }} borderRadius="xl" px={6}>
                  Take Final Exam
                </Button>
              </Link>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
