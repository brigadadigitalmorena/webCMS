/**
 * Quota Service
 * Obtiene información de quota y uso de servicios externos:
 * - Render (hosting)
 * - Neon DB (base de datos)
 * - Cloudinary (almacenamiento de imágenes)
 */

export interface QuotaInfo {
  service: string;
  status: "success" | "error" | "pending";
  data?: any;
  error?: string;
  lastUpdated?: string;
}

export interface QuotaResponse {
  render?: QuotaInfo;
  neon?: QuotaInfo;
  cloudinary?: QuotaInfo;
  timestamp: string;
}

class QuotaService {
  /**
   * Obtener información de quota de Render
   */
  async getRenderQuota(): Promise<QuotaInfo> {
    try {
      const renderToken = process.env.NEXT_PUBLIC_RENDER_API_KEY;
      if (!renderToken) {
        return {
          service: "Render",
          status: "error",
          error: "API key no configurada",
        };
      }

      const response = await fetch("https://api.render.com/v1/services", {
        headers: {
          Authorization: `Bearer ${renderToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Render API error: ${response.status}`);
      }

      const services = await response.json();

      // Calcular información de uso
      const totalCpus = services.reduce(
        (sum: number, service: any) => sum + (service.cpuAllocation || 0),
        0,
      );
      const totalMemory = services.reduce(
        (sum: number, service: any) => sum + (service.memoryAllocation || 0),
        0,
      );

      return {
        service: "Render",
        status: "success",
        data: {
          totalServices: services.length,
          activeServices: services.filter((s: any) => s.status === "live")
            .length,
          totalCpus,
          totalMemory,
          services: services.map((s: any) => ({
            name: s.name,
            status: s.status,
            cpuAllocation: s.cpuAllocation,
            memoryAllocation: s.memoryAllocation,
            createdAt: s.createdAt,
          })),
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: "Render",
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener información de quota de Neon DB
   */
  async getNeonQuota(): Promise<QuotaInfo> {
    try {
      const neonToken = process.env.NEXT_PUBLIC_NEON_API_KEY;
      const neonProjectId = process.env.NEXT_PUBLIC_NEON_PROJECT_ID;

      if (!neonToken || !neonProjectId) {
        return {
          service: "Neon DB",
          status: "error",
          error: "API key o Project ID no configurados",
        };
      }

      const response = await fetch(
        `https://api.neon.tech/v1/projects/${neonProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${neonToken}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status}`);
      }

      const project = await response.json();

      return {
        service: "Neon DB",
        status: "success",
        data: {
          projectId: project.id,
          projectName: project.name,
          region: project.region_id,
          branches: project.branches?.length || 0,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          computeTime: project.compute_time_sec || 0,
          dataTransfer: project.data_transfer_bytes || 0,
          storageUsed: project.storage_bytes || 0,
          // Quotas típicas de Neon
          quotas: {
            dataTransferPerMonth: 5268480000, // ~5GB
            computeTimePerMonth: 2592000, // ~30 días
            storagePerProject: 1099511627776, // ~1TB
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: "Neon DB",
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener información de quota de Cloudinary
   */
  async getCloudinaryQuota(): Promise<QuotaInfo> {
    try {
      const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
        return {
          service: "Cloudinary",
          status: "error",
          error: "Credenciales de Cloudinary no configuradas",
        };
      }

      // Crear autenticación basic
      const auth = Buffer.from(
        `${cloudinaryApiKey}:${cloudinaryApiSecret}`,
      ).toString("base64");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/usage`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Cloudinary API error: ${response.status}`);
      }

      const usage = await response.json();

      // Convertir bytes a GB
      const bytesToGb = (bytes: number) =>
        (bytes / (1024 * 1024 * 1024)).toFixed(2);

      return {
        service: "Cloudinary",
        status: "success",
        data: {
          cloudName: cloudinaryCloudName,
          storageUsed: {
            bytes: usage.bytes,
            gb: bytesToGb(usage.bytes),
          },
          credits: {
            used: usage.credits_used,
            limit: 1000, // Depende del plan
          },
          requests: {
            requests: usage.requests,
            bandwidth: {
              bytes: usage.bandwidth,
              gb: bytesToGb(usage.bandwidth),
            },
          },
          transformations: usage.transformations || 0,
          mediaAssets: usage.media_assets || 0,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: "Cloudinary",
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener todas las quotas
   */
  async getAllQuotas(): Promise<QuotaResponse> {
    const [render, neon, cloudinary] = await Promise.all([
      this.getRenderQuota(),
      this.getNeonQuota(),
      this.getCloudinaryQuota(),
    ]);

    return {
      render,
      neon,
      cloudinary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener quota de un servicio específico
   */
  async getQuotaByService(
    service: "render" | "neon" | "cloudinary",
  ): Promise<QuotaInfo> {
    switch (service) {
      case "render":
        return this.getRenderQuota();
      case "neon":
        return this.getNeonQuota();
      case "cloudinary":
        return this.getCloudinaryQuota();
      default:
        return {
          service,
          status: "error",
          error: `Servicio desconocido: ${service}`,
        };
    }
  }

  /**
   * Formatear información de quota para mostrar
   */
  formatQuotaDisplay(quotaInfo: QuotaInfo): string {
    if (quotaInfo.status === "error") {
      return `${quotaInfo.service}: ❌ ${quotaInfo.error || "Error desconocido"}`;
    }

    switch (quotaInfo.service) {
      case "Render":
        return `${quotaInfo.service}: ✅ ${quotaInfo.data?.totalServices || 0} servicios, ${quotaInfo.data?.activeServices || 0} activos`;
      case "Neon DB":
        return `${quotaInfo.service}: ✅ ${quotaInfo.data?.branches || 0} branches`;
      case "Cloudinary":
        return `${quotaInfo.service}: ✅ ${quotaInfo.data?.storageUsed?.gb || 0}GB usados`;
      default:
        return `${quotaInfo.service}: ⏳ Pendiente`;
    }
  }
}

export const quotaService = new QuotaService();
