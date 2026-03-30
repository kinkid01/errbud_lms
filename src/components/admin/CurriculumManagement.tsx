"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiBook,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPlay,
  FiChevronUp,
  FiChevronDown,
  FiClock,
  FiHelpCircle,
  FiEye,
} from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { Curriculum, Course } from "@/types/admin";
import { curriculumApi } from "@/lib/curriculumApi";
import CurriculumForm from "./CurriculumForm";
import QuizManager from "./QuizManager";
import LessonPreviewModal from "./LessonPreviewModal";

interface CurriculumManagementProps {
  course: Course;
  onBack: () => void;
}

export default function CurriculumManagement({ course, onBack }: CurriculumManagementProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingQuiz, setIsManagingQuiz] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const loadCurriculums = useCallback(async () => {
    try {
      const curriculumsData = await curriculumApi.getCurriculumsByCourse(course.id);
      setCurriculums(curriculumsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast({
        title: "Error loading lessons",
        description: "Failed to load lesson data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [course.id, toast]);

  useEffect(() => {
    loadCurriculums();
  }, [loadCurriculums]);

  const handleCreateCurriculum = () => {
    setSelectedCurriculum(null);
    setIsEditing(false);
    onFormModalOpen();
  };

  const handleEditCurriculum = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setIsEditing(true);
    onFormModalOpen();
  };

  const handleDeleteCurriculum = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    onDeleteAlertOpen();
  };

  const handleManageQuiz = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setIsManagingQuiz(true);
  };

  const handlePreview = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setIsPreviewOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCurriculum) return;

    try {
      await curriculumApi.deleteCurriculum(selectedCurriculum.id);
      toast({
        title: "Lesson deleted",
        description: "Lesson has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await loadCurriculums();
      onDeleteAlertClose();
    } catch (error) {
      toast({
        title: "Error deleting lesson",
        description: "Failed to delete lesson",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = async (curriculumData: Omit<Curriculum, 'id'>) => {
    try {
      if (isEditing && selectedCurriculum) {
        await curriculumApi.updateCurriculum(selectedCurriculum.id, curriculumData);
        toast({
          title: "Lesson updated",
          description: "Lesson has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await curriculumApi.createCurriculum({
          ...curriculumData,
          order: curriculums.length + 1,
        });
        toast({
          title: "Lesson created",
          description: "Lesson has been created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      await loadCurriculums();
      onFormModalClose();
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} lesson`,
        description: `Failed to ${isEditing ? 'update' : 'create'} lesson`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReorder = async (direction: 'up' | 'down', curriculum: Curriculum) => {
    const currentIndex = curriculums.findIndex(c => c.id === curriculum.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === curriculums.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...curriculums];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    try {
      await curriculumApi.reorderCurriculums(
        course.id,
        newOrder.map(c => c.id)
      );
      setCurriculums(newOrder);
    } catch (error) {
      toast({
        title: "Error reordering lessons",
        description: "Failed to reorder lessons",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleQuizUpdate = async (quiz: any) => {
    if (!selectedCurriculum) return;

    try {
      await curriculumApi.updateQuiz(selectedCurriculum.id, quiz);
      toast({
        title: "Quiz updated",
        description: "Quiz has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await loadCurriculums();
      setIsManagingQuiz(false);
    } catch (error) {
      toast({
        title: "Error updating quiz",
        description: "Failed to update quiz",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="center">
          <Text>Loading lessons...</Text>
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
              ← Back to Modules
            </Button>
            <Heading size="lg" mb={2}>Lesson Management</Heading>
            <Text color="gray.600">Manage lessons for: {course.title}</Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleCreateCurriculum}
          >
            Add Lesson
          </Button>
        </Flex>

        {/* Stats */}
        <HStack spacing={6}>
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiBook} boxSize={8} color="blue.500" />
                <Text>
                  <Text as="span" fontWeight="bold">{curriculums.length}</Text> Lessons
                </Text>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiHelpCircle} boxSize={8} color="green.500" />
                <Text>
                  <Text as="span" fontWeight="bold">
                    {curriculums.reduce((acc, c) => acc + c.quiz.questions.length, 0)}
                  </Text> Total Questions
                </Text>
              </HStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Curriculums List */}
        <VStack spacing={4} align="stretch">
          {curriculums.length === 0 ? (
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
              <CardBody p={8} textAlign="center">
                <Icon as={FiBook} boxSize={12} color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No Lessons Yet</Heading>
                <Text color="gray.600" mb={4}>
                  Start by adding your first lesson to this module.
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={handleCreateCurriculum}
                >
                  Add First Lesson
                </Button>
              </CardBody>
            </Card>
          ) : (
            curriculums.map((curriculum, index) => (
              <Card key={curriculum.id} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={6}>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="flex-start">
                      <Box flex={1}>
                        <HStack spacing={3} mb={2}>
                          <Badge colorScheme="blue">#{curriculum.order}</Badge>
                          <Heading size="md">{curriculum.title}</Heading>
                        </HStack>
                        <Text color="gray.600" noOfLines={2}>
                          {curriculum.description}
                        </Text>
                      </Box>
                      
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          onClick={() => handleReorder('up', curriculum)}
                          isDisabled={index === 0}
                          variant="outline"
                        >
                          <FiChevronUp />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReorder('down', curriculum)}
                          isDisabled={index === curriculums.length - 1}
                          variant="outline"
                        >
                          <FiChevronDown />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleManageQuiz(curriculum)}
                          variant="outline"
                        >
                          <FiHelpCircle /> Quiz ({curriculum.quiz.questions.length})
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePreview(curriculum)}
                          colorScheme="purple"
                          variant="outline"
                        >
                          <FiEye /> Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditCurriculum(curriculum)}
                          colorScheme="blue"
                          variant="outline"
                        >
                          <FiEdit /> Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteCurriculum(curriculum)}
                          colorScheme="red"
                          variant="outline"
                        >
                          <FiTrash2 /> Delete
                        </Button>
                      </HStack>
                    </Flex>

                    {curriculum.visualContent && (() => {
                      try {
                        const imgs = JSON.parse(curriculum.visualContent!);
                        const src = Array.isArray(imgs) ? imgs[0] : curriculum.visualContent;
                        return (
                          <Box
                            w="full"
                            h="150px"
                            borderRadius="md"
                            bg="gray.100"
                            backgroundImage={`url(${src})`}
                            backgroundSize="cover"
                            backgroundPosition="center"
                            border="1px"
                            borderColor="gray.300"
                          />
                        );
                      } catch { return null; }
                    })()}

                    <Accordion allowToggle>
                      <AccordionItem border="none">
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Text fontSize="sm" color="gray.600">
                                View Content & Quiz Details
                              </Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Text fontSize="sm" fontWeight="medium" mb={2}>Content Preview:</Text>
                              <Text fontSize="sm" color="gray.600" noOfLines={3}>
                                {curriculum.content}
                              </Text>
                            </Box>
                            
                            <Divider />
                            
                            <Box>
                              <Text fontSize="sm" fontWeight="medium" mb={2}>Quiz Details:</Text>
                              <HStack spacing={4}>
                                <Text fontSize="sm" color="gray.600">
                                  Questions: {curriculum.quiz.questions.length}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  Passing Score: {curriculum.quiz.passingScore}%
                                </Text>
                              </HStack>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </VStack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>

        {/* Curriculum Form Modal */}
        <CurriculumForm
          isOpen={isFormModalOpen}
          onClose={onFormModalClose}
          curriculum={selectedCurriculum}
          isEditing={isEditing}
          courseId={course.id}
          onSubmit={handleFormSubmit}
        />

        {/* Lesson Preview Modal */}
        {selectedCurriculum && (
          <LessonPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            curriculum={selectedCurriculum}
          />
        )}

        {/* Quiz Manager Modal */}
        {selectedCurriculum && (
          <QuizManager
            isOpen={isManagingQuiz}
            onClose={() => setIsManagingQuiz(false)}
            curriculum={selectedCurriculum}
            onSubmit={handleQuizUpdate}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Lesson
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete "{selectedCurriculum?.title}"? This action cannot be undone and will also remove the associated quiz and any user progress.
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
