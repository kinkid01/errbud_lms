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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Spacer,
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
  Textarea,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FiBook,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiEye,
  FiLayers,
} from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { Course } from "@/types/admin";
import { adminApi } from "@/lib/adminApi";
import CourseForm from "./CourseForm";
import CurriculumManagement from "./CurriculumManagement";

export default function CourseManagement() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);

  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const loadCourses = useCallback(async () => {
    try {
      const coursesData = await adminApi.getCourses();
      setCourses(coursesData);
    } catch (error) {
      toast({
        title: "Error loading modules",
        description: "Failed to load module data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const filterCourses = useCallback(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsEditing(false);
    onFormModalOpen();
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditing(true);
    onFormModalOpen();
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      await adminApi.deleteCourse(selectedCourse.id);
      toast({
        title: "Module deleted",
        description: "Module has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await loadCourses();
      onDeleteAlertClose();
    } catch (error) {
      toast({
        title: "Error deleting module",
        description: "Failed to delete module",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = async (courseData: Partial<Course>) => {
    try {
      if (isEditing && selectedCourse) {
        await adminApi.updateCourse(selectedCourse.id, courseData);
        toast({
          title: "Module updated",
          description: "Module has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await adminApi.createCourse(courseData as Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'curriculums'>);
        toast({
          title: "Module created",
          description: "Module has been created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      await loadCourses();
      onFormModalClose();
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} module`,
        description: `Failed to ${isEditing ? 'update' : 'create'} module`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge colorScheme="green">Active</Badge>;
      case 'inactive':
        return <Badge colorScheme="red">Inactive</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  if (managingCourse) {
    return (
      <CurriculumManagement
        course={managingCourse}
        onBack={() => setManagingCourse(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <VStack spacing={4} align="center">
          <Text>Loading modules...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
          <Box>
            <Heading size="lg" mb={1}>Module Management</Heading>
            <Text color="gray.600" fontSize="sm">Create, edit, and manage module content</Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleCreateCourse}
            borderRadius="xl"
            flexShrink={0}
            w={{ base: "full", sm: "auto" }}
          >
            Create New Module
          </Button>
        </Flex>

        {/* Stats Overview */}
        <Flex gap={4} flexWrap="wrap">
          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="130px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiBook} boxSize={7} color="blue.500" />
                <Stat>
                  <StatLabel fontSize="sm">Total Modules</StatLabel>
                  <StatNumber fontSize="lg">{courses.length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="130px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiEye} boxSize={7} color="green.500" />
                <Stat>
                  <StatLabel fontSize="sm">Active Modules</StatLabel>
                  <StatNumber fontSize="lg">{courses.filter(c => c.status === 'active').length}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" flex="1" minW="130px">
            <CardBody p={4}>
              <HStack spacing={3}>
                <Icon as={FiClock} boxSize={7} color="purple.500" />
                <Stat>
                  <StatLabel fontSize="sm">Total Hours</StatLabel>
                  <StatNumber fontSize="lg">{courses.reduce((acc, c) => acc + c.duration, 0)}</StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        </Flex>

        {/* Filters */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={4}>
            <Flex gap={3} direction={{ base: "column", sm: "row" }}>
              <Box flex={1}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                w={{ base: "full", sm: "180px" }}
              >
                <option value="all">All Modules</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Flex>
          </CardBody>
        </Card>

        {/* Courses Table */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={0} overflowX="auto">
            <Table variant="simple" minW="600px">
              <Thead>
                <Tr>
                  <Th>Module</Th>
                  <Th>Description</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCourses.map((course) => (
                  <Tr key={course.id}>
                    <Td>
                      <HStack spacing={3} align="center">
                        <Flex
                          w="36px"
                          h="36px"
                          minW="36px"
                          minH="36px"
                          borderRadius="lg"
                          bg="blue.500"
                          align="center"
                          justify="center"
                          color="white"
                          flexShrink={0}
                        >
                          <Icon as={FiBook} boxSize={4} />
                        </Flex>
                        <Text fontWeight="medium">{course.title}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text noOfLines={2} maxW="300px">
                        {course.description}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Icon as={FiClock} color="gray.400" />
                        <Text>{course.duration}h</Text>
                      </HStack>
                    </Td>
                    <Td>{getStatusBadge(course.status)}</Td>
                    <Td>{new Date(course.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiLayers} />}
                          onClick={() => setManagingCourse(course)}
                          colorScheme="green"
                          variant="outline"
                          px={{ base: 2, md: 3 }}
                        >
                          <Text display={{ base: "none", lg: "inline" }}>Lessons</Text>
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiEdit} />}
                          onClick={() => handleEditCourse(course)}
                          colorScheme="blue"
                          variant="outline"
                          px={{ base: 2, md: 3 }}
                        >
                          <Text display={{ base: "none", lg: "inline" }}>Edit</Text>
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiTrash2} />}
                          onClick={() => handleDeleteCourse(course)}
                          colorScheme="red"
                          variant="outline"
                          px={{ base: 2, md: 3 }}
                        >
                          <Text display={{ base: "none", lg: "inline" }}>Delete</Text>
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Course Form Modal */}
        <CourseForm
          isOpen={isFormModalOpen}
          onClose={onFormModalClose}
          course={selectedCourse}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
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
                Delete Course
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete &quot;{selectedCourse?.title}&quot;? This action cannot be undone and will also remove all associated lessons and user progress.
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
