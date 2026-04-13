"use client";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: DeleteConfirmationProps) {
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const isConfirmEnabled = deleteText.toLowerCase() === "delete";

  useEffect(() => {
    if (!isOpen) {
      setDeleteText("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete item",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      closeOnEsc={!isDeleting}
      closeOnOverlayClick={!isDeleting}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="stretch">
              <Text>{message}</Text>
              
              {itemName && (
                <Text fontWeight="medium" color="red.600">
                  "{itemName}"
                </Text>
              )}

              <VStack spacing={2} align="start">
                <Text fontSize="sm" fontWeight="medium">
                  To confirm, type <Text as="span" color="red.600" fontWeight="bold">"delete"</Text> below:
                </Text>
                <Input
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  borderColor={isConfirmEnabled ? "red.500" : undefined}
                  _focus={{
                    borderColor: isConfirmEnabled ? "red.500" : undefined,
                    boxShadow: isConfirmEnabled ? "0 0 0 1px red.500" : undefined,
                  }}
                  disabled={isDeleting}
                />
              </VStack>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button 
              ref={cancelRef} 
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleConfirm} 
              ml={3}
              isDisabled={!isConfirmEnabled || isDeleting || isLoading}
              isLoading={isDeleting || isLoading}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
