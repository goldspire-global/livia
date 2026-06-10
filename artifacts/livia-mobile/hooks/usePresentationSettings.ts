import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export type PresentationPresetOption = {
  id: string;
  label: string;
  description: string;
  cssPreset: string;
};

export type PresentationSettingsPayload = {
  businessId: string;
  vertical: string;
  presetId: string;
  preset: PresentationPresetOption;
  brandAccentHex: string | null;
  presetsEnabled: boolean;
  availablePresets: PresentationPresetOption[];
};

export function presentationSettingsQueryKey(businessId: string) {
  return ["presentation-settings", businessId] as const;
}

export function usePresentationSettings(businessId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: presentationSettingsQueryKey(businessId ?? ""),
    enabled: !!businessId,
    queryFn: () =>
      customFetch<PresentationSettingsPayload>(`/api/businesses/${businessId}/presentation`),
    staleTime: 60_000,
  });

  const patch = useMutation({
    mutationFn: (body: {
      presentationPresetId?: string;
      brandAccentHex?: string | null;
    }) =>
      customFetch<PresentationSettingsPayload>(`/api/businesses/${businessId}/presentation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      if (!businessId) return;
      qc.setQueryData(presentationSettingsQueryKey(businessId), data);
      await qc.invalidateQueries({ queryKey: ["tenant-experience", businessId] });
    },
  });

  return { ...query, patch };
}
