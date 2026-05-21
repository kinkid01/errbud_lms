"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  HStack,
  VStack,
  Flex,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import { useState } from "react";
import { Certificate } from "@/types/admin";

interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

const OVERLAY = {
  name:   { top: "38%", fontSize: "38px",  displayFontSize: "min(38px, 4.75vw)" },
  certId: { top: "80%", left: "7%",  fontSize: "14px", displayFontSize: "clamp(7px, 1.75vw, 14px)" },
  date:   { top: "80%", left: "60%", fontSize: "14px", displayFontSize: "clamp(7px, 1.75vw, 14px)" },
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!certificate) return null;

  const downloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');

      // Fetch background image as base64
      const imgResponse = await fetch('/images/certificate.png');
      const imgBlob = await imgResponse.blob();
      const imgBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imgBlob);
      });

      const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();  // 297mm
      const H = doc.internal.pageSize.getHeight(); // 210mm

      // Background
      doc.addImage(imgBase64, 'PNG', 0, 0, W, H);

      // Name — centered, bold, ~33pt
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(33);
      doc.setTextColor(26, 43, 94);
      doc.text(certificate.userName, W * 0.5, H * 0.42, { align: 'center' });

      // Certificate ID — left-aligned, ~12pt
      doc.setFontSize(12);
      doc.text(certificate.certificateId.slice(-12).toUpperCase(), W * 0.07, H * 0.835);

      // Completion date — centered at 60%, ~12pt
      doc.text(formattedDate, W * 0.6, H * 0.835, { align: 'center' });

      const fileName = `certificate-${certificate.certificateId.slice(-12).toUpperCase()}.pdf`;
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: 'Certificate downloaded successfully',
        description: 'The certificate has been saved as a PDF.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download certificate. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "5xl" }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={0}>
            <Heading size="md">Certificate Preview</Heading>
            <Text fontSize="xs" color="gray.400" fontFamily="mono" isTruncated maxW="90%">
              ID: {certificate.certificateId}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={4}>
          <div
            id="certificate-preview"
            style={{
              backgroundColor: "#e8e8e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              borderRadius: "12px",
            }}
          >
            <div
              id="certificate-preview-inner"
              style={{
                position: "relative",
                width: "min(800px, 100%)",
                aspectRatio: "2000 / 1414",
              }}
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/certificate.png"
                alt="certificate"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
              />

              {/* Overlays */}
              <div style={{ position: "absolute", inset: 0 }}>

                {/* 1. Student name */}
                <div
                  data-cert="name-container"
                  style={{
                    position: "absolute",
                    top: OVERLAY.name.top,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70%",
                    textAlign: "center",
                  }}
                >
                  <span
                    data-cert="name"
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: OVERLAY.name.displayFontSize,
                      fontWeight: "600",
                      color: "#1a2b5e",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {certificate.userName}
                  </span>
                </div>

                {/* 2. Certificate ID value */}
                <div
                  data-cert="certid-container"
                  style={{ position: "absolute", top: OVERLAY.certId.top, left: OVERLAY.certId.left }}
                >
                  <span
                    data-cert="certid"
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: OVERLAY.certId.displayFontSize,
                      fontWeight: "800",
                      color: "#1a2b5e",
                      letterSpacing: "1.5px",
                    }}
                  >
                    {certificate.certificateId.slice(-12).toUpperCase()}
                  </span>
                </div>

                {/* 3. Completion date value */}
                <div
                  data-cert="date-container"
                  style={{ position: "absolute", top: OVERLAY.date.top, left: "60%", transform: "translateX(-50%)", width: "30%", textAlign: "center" }}
                >
                  <span
                    data-cert="date"
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: OVERLAY.date.displayFontSize,
                      fontWeight: "800",
                      color: "#1a2b5e",
                      letterSpacing: "1px",
                    }}
                  >
                    {new Date(certificate.completionDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} gap={3} w="full">
            <Text fontSize="xs" color="gray.400" fontFamily="mono" flex={1} isTruncated>
              Score: {certificate.score}% &nbsp;·&nbsp; {certificate.userName}
            </Text>
            <HStack spacing={3} justify={{ base: "flex-end", md: "flex-end" }}>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="green"
                variant="outline"
                onClick={downloadCertificate}
                isLoading={isDownloading}
                loadingText="Downloading"
                size={{ base: "sm", md: "md" }}
              >
                Download
              </Button>
              <Button variant="outline" onClick={onClose} size={{ base: "sm", md: "md" }}>
                Close
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CertificatePreview;
