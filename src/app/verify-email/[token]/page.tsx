"use client";

import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Spinner,
  Icon,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiArrowRight,
} from "react-icons/fi";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  const token = params.token as string;

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/verify-email/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        setMessage("Email verified successfully! Your account is now active.");
        toast({
          title: "Email Verified!",
          description: "Your account has been activated. Redirecting to login...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
      toast({
        title: "Verification Failed",
        description: "Unable to verify your email. Please try again or contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/signin");
    }
  }, [status, countdown, router]);

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
      <Box w="full" maxW="420px">
        {/* Logo */}
        <VStack mb={8} spacing={1}>
          <Flex align="center" justify="center" gap={3}>
            <Box
              as="img"
              src="/images/logo/og-image.png"
              alt="Errbud Logo"
              w="12"
              h="12"
              objectFit="contain"
            />
            <Heading size="xl" color="blue.600" letterSpacing="-0.5px">
              Errbud
            </Heading>
          </Flex>
          <Text color="gray.500" fontSize="sm">
            Professional Cleaning Training Platform
          </Text>
        </VStack>

        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={8}>
          <VStack spacing={6} align="center" textAlign="center">
            {status === "loading" && (
              <>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <VStack spacing={3}>
                  <Heading size="lg" color="gray.800">
                    Verifying your email...
                  </Heading>
                  <Text color="gray.600">
                    Please wait while we verify your email address
                  </Text>
                </VStack>
              </>
            )}

            {status === "success" && (
              <>
                <Icon as={FiCheckCircle} boxSize={16} color="green.500" />
                <VStack spacing={3}>
                  <Heading size="lg" color="gray.800">
                    Verification Successful!
                  </Heading>
                  <Text color="gray.600" fontSize="md">
                    {message}
                  </Text>
                  <Text color="blue.600" fontSize="sm" fontWeight="500">
                    Redirecting to login in {countdown} seconds...
                  </Text>
                </VStack>
                <Button
                  as={Link}
                  href="/signin"
                  colorScheme="blue"
                  size="lg"
                  borderRadius="lg"
                  rightIcon={<FiArrowRight />}
                  w="full"
                  mt={2}
                >
                  Go to Login Now
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <Icon as={FiXCircle} boxSize={16} color="red.500" />
                <VStack spacing={3}>
                  <Heading size="lg" color="gray.800">
                    Verification Failed
                  </Heading>
                  <Text color="gray.600" fontSize="md">
                    {message}
                  </Text>
                </VStack>
                <VStack spacing={3} w="full" mt={4}>
                  <Button
                    as={Link}
                    href="/signin"
                    colorScheme="blue"
                    size="lg"
                    borderRadius="lg"
                    w="full"
                  >
                    Back to Login
                  </Button>
                  <Text fontSize="xs" color="gray.400">
                    If you continue to have issues, please contact your administrator.
                  </Text>
                </VStack>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
