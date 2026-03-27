"use client";

import { useState, useEffect } from "react";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiAward, FiArrowRight, FiClipboard } from "react-icons/fi";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import api from "@/lib/api";

interface MyCertificate {
  id: string;
  studentName: string;
  score: number;
  issuedAt: string;
}

export default function CertificatePage() {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<MyCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/mine')
      .then((res) => {
        const c = res.data.data;
        setCertificate({
          id: String(c._id),
          studentName: c.studentName,
          score: c.score,
          issuedAt: c.issuedAt,
        });
      })
      .catch(() => {
        // 404 means no certificate yet — that's fine
        setCertificate(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="yellow.400" />
      </Center>
    );
  }

  // ── No certificate yet ────────────────────────────────────────────────────
  if (!certificate) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={6}
      >
        <Box maxW="480px" w="full">
          <VStack spacing={6} align="stretch">
            <VStack spacing={3} align="center" pt={4}>
              <Box
                w="80px" h="80px" borderRadius="2xl" bg="yellow.50"
                display="flex" alignItems="center" justifyContent="center"
              >
                <Icon as={FiAward} boxSize={9} color="yellow.400" />
              </Box>
              <Heading size="lg" color="gray.800" textAlign="center">
                No Certificate Yet
              </Heading>
              <Text color="gray.500" fontSize="sm" textAlign="center" maxW="360px">
                You haven&apos;t earned your certificate yet. Complete all
                modules, pass the quizzes, then sit and pass the final exam to
                receive yours.
              </Text>
            </VStack>

            <Card borderRadius="2xl" boxShadow="sm">
              <CardBody p={6}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={4}>
                  Steps to Earn Your Certificate
                </Text>
                <VStack spacing={4} align="stretch">
                  {[
                    { step: "1", label: "Complete all modules", sub: "Read through every lesson in all modules" },
                    { step: "2", label: "Pass each module quiz", sub: "Score 60% or above on every quiz" },
                    { step: "3", label: "Pass the final exam", sub: "Score 60% or above on the final exam" },
                  ].map((item) => (
                    <HStack key={item.step} spacing={4} align="start">
                      <Box w="32px" h="32px" borderRadius="lg" bg="blue.500"
                        display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                        <Text fontSize="sm" fontWeight="bold" color="white" lineHeight="1">
                          {item.step}
                        </Text>
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">{item.label}</Text>
                        <Text fontSize="xs" color="gray.400">{item.sub}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            <VStack spacing={3}>
              <Link href="/courses" style={{ width: "100%" }}>
                <Button colorScheme="blue" borderRadius="xl" w="full" size="lg" rightIcon={<FiArrowRight />}>
                  Go to Modules
                </Button>
              </Link>
              <Link href="/final-exam" style={{ width: "100%" }}>
                <Button variant="outline" colorScheme="gray" borderRadius="xl" w="full" leftIcon={<FiClipboard />}>
                  View Final Exam
                </Button>
              </Link>
            </VStack>

            <Text fontSize="xs" color="gray.400" textAlign="center">
              Your certificate will appear here automatically once you pass the final exam.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // ── Certificate earned — show it ─────────────────────────────────────────
  return (
    <CertificateTemplate
      certificate={{
        id: certificate.id,
        courseName: "Errbud Professional Cleaning Program",
        studentName: certificate.studentName || user?.name || "Student",
        completionDate: new Date(certificate.issuedAt).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric",
        }),
        score: certificate.score,
        instructorName: "Errbud Training Faculty",
        certificateId: certificate.id,
      }}
    />
  );
}
