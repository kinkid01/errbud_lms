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

// ─── Tune these to adjust overlay positions in the downloaded image ───────────
const OVERLAY = {
  name:   { top: "38%", fontSize: "38px" },
  certId: { top: "80%", left: "7%",  fontSize: "14px" },
  date:   { top: "80%", left: "60%", fontSize: "14px" },
};
// ─────────────────────────────────────────────────────────────────────────────

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
      const { toPng } = await import('html-to-image');

      const certificateElement = document.getElementById('certificate-preview-inner');
      if (!certificateElement) throw new Error('Certificate element not found');

      await document.fonts.ready;

      const dataUrl = await toPng(certificateElement, {
        pixelRatio: 2,
        skipAutoScale: true,
      });

      const link = document.createElement('a');
      link.download = `certificate-${certificate.certificateId.slice(-12).toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Certificate downloaded successfully',
        description: 'The certificate has been saved to your device.',
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
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={0}>
            <Heading size="md">Certificate Preview</Heading>
            <Text fontSize="xs" color="gray.400" fontFamily="mono">
              ID: {certificate.certificateId}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          {/* Certificate rendered exactly as the student sees it */}
          <div
            id="certificate-preview"
            style={{
              backgroundColor: "#e8e8e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
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
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: OVERLAY.name.fontSize,
                      fontWeight: "600",
                      color: "#1a2b5e",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {certificate.userName}
                  </span>
                </div>

                {/* 2. Certificate ID value */}
                <div style={{ position: "absolute", top: OVERLAY.certId.top, left: OVERLAY.certId.left }}>
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: OVERLAY.certId.fontSize,
                      fontWeight: "800",
                      color: "#1a2b5e",
                      letterSpacing: "1.5px",
                    }}
                  >
                    {certificate.certificateId.slice(-12).toUpperCase()}
                  </span>
                </div>

                {/* 3. Completion date value */}
                <div style={{ position: "absolute", top: OVERLAY.date.top, left: "50%", transform: "translateX(-50%)", width: "30%", textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: OVERLAY.date.fontSize,
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
          <HStack spacing={3}>
            <Text fontSize="xs" color="gray.400" fontFamily="mono" flex={1}>
              Score: {certificate.score}% &nbsp;·&nbsp; {certificate.userName}
            </Text>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="green"
              variant="outline"
              onClick={downloadCertificate}
              isLoading={isDownloading}
              loadingText="Downloading"
            >
              Download
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CertificatePreview;
