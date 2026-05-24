"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  useBreakpointValue,
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
  name:   { top: "39%", mobileTop: "36%", fontSize: "38px",  displayFontSize: "min(38px, 3.96vw)" },
  certId: { top: "80%", mobileTop: "76%", left: "5%",  fontSize: "14px", displayFontSize: "clamp(7px, 1.46vw, 14px)" },
  date:   { top: "80%", mobileTop: "76%", left: "60%", fontSize: "14px", displayFontSize: "clamp(7px, 1.46vw, 14px)" },
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const nameTop   = useBreakpointValue({ base: OVERLAY.name.mobileTop,   md: OVERLAY.name.top });
  const certIdTop = useBreakpointValue({ base: OVERLAY.certId.mobileTop, md: OVERLAY.certId.top });
  const dateTop   = useBreakpointValue({ base: OVERLAY.date.mobileTop,   md: OVERLAY.date.top });

  if (!certificate) return null;

  const formattedDate = new Date(certificate.completionDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const downloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");

      const imgBase64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = "/images/certificate.png";
      });

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      doc.addImage(imgBase64, "PNG", 0, 0, W, H);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(33);
      doc.setTextColor(26, 43, 94);
      doc.text(certificate.userName, W * 0.5, H * 0.43, { align: "center" });

      doc.setFontSize(12);
      doc.text(certificate.certificateId.slice(-12).toUpperCase(), W * 0.07, H * 0.835);
      doc.text(formattedDate, W * 0.6, H * 0.835, { align: "center" });

      const fileName = `certificate-${certificate.certificateId.slice(-12).toUpperCase()}.pdf`;
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast({
        title: "Certificate ready",
        description: "The certificate has been saved as a PDF.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download failed",
        description: "Unable to download certificate. Please try again.",
        status: "error",
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
      <ModalContent
        bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative blurred orbs */}
        <Box
          position="absolute" top="-120px" left="-120px"
          w="400px" h="400px" borderRadius="full"
          bg="rgba(102,126,234,0.18)" filter="blur(90px)"
          pointerEvents="none"
        />
        <Box
          position="absolute" bottom="-120px" right="-120px"
          w="400px" h="400px" borderRadius="full"
          bg="rgba(118,75,162,0.18)" filter="blur(90px)"
          pointerEvents="none"
        />

        <ModalCloseButton color="white" zIndex={10} />

        <ModalBody py={{ base: 10, md: 14 }} px={{ base: 4, md: 6 }}>
          {/* Header */}
          <Box textAlign="center" mb={{ base: 6, md: 10 }}>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="blue.300"
              letterSpacing="0.2em"
              textTransform="uppercase"
              mb={3}
            >
              Achievement Unlocked
            </Text>
            <Text
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="800"
              color="white"
              lineHeight="1.2"
              mb={2}
            >
              Congratulations, {certificate.userName.split(" ")[0]}!
            </Text>
            <Text fontSize={{ base: "sm", md: "md" }} color="whiteAlpha.600">
              Certificate ID:{" "}
              <Box as="span" color="whiteAlpha.900" fontWeight="600" fontFamily="mono">
                {certificate.certificateId.slice(-12).toUpperCase()}
              </Box>
            </Text>
          </Box>

          {/* Certificate card */}
          <Box
            maxW="960px"
            mx="auto"
            p={{ base: 2, md: 3 }}
            bg="rgba(255,255,255,0.06)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.12)"
            boxShadow="0 40px 100px rgba(0,0,0,0.5)"
          >
            <div
              id="certificate-preview"
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "2000 / 1414",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/certificate.png"
                alt="certificate background"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
              />

              <div style={{ position: "absolute", inset: 0 }}>

                {/* 1. Student name */}
                <div
                  data-cert="name-container"
                  style={{
                    position: "absolute",
                    top: nameTop,
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

                {/* 2. Certificate ID */}
                <div
                  data-cert="certid-container"
                  style={{ position: "absolute", top: certIdTop, left: OVERLAY.certId.left }}
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

                {/* 3. Completion date */}
                <div
                  data-cert="date-container"
                  style={{ position: "absolute", top: dateTop, left: "60%", transform: "translateX(-50%)", width: "30%", textAlign: "center" }}
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
                    {formattedDate}
                  </span>
                </div>

              </div>
            </div>
          </Box>

          {/* Download button */}
          <Flex justify="center" mt={{ base: 6, md: 8 }}>
            <Button
              leftIcon={<FiDownload />}
              size="lg"
              px={10}
              fontSize="md"
              fontWeight="700"
              bg="white"
              color="#0f3460"
              borderRadius="full"
              boxShadow="0 8px 32px rgba(0,0,0,0.35)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                bg: "gray.50",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
              onClick={downloadCertificate}
              isLoading={isDownloading}
              loadingText="Preparing..."
            >
              Download Certificate
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CertificatePreview;
