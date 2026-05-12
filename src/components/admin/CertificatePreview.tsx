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
      const { toPng } = await import('html-to-image');

      const certEl = document.getElementById('certificate-preview-inner') as HTMLElement | null;
      if (!certEl) throw new Error('Certificate element not found');

      // Clone off-screen at fixed 800px so the live element is never disrupted.
      // This ensures a consistent output size regardless of device width.
      const clone = certEl.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.boxShadow = 'none';

      // Apply fixed font sizes and positions matched to the 800px canvas
      const nameContainer   = clone.querySelector<HTMLElement>('[data-cert="name-container"]');
      const nameSpan        = clone.querySelector<HTMLElement>('[data-cert="name"]');
      const certIdContainer = clone.querySelector<HTMLElement>('[data-cert="certid-container"]');
      const certIdSpan      = clone.querySelector<HTMLElement>('[data-cert="certid"]');
      const dateContainer   = clone.querySelector<HTMLElement>('[data-cert="date-container"]');
      const dateSpan        = clone.querySelector<HTMLElement>('[data-cert="date"]');

      if (nameContainer)   nameContainer.style.top   = OVERLAY.name.top;
      if (nameSpan)        nameSpan.style.fontSize    = OVERLAY.name.fontSize;
      if (certIdContainer) certIdContainer.style.top = OVERLAY.certId.top;
      if (certIdSpan)      certIdSpan.style.fontSize  = OVERLAY.certId.fontSize;
      if (dateContainer)   dateContainer.style.top   = OVERLAY.date.top;
      if (dateSpan)        dateSpan.style.fontSize    = OVERLAY.date.fontSize;

      document.body.appendChild(clone);
      await document.fonts.ready;
      // Two rAF frames to ensure the browser has fully laid out the clone
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
        skipAutoScale: true,
      });

      document.body.removeChild(clone);

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
