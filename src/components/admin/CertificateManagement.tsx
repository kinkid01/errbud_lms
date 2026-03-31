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
  useToast,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import {
  FiAward,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { useEffect, useState, useCallback } from "react";
import { Certificate } from "@/types/admin";
import { adminApi } from "@/lib/adminApi";
import CertificatePreview from "./CertificatePreview";

export default function CertificateManagement() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getCertificates();
      setCertificates(data);
    } catch {
      toast({ title: "Error loading certificates", status: "error", duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadCertificates(); }, [loadCertificates]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCertificates(certificates);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredCertificates(
      certificates.filter(
        (c) =>
          c.userName.toLowerCase().includes(q) ||
          c.certificateId.toLowerCase().includes(q)
      )
    );
  }, [certificates, searchTerm]);

  const issuedThisMonth = certificates.filter((c) => {
    const d = new Date(c.completionDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgScore = certificates.length
    ? Math.round(certificates.reduce((s, c) => s + c.score, 0) / certificates.length)
    : 0;

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <Text>Loading certificates...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" mb={1}>Certificate Management</Heading>
            <Text color="gray.500" fontSize="sm">View and verify all issued certificates</Text>
          </Box>
          <Button leftIcon={<FiRefreshCw />} variant="outline" borderRadius="xl" size="sm" onClick={loadCertificates}>
            Refresh
          </Button>
        </HStack>

        {/* Stats */}
        <HStack spacing={4} flexWrap="wrap">
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" flex={1} minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiAward} boxSize={7} color="blue.500" />
                <Stat>
                  <StatLabel fontSize="xs">Total Issued</StatLabel>
                  <StatNumber fontSize="lg">{certificates.length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" flex={1} minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiCalendar} boxSize={7} color="green.500" />
                <Stat>
                  <StatLabel fontSize="xs">This Month</StatLabel>
                  <StatNumber fontSize="lg">{issuedThisMonth}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" flex={1} minW="140px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiTrendingUp} boxSize={7} color="purple.500" />
                <Stat>
                  <StatLabel fontSize="xs">Avg Exam Score</StatLabel>
                  <StatNumber fontSize="lg">{avgScore}%</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Search */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
          <CardBody p={4}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by student name or certificate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="lg"
              />
            </InputGroup>
          </CardBody>
        </Card>

        {/* Table */}
        {filteredCertificates.length === 0 ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
            <CardBody p={10} textAlign="center">
              <Icon as={FiAward} boxSize={10} color="gray.300" mb={3} />
              <Heading size="sm" color="gray.500" mb={1}>No Certificates Found</Heading>
              <Text fontSize="sm" color="gray.400">
                {searchTerm ? "No certificates match your search." : "No certificates have been issued yet."}
              </Text>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden">
            <CardBody p={0}>
              <Table variant="simple">
                <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Certificate ID</Th>
                    <Th>Exam Score</Th>
                    <Th>Issued On</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCertificates.map((cert) => (
                    <Tr key={cert.id} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiUser} color="gray.400" />
                          <Text fontWeight="medium" fontSize="sm">{cert.userName}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontFamily="mono" fontSize="xs" color="gray.500">
                          {cert.certificateId.slice(-12).toUpperCase()}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="semibold" color={cert.score >= 80 ? "green.600" : cert.score >= 60 ? "orange.500" : "red.500"}>
                          {cert.score}%
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FiCalendar} color="gray.400" boxSize={3} />
                          <Text fontSize="sm">
                            {new Date(cert.completionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="green" borderRadius="full" display="flex" alignItems="center" w="fit-content" gap={1}>
                          <FiCheckCircle />
                          Valid
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          colorScheme="blue"
                          variant="outline"
                          borderRadius="lg"
                          onClick={() => { setSelectedCertificate(cert); onOpen(); }}
                        >
                          Preview
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        <CertificatePreview isOpen={isOpen} onClose={onClose} certificate={selectedCertificate} />
      </VStack>
    </Box>
  );
}
