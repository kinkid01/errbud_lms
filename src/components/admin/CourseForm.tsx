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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Course } from "@/types/admin";

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  isEditing: boolean;
  onSubmit: (courseData: Partial<Course>) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  isOpen,
  onClose,
  course,
  isEditing,
  onSubmit,
}) => {
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active" as "active" | "inactive",
    coverImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && course) {
        setFormData({
          title: course.title,
          description: course.description,
          status: course.status,
          coverImage: course.coverImage || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          status: "active",
          coverImage: "",
        });
      }
    }
  }, [isOpen, isEditing, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            {isEditing ? "Edit Module" : "Create New Module"}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Module Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter module title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter module description"
                  rows={4}
                />
              </FormControl>
{/* 
              <FormControl>
                <FormLabel>Cover Image URL</FormLabel>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => handleChange("coverImage", e.target.value)}
                  placeholder="Enter cover image URL (optional)"
                />
              </FormControl> */}

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>

              {formData.coverImage && (
                <Box>
                  <FormLabel>Cover Image Preview</FormLabel>
                  <Box
                    w="full"
                    h="200px"
                    borderRadius="md"
                    bg="gray.100"
                    backgroundImage={formData.coverImage}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    border="1px"
                    borderColor="gray.300"
                  />
                </Box>
              )}
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
              >
                {isEditing ? "Update Module" : "Create Module"}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CourseForm;
