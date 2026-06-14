import {
  LIV_TOOL_CANCEL_BOOKING,
  LIV_TOOL_CONFIRM_BOOKING,
  LIV_TOOL_CREATE_BOOKING,
  LIV_TOOL_FIND_SLOTS,
  LIV_TOOL_SEARCH_RETAIL_PRODUCTS,
  LIV_TOOL_GET_BOOKING,
  LIV_TOOL_LIST_STUCK_CONTINUITY,
  LIV_TOOL_LIST_DRIFT_CANDIDATES,
  LIV_TOOL_DRAFT_DRIFT_RECOVERY,
  LIV_TOOL_LOOKUP_CUSTOMER,
  LIV_TOOL_MORNING_BRIEFING,
  LIV_TOOL_RESCHEDULE_BOOKING,
  LIV_TOOL_SEARCH_TENANTS,
  LIV_TOOL_SEND_MESSAGE,
  LIV_TOOL_TENANT_SNAPSHOT,
  LIV_TOOL_WELLNESS_DUTY_SOLVER,
  LIV_TOOL_WELLNESS_EOD_CLOSE,
  LIV_TOOL_WELLNESS_REROOM,
  LIV_TOOL_GET_ACTIVATION_STATUS,
  LIV_TOOL_GET_BUSINESS_TWIN,
  LIV_TOOL_GET_COMMERCE_SNAPSHOT,
  LIV_TOOL_GET_COMMERCE_SIGNALS,
  LIV_TOOL_LIST_CAPABILITY_BLOCKERS,
  LIV_TOOL_GET_OWNER_INTELLIGENCE,
  LIV_TOOL_LIST_PRESENTATION_PRESETS,
  LIV_TOOL_GET_SETUP_CHECKLIST,
  LIV_TOOL_GET_TENANT_EXPERIENCE,
  LIV_TOOL_PREVIEW_PRESENTATION,
  LIV_TOOL_APPLY_PRESENTATION_PRESET,
  LIV_TOOL_PATCH_LIV_PERSONA,
  LIV_TOOL_PATCH_BRAND_ASSETS,
  LIV_TOOL_EXPLAIN_OPERATIONAL_POLICY,
  LIV_TOOL_PROPOSE_POLICY_PATCH,
  LIV_TOOL_PATCH_BUSINESS_HOURS,
  LIV_TOOL_CONFIRM_PUBLIC_LINK,
  LIV_TOOL_PATCH_OPERATIONAL_POLICY,
  LIV_TOOL_INVITE_STAFF,
  LIV_TOOL_ASSIGN_SERVICE,
  LIV_TOOL_START_CHANNEL_CONNECT,
} from "./registry";

export type LivSlot = {
  startAt: string;
  endAt: string;
  staffId: string | null;
  staffName: string | null;
};

