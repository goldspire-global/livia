export type BrokerStatus = {
  id: string;
  label: string;
  mode: string;
  connected: boolean;
  note: string;
};

export type MigrationBrokerCategory =
  | "scheduling"
  | "payments"
  | "accounting"
  | "calendar"
  | "marketing"
  | "fitness";

export type MigrationBrokerAction =
  | { type: "scroll"; elementId: string; label: string }
  | { type: "link"; href: string; label: string }
  | { type: "none"; label: string; hint: string };

export type MigrationBrokerUiMeta = {
  category: MigrationBrokerCategory;
  ownerSummary: string;
  action: MigrationBrokerAction;
};

export const MIGRATION_BROKER_CATEGORY_LABELS: Record<MigrationBrokerCategory, string> = {
  scheduling: "Scheduling & bookings",
  payments: "Payments",
  accounting: "Accounting exports",
  calendar: "Calendar sync",
  marketing: "Guest marketing",
  fitness: "Fitness & classes",
};

/** Owner-facing copy — what each broker is for and what they can do today. */
export const MIGRATION_BROKER_UI: Record<string, MigrationBrokerUiMeta> = {
  booksy: {
    category: "scheduling",
    ownerSummary: "Paste a client CSV export from Booksy.",
    action: { type: "scroll", elementId: "booksy-import", label: "Import CSV" },
  },
  fresha: {
    category: "scheduling",
    ownerSummary: "Import clients and appointments from Fresha.",
    action: {
      type: "none",
      label: "Concierge migration",
      hint: "Self-serve OAuth rolls out in phases — contact support to move your book.",
    },
  },
  square: {
    category: "scheduling",
    ownerSummary: "Read appointments from Square Appointments.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Square import is platform-configured during beta.",
    },
  },
  vagaro: {
    category: "scheduling",
    ownerSummary: "Salon and spa data from Vagaro.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "UK + US import path — concierge-led for now.",
    },
  },
  acuity: {
    category: "scheduling",
    ownerSummary: "Wellness and solo-pro appointment import.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Acuity broker lands with wellness depth.",
    },
  },
  timely: {
    category: "scheduling",
    ownerSummary: "UK, AU, and NZ salon appointment import.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Timely import is on the v2 broker roadmap.",
    },
  },
  treatwell: {
    category: "scheduling",
    ownerSummary: "Tag marketplace bookings on import for margin reports.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Treatwell tagging ships with reports depth.",
    },
  },
  stripe: {
    category: "payments",
    ownerSummary: "Capture deposits and card payments on booking.",
    action: {
      type: "link",
      href: "/settings?tab=billing#commerce-fix",
      label: "Set up payments",
    },
  },
  xero: {
    category: "accounting",
    ownerSummary: "Export settlement CSV for your accountant.",
    action: {
      type: "none",
      label: "CSV export",
      hint: "Weekly settlement CSV is available from wellness reports when enabled.",
    },
  },
  quickbooks: {
    category: "accounting",
    ownerSummary: "QuickBooks settlement export.",
    action: {
      type: "none",
      label: "CSV export",
      hint: "Use settlement CSV until live QBO OAuth ships.",
    },
  },
  google_calendar: {
    category: "calendar",
    ownerSummary: "Two-way calendar sync for staff availability.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Google OAuth connect rolls out platform-wide.",
    },
  },
  mindbody: {
    category: "fitness",
    ownerSummary: "Class roster and client CSV for fitness studios.",
    action: {
      type: "none",
      label: "CSV import",
      hint: "Mindbody CSV parallel-run is concierge-led during beta.",
    },
  },
  mailchimp: {
    category: "marketing",
    ownerSummary: "Package expiring and win-back audience events.",
    action: {
      type: "none",
      label: "Coming soon",
      hint: "Mailchimp / Klaviyo events ship with marketing automations.",
    },
  },
  whatsapp: {
    category: "marketing",
    ownerSummary: "Arrival, intake, and voucher templates.",
    action: { type: "link", href: "/settings?tab=comms", label: "Open channels" },
  },
};

export function migrationBrokerMeta(broker: BrokerStatus): MigrationBrokerUiMeta {
  return (
    MIGRATION_BROKER_UI[broker.id] ?? {
      category: "scheduling",
      ownerSummary: broker.note,
      action: {
        type: "none",
        label: "Coming soon",
        hint: "Contact support if you need this import path.",
      },
    }
  );
}

/** Brokers an owner should see without expanding the full roadmap. */
export function migrationBrokersForOwner(brokers: BrokerStatus[]): BrokerStatus[] {
  return brokers.filter((b) => b.connected || b.id === "booksy");
}

export function migrationBrokerModeLabel(mode: string): string {
  if (mode === "csv_only") return "CSV";
  if (mode === "oauth_stub") return "OAuth";
  return "API";
}
