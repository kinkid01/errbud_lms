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
} from "@chakra-ui/react";
import { Certificate } from "@/types/admin";

interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  if (!certificate) return null;

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
              style={{
                position: "relative",
                width: "min(800px, 100%)",
                aspectRatio: "2000 / 1414",
                boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
              }}
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/certificate.png"
                alt="certificate"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
              />

              {/* Overlays — identical to CertificateTemplate.tsx */}
              <div style={{ position: "absolute", inset: 0 }}>

                {/* 1. Student name */}
                <div
                  style={{
                    position: "absolute",
                    top: "38%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70%",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: "clamp(18px, 3.2vw, 42px)",
                      fontWeight: "600",
                      color: "#1a2b5e",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {certificate.userName}
                  </span>
                </div>

                {/* 2. Certificate ID value */}
                <div style={{ position: "absolute", top: "80%", left: "7%" }}>
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: "clamp(10px, 1.4vw, 16px)",
                      fontWeight: "800",
                      color: "#1a2b5e",
                      letterSpacing: "1.5px",
                    }}
                  >
                    {certificate.certificateId.slice(-12).toUpperCase()}
                  </span>
                </div>

                {/* 3. Completion date value */}
                <div style={{ position: "absolute", top: "80%", left: "60%", transform: "translateX(-50%)" }}>
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontSize: "clamp(10px, 1.4vw, 16px)",
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
            <Button variant="outline" onClick={onClose}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CertificatePreview;
