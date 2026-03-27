"use client";

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

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ certificate }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      {/* Certificate — locked to image aspect ratio 2000×1414 */}
      <div
        style={{
          position: "relative",
          width: "min(960px, 100%)",
          aspectRatio: "2000 / 1414",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/certificate.png"
          alt="certificate background"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />

        {/* ── Overlays ── */}
        <div style={{ position: "absolute", inset: 0 }}>

          {/* 1. Student name — centred in the blank white space below "This certificate awarded to:" */}
          <div
            style={{
              position: "absolute",
              top: "39%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(18px, 3.2vw, 42px)",
                fontStyle: "italic",
                fontWeight: "700",
                color: "#1a2b5e",
                letterSpacing: "1px",
                whiteSpace: "nowrap",
              }}
            >
              {certificate.studentName}
            </span>
          </div>

          {/* 2. Certificate ID value — left column of blue panel, below the label */}
          <div
            style={{
              position: "absolute",
              top: "80%",
              left: "7%",
            }}
          >
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

          {/* 3. Completion date value — centre column of blue panel, below the label */}
          <div
            style={{
              position: "absolute",
              top: "80%",
              left: "60%",
              transform: "translateX(-50%)",
            }}
          >
            <span
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "clamp(10px, 1.4vw, 16px)",
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
    </div>
  );
};

export default CertificateTemplate;
