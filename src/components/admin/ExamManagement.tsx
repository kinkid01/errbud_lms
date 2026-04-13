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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  IconButton,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { FinalAssessment, Question } from "@/types/admin";
import { finalAssessmentApi } from "@/lib/finalAssessmentApi";
import DeleteConfirmation from "./DeleteConfirmation";

const MAX_QUESTIONS = 20;
const GENERAL_EXAM_ID = "general";

export default function ExamManagement() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const activeBorder = useColorModeValue("purple.400", "purple.300");
  const questionBg = useColorModeValue("gray.50", "gray.750");
  const toast = useToast();

  const [assessment, setAssessment] = useState<FinalAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScoreInput, setPassingScoreInput] = useState("70");
  const [timeLimitInput, setTimeLimitInput] = useState("60");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadExam = useCallback(async () => {
    try {
      const data = await finalAssessmentApi.getGeneralExam();
      setAssessment(data);
      setQuestions(data?.questions ?? []);
      setPassingScore(data?.passingScore ?? 70);
      setTimeLimit(data?.timeLimit ?? 60);
      setPassingScoreInput(String(data?.passingScore ?? 70));
      setTimeLimitInput(String(data?.timeLimit ?? 60));
    } catch {
      toast({ title: "Error loading exam", status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadExam(); }, [loadExam]);

  // ---- Question CRUD ----
  const startAddQuestion = () => {
    setEditingQuestion({
      id: Date.now().toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  const startEditQuestion = (q: Question) => setEditingQuestion({ ...q });

  const updateOption = (i: number, value: string) => {
    if (!editingQuestion) return;
    const opts = [...editingQuestion.options];
    opts[i] = value;
    setEditingQuestion({ ...editingQuestion, options: opts });
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;
    if (!editingQuestion.text.trim()) {
      toast({ title: "Question text is required", status: "error", duration: 3000, isClosable: true });
      return;
    }
    if (editingQuestion.options.some((o) => !o.trim())) {
      toast({ title: "All four options must be filled in", status: "error", duration: 3000, isClosable: true });
      return;
    }
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === editingQuestion.id);
      return idx >= 0
        ? prev.map((q, i) => (i === idx ? editingQuestion : q))
        : [...prev, editingQuestion];
    });
    setEditingQuestion(null);
  };

  const confirmDeleteQuestion = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      // Just remove from local state since this is a temporary operation
      setQuestions((prev) => prev.filter((q) => q.id !== deletingId));
      setDeletingId(null);
      onDeleteClose();
    } catch (error: any) {
      throw error; // Let DeleteConfirmation handle the error
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- Save exam ----
  const handleSave = async () => {
    if (questions.length === 0) {
      toast({ title: "Add at least one question before saving", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setIsSaving(true);
    try {
      const payload = { courseId: GENERAL_EXAM_ID, questions, passingScore, timeLimit };
      const saved = assessment
        ? await finalAssessmentApi.updateFinalAssessment(assessment.id, payload)
        : await finalAssessmentApi.createFinalAssessment(payload);
      setAssessment(saved);
      toast({ title: "Exam saved successfully", status: "success", duration: 3000, isClosable: true });
    } catch {
      toast({ title: "Error saving exam", status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Flex justify="center" align="center" minH="400px"><Spinner size="xl" color="purple.500" /></Flex>;
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">

        {/* Header */}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Heading size="lg">Final Exam</Heading>
            <Text color={mutedText} mt={1}>
              20 general questions covering all 13 modules.
            </Text>
          </Box>
          <Button
            colorScheme="purple"
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
            isDisabled={!!editingQuestion}
          >
            Save Exam
          </Button>
        </Flex>

        {/* Exam Settings */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={5}>
            <Text fontWeight="semibold" mb={4}>Exam Settings</Text>
            <HStack spacing={8}>
              <FormControl maxW="160px">
                <FormLabel fontSize="sm">Passing Score (%)</FormLabel>
                <Input
                  type="number"
                  value={passingScoreInput}
                  onChange={(e) => setPassingScoreInput(e.target.value)}
                  onBlur={() => {
                    const parsed = Math.min(100, Math.max(0, parseInt(passingScoreInput) || 70));
                    setPassingScoreInput(String(parsed));
                    setPassingScore(parsed);
                  }}
                  min={0}
                  max={100}
                />
              </FormControl>
              <FormControl maxW="160px">
                <FormLabel fontSize="sm">Time Limit (minutes)</FormLabel>
                <Input
                  type="number"
                  value={timeLimitInput}
                  onChange={(e) => setTimeLimitInput(e.target.value)}
                  onBlur={() => {
                    const parsed = Math.min(300, Math.max(5, parseInt(timeLimitInput) || 60));
                    setTimeLimitInput(String(parsed));
                    setTimeLimit(parsed);
                  }}
                  min={5}
                  max={300}
                />
              </FormControl>
            </HStack>
          </CardBody>
        </Card>

        {/* Questions */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={5}>
            <Flex justify="space-between" align="center" mb={5}>
              <HStack spacing={3}>
                <Text fontWeight="semibold">Questions</Text>
                <Badge colorScheme={questions.length === MAX_QUESTIONS ? "green" : "orange"}>
                  {questions.length} / {MAX_QUESTIONS}
                </Badge>
              </HStack>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="purple"
                size="sm"
                onClick={startAddQuestion}
                isDisabled={!!editingQuestion || questions.length >= MAX_QUESTIONS}
              >
                Add Question
              </Button>
            </Flex>

            <VStack spacing={4} align="stretch">

              {/* Saved questions */}
              {questions.map((q, index) => (
                <Box
                  key={q.id}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={questionBg}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold" color={mutedText}>
                      Q{index + 1}
                    </Text>
                    <HStack spacing={1}>
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Edit"
                        size="xs"
                        variant="outline"
                        isDisabled={!!editingQuestion}
                        onClick={() => startEditQuestion(q)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete"
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        isDisabled={!!editingQuestion}
                        onClick={() => { setDeletingId(q.id); onDeleteOpen(); }}
                      />
                    </HStack>
                  </Flex>
                  <Text fontSize="sm" mb={3}>{q.text}</Text>
                  <VStack spacing={1} align="stretch">
                    {q.options.map((opt, oi) => (
                      <HStack key={oi} spacing={2}>
                        <Box
                          w={5} h={5}
                          borderRadius="full"
                          flexShrink={0}
                          bg={oi === q.correctAnswer ? "green.500" : "gray.200"}
                          _dark={{ bg: oi === q.correctAnswer ? "green.500" : "gray.600" }}
                          display="flex" alignItems="center" justifyContent="center"
                          fontSize="10px" fontWeight="bold" color="white"
                        >
                          {oi === q.correctAnswer ? "✓" : oi + 1}
                        </Box>
                        <Text fontSize="sm" color={oi === q.correctAnswer ? "green.600" : undefined}>
                          {opt}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}

              {/* Inline editor */}
              {editingQuestion && (
                <Box
                  p={5}
                  border="2px"
                  borderColor={activeBorder}
                  borderRadius="md"
                  bg={cardBg}
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {questions.find((q) => q.id === editingQuestion.id)
                        ? "Edit Question"
                        : `New Question (${questions.length + 1}/${MAX_QUESTIONS})`}
                    </Text>
                    <HStack spacing={2}>
                      <IconButton icon={<FiCheck />} aria-label="Save" size="sm" colorScheme="green" onClick={saveQuestion} />
                      <IconButton icon={<FiX />} aria-label="Cancel" size="sm" variant="outline" onClick={() => setEditingQuestion(null)} />
                    </HStack>
                  </Flex>

                  <FormControl isRequired mb={4}>
                    <FormLabel fontSize="sm">Question</FormLabel>
                    <Textarea
                      value={editingQuestion.text}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                      placeholder="Type the question here..."
                      rows={2}
                      resize="vertical"
                    />
                  </FormControl>

                  <FormLabel fontSize="sm">Answer Options — click to mark the correct one</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {editingQuestion.options.map((opt, i) => (
                      <HStack key={i} spacing={3}>
                        <Text w="20px" fontSize="sm" color={mutedText} flexShrink={0}>{i + 1}.</Text>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          size="sm"
                        />
                        <Button
                          size="sm"
                          minW="110px"
                          colorScheme={i === editingQuestion.correctAnswer ? "green" : "gray"}
                          variant={i === editingQuestion.correctAnswer ? "solid" : "outline"}
                          onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })}
                        >
                          {i === editingQuestion.correctAnswer ? "✓ Correct" : "Set Correct"}
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Empty state */}
              {questions.length === 0 && !editingQuestion && (
                <Flex direction="column" align="center" py={10} color={mutedText}>
                  <Icon as={FiFileText} boxSize={10} mb={3} />
                  <Text fontSize="sm">No questions yet. Click &quot;Add Question&quot; to get started.</Text>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={confirmDeleteQuestion}
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          itemName={`Question ${deletingId ? questions.findIndex(q => q.id === deletingId) + 1 : ''}`}
          isLoading={isDeleting}
        />
    </Box>
  );
}
