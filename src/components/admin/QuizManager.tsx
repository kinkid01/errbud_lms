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
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Curriculum, Quiz, Question, Course, CourseQuiz } from "@/types/admin";

interface QuizManagerProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSubmit: (quiz: CourseQuiz) => void;
}

const QuizManager: React.FC<QuizManagerProps> = ({
  isOpen,
  onClose,
  course,
  onSubmit,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const [quiz, setQuiz] = useState<CourseQuiz>(course.quiz);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuiz(course.quiz);
      setEditingQuestion(null);
    }
  }, [isOpen, course]);

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
    setQuiz(prev => ({
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

    const existingIndex = quiz.questions.findIndex(q => q.id === editingQuestion.id);
    
    if (existingIndex >= 0) {
      // Update existing question
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map((q, index) => 
          index === existingIndex ? editingQuestion : q
        ),
      }));
    } else {
      // Add new question
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, editingQuestion],
      }));
    }

    setEditingQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleSubmit = async () => {
    if (quiz.questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Quiz must have at least one question",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(quiz);
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Quiz Manager</Heading>
          <Text color="gray.600" fontSize="sm">
            {course.title} - {quiz.questions.length} questions
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Quiz Settings */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
              <CardBody p={4}>
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <NumberInput
                      value={quiz.passingScore}
                      onChange={(value) => setQuiz(prev => ({
                        ...prev,
                        passingScore: parseInt(value) || 60,
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
                </HStack>
              </CardBody>
            </Card>

            {/* Questions List */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Questions</Heading>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={handleAddQuestion}
                  isDisabled={editingQuestion !== null}
                >
                  Add Question
                </Button>
              </HStack>

              {quiz.questions.length === 0 && !editingQuestion ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                  <CardBody p={8} textAlign="center">
                    <Text color="gray.500">No questions yet. Add your first question to get started.</Text>
                  </CardBody>
                </Card>
              ) : (
                <>
                  {quiz.questions.map((question, index) => (
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
                              {quiz.questions.find(q => q.id === editingQuestion.id) ? "Edit Question" : "New Question"}
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

                          <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                            <Text fontSize="sm" color="blue.800">
                              <strong>Tip:</strong> Each question has 4 options (A–D).
                              Click &quot;Set as Correct&quot; to mark the right answer.
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Saving..."
              isDisabled={editingQuestion !== null || quiz.questions.length === 0}
            >
              Save Quiz
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuizManager;
