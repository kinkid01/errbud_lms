"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Progress,
  Badge,
  Icon,
  Card,
  CardBody,
  Divider,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiAward,
  FiRefreshCw,
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiBookOpen,
} from "react-icons/fi";
import Link from "next/link";
import api from "@/lib/api";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];
const EXAM_SECONDS = 30 * 60; // 30 minutes

interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionButton({
  label,
  text,
  selected,
  onClick,
}: {
  label: string;
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      align="center" gap={4} p={4}
      border="2px solid"
      borderColor={selected ? "blue.500" : "gray.200"}
      borderRadius="xl"
      bg={selected ? "blue.50" : "white"}
      cursor="pointer"
      transition="all 0.15s"
      _hover={selected ? {} : { bg: "blue.50", borderColor: "blue.300" }}
      onClick={onClick}
      w="full"
    >
      <Flex
        w="32px" h="32px" borderRadius="lg"
        bg={selected ? "blue.500" : "gray.100"}
        align="center" justify="center" flexShrink={0} transition="all 0.15s"
      >
        <Text fontSize="sm" fontWeight="bold" color={selected ? "white" : "gray.500"}>
          {label}
        </Text>
      </Flex>
      <Text fontSize="sm" fontWeight={selected ? "semibold" : "normal"} color={selected ? "blue.700" : "gray.700"}>
        {text}
      </Text>
    </Flex>
  );
}

