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

const OVERLAY = {
  name:   { top: "39%", fontSize: "38px",  displayFontSize: "min(38px, 3.96vw)" },
  certId: { top: "80%", left: "7%",  fontSize: "14px", displayFontSize: "clamp(7px, 1.46vw, 14px)" },
  date:   { top: "80%", left: "60%", fontSize: "14px", displayFontSize: "clamp(7px, 1.46vw, 14px)" },
};

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ certificate }) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const { toPng } = await import('html-to-image');

      const certEl = document.getElementById('certificate-template') as HTMLElement | null;
      if (!certEl) throw new Error('Certificate element not found');

      // Clone off-screen at fixed 960px so the live element is never disrupted.
      // This also ensures the captured size is always consistent regardless of device width.
      const clone = certEl.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '960px';
      clone.style.boxShadow = 'none';

      // Apply fixed font sizes and positions matched to the 960px canvas
      const nameContainer   = clone.querySelector<HTMLElement>('[data-cert="name-container"]');
      const nameSpan        = clone.querySelector<HTMLElement>('[data-cert="name"]');
      const certIdContainer = clone.querySelector<HTMLElement>('[data-cert="certid-container"]');
      const certIdSpan      = clone.querySelector<HTMLElement>('[data-cert="certid"]');
      const dateContainer   = clone.querySelector<HTMLElement>('[data-cert="date-container"]');
      const dateSpan        = clone.querySelector<HTMLElement>('[data-cert="date"]');

      if (nameContainer)   nameContainer.style.top     = OVERLAY.name.top;
      if (nameSpan)        nameSpan.style.fontSize      = OVERLAY.name.fontSize;
      if (certIdContainer) certIdContainer.style.top   = OVERLAY.certId.top;
      if (certIdSpan)      certIdSpan.style.fontSize    = OVERLAY.certId.fontSize;
      if (dateContainer)   dateContainer.style.top     = OVERLAY.date.top;
      if (dateSpan)        dateSpan.style.fontSize      = OVERLAY.date.fontSize;

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
    <Box minH="100vh" bg="#e8e8e8" p={{ base: 3, md: 6 }}>
      {/* Header row: title + download button */}
      <Flex
        align="center"
        justify="space-between"
        maxW="960px"
        mx="auto"
        mb={4}
      >
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="600" color="gray.700">
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
                {certificate.studentName}
              </span>
            </div>

            {/* 2. Certificate ID */}
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

            {/* 3. Completion date */}
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
