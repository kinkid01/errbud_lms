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

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();  // 297mm
      const H = doc.internal.pageSize.getHeight(); // 210mm

      // Background
      doc.addImage(imgBase64, 'PNG', 0, 0, W, H);

      // Name — centered, bold, ~33pt
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(33);
      doc.setTextColor(26, 43, 94);
      doc.text(certificate.studentName, W * 0.5, H * 0.43, { align: 'center' });

      // Certificate ID — left-aligned, ~12pt
      doc.setFontSize(12);
      doc.text(certificate.certificateId.slice(-12).toUpperCase(), W * 0.07, H * 0.835);

      // Completion date — centered at 60%, ~12pt
      doc.text(certificate.completionDate, W * 0.6, H * 0.835, { align: 'center' });

      const fileName = `certificate-${certificate.certificateId.slice(-12).toUpperCase()}.pdf`;
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast({
        title: 'Certificate downloaded successfully',
        description: 'Your certificate has been saved as a PDF.',
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
