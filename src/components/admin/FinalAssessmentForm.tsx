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
  useToast,
  Box,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { FinalAssessment, Question } from "@/types/admin";

interface FinalAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: FinalAssessment | null;
  isEditing: boolean;
  courseId: string;
  onSubmit: (assessmentData: Omit<FinalAssessment, 'id'>) => void;
}

const FinalAssessmentForm: React.FC<FinalAssessmentFormProps> = ({
  isOpen,
  onClose,
  assessment,
  isEditing,
  courseId,
  onSubmit,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const [formData, setFormData] = useState({
    courseId: courseId,
    questions: [] as Question[],
    passingScore: 70,
    timeLimit: 60,
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && assessment) {
        setFormData({
          courseId: assessment.courseId,
          questions: assessment.questions,
          passingScore: assessment.passingScore,
          timeLimit: assessment.timeLimit || 60,
        });
      } else {
        setFormData({
          courseId: courseId,
          questions: [],
          passingScore: 70,
          timeLimit: 60,
        });
      }
      setEditingQuestion(null);
    }
  }, [isOpen, isEditing, assessment, courseId]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setEditingQuestion(newQuestion);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const hasEmptyOptions = editingQuestion.options.some(opt => !opt.trim());
    if (hasEmptyOptions) {
      toast({
        title: "Validation Error",
        description: "All options must be filled",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const existingIndex = formData.questions.findIndex(q => q.id === editingQuestion.id);
    
    if (existingIndex >= 0) {
      // Update existing question
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, index) => 
          index === existingIndex ? editingQuestion : q
        ),
      }));
    } else {
      // Add new question
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, editingQuestion],
      }));
    }

    setEditingQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Final assessment must have at least one question",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.questions.length < 20) {
      toast({
        title: "Warning",
        description: "Final assessment should have 20 questions for optimal evaluation",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEditingQuestion = (field: string, value: any) => {
    if (!editingQuestion) return;
    
    setEditingQuestion(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const updateEditingOption = (index: number, value: string) => {
    if (!editingQuestion) return;
    
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion(prev => {
      if (!prev) return null;
      return { ...prev, options: newOptions };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            {isEditing ? "Edit Final Assessment" : "Create Final Assessment"}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {formData.questions.length} questions added
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Assessment Settings */}
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={4}>
                  <HStack spacing={6}>
                    <FormControl>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <NumberInput
                        value={formData.passingScore}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          passingScore: parseInt(value) || 70,
                        }))}
                        min={0}
                        max={100}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Time Limit (minutes)</FormLabel>
                      <NumberInput
                        value={formData.timeLimit}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          timeLimit: parseInt(value) || 60,
                        }))}
                        min={10}
                        max={180}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>
                </CardBody>
              </Card>

              {/* Questions Section */}
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Assessment Questions</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={handleAddQuestion}
                    isDisabled={editingQuestion !== null || formData.questions.length >= 20}
                  >
                    Add Question ({formData.questions.length}/20)
                  </Button>
                </HStack>

                {formData.questions.length === 0 && !editingQuestion ? (
                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                    <CardBody p={8} textAlign="center">
                      <Text color="gray.500">No questions yet. Add your first question to get started.</Text>
                    </CardBody>
                  </Card>
                ) : (
                  <>
                    {formData.questions.map((question, index) => (
                      <Card key={question.id} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                        <CardBody p={4}>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="medium">Question {index + 1}</Text>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={<FiEdit />}
                                  aria-label="Edit question"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditQuestion(question)}
                                  isDisabled={editingQuestion !== null}
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  aria-label="Delete question"
                                  size="sm"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  isDisabled={editingQuestion !== null}
                                />
                              </HStack>
                            </HStack>
                            
                            <Text>{question.text}</Text>
                            
                            <VStack align="stretch" spacing={1}>
                              {question.options.map((option, optionIndex) => (
                                <HStack key={optionIndex} spacing={2}>
                                  <Box
                                    w="6"
                                    h="6"
                                    borderRadius="full"
                                    bg={optionIndex === question.correctAnswer ? "green.500" : "gray.300"}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="bold"
                                  >
                                    {optionIndex === question.correctAnswer ? "✓" : optionIndex + 1}
                                  </Box>
                                  <Text fontSize="sm">{option}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}

                    {/* Edit Question Form */}
                    {editingQuestion && (
                      <Card bg={cardBg} border="2px" borderColor="blue.500" borderRadius="lg">
                        <CardBody p={4}>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <Heading size="sm">
                                {formData.questions.find(q => q.id === editingQuestion.id) ? "Edit Question" : "New Question"}
                              </Heading>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={<FiCheck />}
                                  aria-label="Save question"
                                  size="sm"
                                  colorScheme="green"
                                  onClick={handleSaveQuestion}
                                />
                                <IconButton
                                  icon={<FiX />}
                                  aria-label="Cancel edit"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                />
                              </HStack>
                            </HStack>

                            <FormControl isRequired>
                              <FormLabel>Question Text</FormLabel>
                              <Input
                                value={editingQuestion.text}
                                onChange={(e) => updateEditingQuestion("text", e.target.value)}
                                placeholder="Enter your question"
                              />
                            </FormControl>

                            <VStack align="stretch" spacing={3}>
                              <FormLabel>Answer Options</FormLabel>
                              {editingQuestion.options.map((option, index) => (
                                <HStack key={index} spacing={2}>
                                  <FormControl>
                                    <Input
                                      value={option}
                                      onChange={(e) => updateEditingOption(index, e.target.value)}
                                      placeholder={`Option ${index + 1}`}
                                    />
                                  </FormControl>
                                  <Button
                                    size="sm"
                                    variant={index === editingQuestion.correctAnswer ? "solid" : "outline"}
                                    colorScheme={index === editingQuestion.correctAnswer ? "green" : "gray"}
                                    onClick={() => updateEditingQuestion("correctAnswer", index)}
                                  >
                                    {index === editingQuestion.correctAnswer ? "Correct" : "Set as Correct"}
                                  </Button>
                                </HStack>
                              ))}
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </>
                )}
              </VStack>

              <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <strong>Final Assessment Guidelines:</strong>
                  <br />
                  • Should contain 20 questions for comprehensive evaluation
                  <br />
                  • Questions should be randomly selected from course content
                  <br />
                  • Each question should have 4 multiple-choice options
                  <br />
                  • Passing score should be challenging but achievable
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText={isEditing ? "Updating..." : "Creating..."}
                isDisabled={editingQuestion !== null || formData.questions.length === 0}
              >
                {isEditing ? "Update Assessment" : "Create Assessment"}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FinalAssessmentForm;
