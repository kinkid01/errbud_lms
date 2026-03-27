"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Badge,
  Card,
  CardBody,
  Avatar,
  Spinner,
  Center,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { FiUserCheck, FiUserX, FiMail, FiClock, FiRefreshCw } from "react-icons/fi";
import api from "@/lib/api";

interface StudentRequest {
  id: string;
  name: string;
  email: string;
  status: "pending" | "rejected";
  createdAt: string;
}

export default function StudentRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/requests");
      const data = (res.data.data as any[]).map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        status: u.status,
        createdAt: u.createdAt,
      }));
      setRequests(data);
    } catch {
      toast({ title: "Failed to load requests", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handle = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await api.put(`/users/${id}/${action}`);
      toast({
        title: action === "approve" ? "Student approved" : "Student rejected",
        description: action === "approve"
          ? "The student can now log in."
          : "The student has been notified to check their email.",
        status: action === "approve" ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });
      load();
    } catch {
      toast({ title: "Action failed", status: "error", duration: 3000 });
    } finally {
      setActionLoading(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const rejected = requests.filter((r) => r.status === "rejected");

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} w="full">
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="gray.800">Student Requests</Heading>
          <Text color="gray.500" fontSize="sm">
            Manually verify each email against the Errbud platform before approving.
          </Text>
        </VStack>
        <Button
          leftIcon={<FiRefreshCw />}
          variant="outline"
          colorScheme="gray"
          borderRadius="xl"
          size="sm"
          onClick={load}
        >
          Refresh
        </Button>
      </HStack>

      {/* Pending */}
      <VStack align="stretch" spacing={4} mb={8}>
        <HStack spacing={2}>
          <Text fontWeight="semibold" color="gray.700" fontSize="sm">
            Pending Approval
          </Text>
          <Badge colorScheme="orange" borderRadius="full">{pending.length}</Badge>
        </HStack>

        {pending.length === 0 ? (
          <Card borderRadius="2xl" boxShadow="sm">
            <CardBody p={6}>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                No pending requests right now.
              </Text>
            </CardBody>
          </Card>
        ) : (
          pending.map((req, i) => (
            <Card key={req.id} borderRadius="2xl" boxShadow="sm">
              <CardBody p={5}>
                <HStack spacing={4} flexWrap="wrap" gap={3}>
                  <Avatar size="sm" name={req.name} bg="orange.400" color="white" flexShrink={0} />
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                      {req.name}
                    </Text>
                    <HStack spacing={1}>
                      <Icon as={FiMail} boxSize={3} color="gray.400" />
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{req.email}</Text>
                    </HStack>
                    <HStack spacing={1} mt={0.5}>
                      <Icon as={FiClock} boxSize={3} color="gray.400" />
                      <Text fontSize="xs" color="gray.400">
                        Applied {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </HStack>
                  </VStack>
                  <HStack spacing={2} flexShrink={0}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      borderRadius="lg"
                      leftIcon={<FiUserCheck />}
                      isLoading={actionLoading === req.id + "approve"}
                      onClick={() => handle(req.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      borderRadius="lg"
                      leftIcon={<FiUserX />}
                      isLoading={actionLoading === req.id + "reject"}
                      onClick={() => handle(req.id, "reject")}
                    >
                      Reject
                    </Button>
                  </HStack>
                </HStack>
              </CardBody>
              {i < pending.length - 1 && <Divider />}
            </Card>
          ))
        )}
      </VStack>

      {/* Rejected */}
      <VStack align="stretch" spacing={4}>
        <HStack spacing={2}>
          <Text fontWeight="semibold" color="gray.700" fontSize="sm">
            Rejected
          </Text>
          <Badge colorScheme="red" borderRadius="full">{rejected.length}</Badge>
        </HStack>

        {rejected.length === 0 ? (
          <Card borderRadius="2xl" boxShadow="sm">
            <CardBody p={6}>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                No rejected accounts.
              </Text>
            </CardBody>
          </Card>
        ) : (
          rejected.map((req) => (
            <Card key={req.id} borderRadius="2xl" boxShadow="sm" opacity={0.8}>
              <CardBody p={5}>
                <HStack spacing={4} flexWrap="wrap" gap={3}>
                  <Avatar size="sm" name={req.name} bg="red.300" color="white" flexShrink={0} />
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" color="gray.700" fontSize="sm">{req.name}</Text>
                      <Badge colorScheme="red" borderRadius="full" fontSize="10px">Rejected</Badge>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiMail} boxSize={3} color="gray.400" />
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{req.email}</Text>
                    </HStack>
                  </VStack>
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    borderRadius="lg"
                    leftIcon={<FiUserCheck />}
                    isLoading={actionLoading === req.id + "approve"}
                    onClick={() => handle(req.id, "approve")}
                  >
                    Approve
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Box>
  );
}
