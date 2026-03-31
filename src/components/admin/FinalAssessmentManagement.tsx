"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  useColorModeValue,
  Button,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { FinalAssessment, Course, Question } from "@/types/admin";
import { finalAssessmentApi } from "@/lib/finalAssessmentApi";
import FinalAssessmentForm from "./FinalAssessmentForm";
import AssessmentResults from "./AssessmentResults";

interface FinalAssessmentManagementProps {
  course: Course;
  onBack: () => void;
}

export default function FinalAssessmentManagement({ course, onBack }: FinalAssessmentManagementProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  
  const [assessment, setAssessment] = useState<FinalAssessment | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingResults, setIsViewingResults] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const loadAssessment = useCallback(async () => {
    try {
      const assessmentData = await finalAssessmentApi.getFinalAssessment(course.id);
      setAssessment(assessmentData);
    } catch (error) {
      toast({
        title: "Error loading final assessment",
        description: "Failed to load assessment data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [course.id, toast]);

  const loadResults = useCallback(async () => {
    try {
      // In a real app, this would fetch results for all users
      // For now, we'll use mock data
      const mockResults = [
        {
          id: '1',
          userId: '1',
          userName: 'Alice Johnson',
          score: 85,
          totalQuestions: 20,
          correctAnswers: 17,
          timeTaken: 45,
          completedAt: '2024-03-01T10:30:00Z',
          passed: true,
        },
        {
          id: '2',
          userId: '2',
          userName: 'Bob Smith',
          score: 65,
          totalQuestions: 20,
          correctAnswers: 13,
          timeTaken: 55,
          completedAt: '2024-03-02T14:15:00Z',
          passed: true,
        },
        {
          id: '3',
          userId: '3',
          userName: 'Carol Davis',
          score: 55,
          totalQuestions: 20,
          correctAnswers: 11,
          timeTaken: 60,
          completedAt: '2024-03-03T09:45:00Z',
          passed: false,
        },
      ];
      setAssessmentResults(mockResults);
    } catch (error) {
      toast({
        title: "Error loading assessment results",
        description: "Failed to load results data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    loadAssessment();
    loadResults();
  }, [loadAssessment, loadResults]);

  const handleCreateAssessment = () => {
    setAssessment(null);
    setIsEditing(false);
    onFormModalOpen();
  };

  const handleEditAssessment = () => {
    setIsEditing(true);
    onFormModalOpen();
  };

  const handleDeleteAssessment = () => {
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
    if (!assessment) return;

    try {
      await finalAssessmentApi.deleteFinalAssessment(assessment.id);
      toast({
        title: "Final assessment deleted",
        description: "Final assessment has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAssessment(null);
      onDeleteAlertClose();
    } catch (error) {
      toast({
        title: "Error deleting final assessment",
        description: "Failed to delete final assessment",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = async (assessmentData: Omit<FinalAssessment, 'id'>) => {
    try {
      if (isEditing && assessment) {
        const updatedAssessment = await finalAssessmentApi.updateFinalAssessment(assessment.id, assessmentData);
        setAssessment(updatedAssessment);
        toast({
          title: "Final assessment updated",
          description: "Final assessment has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newAssessment = await finalAssessmentApi.createFinalAssessment(assessmentData);
        setAssessment(newAssessment);
        toast({
          title: "Final assessment created",
          description: "Final assessment has been created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onFormModalClose();
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} final assessment`,
        description: `Failed to ${isEditing ? 'update' : 'create'} final assessment`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await finalAssessmentApi.generateQuestions(course.id, 20);
      
      if (assessment) {
        const updatedAssessment = await finalAssessmentApi.updateFinalAssessment(assessment.id, {
          questions,
        });
        setAssessment(updatedAssessment);
      } else {
        const newAssessment = await finalAssessmentApi.createFinalAssessment({
          courseId: course.id,
          questions,
          passingScore: 70,
          timeLimit: 60,
        });
        setAssessment(newAssessment);
      }
      
      toast({
        title: "Questions generated",
        description: `Successfully generated ${questions.length} questions for the final assessment`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error generating questions",
        description: "Failed to generate questions automatically",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const getAverageScore = () => {
    if (assessmentResults.length === 0) return 0;
    return Math.round(assessmentResults.reduce((acc, result) => acc + result.score, 0) / assessmentResults.length);
  };

  const getPassRate = () => {
    if (assessmentResults.length === 0) return 0;
    const passedCount = assessmentResults.filter(result => result.passed).length;
    return Math.round((passedCount / assessmentResults.length) * 100);
  };

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <VStack spacing={4} align="center">
          <Text>Loading final assessment...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Button variant="outline" onClick={onBack} mb={2}>
              ← Back to Courses
            </Button>
            <Heading size="lg" mb={2}>Final Assessment Management</Heading>
            <Text color="gray.600">Manage final assessment for: {course.title}</Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="green"
              onClick={handleGenerateQuestions}
              isLoading={isGeneratingQuestions}
              loadingText="Generating..."
            >
              Generate Questions
            </Button>
            {assessment ? (
              <>
                <Button
                  leftIcon={<FiEdit />}
                  colorScheme="blue"
                  onClick={handleEditAssessment}
                >
                  Edit Assessment
                </Button>
                <Button
                  leftIcon={<FiTrash2 />}
                  colorScheme="red"
                  onClick={handleDeleteAssessment}
                >
                  Delete Assessment
                </Button>
              </>
            ) : (
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleCreateAssessment}
              >
                Create Assessment
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Assessment Overview */}
        {assessment ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={6}>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Assessment Details</Heading>
                  <Badge colorScheme="green" p={2}>
                    {assessment.questions.length} Questions
                  </Badge>
                </HStack>
                
                <HStack spacing={8}>
                  <VStack align="start">
                    <Text fontSize="sm" color="gray.600">Passing Score</Text>
                    <Text fontSize="lg" fontWeight="bold">{assessment.passingScore}%</Text>
                  </VStack>
                  <VStack align="start">
                    <Text fontSize="sm" color="gray.600">Time Limit</Text>
                    <Text fontSize="lg" fontWeight="bold">{assessment.timeLimit} minutes</Text>
                  </VStack>
                  <VStack align="start">
                    <Text fontSize="sm" color="gray.600">Total Questions</Text>
                    <Text fontSize="lg" fontWeight="bold">{assessment.questions.length}</Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={8} textAlign="center">
              <Icon as={FiFileText} boxSize={12} color="gray.400" mb={4} />
              <Heading size="md" mb={2}>No Final Assessment Yet</Heading>
              <Text color="gray.600" mb={4}>
                Create a final assessment with 20 questions to evaluate student knowledge.
              </Text>
              <HStack spacing={3} justify="center">
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={handleCreateAssessment}
                >
                  Create Assessment
                </Button>
                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="green"
                  onClick={handleGenerateQuestions}
                  isLoading={isGeneratingQuestions}
                  loadingText="Generating..."
                >
                  Auto-Generate Questions
                </Button>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Assessment Results */}
        {assessment && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={6}>
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Assessment Results</Heading>
                  <Button
                    leftIcon={<FiBarChart2 />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => setIsViewingResults(true)}
                  >
                    View Detailed Results
                  </Button>
                </Flex>

                {/* Stats */}
                <HStack spacing={6}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                    <CardBody p={4}>
                      <HStack spacing={3}>
                        <Icon as={FiFileText} boxSize={8} color="blue.500" />
                        <Stat>
                          <StatLabel fontSize="sm">Total Attempts</StatLabel>
                          <StatNumber fontSize="lg">{assessmentResults.length}</StatNumber>
                        </Stat>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
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

                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
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
                </HStack>

                {/* Recent Results Table */}
                {assessmentResults.length > 0 && (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Student</Th>
                        <Th>Score</Th>
                        <Th>Result</Th>
                        <Th>Time Taken</Th>
                        <Th>Completed</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {assessmentResults.slice(0, 5).map((result) => (
                        <Tr key={result.id}>
                          <Td>{result.userName}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Text>{result.score}%</Text>
                              <Progress
                                value={result.score}
                                colorScheme={result.passed ? "green" : "red"}
                                size="sm"
                                w="60px"
                                borderRadius="full"
                              />
                            </HStack>
                          </Td>
                          <Td>
                            {result.passed ? (
                              <Badge colorScheme="green">Passed</Badge>
                            ) : (
                              <Badge colorScheme="red">Failed</Badge>
                            )}
                          </Td>
                          <Td>{result.timeTaken} min</Td>
                          <Td>{new Date(result.completedAt).toLocaleDateString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Final Assessment Form Modal */}
        <FinalAssessmentForm
          isOpen={isFormModalOpen}
          onClose={onFormModalClose}
          assessment={assessment}
          isEditing={isEditing}
          courseId={course.id}
          onSubmit={handleFormSubmit}
        />

        {/* Assessment Results Modal */}
        <AssessmentResults
          isOpen={isViewingResults}
          onClose={() => setIsViewingResults(false)}
          results={assessmentResults}
          assessment={assessment}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Final Assessment
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this final assessment? This action cannot be undone and will also remove all assessment results.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Box>
  );
}