export type LivToolDeps = {
  findSlots: (input: {
    serviceId: string;
    date: string;
    staffId?: string;
  }) => Promise<LivSlot[]>;
  searchRetailProducts?: (input: {
    query?: string;
    category?: string;
    limit?: number;
  }) => Promise<Record<string, unknown>>;
  sendMessage?: (input: { content: string }) => Promise<{ messageId: string }>;
  createBooking: (input: {
    serviceId: string;
    startAt: string;
    staffId?: string;
    customerFirstName: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
    conversationId: string;
    channelType: "WEB" | "SMS" | "WHATSAPP" | "INSTAGRAM" | "MESSENGER" | "VOICE";
  }) => Promise<{
    bookingId: string;
    customerId: string;
    status: string;
    pendingReason?: string | null;
    startAt: string;
    endAt: string;
    serviceName: string | null;
    staffName: string | null;
  }>;
  confirmBooking?: (input: { bookingId: string }) => Promise<Record<string, unknown>>;
  cancelBooking?: (input: { bookingId: string; reason?: string }) => Promise<Record<string, unknown>>;
  rescheduleBooking?: (input: {
    bookingId: string;
    startAt: string;
  }) => Promise<Record<string, unknown>>;
  lookupCustomer?: (input: { query: string }) => Promise<Record<string, unknown>>;
  getBooking?: (input: { bookingId: string }) => Promise<Record<string, unknown>>;
  listStuckContinuity?: (input: { limit?: number }) => Promise<Record<string, unknown>>;
  listDriftCandidates?: (input: {
    minDays?: number;
    limit?: number;
  }) => Promise<Record<string, unknown>>;
  draftDriftRecovery?: (input: {
    customerId?: string;
    customerName?: string;
    lastServiceName?: string;
    daysSinceVisit?: number;
  }) => Promise<Record<string, unknown>>;
  morningBriefing?: () => Promise<Record<string, unknown>>;
  searchTenants?: (input: { q: string; limit?: number }) => Promise<Record<string, unknown>>;
  tenantSnapshot?: (input: { businessId: string }) => Promise<Record<string, unknown>>;
  wellnessEodClose?: () => Promise<Record<string, unknown>>;
  wellnessDutySolver?: (input: {
    resourceName: string;
    hour: number;
  }) => Promise<Record<string, unknown>>;
  wellnessReroom?: () => Promise<Record<string, unknown>>;
  getActivationStatus?: () => Promise<Record<string, unknown>>;
  getBusinessTwin?: () => Promise<Record<string, unknown>>;
  getCommerceSnapshot?: () => Promise<Record<string, unknown>>;
  getCommerceSignals?: () => Promise<Record<string, unknown>>;
  listCapabilityBlockers?: () => Promise<Record<string, unknown>>;
  getOwnerIntelligence?: () => Promise<Record<string, unknown>>;
  listPresentationPresets?: () => Promise<Record<string, unknown>>;
  getSetupChecklist?: () => Promise<Record<string, unknown>>;
  getTenantExperience?: () => Promise<Record<string, unknown>>;
  previewPresentation?: (input: {
    presentationPresetId: string;
    brandAccentHex?: string;
  }) => Promise<Record<string, unknown>>;
  applyPresentationPreset?: (input: {
    presentationPresetId: string;
    brandAccentHex?: string;
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  patchLivPersona?: (input: {
    aiTone?: string;
    aiGreeting?: string;
    aiKnowledge?: string;
    aiEnabled?: boolean;
    aiCanBookDirectly?: boolean;
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  patchBrandAssets?: (input: {
    logoUrl?: string;
    coverImageUrl?: string;
    brandAccentHex?: string | null;
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  explainOperationalPolicy?: () => Promise<Record<string, unknown>>;
  proposePolicyPatch?: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
  patchBusinessHours?: (input: {
    rules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
    staffId?: string;
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  confirmPublicLink?: (input: { confirm: boolean }) => Promise<Record<string, unknown>>;
  patchOperationalPolicy?: (input: {
    partial: Record<string, unknown>;
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  inviteStaff?: (input: {
    email: string;
    role: "ADMIN" | "STAFF";
    deskRole?: "manager" | "reception";
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  assignService?: (input: {
    staffId: string;
    serviceIds: string[];
    confirm: boolean;
  }) => Promise<Record<string, unknown>>;
  startChannelConnect?: (input: { channel?: string }) => Promise<Record<string, unknown>>;
};

export type LivToolResult = {
  result: Record<string, unknown>;
  bookingId?: string;
};

function bookingToolError(message: string): LivToolResult {
  if (message === "SLOT_CONFLICT") {
    return {
      result: {
        ok: false,
        error: "SLOT_CONFLICT",
        message: "That slot was just taken. Try another.",
      },
    };
  }
  if (message.startsWith("INVALID_TRANSITION")) {
    return { result: { ok: false, error: "INVALID_TRANSITION", message } };
  }
  if (message === "BOOKING_NOT_FOUND") {
    return { result: { ok: false, error: "NOT_FOUND", message: "Booking not found." } };
  }
  if (message === "DEPOSIT_REQUIRED") {
    return {
      result: {
        ok: false,
        error: "DEPOSIT_REQUIRED",
        message: "Deposit must be paid before this booking can be confirmed.",
      },
    };
  }
  return { result: { ok: false, error: "UNKNOWN", message } };
}

export async function executeLivTool(args: {
  toolName: string;
  toolInput: Record<string, unknown>;
  deps: LivToolDeps;
  conversationId: string;
  channelType: "WEB" | "SMS" | "WHATSAPP" | "INSTAGRAM" | "MESSENGER" | "VOICE";
}): Promise<LivToolResult> {
  const { toolName, toolInput, deps, conversationId, channelType } = args;

  if (toolName === LIV_TOOL_FIND_SLOTS) {
    const slots = await deps.findSlots({
      serviceId: String(toolInput.serviceId),
      date: String(toolInput.date),
      staffId: toolInput.staffId ? String(toolInput.staffId) : undefined,
    });
    return {
      result: {
        date: toolInput.date,
        slots: slots.slice(0, 20),
      },
    };
  }

  if (toolName === LIV_TOOL_SEARCH_RETAIL_PRODUCTS) {
    if (!deps.searchRetailProducts) {
      return { result: { ok: false, error: "RETAIL_NOT_AVAILABLE", products: [] } };
    }
    const products = await deps.searchRetailProducts({
      query: toolInput.query ? String(toolInput.query) : undefined,
      category: toolInput.category ? String(toolInput.category) : undefined,
      limit: toolInput.limit != null ? Number(toolInput.limit) : undefined,
    });
    return { result: products };
  }

  if (toolName === LIV_TOOL_CREATE_BOOKING) {
    try {
      const created = await deps.createBooking({
        serviceId: String(toolInput.serviceId),
        startAt: String(toolInput.startAt),
        staffId: toolInput.staffId ? String(toolInput.staffId) : undefined,
        customerFirstName: String(toolInput.customerFirstName),
        customerLastName: toolInput.customerLastName
          ? String(toolInput.customerLastName)
          : undefined,
        customerEmail: toolInput.customerEmail ? String(toolInput.customerEmail) : undefined,
        customerPhone: toolInput.customerPhone ? String(toolInput.customerPhone) : undefined,
        notes: toolInput.notes ? String(toolInput.notes) : undefined,
        conversationId,
        channelType,
      });
      return {
        bookingId: created.bookingId,
        result: {
          ok: true,
          bookingId: created.bookingId,
          customerId: created.customerId,
          status: created.status,
          pendingReason: created.pendingReason,
          startAt: created.startAt,
          endAt: created.endAt,
          serviceName: created.serviceName,
          staffName: created.staffName,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "SERVICE_NOT_FOUND") {
        return {
          result: {
            ok: false,
            error: "SERVICE_NOT_FOUND",
            message: "Service not found.",
          },
        };
      }
      return bookingToolError(message);
    }
  }

  if (toolName === LIV_TOOL_SEND_MESSAGE) {
    if (!deps.sendMessage) {
      return { result: { ok: false, error: "SEND_NOT_CONFIGURED" } };
    }
    const content = String(toolInput.content ?? "").trim();
    if (!content) {
      return { result: { ok: false, error: "EMPTY_MESSAGE" } };
    }
    const sent = await deps.sendMessage({ content });
    return { result: { ok: true, messageId: sent.messageId } };
  }

  if (toolName === LIV_TOOL_CONFIRM_BOOKING) {
    if (!deps.confirmBooking) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    try {
      const out = await deps.confirmBooking({ bookingId: String(toolInput.bookingId) });
      return { result: { ok: true, ...out }, bookingId: String(toolInput.bookingId) };
    } catch (err: unknown) {
      return bookingToolError(err instanceof Error ? err.message : String(err));
    }
  }

  if (toolName === LIV_TOOL_CANCEL_BOOKING) {
    if (!deps.cancelBooking) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    try {
      const out = await deps.cancelBooking({
        bookingId: String(toolInput.bookingId),
        reason: toolInput.reason ? String(toolInput.reason) : undefined,
      });
      return { result: { ok: true, ...out } };
    } catch (err: unknown) {
      return bookingToolError(err instanceof Error ? err.message : String(err));
    }
  }

  if (toolName === LIV_TOOL_RESCHEDULE_BOOKING) {
    if (!deps.rescheduleBooking) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    try {
      const out = await deps.rescheduleBooking({
        bookingId: String(toolInput.bookingId),
        startAt: String(toolInput.startAt),
      });
      return { result: { ok: true, ...out }, bookingId: String(toolInput.bookingId) };
    } catch (err: unknown) {
      return bookingToolError(err instanceof Error ? err.message : String(err));
    }
  }

  if (toolName === LIV_TOOL_MORNING_BRIEFING) {
    if (!deps.morningBriefing) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.morningBriefing();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_LOOKUP_CUSTOMER) {
    if (!deps.lookupCustomer) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.lookupCustomer({ query: String(toolInput.query ?? "") });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_BOOKING) {
    if (!deps.getBooking) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getBooking({ bookingId: String(toolInput.bookingId) });
    return { result: out };
  }

  if (toolName === LIV_TOOL_LIST_STUCK_CONTINUITY) {
    if (!deps.listStuckContinuity) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const limit = toolInput.limit ? parseInt(String(toolInput.limit), 10) : 10;
    const out = await deps.listStuckContinuity({
      limit: Number.isFinite(limit) ? limit : 10,
    });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_LIST_DRIFT_CANDIDATES) {
    if (!deps.listDriftCandidates) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const minDays = toolInput.minDays ? parseInt(String(toolInput.minDays), 10) : undefined;
    const limit = toolInput.limit ? parseInt(String(toolInput.limit), 10) : undefined;
    const out = await deps.listDriftCandidates({
      minDays: Number.isFinite(minDays) ? minDays : undefined,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_DRAFT_DRIFT_RECOVERY) {
    if (!deps.draftDriftRecovery) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const days = toolInput.daysSinceVisit
      ? parseInt(String(toolInput.daysSinceVisit), 10)
      : undefined;
    const out = await deps.draftDriftRecovery({
      customerId: toolInput.customerId ? String(toolInput.customerId) : undefined,
      customerName: toolInput.customerName ? String(toolInput.customerName) : undefined,
      lastServiceName: toolInput.lastServiceName ? String(toolInput.lastServiceName) : undefined,
      daysSinceVisit: Number.isFinite(days) ? days : undefined,
    });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_SEARCH_TENANTS) {
    if (!deps.searchTenants) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const limit = toolInput.limit ? parseInt(String(toolInput.limit), 10) : undefined;
    const out = await deps.searchTenants({
      q: String(toolInput.q ?? ""),
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_TENANT_SNAPSHOT) {
    if (!deps.tenantSnapshot) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.tenantSnapshot({ businessId: String(toolInput.businessId) });
    return { result: out };
  }

  if (toolName === LIV_TOOL_WELLNESS_EOD_CLOSE) {
    if (!deps.wellnessEodClose) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.wellnessEodClose();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_WELLNESS_DUTY_SOLVER) {
    if (!deps.wellnessDutySolver) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const hour = Number(toolInput.hour);
    const out = await deps.wellnessDutySolver({
      resourceName: String(toolInput.resourceName ?? ""),
      hour: Number.isFinite(hour) ? hour : 12,
    });
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_WELLNESS_REROOM) {
    if (!deps.wellnessReroom) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.wellnessReroom();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_ACTIVATION_STATUS) {
    if (!deps.getActivationStatus) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getActivationStatus();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_BUSINESS_TWIN) {
    if (!deps.getBusinessTwin) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getBusinessTwin();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_COMMERCE_SNAPSHOT) {
    if (!deps.getCommerceSnapshot) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getCommerceSnapshot();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_COMMERCE_SIGNALS) {
    if (!deps.getCommerceSignals) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getCommerceSignals();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_LIST_CAPABILITY_BLOCKERS) {
    if (!deps.listCapabilityBlockers) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.listCapabilityBlockers();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_OWNER_INTELLIGENCE) {
    if (!deps.getOwnerIntelligence) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getOwnerIntelligence();
    return { result: { ok: true, bundle: out } };
  }

  if (toolName === LIV_TOOL_LIST_PRESENTATION_PRESETS) {
    if (!deps.listPresentationPresets) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.listPresentationPresets();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_SETUP_CHECKLIST) {
    if (!deps.getSetupChecklist) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getSetupChecklist();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_GET_TENANT_EXPERIENCE) {
    if (!deps.getTenantExperience) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.getTenantExperience();
    return { result: { ok: true, experience: out } };
  }

  if (toolName === LIV_TOOL_PREVIEW_PRESENTATION) {
    if (!deps.previewPresentation) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.previewPresentation({
      presentationPresetId: String(toolInput.presentationPresetId ?? ""),
      brandAccentHex: toolInput.brandAccentHex ? String(toolInput.brandAccentHex) : undefined,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_APPLY_PRESENTATION_PRESET) {
    if (!deps.applyPresentationPreset) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const out = await deps.applyPresentationPreset({
      presentationPresetId: String(toolInput.presentationPresetId ?? ""),
      brandAccentHex: toolInput.brandAccentHex ? String(toolInput.brandAccentHex) : undefined,
      confirm,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_PATCH_LIV_PERSONA) {
    if (!deps.patchLivPersona) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const parseBool = (v: unknown): boolean | undefined => {
      if (v === undefined || v === null || v === "") return undefined;
      if (v === true) return true;
      if (v === false) return false;
      const s = String(v).toLowerCase();
      if (s === "true") return true;
      if (s === "false") return false;
      return undefined;
    };
    const out = await deps.patchLivPersona({
      confirm,
      aiTone: toolInput.aiTone ? String(toolInput.aiTone) : undefined,
      aiGreeting: toolInput.aiGreeting ? String(toolInput.aiGreeting) : undefined,
      aiKnowledge: toolInput.aiKnowledge ? String(toolInput.aiKnowledge) : undefined,
      aiEnabled: parseBool(toolInput.aiEnabled),
      aiCanBookDirectly: parseBool(toolInput.aiCanBookDirectly),
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_PATCH_BRAND_ASSETS) {
    if (!deps.patchBrandAssets) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const out = await deps.patchBrandAssets({
      confirm,
      logoUrl: toolInput.logoUrl ? String(toolInput.logoUrl) : undefined,
      coverImageUrl: toolInput.coverImageUrl ? String(toolInput.coverImageUrl) : undefined,
      brandAccentHex:
        toolInput.brandAccentHex === null || toolInput.brandAccentHex === ""
          ? null
          : toolInput.brandAccentHex
            ? String(toolInput.brandAccentHex)
            : undefined,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_EXPLAIN_OPERATIONAL_POLICY) {
    if (!deps.explainOperationalPolicy) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.explainOperationalPolicy();
    return { result: { ok: true, ...out } };
  }

  if (toolName === LIV_TOOL_PROPOSE_POLICY_PATCH) {
    if (!deps.proposePolicyPatch) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.proposePolicyPatch(toolInput);
    return { result: out };
  }

  if (toolName === LIV_TOOL_PATCH_BUSINESS_HOURS) {
    if (!deps.patchBusinessHours) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    let rules: Array<{ dayOfWeek: number; startTime: string; endTime: string }> = [];
    try {
      const raw = toolInput.rulesJson ?? toolInput.rules;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) throw new Error("rules must be an array");
      rules = parsed.map((r: Record<string, unknown>) => ({
        dayOfWeek: Number(r.dayOfWeek),
        startTime: String(r.startTime),
        endTime: String(r.endTime),
      }));
    } catch {
      return { result: { ok: false, error: "INVALID_RULES_JSON" } };
    }
    const out = await deps.patchBusinessHours({
      confirm,
      rules,
      staffId: toolInput.staffId ? String(toolInput.staffId) : undefined,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_CONFIRM_PUBLIC_LINK) {
    if (!deps.confirmPublicLink) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const out = await deps.confirmPublicLink({ confirm });
    return { result: out };
  }

  if (toolName === LIV_TOOL_PATCH_OPERATIONAL_POLICY) {
    if (!deps.patchOperationalPolicy) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const { confirm: _c, ...partial } = toolInput;
    const out = await deps.patchOperationalPolicy({ partial, confirm });
    return { result: out };
  }

  if (toolName === LIV_TOOL_INVITE_STAFF) {
    if (!deps.inviteStaff) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    const role = String(toolInput.role ?? "").toUpperCase();
    if (role !== "ADMIN" && role !== "STAFF") {
      return { result: { ok: false, error: "INVALID_ROLE" } };
    }
    const desk = String(toolInput.deskRole ?? "").toLowerCase();
    const out = await deps.inviteStaff({
      confirm,
      email: String(toolInput.email ?? "").trim(),
      role: role as "ADMIN" | "STAFF",
      deskRole:
        desk === "reception" || desk === "manager"
          ? (desk as "manager" | "reception")
          : undefined,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_ASSIGN_SERVICE) {
    if (!deps.assignService) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const confirm =
      toolInput.confirm === true ||
      String(toolInput.confirm ?? "").toLowerCase() === "true";
    let serviceIds: string[] = [];
    try {
      const raw = toolInput.serviceIdsJson ?? toolInput.serviceIds;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) throw new Error("serviceIds must be an array");
      serviceIds = parsed.map((id) => String(id));
    } catch {
      return { result: { ok: false, error: "INVALID_SERVICE_IDS_JSON" } };
    }
    const out = await deps.assignService({
      confirm,
      staffId: String(toolInput.staffId),
      serviceIds,
    });
    return { result: out };
  }

  if (toolName === LIV_TOOL_START_CHANNEL_CONNECT) {
    if (!deps.startChannelConnect) {
      return { result: { ok: false, error: "NOT_CONFIGURED" } };
    }
    const out = await deps.startChannelConnect({
      channel: toolInput.channel ? String(toolInput.channel) : undefined,
    });
    return { result: out };
  }

  return { result: { ok: false, error: "UNKNOWN_TOOL" } };
}
