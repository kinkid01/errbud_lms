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

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const k = key++;

    if (line.trim() === "") {
      elements.push(<Box key={k} h={3} />);
      i++;
      continue;
    }

    if (/^\s*[•\-\*·]\s/.test(line)) {
      const bullets: string[] = [];
      while (i < lines.length && /^\s*[•\-\*·]\s/.test(lines[i])) {
        bullets.push(lines[i].replace(/^\s*[•\-\*·]\s*/, ""));
        i++;
      }
      elements.push(
        <Box key={k} mb={3}>
          {bullets.map((b, bi) => (
            <HStack key={bi} spacing={2} align="start" mb={1}>
              <Text color="blue.400" fontSize="md" lineHeight="1.8" flexShrink={0}>•</Text>
              <Text color="gray.700" fontSize="md" lineHeight="1.8">{b}</Text>
            </HStack>
          ))}
        </Box>
      );
      continue;
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const items: { num: string; text: string }[] = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^\s*(\d+)\.\s+(.*)/);
        if (m) items.push({ num: m[1], text: m[2] });
        i++;
      }
      elements.push(
        <Box key={k} mb={3}>
          {items.map((item, ii) => (
            <HStack key={ii} spacing={2} align="start" mb={1}>
              <Text color="blue.500" fontSize="md" lineHeight="1.8" fontWeight="semibold" flexShrink={0}>
                {item.num}.
              </Text>
              <Text color="gray.700" fontSize="md" lineHeight="1.8">{item.text}</Text>
            </HStack>
          ))}
        </Box>
      );
      continue;
    }

    // Regular paragraph — collect consecutive lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*[•\-\*·]\s/.test(lines[i]) &&
      !/^\s*\d+\.\s/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    elements.push(
      <Text key={k} color="gray.700" fontSize="md" lineHeight="1.8" mb={4}>
        {paragraphLines.join(" ")}
      </Text>
    );
  }

  return elements;
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
                {curriculum.content ? renderContent(curriculum.content) : (
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
