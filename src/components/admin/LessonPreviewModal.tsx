"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Heading,
  HStack,
  VStack,
  Divider,
  Badge,
  Image,
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { Icon } from "@chakra-ui/react";
import React from "react";
import { Curriculum } from "@/types/admin";

interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Curriculum;
}


const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({ isOpen, onClose, curriculum }) => {
  const images: string[] = (() => {
    if (!curriculum.visualContent) return [];
    try {
      const p = JSON.parse(curriculum.visualContent);
      return Array.isArray(p) ? p : [curriculum.visualContent];
    } catch {
      return [curriculum.visualContent];
    }
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={4}>
          <HStack spacing={3}>
            <Icon as={FiEye} color="purple.500" boxSize={5} />
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="purple.500" textTransform="uppercase" letterSpacing="wider">
                Student Preview
              </Text>
              <Heading size="md" color="gray.800" mt={0.5}>{curriculum.title}</Heading>
            </Box>
            <Badge colorScheme="purple" borderRadius="full" px={3} ml="auto">
              As seen by students
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Content */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={6}
              boxShadow="sm"
            >
              <Divider mb={5} />
              <Box>
                {curriculum.content ? (
                  <Box
                    dangerouslySetInnerHTML={{ __html: curriculum.content }}
                    sx={{
                      fontSize: "md",
                      lineHeight: "1.8",
                      color: "gray.700",
                      "& h1": { fontSize: "1.5em", fontWeight: "bold", my: 2 },
                      "& h2": { fontSize: "1.3em", fontWeight: "bold", my: 2 },
                      "& h3": { fontSize: "1.1em", fontWeight: "bold", my: 2 },
                      "& ul": { pl: 5, listStyleType: "disc", mb: 3 },
                      "& ol": { pl: 5, listStyleType: "decimal", mb: 3 },
                      "& li": { mb: 1 },
                      "& blockquote": {
                        borderLeft: "3px solid",
                        borderColor: "blue.300",
                        pl: 3,
                        color: "gray.500",
                        fontStyle: "italic",
                        my: 2,
                      },
                      "& p": { mb: 4 },
                      "& strong": { fontWeight: "bold" },
                      "& em": { fontStyle: "italic" },
                      "& u": { textDecoration: "underline" },
                    }}
                  />
                ) : (
                  <Text color="gray.400" fontStyle="italic">No content added yet.</Text>
                )}
              </Box>
            </Box>

            {/* Images */}
            {images.length > 0 && (
              <VStack spacing={4} align="stretch">
                {images.map((src, idx) => (
                  <Image
                    key={idx}
                    src={src}
                    alt={`Image ${idx + 1}`}
                    borderRadius="xl"
                    w="full"
                    maxH="400px"
                    objectFit="cover"
                    boxShadow="sm"
                  />
                ))}
              </VStack>
            )}

            {/* Quiz info */}
            {curriculum.quiz.questions.length > 0 && (
              <Box bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="xl" p={4}>
                <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={1}>
                  Quiz attached — {curriculum.quiz.questions.length} question{curriculum.quiz.questions.length !== 1 ? "s" : ""}
                </Text>
                <Text fontSize="xs" color="blue.500">
                  Students will see a &quot;Take Quiz&quot; button after completing all lessons in this module.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LessonPreviewModal;
