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
} from "@chakra-ui/react";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
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
      await login(form.email, form.password);

      // Determine redirect based on role stored by authService
      const storedUser = localStorage.getItem("errbud_user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const dest = user?.role === "admin" ? "/admin" : "/dashboard";

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      setTimeout(() => router.push(dest), 800);
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Invalid email or password.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                Welcome back
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Sign in to continue to your dashboard
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
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
                      placeholder="Enter your password"
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

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  borderRadius="lg"
                  rightIcon={<FiArrowRight />}
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  w="full"
                  mt={2}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text fontSize="xs" color="gray.400" textAlign="center">
              Contact your administrator if you don't have login credentials.
            </Text>

          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
