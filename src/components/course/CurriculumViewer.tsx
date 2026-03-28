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
  Image,
  Card,
  CardBody,
  Divider,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiArrowLeft,
  FiAward,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import Link from "next/link";
import api from "@/lib/api";

const READ_TIME = 60; // seconds required per lesson

interface ViewerLesson {
  id: string;
  title: string;
  content: string;
  images: string[];
  isLocked: boolean;
  isCompleted: boolean;
}

interface CurriculumViewerProps {
  courseId: string;
}

const CurriculumViewer: React.FC<CurriculumViewerProps> = ({ courseId }) => {
  const [lessons, setLessons] = useState<ViewerLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(READ_TIME);
  const [hasQuiz, setHasQuiz] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load lessons + restore progress from backend ──────────────────────────
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          api.get(`/lessons/module/${courseId}`),
          api.get('/progress/me').catch(() => ({ data: { data: [] } })),
        ]);

        const raw: any[] = lessonsRes.data.data.sort(
          (a: any, b: any) => a.order - b.order
        );

        // Find this student's progress record for this module
        const myProgress = (progressRes.data.data as any[]).find(
          (p) => (p.moduleId?._id ?? p.moduleId) === courseId
        );

        // Auto-enroll if not yet enrolled
        if (!myProgress && raw.length > 0) {
          api.post(`/progress/enroll/${courseId}`).catch(() => {});
        }

        // Build a set of lesson IDs the student already completed
        const completedIds = new Set<string>(
          (myProgress?.lessonProgress ?? [])
            .filter((lp: any) => lp.status === 'completed')
            .map((lp: any) => String(lp.lessonId))
        );

        const built: ViewerLesson[] = raw.map((lesson, i) => {
          const id = String(lesson._id);
          const isCompleted = completedIds.has(id);
          const prevCompleted =
            i === 0 || completedIds.has(String(raw[i - 1]._id));
          return {
            id,
            title: lesson.title,
            content: lesson.content ?? '',
            images: (() => {
              const v = lesson.visualContent;
              if (!v) return [];
              try {
                const p = JSON.parse(v);
                return Array.isArray(p) ? p : [v];
              } catch { return [v]; }
            })(),
            isCompleted,
            isLocked: !isCompleted && !prevCompleted,
          };
        });

        setLessons(built);
        setHasQuiz(raw.some((l: any) => l.quiz?.questions?.length > 0));

        // Jump straight to the first uncompleted lesson
        const firstUncompleted = built.findIndex((l) => !l.isCompleted);
        setActiveIndex(firstUncompleted === -1 ? 0 : firstUncompleted);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId]);

  // ── Reading timer — resets each time the active lesson changes ────────────
  useEffect(() => {
    if (!lessons.length) return;

    if (lessons[activeIndex]?.isCompleted) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(READ_TIME);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIndex, lessons.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <Center flex={1} minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!lessons.length) {
    return (
      <Box p={8}>
        <Text color="gray.500">No lessons found for this module.</Text>
      </Box>
    );
  }

  const current = lessons[activeIndex];
  const timerDone = timeLeft === 0;
  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progress = Math.round((completedCount / lessons.length) * 100);
  const allDone = completedCount === lessons.length;

  // ── Mark lesson complete — saves to backend ───────────────────────────────
  const markComplete = () => {
    // Optimistically update UI immediately
    setLessons((prev) =>
      prev.map((l, i) => {
        if (i === activeIndex) return { ...l, isCompleted: true };
        if (i === activeIndex + 1) return { ...l, isLocked: false };
        return l;
      })
    );
    // Save to backend (fire-and-forget; UI is already updated)
    api
      .put(`/progress/lesson/${current.id}/complete`, { quizScore: 100 })
      .catch(() => {});
  };

  const goTo = (index: number) => {
    if (lessons[index].isLocked) return;
    setActiveIndex(index);
  };

  const timerColor =
    timeLeft > 30 ? "blue.400" : timeLeft > 10 ? "orange.400" : "red.400";
  const timerPct = Math.round(((READ_TIME - timeLeft) / READ_TIME) * 100);

  return (
    <Flex h="100%" minH="0" overflow="hidden">
      {/* ── Left sidebar ── */}
      <Box
        w="280px"
        flexShrink={0}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.100"
        overflowY="auto"
        py={6}
      >
        <Box px={5} mb={5}>
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Progress
            </Text>
            <Text fontSize="xs" color="blue.600" fontWeight="bold">
              {completedCount}/{lessons.length}
            </Text>
          </HStack>
          <Progress
            value={progress}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
          />
        </Box>

        <Divider mb={4} />

        <VStack spacing={1} align="stretch" px={3}>
          {lessons.map((lesson, index) => {
            const isActive = index === activeIndex;
            const isDone = lesson.isCompleted;
            const isLocked = lesson.isLocked;

            return (
              <Box
                key={lesson.id}
                onClick={() => goTo(index)}
                cursor={isLocked ? "not-allowed" : "pointer"}
                px={3}
                py={3}
                borderRadius="xl"
                bg={isActive ? "blue.50" : "transparent"}
                opacity={isLocked ? 0.45 : 1}
                transition="all 0.15s"
                _hover={isLocked ? {} : { bg: isActive ? "blue.50" : "gray.50" }}
              >
                <HStack spacing={3} align="start">
                  <Box
                    mt="1px"
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={isDone ? "green.500" : isActive ? "blue.500" : "gray.100"}
                  >
                    {isDone ? (
                      <Icon as={FiCheckCircle} boxSize={3} color="white" />
                    ) : isLocked ? (
                      <Icon as={FiLock} boxSize={3} color="gray.400" />
                    ) : (
                      <Text
                        fontSize="10px"
                        fontWeight="bold"
                        color={isActive ? "white" : "gray.500"}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </Box>

                  <Box flex={1} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight={isActive ? "semibold" : "normal"}
                      color={
                        isActive ? "blue.700" : isDone ? "green.700" : "gray.600"
                      }
                      noOfLines={2}
                      lineHeight="1.4"
                    >
                      {lesson.title}
                    </Text>
                    {isDone && (
                      <Badge
                        colorScheme="green"
                        borderRadius="full"
                        fontSize="10px"
                        mt={1}
                        px={2}
                      >
                        Done
                      </Badge>
                    )}
                  </Box>

                  {isActive && !isLocked && (
                    <Icon
                      as={FiChevronRight}
                      boxSize={4}
                      color="blue.400"
                      flexShrink={0}
                      mt="2px"
                    />
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>

        {allDone && hasQuiz && (
          <Box px={5} mt={6}>
            <Divider mb={4} />
            <Link href={`/courses/${courseId}/quiz`}>
              <Button
                colorScheme="green"
                borderRadius="xl"
                w="full"
                rightIcon={<FiAward />}
                size="sm"
              >
                Take Quiz
              </Button>
            </Link>
          </Box>
        )}
      </Box>

      {/* ── Main content ── */}
      <Box flex={1} overflowY="auto" bg="gray.50" p={8}>
        <Box maxW="780px" mx="auto">
          <HStack spacing={1} mb={6} color="gray.400" fontSize="sm">
            <Text>Module</Text>
            <Icon as={FiChevronRight} boxSize={3} />
            <Text color="gray.600" fontWeight="medium" noOfLines={1}>
              {current.title}
            </Text>
          </HStack>

          <Card borderRadius="2xl" boxShadow="sm" overflow="hidden" mb={6}>
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="blue.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mb={2}
                    >
                      Lesson {activeIndex + 1} of {lessons.length}
                    </Text>
                    <Heading size="lg" color="gray.800" lineHeight="1.3">
                      {current.title}
                    </Heading>
                  </Box>
                  {current.isCompleted && (
                    <Badge
                      colorScheme="green"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                      flexShrink={0}
                    >
                      Completed
                    </Badge>
                  )}
                </HStack>

                <Divider />

                <Box>
                  {(() => {
                    const lines = current.content.split('\n');
                    const elements: React.ReactNode[] = [];
                    let key = 0;
                    let i = 0;

                    while (i < lines.length) {
                      const line = lines[i];
                      const k = key++;

                      // Empty line → small spacer
                      if (line.trim() === '') {
                        elements.push(<Box key={k} h={3} />);
                        i++;
                        continue;
                      }

                      // Bullet line (•, -, *, ·)
                      if (/^\s*[•\-\*·]\s/.test(line)) {
                        const bullets: string[] = [];
                        while (i < lines.length && /^\s*[•\-\*·]\s/.test(lines[i])) {
                          bullets.push(lines[i].replace(/^\s*[•\-\*·]\s*/, ''));
                          i++;
                        }
                        elements.push(
                          <Box key={k} mb={3}>
                            {bullets.map((b, bi) => (
                              <HStack key={bi} spacing={2} align="start" mb={1}>
                                <Text color="blue.400" fontSize="md" lineHeight="1.8" flexShrink={0}>•</Text>
                                <Text color="gray.700" fontSize="md" lineHeight="1.8">{b}</Text>
                              </HStack>
                            ))}
                          </Box>
                        );
                        continue;
                      }

                      // Numbered line (1., 2., etc.)
                      if (/^\s*\d+\.\s/.test(line)) {
                        const items: { num: string; text: string }[] = [];
                        while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
                          const m = lines[i].match(/^\s*(\d+)\.\s+(.*)/);
                          if (m) items.push({ num: m[1], text: m[2] });
                          i++;
                        }
                        elements.push(
                          <Box key={k} mb={3}>
                            {items.map((item, ii) => (
                              <HStack key={ii} spacing={2} align="start" mb={1}>
                                <Text color="blue.500" fontSize="md" lineHeight="1.8" fontWeight="semibold" flexShrink={0}>
                                  {item.num}.
                                </Text>
                                <Text color="gray.700" fontSize="md" lineHeight="1.8">{item.text}</Text>
                              </HStack>
                            ))}
                          </Box>
                        );
                        continue;
                      }

                      // Regular text — collect consecutive lines into one paragraph
                      const paragraphLines: string[] = [];
                      while (
                        i < lines.length &&
                        lines[i].trim() !== '' &&
                        !/^\s*[•\-\*·]\s/.test(lines[i]) &&
                        !/^\s*\d+\.\s/.test(lines[i])
                      ) {
                        paragraphLines.push(lines[i]);
                        i++;
                      }
                      elements.push(
                        <Text key={k} color="gray.700" fontSize="md" lineHeight="1.8" mb={4}>
                          {paragraphLines.join(' ')}
                        </Text>
                      );
                    }

                    return elements;
                  })()}
                </Box>

                {current.images.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    {current.images.map((src, idx) => (
                      <Image
                        key={idx}
                        src={src}
                        alt={`${current.title} — image ${idx + 1}`}
                        borderRadius="xl"
                        w="full"
                        maxH="400px"
                        objectFit="cover"
                        boxShadow="sm"
                      />
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Reading timer — only shown while lesson not yet completed */}
          {!current.isCompleted && (
            <Card borderRadius="2xl" boxShadow="sm" mb={6}>
              <CardBody>
                <HStack spacing={5} align="center">
                  <CircularProgress
                    value={timerPct}
                    color={timerColor}
                    trackColor="gray.100"
                    size="72px"
                    thickness="8px"
                  >
                    <CircularProgressLabel>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={timerColor}
                        lineHeight="1"
                      >
                        {timeLeft}s
                      </Text>
                    </CircularProgressLabel>
                  </CircularProgress>

                  <Box flex={1}>
                    {timerDone ? (
                      <>
                        <Text fontWeight="semibold" color="green.600" fontSize="sm">
                          You&apos;re ready to continue!
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={0.5}>
                          Click &quot;Mark as Complete&quot; to unlock the next lesson.
                        </Text>
                      </>
                    ) : (
                      <>
                        <HStack spacing={2}>
                          <Icon as={FiClock} color="blue.400" boxSize={4} />
                          <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                            Please read the lesson carefully
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.400" mt={0.5}>
                          You can mark complete in{" "}
                          <Text as="span" fontWeight="bold" color="blue.500">
                            {timeLeft} second{timeLeft !== 1 ? "s" : ""}
                          </Text>
                          .
                        </Text>
                      </>
                    )}
                  </Box>

                  <Box w="120px">
                    <Progress
                      value={timerPct}
                      colorScheme={
                        timeLeft > 30 ? "blue" : timeLeft > 10 ? "orange" : "red"
                      }
                      borderRadius="full"
                      size="sm"
                    />
                    <Text fontSize="10px" color="gray.400" mt={1} textAlign="right">
                      {timerPct}% read
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          )}

          <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
            <Button
              variant="outline"
              leftIcon={<FiArrowLeft />}
              borderRadius="xl"
              isDisabled={activeIndex === 0}
              onClick={() => goTo(activeIndex - 1)}
              colorScheme="gray"
            >
              Previous
            </Button>

            <HStack spacing={3}>
              {!current.isCompleted && (
                <Tooltip
                  label={!timerDone ? `Please wait ${timeLeft}s before marking complete` : ""}
                  hasArrow
                >
                  <Button
                    colorScheme="blue"
                    borderRadius="xl"
                    leftIcon={<FiCheckCircle />}
                    onClick={markComplete}
                    isDisabled={!timerDone}
                    _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                  >
                    Mark as Complete
                  </Button>
                </Tooltip>
              )}

              {current.isCompleted && activeIndex < lessons.length - 1 && (
                <Button
                  colorScheme="blue"
                  borderRadius="xl"
                  rightIcon={<FiArrowRight />}
                  onClick={() => goTo(activeIndex + 1)}
                >
                  Next Lesson
                </Button>
              )}

              {allDone && hasQuiz && activeIndex === lessons.length - 1 && (
                <Link href={`/courses/${courseId}/quiz`}>
                  <Button colorScheme="green" borderRadius="xl" rightIcon={<FiAward />}>
                    Take the Quiz
                  </Button>
                </Link>
              )}
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default CurriculumViewer;
