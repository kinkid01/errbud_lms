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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Box,
  Image,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";
import { Curriculum, Quiz } from "@/types/admin";

interface CurriculumFormProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Curriculum | null;
  isEditing: boolean;
  courseId: string;
  onSubmit: (curriculumData: Omit<Curriculum, 'id'>) => void;
}

interface CurriculumFormData {
  title: string;
  description: string;
  content: string;
  visualContent: string;
  courseId: string;
  order: number;
  duration: number;
  quiz: Quiz;
}

const CurriculumForm: React.FC<CurriculumFormProps> = ({
  isOpen,
  onClose,
  curriculum,
  isEditing,
  courseId,
  onSubmit,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: parse visualContent string → string[]
  const parseImages = (v?: string): string[] => {
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [v];
    } catch {
      return [v]; // legacy single URL
    }
  };

  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CurriculumFormData>({
    title: "",
    description: "",
    content: "",
    visualContent: "",
    courseId: courseId,
    order: 1,
    duration: 30,
    quiz: {
      id: "",
      curriculumId: "",
      questions: [],
      passingScore: 60,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && curriculum) {
        setFormData({
          title: curriculum.title,
          description: curriculum.description,
          content: curriculum.content,
          visualContent: curriculum.visualContent || "",
          courseId: curriculum.courseId,
          order: curriculum.order,
          duration: curriculum.duration ?? 30,
          quiz: curriculum.quiz,
        });
        setImages(parseImages(curriculum.visualContent));
      } else {
        setFormData({
          title: "",
          description: "",
          content: "",
          visualContent: "",
          courseId: courseId,
          order: 1,
          duration: 30,
          quiz: {
            id: "",
            curriculumId: "",
            questions: [],
            passingScore: 60,
          },
        });
        setImages([]);
      }
    }
  }, [isOpen, isEditing, curriculum, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title, description, and content are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        visualContent: images.length > 0 ? JSON.stringify(images) : "",
        quiz: {
          ...formData.quiz,
          curriculumId: "",
        },
      });
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

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_WIDTH = 900;
          const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Iteratively reduce quality until base64 is under 350 KB
          const TARGET_BYTES = 350 * 1024;
          let quality = 0.80;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (dataUrl.length > TARGET_BYTES && quality > 0.30) {
            quality -= 0.10;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    for (const file of files) {
      const compressed = await compressImage(file);
      setImages((prev) => [...prev, compressed]);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            {isEditing ? "Edit Lesson" : "Create New Lesson"}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Lesson Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter lesson title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter lesson description"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Learning Content</FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Enter the learning material for this lesson"
                  rows={6}
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  Lesson Images{" "}
                  <Text as="span" color="gray.500" fontWeight="normal">
                    (optional — you can add multiple images)
                  </Text>
                </FormLabel>
                <VStack align="stretch" spacing={3}>
                  {/* Hidden file input — allows multiple selection */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  <Button
                    size="sm"
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    alignSelf="flex-start"
                  >
                    Upload Images
                  </Button>

                  {/* Image grid */}
                  {images.length > 0 && (
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))"
                      gap={3}
                    >
                      {images.map((src, idx) => (
                        <Box key={idx} position="relative" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                          <Image
                            src={src}
                            alt={`Image ${idx + 1}`}
                            w="full"
                            h="120px"
                            objectFit="cover"
                          />
                          <IconButton
                            aria-label="Remove image"
                            icon={<FiX />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => removeImage(idx)}
                          />
                          <Box
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            bg="blackAlpha.500"
                            px={2}
                            py={0.5}
                          >
                            <Text fontSize="10px" color="white">Image {idx + 1}</Text>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {images.length === 0 && (
                    <Box
                      border="2px dashed"
                      borderColor="gray.200"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      color="gray.400"
                    >
                      <Icon as={FiImage} boxSize={6} mx="auto" mb={2} />
                      <Text fontSize="sm">No images added yet. Click Upload Images to add some.</Text>
                    </Box>
                  )}
                </VStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Lesson Timer (seconds)</FormLabel>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", parseInt(e.target.value) || 30)}
                  placeholder="Timer duration in seconds"
                  min={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Quiz Passing Score (%)</FormLabel>
                <Input
                  type="number"
                  value={formData.quiz.passingScore}
                  onChange={(e) => handleChange("quiz", {
                    ...formData.quiz,
                    passingScore: parseInt(e.target.value) || 60,
                  })}
                  placeholder="Passing score percentage"
                  min={0}
                  max={100}
                />
              </FormControl>

              <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <strong>Note:</strong> After creating this lesson, you can add quiz questions with 5 multiple-choice options each. 
                  Students will need to score at least {formData.quiz.passingScore}% to pass.
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
              >
                {isEditing ? "Update Lesson" : "Create Lesson"}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CurriculumForm;
