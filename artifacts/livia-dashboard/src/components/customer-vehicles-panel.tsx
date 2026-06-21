import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vehicle = {
  id: string;
  make: string | null;
  model: string;
  registration: string | null;
  colour: string | null;
};

export function CustomerVehiclesPanel({
  businessId,
  customerId,
  vertical,
}: {
  businessId: string;
  customerId: string;
  vertical?: string | null;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [registration, setRegistration] = useState("");

  const show = vertical === "automotive-detailing";

  useEffect(() => {
    if (!show || !businessId || !customerId) return;
    apiFetch<{ vehicles: Vehicle[] }>(`/businesses/${businessId}/customers/${customerId}/vehicles`)
      .then((r) => setVehicles(r.vehicles ?? []))
      .catch(() => setVehicles([]));
  }, [show, businessId, customerId]);

  if (!show) return null;

  async function addVehicle() {
    if (!model.trim()) return;
    const row = await apiFetch<Vehicle>(`/businesses/${businessId}/customers/${customerId}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: make.trim() || undefined,
        model: model.trim(),
        registration: registration.trim() || undefined,
      }),
    });
    setVehicles((v) => [...v, row]);
    setMake("");
    setModel("");
    setRegistration("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vehicles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vehicles on file yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {vehicles.map((v) => (
              <li key={v.id}>
                <strong>{[v.make, v.model].filter(Boolean).join(" ")}</strong>
                {v.registration ? ` · ${v.registration}` : ""}
                {v.colour ? ` (${v.colour})` : ""}
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label>Make</Label>
            <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="BMW" />
          </div>
          <div className="space-y-1">
            <Label>Model</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="3 Series" />
          </div>
          <div className="space-y-1">
            <Label>Reg</Label>
            <Input value={registration} onChange={(e) => setRegistration(e.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={() => void addVehicle()}>
          Add vehicle
        </Button>
      </CardContent>
    </Card>
  );
}
