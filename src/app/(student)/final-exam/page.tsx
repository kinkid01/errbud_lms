"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Card,
  CardBody,
  Badge,
  Divider,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiLock, FiCheckCircle, FiCircle, FiArrowRight, FiAward } from "react-icons/fi";
import Link from "next/link";
import api, { normalize } from "@/lib/api";
import FinalExam from "@/components/quiz/FinalExam";

interface ModuleRequirement {
  id: string;
  label: string;
  done: boolean;
}

export default function FinalExamPage() {
  const [status, setStatus] = useState<'loading' | 'passed' | 'eligible' | 'locked'>('loading');
  const [requirements, setRequirements] = useState<ModuleRequirement[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [eligRes, modulesRes, progressRes, certRes] = await Promise.all([
          api.get('/progress/can-take-exam'),
          api.get('/modules'),
          api.get('/progress/me').catch(() => ({ data: { data: [] } })),
          // Check if student already has a certificate (already passed)
          api.get('/certificates/mine').catch(() => null),
        ]);

        // Already passed — don't show exam again
        if (certRes?.data?.data) {
          setStatus('passed');
          return;
        }

        // Build completed set
        const completedIds = new Set<string>(
          (progressRes.data.data as any[])
            .filter((p: any) => p.status === 'completed')
            .map((p: any) => p.moduleId?._id ?? p.moduleId)
        );

        const reqs: ModuleRequirement[] = modulesRes.data.data
          .filter((m: any) => m.status === 'active')
          .map((m: any) => {
            const n = normalize(m);
            return { id: n.id, label: n.title, done: completedIds.has(n.id) };
          });

        setRequirements(reqs);
        setStatus(eligRes.data.eligible ? 'eligible' : 'locked');
      } catch {
        setStatus('locked');
      }
    }
    load();
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // ── Already passed ────────────────────────────────────────────────────────
  if (status === 'passed') {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={6}>
        <Box maxW="480px" w="full">
          <VStack spacing={6} align="stretch">
            <VStack spacing={3} align="center" pt={4}>
              <Box
                w="80px" h="80px" borderRadius="2xl" bg="green.50"
                display="flex" alignItems="center" justifyContent="center"
              >
                <Icon as={FiAward} boxSize={9} color="green.400" />
              </Box>
              <Heading size="lg" color="gray.800" textAlign="center">
                Exam Completed!
              </Heading>
              <Badge colorScheme="green" borderRadius="full" px={4} py={1} fontSize="sm">
                Certificate Issued
              </Badge>
              <Text color="gray.500" fontSize="sm" textAlign="center" maxW="360px">
                You've already passed the final exam. Your certificate has been issued and is ready to view.
              </Text>
            </VStack>

            <Link href="/certificate">
              <Button colorScheme="green" borderRadius="xl" w="full" size="lg" leftIcon={<FiAward />}>
                View My Certificate
              </Button>
            </Link>
          </VStack>
        </Box>
      </Box>
    );
  }

  // ── Eligible — show exam ──────────────────────────────────────────────────
  if (status === 'eligible') {
    return <FinalExam />;
  }

  // ── Locked — not all modules completed ───────────────────────────────────
  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Box maxW="520px" w="full">
        <VStack spacing={6} align="stretch">
          <VStack spacing={3} align="center" pt={4}>
            <Box
              w="80px" h="80px" borderRadius="2xl" bg="blue.50"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={FiLock} boxSize={9} color="blue.400" />
            </Box>
            <Heading size="lg" color="gray.800" textAlign="center">
              Final Exam is Locked
            </Heading>
            <Text color="gray.500" fontSize="sm" textAlign="center" maxW="380px">
              You need to complete all modules and pass every lesson quiz before
              you can sit the final exam.
            </Text>
          </VStack>

          <Card borderRadius="2xl" boxShadow="sm">
            <CardBody p={6}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={4}>
                Your Progress
              </Text>
              <VStack spacing={3} align="stretch">
                {requirements.map((req, i) => (
                  <React.Fragment key={req.id}>
                    <HStack spacing={3}>
                      <Icon
                        as={req.done ? FiCheckCircle : FiCircle}
                        boxSize={5}
                        color={req.done ? "green.500" : "gray.300"}
                        flexShrink={0}
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={req.done ? "gray.700" : "gray.500"}>
                          {req.label}
                        </Text>
                        <Text fontSize="xs" color={req.done ? "green.500" : "orange.400"}>
                          {req.done ? "Completed" : "Not yet completed"}
                        </Text>
                      </VStack>
                      {req.done && (
                        <Badge colorScheme="green" borderRadius="full" fontSize="10px">Done</Badge>
                      )}
                    </HStack>
                    {i < requirements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {requirements.length === 0 && (
                  <Text fontSize="sm" color="gray.400" textAlign="center">No modules available yet.</Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Link href="/courses">
            <Button colorScheme="blue" borderRadius="xl" w="full" size="lg" rightIcon={<FiArrowRight />}>
              Continue Your Modules
            </Button>
          </Link>

          <Text fontSize="xs" color="gray.400" textAlign="center">
            Once all modules are marked complete, this page will unlock automatically.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
