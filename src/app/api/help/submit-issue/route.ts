import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface IssueReport {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  email: string;
}

export async function POST(request: NextRequest) {
  // Require authentication — read token from HttpOnly cookie
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

    // Call the (now authenticated) backend email endpoint
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/email/send-issue-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: `[${body.severity.toUpperCase()}] Reporte: ${body.title}`,
          body: emailBody,
        }),
      },
    );

    if (!backendResponse.ok) {
      const err = await backendResponse.json().catch(() => ({}));
      console.error("Backend issue-report error:", backendResponse.status, err);
      return NextResponse.json(
        { error: err.detail || "Error al enviar el reporte" },
        { status: backendResponse.status },
      );
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
