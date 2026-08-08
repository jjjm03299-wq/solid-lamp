/**
 * MIDNIGHT VAULT (see ideas.md): the API spec page is a "technical manifest" —
 * mono type for all data, hairline-ruled panels, amber for methods/data only.
 * Renders the OpenAPI 3.1 spec endpoints as an interactive contract.
 */
import { Button } from "@/components/ui/button";
import { Check, Copy, FileJson } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  responses: string[];
  body?: string;
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/pins",
    summary: "Mint a new 4-digit PIN",
    description:
      "Generates a cryptographically random 4-digit PIN (1000–9999) via crypto.getRandomValues and returns it with a short hex credential id. Stored in-memory until verified, then destroyed.",
    responses: ["201 Created", "400 Bad request"],
    body: '{ "length": 4 } (optional)',
  },
  {
    method: "GET",
    path: "/api/pins/{id}",
    summary: "Check a credential's status",
    description:
      "Returns metadata for a credential without revealing the PIN: whether it is live or consumed, its mint timestamp, and attempt count.",
    responses: ["200 OK", "404 Unknown id"],
  },
  {
    method: "POST",
    path: "/api/pins/{id}/verify",
    summary: "Verify an attempt against a PIN",
    description:
      "Tests a 4-digit attempt against the minted PIN. A match destroys the credential (one-time use); failed attempts are counted but leave it live.",
    responses: ["200 OK", "400 Malformed attempt", "404 Unknown id"],
    body: '{ "attempt": "7382" }',
  },
  {
    method: "GET",
    path: "/health",
    summary: "Liveness probe",
    description: "Returns { status: \"ok\" } when the Express server is running.",
    responses: ["200 OK"],
  },
];

const methodColor = (m: string) =>
  m === "POST" ? "text-primary" : "text-foreground";

export default function OpenApiDoc() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyExample = (endpoint: Endpoint) => {
    const url = `https://api.pinforge.example${endpoint.path.replace("{id}", "a3f1c8e20d44")}`;
    const body = endpoint.body ? ` -d '${endpoint.body}'` : "";
    const cmd = `curl -X ${endpoint.method} '${url}'${body} -H 'Content-Type: application/json'`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(endpoint.path);
      toast.success("cURL command copied");
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <section className="container py-10 sm:py-14 max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">
        Technical manifest
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
        API contract — OpenAPI 3.1
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        The full machine-readable specification lives in{" "}
        <code className="font-mono text-primary bg-secondary rounded px-1.5 py-0.5">
          openapi.yaml
        </code>{" "}
        at the repository root, served at{" "}
        <code className="font-mono text-primary bg-secondary rounded px-1.5 py-0.5">
          GET /api/openapi
        </code>
        . Below is the working contract for each endpoint.
      </p>

      <div className="mt-8 space-y-4">
        {endpoints.map((e) => (
          <div key={e.path + e.method} className="vault-panel rounded-md p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`font-mono text-xs font-bold px-2 py-1 rounded border ${methodColor(e.method)} border-border bg-secondary/60`}>
                {e.method}
              </span>
              <code className="font-mono text-sm text-foreground">{e.path}</code>
              <span className="text-sm text-muted-foreground">— {e.summary}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{e.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                {e.responses.map((r) => (
                  <span
                    key={r}
                    className="font-mono text-[11px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5"
                  >
                    {r}
                  </span>
                ))}
              </div>
              {e.body && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  body: {e.body}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto bg-secondary/40"
                onClick={() => copyExample(e)}
              >
                {copied === e.path ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                cURL
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 vault-panel rounded-md p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <FileJson className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em]">
            Data model
          </h3>
        </div>
        <pre className="font-mono text-[12px] leading-relaxed text-muted-foreground overflow-x-auto">
{`PinResponse    { id: string, pin: string, createdAt: ISO }
PinStatus      { id, live: bool, createdAt, destroyedAt?, attemptsUsed }
VerifyRequest  { attempt: "^[0-9]{4}$" }
VerifyResponse { valid: bool, consumed: bool, attemptsUsed }
ErrorResponse  { error: string }`}
        </pre>
      </div>
    </section>
  );
}
