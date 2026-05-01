"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";

interface CertificateTemplateProps {
  certificate: {
    id: string;
    courseName: string;
    studentName: string;
    completionDate: string;
    score: number;
    instructorName: string;
    certificateId: string;
  };
}

// ─── Tune these to adjust overlay positions in the downloaded image ───────────
const OVERLAY = {
  name:   { top: "39%", fontSize: "38px" },
  certId: { top: "80%", left: "7%",  fontSize: "14px" },
  date:   { top: "80%", left: "60%", fontSize: "14px" },
};
// ─────────────────────────────────────────────────────────────────────────────

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ certificate }) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const { toPng } = await import('html-to-image');

      const certificateElement = document.getElementById('certificate-template');
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
        description: 'Your certificate has been saved to your device.',
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
    <Box minH="100vh" bg="#e8e8e8" p={6}>
      {/* Header row: title + download button */}
      <Flex
        align="center"
        justify="space-between"
        maxW="960px"
        mx="auto"
        mb={4}
      >
        <Text fontSize="lg" fontWeight="600" color="gray.700">
          Your Certificate
        </Text>
        <Button
          leftIcon={<FiDownload />}
          colorScheme="blue"
          size="sm"
          borderRadius="lg"
          onClick={downloadCertificate}
          isLoading={isDownloading}
          loadingText="Downloading..."
        >
          Download
        </Button>
      </Flex>

      {/* Certificate */}
      <Box display="flex" justifyContent="center">
        <div
          id="certificate-template"
          style={{
            position: "relative",
            width: "min(960px, 100%)",
            aspectRatio: "2000 / 1414",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
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
                {certificate.studentName}
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
            <div style={{ position: "absolute", top: OVERLAY.date.top, left: "60%", transform: "translateX(-50%)", width: "30%", textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: OVERLAY.date.fontSize,
                  fontWeight: "800",
                  color: "#1a2b5e",
                  letterSpacing: "1px",
                }}
              >
                {certificate.completionDate}
              </span>
            </div>

          </div>
        </div>
      </Box>
    </Box>
  );
};

export default CertificateTemplate;