// ── Question dot navigator ────────────────────────────────────────────────────
function QuestionDots({ total, current, answers, onSelect }: {
  total: number; current: number; answers: number[]; onSelect: (i: number) => void;
}) {
  return (
    <Flex gap={2} flexWrap="wrap" justify="center">
      {Array.from({ length: total }).map((_, i) => {
        const answered = answers[i] !== -1;
        const isActive = i === current;
        return (
          <Box key={i} w="32px" h="32px" borderRadius="lg"
            display="flex" alignItems="center" justifyContent="center"
            cursor="pointer" fontSize="xs" fontWeight="bold" transition="all 0.15s"
            bg={isActive ? "blue.500" : answered ? "blue.100" : "gray.100"}
            color={isActive ? "white" : answered ? "blue.600" : "gray.400"}
            border="2px solid" borderColor={isActive ? "blue.500" : "transparent"}
            _hover={{ borderColor: "blue.300" }}
            onClick={() => onSelect(i)}
          >
            {i + 1}
          </Box>
        );
      })}
    </Flex>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({ score, passed, passingScore, onRetry }: {
  score: number; passed: boolean; passingScore: number; onRetry: () => void;
}) {
  return (
    <Box p={{ base: 4, md: 8 }} maxW="560px" mx="auto">
      <Card borderRadius="2xl" boxShadow="sm" overflow="hidden">
        <Box h="6px" bg={passed ? "green.400" : "red.400"} />
        <CardBody p={8}>
          <VStack spacing={6} align="center">
            <CircularProgress
              value={score}
              color={passed ? "green.400" : "red.400"}
              trackColor="gray.100"
              size="140px"
              thickness="10px"
            >
              <CircularProgressLabel>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color={passed ? "green.500" : "red.500"} lineHeight="1">
                    {Math.round(score)}%
                  </Text>
                  <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                    score
                  </Text>
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>

            <VStack spacing={2} align="center">
              <Heading size="lg" color={passed ? "green.600" : "red.500"}>
                {passed ? "Final Exam Passed! 🎉" : "Not Quite There"}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {passingScore}% required to pass
              </Text>
              {passed && (
                <Badge colorScheme="green" borderRadius="full" px={4} py={1} mt={1} fontSize="sm">
                  Certificate Unlocked
                </Badge>
              )}
              {!passed && (
                <Text color="gray.400" fontSize="sm" textAlign="center" maxW="320px">
                  Don't worry — review your modules and try again. You need {passingScore}% to pass.
                </Text>
              )}
            </VStack>

            <HStack spacing={3} flexWrap="wrap" justify="center">
              {!passed && (
                <Button colorScheme="blue" borderRadius="xl" leftIcon={<FiRefreshCw />} onClick={onRetry}>
                  Retry Exam
                </Button>
              )}
              {passed && (
                <Link href="/certificate">
                  <Button colorScheme="green" borderRadius="xl" leftIcon={<FiAward />}>
                    View Certificate
                  </Button>
                </Link>
              )}
              <Link href="/courses">
                <Button variant="outline" borderRadius="xl" colorScheme="gray" leftIcon={<FiBookOpen />}>
                  Back to Modules
                </Button>
              </Link>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const FinalExam: React.FC = () => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [passingScore, setPassingScore] = useState(60);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<(() => void) | null>(null);

  // ── Load questions from backend ───────────────────────────────────────────
  useEffect(() => {
    api.get('/exam/student')
      .then((res) => {
        const data = res.data.data;
        const qs: ExamQuestion[] = (data?.questions ?? []).map((q: any) => ({
          id: String(q._id),
          text: q.text,
          options: q.options ?? [],
        }));
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(-1));
        setPassingScore(data?.passingScore ?? 60);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Start timer once questions are loaded ─────────────────────────────────
  useEffect(() => {
    if (loading || !questions.length || submitted) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [loading, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    clearInterval(intervalRef.current!);
    setSubmitting(true);
    try {
      const res = await api.post('/exam/submit', { answers });
      setScore(res.data.score);
      setPassed(res.data.passed);
      setPassingScore(res.data.passingScore);
    } catch {
      // Fallback — still show submitted state
      setScore(0);
      setPassed(false);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };
  handleSubmitRef.current = handleSubmit;

  const handleRetry = () => {
    setAnswers(new Array(questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setCurrent(0);
    setTimeLeft(EXAM_SECONDS);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!questions.length) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500" mb={4}>
          The final exam has not been set up yet. Please ask your admin to create the exam questions.
        </Text>
        <Link href="/courses">
          <Button colorScheme="blue" borderRadius="xl">Back to Modules</Button>
        </Link>
      </Box>
    );
  }

  if (submitted) {
    return (
      <ResultsScreen
        score={score}
        passed={passed}
        passingScore={passingScore}
        onRetry={handleRetry}
      />
    );
  }

  if (submitting) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text color="gray.500">Submitting your exam...</Text>
        </VStack>
      </Center>
    );
  }

  const q = questions[current];
  const answeredCount = answers.filter((a) => a !== -1).length;
  const timerColor = timeLeft > 600 ? "green.400" : timeLeft > 300 ? "orange.400" : "red.400";
  const timerPct = Math.round(((EXAM_SECONDS - timeLeft) / EXAM_SECONDS) * 100);

  return (
    <Box p={{ base: 4, md: 8 }} maxW="760px" mx="auto">
      <VStack spacing={5} align="stretch">

        {/* Header */}
        <Card borderRadius="2xl" boxShadow="sm">
          <CardBody px={6} py={4}>
            <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                  Final Exam
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Question {current + 1} of {questions.length}
                </Text>
              </VStack>

              <HStack spacing={3}>
                <CircularProgress value={timerPct} color={timerColor} trackColor="gray.100" size="48px" thickness="8px">
                  <CircularProgressLabel>
                    <Icon as={FiClock} boxSize={3} color={timerColor} />
                  </CircularProgressLabel>
                </CircularProgress>
                <VStack spacing={0} align="start">
                  <Text fontSize="lg" fontWeight="bold" color={timerColor} lineHeight="1">
                    {formatTime(timeLeft)}
                  </Text>
                  <Text fontSize="10px" color="gray.400">remaining</Text>
                </VStack>
              </HStack>
            </Flex>

            <Box mt={4}>
              <HStack justify="space-between" mb={1.5}>
                <Text fontSize="xs" color="gray.400">{answeredCount} of {questions.length} answered</Text>
                <Text fontSize="xs" color="gray.400">Question {current + 1} / {questions.length}</Text>
              </HStack>
              <Progress value={(current / questions.length) * 100} colorScheme="blue" borderRadius="full" size="sm" bg="gray.100" />
            </Box>
          </CardBody>
        </Card>

        <QuestionDots total={questions.length} current={current} answers={answers} onSelect={setCurrent} />

        {/* Question card */}
        <Card borderRadius="2xl" boxShadow="sm">
          <CardBody p={7}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Badge colorScheme="purple" borderRadius="full" fontSize="xs" px={3} mb={3}>
                  Question {current + 1} of {questions.length}
                </Badge>
                <Heading size="md" color="gray.800" lineHeight="1.5" fontWeight="semibold">
                  {q.text}
                </Heading>
              </Box>
              <Divider />
              <VStack spacing={3} align="stretch">
                {q.options.map((option, idx) => (
                  <OptionButton
                    key={idx}
                    label={OPTION_LABELS[idx] ?? String(idx + 1)}
                    text={option}
                    selected={answers[current] === idx}
                    onClick={() => {
                      const updated = [...answers];
                      updated[current] = idx;
                      setAnswers(updated);
                    }}
                  />
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Navigation */}
        <Flex justify="space-between" align="center" gap={3}>
          <Button variant="outline" borderRadius="xl" leftIcon={<FiArrowLeft />}
            isDisabled={current === 0} onClick={() => setCurrent((p) => p - 1)} colorScheme="gray">
            Previous
          </Button>

          {current < questions.length - 1 ? (
            <Button colorScheme="blue" borderRadius="xl" rightIcon={<FiArrowRight />}
              onClick={() => setCurrent((p) => p + 1)}>
              Next
            </Button>
          ) : (
            <Button colorScheme="green" borderRadius="xl" leftIcon={<FiAward />}
              isDisabled={answeredCount < questions.length}
              onClick={handleSubmit}>
              Submit Exam
            </Button>
          )}
        </Flex>

        {current === questions.length - 1 && answeredCount < questions.length && (
          <Text fontSize="xs" color="orange.500" textAlign="center">
            {questions.length - answeredCount} question{questions.length - answeredCount > 1 ? "s" : ""} still unanswered — go back and answer before submitting.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default FinalExam;
