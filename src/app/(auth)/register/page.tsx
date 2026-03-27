"use client";

import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Icon,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";
import NextLink from "next/link";
import api from "@/lib/api";

export default function RegisterPage() {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSubmitted(true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Registration failed.";
      toast({
        title: "Registration failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
        <Box w="full" maxW="420px">
          <Box bg="white" borderRadius="2xl" boxShadow="lg" p={8}>
            <VStack spacing={5} align="center">
              <Box w="72px" h="72px" borderRadius="2xl" bg="green.50"
                display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCheckCircle} boxSize={9} color="green.400" />
              </Box>
              <VStack spacing={2} align="center">
                <Heading size="lg" color="gray.800" textAlign="center">
                  Registration Submitted!
                </Heading>
                <Text color="gray.500" fontSize="sm" textAlign="center" maxW="320px">
                  Your account is pending admin approval. Once approved, you can log in using your email and password.
                </Text>
                <Text color="blue.500" fontSize="sm" textAlign="center" maxW="320px" fontWeight="medium">
                  Make sure the email you used matches your Errbud platform account.
                </Text>
              </VStack>
              <Divider />
              <NextLink href="/signin" style={{ width: "100%" }}>
                <Button colorScheme="blue" borderRadius="xl" w="full" rightIcon={<FiArrowRight />}>
                  Back to Sign In
                </Button>
              </NextLink>
            </VStack>
          </Box>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
      <Box w="full" maxW="420px">
        {/* Logo */}
        <VStack mb={8} spacing={1}>
          <Heading size="xl" color="blue.600" letterSpacing="-0.5px">
            Errbud
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Professional Cleaning Training Platform
          </Text>
        </VStack>

        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={1} align="start">
              <Heading size="lg" color="gray.800">
                Student Sign Up
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Use the same email as your Errbud platform account
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel fontSize="sm" color="gray.700">Full Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiUser} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      pl={10}
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="sm" color="gray.700">Email Address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      pl={10}
                      type="email"
                      placeholder="you@errbud.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize="sm" color="gray.700">Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      pl={10}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      borderRadius="lg"
                    />
                    <InputRightElement>
                      <Icon
                        as={showPassword ? FiEyeOff : FiEye}
                        color="gray.400"
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirm}>
                  <FormLabel fontSize="sm" color="gray.700">Confirm Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      pl={10}
                      type="password"
                      placeholder="Repeat your password"
                      value={form.confirm}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.confirm}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  borderRadius="lg"
                  rightIcon={<FiArrowRight />}
                  isLoading={isLoading}
                  loadingText="Submitting..."
                  w="full"
                  mt={2}
                >
                  Submit Registration
                </Button>
              </VStack>
            </form>

            <Divider />

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Already have an account?{" "}
              <NextLink href="/signin" style={{ color: "#3182ce", fontWeight: 600 }}>
                Sign in
              </NextLink>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
