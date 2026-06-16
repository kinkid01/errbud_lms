"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Box,
  useColorModeValue,
  Icon,
  Divider,
} from "@chakra-ui/react";
import {
  FiBook,
  FiAward,
  FiCheckCircle,
  FiPlay,
  FiTrendingUp,
} from "react-icons/fi";
import { User, UserProgress } from "@/types/admin";

interface UserProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userProgress: UserProgress[];
}

const UserProgressModal: React.FC<UserProgressModalProps> = ({
  isOpen,
  onClose,
  user,
  userProgress,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gray50Bg = useColorModeValue("gray.50", "gray.700");

  if (!user) return null;

  // Calculate overall stats
  const totalCourses = userProgress.length;
  const completedCourses = userProgress.filter(p => p.status === 'completed').length;
  const inProgressCourses = userProgress.filter(p => p.status === 'in_progress').length;
  const allQuizScores = userProgress.flatMap(p => {
    const lessonScores = p.curriculumProgress
      .filter(c => c.quizScore != null && c.attempts > 0)
      .map(c => c.quizScore as number);
    if (lessonScores.length > 0) return lessonScores;
    return p.courseQuizScore != null ? [p.courseQuizScore] : [];
  });
  const averageScore = allQuizScores.length > 0
    ? allQuizScores.reduce((acc, s) => acc + s, 0) / allQuizScores.length
    : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge colorScheme="green">Completed</Badge>;
      case 'in_progress':
        return <Badge colorScheme="blue">In Progress</Badge>;
      case 'not_started':
        return <Badge colorScheme="gray">Not Started</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  const getProgressPercentage = (progress: UserProgress) => {
    if (progress.status === 'completed') return 100;
    if (progress.status === 'not_started') return 0;
    
    // Calculate based on curriculum progress
    const completedCurriculums = progress.curriculumProgress.filter(c => c.status === 'completed').length;
    const totalCurriculums = progress.curriculumProgress.length;
    return totalCurriculums > 0 ? (completedCurriculums / totalCurriculums) * 100 : 0;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "6xl" }}>
      <ModalOverlay />
      <ModalContent maxW={{ base: "100vw", md: "90vw" }} m={{ base: 0, md: 4 }} borderRadius={{ base: 0, md: "xl" }}>
        <ModalHeader pb={2}>
          <VStack align="start" spacing={1}>
            <Heading size={{ base: "md", md: "lg" }}>User Progress Details</Heading>
            <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }} wordBreak="break-all">
              {user.name} - {user.email}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Overview Stats */}
            <HStack spacing={3} flexWrap="wrap">
              <Box flex={1} minW="120px" bg={cardBg} p={3} borderRadius="lg" border="1px" borderColor={borderColor}>
                <HStack spacing={2}>
                  <Icon as={FiBook} boxSize={6} color="blue.500" />
                  <Stat>
                    <StatLabel fontSize="xs">Total Courses</StatLabel>
                    <StatNumber fontSize="lg">{totalCourses}</StatNumber>
                  </Stat>
                </HStack>
              </Box>

              <Box flex={1} minW="120px" bg={cardBg} p={3} borderRadius="lg" border="1px" borderColor={borderColor}>
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} boxSize={6} color="green.500" />
                  <Stat>
                    <StatLabel fontSize="xs">Completed</StatLabel>
                    <StatNumber fontSize="lg">{completedCourses}</StatNumber>
                  </Stat>
                </HStack>
              </Box>

              <Box flex={1} minW="120px" bg={cardBg} p={3} borderRadius="lg" border="1px" borderColor={borderColor}>
                <HStack spacing={2}>
                  <Icon as={FiPlay} boxSize={6} color="yellow.500" />
                  <Stat>
                    <StatLabel fontSize="xs">In Progress</StatLabel>
                    <StatNumber fontSize="lg">{inProgressCourses}</StatNumber>
                  </Stat>
                </HStack>
              </Box>

              <Box flex={1} minW="120px" bg={cardBg} p={3} borderRadius="lg" border="1px" borderColor={borderColor}>
                <HStack spacing={2}>
                  <Icon as={FiTrendingUp} boxSize={6} color="purple.500" />
                  <Stat>
                    <StatLabel fontSize="xs">Avg Score</StatLabel>
                    <StatNumber fontSize="lg">{averageScore !== null ? `${averageScore.toFixed(1)}%` : "N/A"}</StatNumber>
                  </Stat>
                </HStack>
              </Box>
            </HStack>

            <Divider />

            {/* Course Progress Details */}
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Course Progress</Heading>
              
              {userProgress.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No course progress data available</Text>
                </Box>
              ) : (
                <VStack spacing={4}>
                  {userProgress.map((progress) => (
                    <Box
                      key={progress.id}
                      bg={cardBg}
                      p={4}
                      borderRadius="lg"
                      border="1px"
                      borderColor={borderColor}
                    >
                      <VStack align="stretch" spacing={3}>
                        <VStack align="stretch" spacing={1}>
                          <HStack spacing={3} flexWrap="wrap">
                            <Icon as={FiBook} color="blue.500" flexShrink={0} />
                            <Text fontWeight="medium" fontSize="sm">Course ID: {progress.courseId}</Text>
                            {getStatusBadge(progress.status)}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Enrolled: {new Date(progress.enrolledAt).toLocaleDateString()}
                          </Text>
                        </VStack>

                        <Progress
                          value={getProgressPercentage(progress)}
                          colorScheme={progress.status === 'completed' ? 'green' : 'blue'}
                          size="sm"
                          borderRadius="full"
                        />

                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">
                            Progress: {getProgressPercentage(progress).toFixed(0)}%
                          </Text>
                          {progress.finalAssessmentScore && (
                            <Text color="gray.600">
                              Final Score: {progress.finalAssessmentScore}%
                            </Text>
                          )}
                          {progress.certificateIssued && (
                            <HStack spacing={1}>
                              <Icon as={FiAward} color="green.500" />
                              <Text color="green.500">Certificate Issued</Text>
                            </HStack>
                          )}
                        </HStack>

                        {/* Curriculum Progress */}
                        {progress.curriculumProgress.length > 0 && (
                          <Box mt={3}>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>Curriculum Progress:</Text>
                            <VStack spacing={2} align="stretch">
                              {progress.curriculumProgress.map((curriculum) => (
                                <Box
                                  key={curriculum.id}
                                  p={2}
                                  bg={gray50Bg}
                                  borderRadius="md"
                                >
                                  <HStack spacing={2} flexWrap="wrap" justify="space-between">
                                    <HStack spacing={2}>
                                      {getStatusBadge(curriculum.status)}
                                      <Text fontSize="sm">Curriculum {curriculum.id}</Text>
                                    </HStack>
                                    {curriculum.quizScore && (
                                      <Text fontSize="xs" color="gray.600">
                                        Quiz: {curriculum.quizScore}% ({curriculum.attempts} attempts)
                                      </Text>
                                    )}
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Box w="full" textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
            </Text>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserProgressModal;
