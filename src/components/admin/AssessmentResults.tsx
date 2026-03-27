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
  Button,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
  Icon,
} from "@chakra-ui/react";
import {
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { FinalAssessment } from "@/types/admin";

interface AssessmentResultsProps {
  isOpen: boolean;
  onClose: () => void;
  results: any[];
  assessment: FinalAssessment | null;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  isOpen,
  onClose,
  results,
  assessment,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, result) => acc + result.score, 0) / results.length);
  };

  const getPassRate = () => {
    if (results.length === 0) return 0;
    const passedCount = results.filter(result => result.passed).length;
    return Math.round((passedCount / results.length) * 100);
  };

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, result) => acc + result.timeTaken, 0) / results.length);
  };

  const getScoreDistribution = () => {
    const distribution = {
      excellent: results.filter(r => r.score >= 90).length,
      good: results.filter(r => r.score >= 70 && r.score < 90).length,
      average: results.filter(r => r.score >= 50 && r.score < 70).length,
      poor: results.filter(r => r.score < 50).length,
    };
    return distribution;
  };

  const scoreDistribution = getScoreDistribution();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Heading size="lg">Assessment Results</Heading>
            <Text color="gray.600">
              {assessment?.questions.length || 0} questions • {assessment?.passingScore}% passing score
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Overview Stats */}
            <HStack spacing={4}>
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex={1}>
                <CardBody p={4}>
                  <HStack spacing={3}>
                    <Icon as={FiUsers} boxSize={8} color="blue.500" />
                    <Stat>
                      <StatLabel fontSize="sm">Total Attempts</StatLabel>
                      <StatNumber fontSize="lg">{results.length}</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex={1}>
                <CardBody p={4}>
                  <HStack spacing={3}>
                    <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                    <Stat>
                      <StatLabel fontSize="sm">Pass Rate</StatLabel>
                      <StatNumber fontSize="lg">{getPassRate()}%</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex={1}>
                <CardBody p={4}>
                  <HStack spacing={3}>
                    <Icon as={FiBarChart2} boxSize={8} color="purple.500" />
                    <Stat>
                      <StatLabel fontSize="sm">Average Score</StatLabel>
                      <StatNumber fontSize="lg">{getAverageScore()}%</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex={1}>
                <CardBody p={4}>
                  <HStack spacing={3}>
                    <Icon as={FiClock} boxSize={8} color="orange.500" />
                    <Stat>
                      <StatLabel fontSize="sm">Avg. Time</StatLabel>
                      <StatNumber fontSize="lg">{getAverageTime()}m</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
            </HStack>

            {/* Score Distribution */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
              <CardBody p={4}>
                <Heading size="sm" mb={4}>Score Distribution</Heading>
                <VStack spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Excellent (90-100%)</Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold">{scoreDistribution.excellent}</Text>
                      <Progress
                        value={results.length > 0 ? (scoreDistribution.excellent / results.length) * 100 : 0}
                        colorScheme="green"
                        size="sm"
                        w="100px"
                        borderRadius="full"
                      />
                    </HStack>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Good (70-89%)</Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold">{scoreDistribution.good}</Text>
                      <Progress
                        value={results.length > 0 ? (scoreDistribution.good / results.length) * 100 : 0}
                        colorScheme="blue"
                        size="sm"
                        w="100px"
                        borderRadius="full"
                      />
                    </HStack>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Average (50-69%)</Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold">{scoreDistribution.average}</Text>
                      <Progress
                        value={results.length > 0 ? (scoreDistribution.average / results.length) * 100 : 0}
                        colorScheme="yellow"
                        size="sm"
                        w="100px"
                        borderRadius="full"
                      />
                    </HStack>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Poor (0-49%)</Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold">{scoreDistribution.poor}</Text>
                      <Progress
                        value={results.length > 0 ? (scoreDistribution.poor / results.length) * 100 : 0}
                        colorScheme="red"
                        size="sm"
                        w="100px"
                        borderRadius="full"
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Divider />

            {/* Detailed Results Table */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Score</Th>
                      <Th>Result</Th>
                      <Th>Correct Answers</Th>
                      <Th>Time Taken</Th>
                      <Th>Completed</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {results.map((result) => (
                      <Tr key={result.id}>
                        <Td fontWeight="medium">{result.userName}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="bold">{result.score}%</Text>
                              <Badge
                                colorScheme={result.passed ? "green" : "red"}
                                variant="subtle"
                              >
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            </HStack>
                            <Progress
                              value={result.score}
                              colorScheme={result.passed ? "green" : "red"}
                              size="sm"
                              w="80px"
                              borderRadius="full"
                            />
                          </VStack>
                        </Td>
                        <Td>
                          {result.passed ? (
                            <HStack spacing={1}>
                              <FiCheckCircle color="green" />
                              <Text color="green.600" fontSize="sm">Passed</Text>
                            </HStack>
                          ) : (
                            <HStack spacing={1}>
                              <FiXCircle color="red" />
                              <Text color="red.600" fontSize="sm">Failed</Text>
                            </HStack>
                          )}
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {result.correctAnswers}/{result.totalQuestions}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <FiClock color="gray.400" />
                            <Text fontSize="sm">{result.timeTaken} min</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            {results.length === 0 && (
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={8} textAlign="center">
                  <Icon as={FiBarChart2} boxSize={12} color="gray.400" mb={4} />
                  <Heading size="md" mb={2}>No Assessment Results Yet</Heading>
                  <Text color="gray.600">
                    Students haven&apos;t completed this assessment yet.
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AssessmentResults;
