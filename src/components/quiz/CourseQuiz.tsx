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
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiRefreshCw,
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiBookOpen,
} from "react-icons/fi";
import Link from "next/link";
import api from "@/lib/api";

const OPTION_LABELS = ["A", "B", "C", "D"];
const QUIZ_SECONDS = 5 * 60;

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface CourseQuizProps {
  courseId: string;
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionButton({
  label,
  text,
  state,
  onClick,
}: {
  label: string;
  text: string;
  state: "idle" | "selected" | "correct" | "wrong" | "missed";
  onClick?: () => void;
}) {
  const styles = {
    idle:     { bg: "white",    border: "gray.200",  labelBg: "gray.100",  labelColor: "gray.500",  textColor: "gray.700",  hover: { bg: "blue.50", borderColor: "blue.300" } },
    selected: { bg: "blue.50",  border: "blue.500",  labelBg: "blue.500",  labelColor: "white",     textColor: "blue.700",  hover: {} },
    correct:  { bg: "green.50", border: "green.400", labelBg: "green.500", labelColor: "white",     textColor: "green.700", hover: {} },
    wrong:    { bg: "red.50",   border: "red.400",   labelBg: "red.500",   labelColor: "white",     textColor: "red.700",   hover: {} },
    missed:   { bg: "green.50", border: "green.400", labelBg: "green.500", labelColor: "white",     textColor: "green.700", hover: {} },
  }[state];

  return (
    <Flex
      align="center" gap={4} p={4}
      border="2px solid" borderColor={styles.border}
      borderRadius="xl" bg={styles.bg}
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.15s"
      _hover={onClick ? styles.hover : {}}
      onClick={onClick} w="full"
    >
      <Flex w="32px" h="32px" borderRadius="lg" bg={styles.labelBg}
        align="center" justify="center" flexShrink={0} transition="all 0.15s">
        <Text fontSize="sm" fontWeight="bold" color={styles.labelColor}>
          {state === "correct" || state === "missed" ? (
            <Icon as={FiCheckCircle} boxSize={4} />
          ) : state === "wrong" ? (
            <Icon as={FiXCircle} boxSize={4} />
          ) : label}
        </Text>
      </Flex>
      <Text fontSize="sm" fontWeight={state !== "idle" ? "semibold" : "normal"} color={styles.textColor}>
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
function ResultsScreen({ questions, answers, score, passed, onRetry }: {
  questions: QuizQuestion[]; answers: number[]; score: number; passed: boolean; onRetry: () => void;
}) {
  const correct = Math.round((score / 100) * questions.length);
  return (
    <Box p={{ base: 4, md: 8 }} maxW="960px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Card borderRadius="2xl" boxShadow="sm" overflow="hidden">
          <Box h="6px" bg={passed ? "green.400" : "red.400"} />
          <CardBody p={8}>
            <VStack spacing={6} align="center">
              <CircularProgress
                value={score} color={passed ? "green.400" : "red.400"}
                trackColor="gray.100" size="120px" thickness="10px"
              >
                <CircularProgressLabel>
                  <VStack spacing={0}>
                    <Text fontSize="xl" fontWeight="bold" color={passed ? "green.500" : "red.500"} lineHeight="1">
                      {Math.round(score)}%
                    </Text>
                    <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                      score
                    </Text>
                  </VStack>
                </CircularProgressLabel>
              </CircularProgress>

              <VStack spacing={1} align="center">
                <Heading size="lg" color={passed ? "green.600" : "red.500"}>
                  {passed ? "Quiz Passed! 🎉" : "Not Quite There"}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {correct} out of {questions.length} correct &nbsp;·&nbsp; 60% required to pass
                </Text>
              </VStack>

              <HStack spacing={3}>
                {!passed && (
                  <Button colorScheme="blue" borderRadius="xl" leftIcon={<FiRefreshCw />} onClick={onRetry}>
                    Retry Quiz
                  </Button>
                )}
                <Link href="/courses">
                  <Button
                    colorScheme={passed ? "green" : "gray"}
                    variant={passed ? "solid" : "outline"}
                    borderRadius="xl"
                    leftIcon={<FiBookOpen />}
                  >
                    Back to Modules
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Answer review */}
        <Card borderRadius="2xl" boxShadow="sm">
          <CardBody p={6}>
            <Heading size="sm" color="gray.700" mb={5}>Answer Review</Heading>
            <VStack spacing={3} align="stretch">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                const unanswered = userAnswer === -1;
                return (
                  <Box key={q.id} p={4} borderRadius="xl"
                    bg={isCorrect ? "green.50" : "red.50"}
                    border="1px solid" borderColor={isCorrect ? "green.200" : "red.200"}
                  >
                    <HStack spacing={3} align="start">
                      <Icon as={isCorrect ? FiCheckCircle : FiXCircle}
                        color={isCorrect ? "green.500" : "red.500"}
                        boxSize={5} mt="2px" flexShrink={0}
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                          Q{i + 1}. {q.question}
                        </Text>
                        <Text fontSize="xs" color={isCorrect ? "green.600" : "red.600"}>
                          Your answer:{" "}
                          <strong>
                            {unanswered ? "Not answered" : `${OPTION_LABELS[userAnswer]}. ${q.options[userAnswer]}`}
                          </strong>
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const CourseQuiz: React.FC<CourseQuizProps> = ({ courseId }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<(() => void) | null>(null);
  const lessonIdsWithQuiz = useRef<string[]>([]);

  useEffect(() => {
    api.get(`/lessons/module/${courseId}`)
      .then((res) => {
        const lessons: any[] = res.data.data;
        const allQuestions: QuizQuestion[] = [];
        const lessonIds: string[] = [];

        for (const lesson of lessons) {
          if (lesson.quiz?.questions?.length) {
            lessonIds.push(String(lesson._id ?? lesson.id));
            for (const q of lesson.quiz.questions) {
              allQuestions.push({
                id: String(q._id ?? Math.random()),
                question: q.text,
                options: q.options ?? [],
                correctAnswer: q.correctAnswer ?? 0,
                category: lesson.title,
              });
            }
          }
        }

        lessonIdsWithQuiz.current = lessonIds;
        setQuestions(allQuestions);
        setAnswers(new Array(allQuestions.length).fill(-1));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

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

  const handleSubmit = () => {
    clearInterval(intervalRef.current!);
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0
    );
    const finalScore = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    setScore(finalScore);
    setSubmitted(true);

    // Save quiz score to backend for each lesson that had quiz questions
    for (const lessonId of lessonIdsWithQuiz.current) {
      api
        .put(`/progress/lesson/${lessonId}/complete`, { quizScore: Math.round(finalScore) })
        .catch(() => {});
    }
  };

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  const handleRetry = () => {
    setAnswers(new Array(questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
    setCurrent(0);
    setTimeLeft(QUIZ_SECONDS);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

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
          No quiz questions have been set for this module yet. Ask your admin to add questions.
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
        questions={questions}
        answers={answers}
        score={score}
        passed={score >= 60}
        onRetry={handleRetry}
      />
    );
  }

  const q = questions[current];
  const answeredCount = answers.filter((a) => a !== -1).length;
  const timerColor = timeLeft > 120 ? "green.400" : timeLeft > 60 ? "orange.400" : "red.400";
  const timerPct = Math.round(((QUIZ_SECONDS - timeLeft) / QUIZ_SECONDS) * 100);
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Box p={{ base: 4, md: 8 }} maxW="960px" mx="auto">
      <VStack spacing={5} align="stretch">

        {/* Header */}
        <Card borderRadius="2xl" boxShadow="sm">
          <CardBody px={6} py={4}>
            <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                  Module Quiz
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  {q.category}
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
        <Card borderRadius="2xl" boxShadow="sm" width={"800px"}>
          <CardBody p={7}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Badge colorScheme="blue" borderRadius="full" fontSize="xs" px={3} mb={3}>
                  Question {current + 1}
                </Badge>
                <Heading size="md" color="gray.800" lineHeight="1.5" fontWeight="semibold">
                  {q.question}
                </Heading>
              </Box>
              <Divider />
              <VStack spacing={3} align="stretch">
                {q.options.map((option, idx) => (
                  <OptionButton
                    key={idx}
                    label={OPTION_LABELS[idx] ?? String(idx + 1)}
                    text={option}
                    state={answers[current] === idx ? "selected" : "idle"}
                    onClick={() => {
                      if (submitted) return;
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
            <Button colorScheme="blue" borderRadius="xl" rightIcon={<FiArrowRight />} onClick={() => setCurrent((p) => p + 1)}>
              Next
            </Button>
          ) : (
            <Button colorScheme="green" borderRadius="xl" leftIcon={<FiAward />}
              isDisabled={answeredCount < questions.length} onClick={handleSubmit}>
              Submit Quiz
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

export default CourseQuiz;
