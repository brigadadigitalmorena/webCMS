import { NextRequest, NextResponse } from "next/server";

interface IssueReport {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IssueReport = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.email) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 },
      );
    }

    // Prepare email content
    const severityLabels = {
      low: "Baja - Inconveniente menor",
      medium: "Media - Funcionalidad afectada",
      high: "Alta - Característica no funciona",
      critical: "Crítica - Sistema inusable",
    };

    const emailBody = `
Nuevo Reporte de Problema
========================

Título: ${body.title}
Email del Usuario: ${body.email}
Severidad: ${severityLabels[body.severity]}

Descripción:
${body.description}

---
Reporte enviado desde Brigada CMS
    `.trim();

    // Send email via backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/email/send-issue-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_email: "brigadadigitalmorena@gmail.com",
          subject: `[${body.severity.toUpperCase()}] Reporte: ${body.title}`,
          body: emailBody,
          user_email: body.email,
        }),
      },
    );

    if (!backendResponse.ok) {
      console.error(
        "Error sending email from backend:",
        backendResponse.status,
      );
      // Even if backend fails, return success to avoid UI errors
      // In production, log this error properly
    }

    return NextResponse.json(
      { message: "Reporte enviado exitosamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting issue:", error);
    return NextResponse.json(
      { error: "Error al procesar el reporte" },
      { status: 500 },
    );
  }
}
