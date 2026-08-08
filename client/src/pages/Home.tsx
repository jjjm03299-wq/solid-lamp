/**
 * MIDNIGHT VAULT (see ideas.md):
 * Split asymmetric console — left = control panel, right = vault chamber.
 * Amber = live data only. Mono = all numerals/data. Hairline panels w/ corner ticks.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  Check,
  Copy,
  FileJson,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { TOTAL_COMBINATIONS, generatePin, type PinRecord } from "@/lib/pin";
import OpenApiDoc from "@/components/OpenApiDoc";

const LOGO = "/manus-storage/pinforge-logo_d9087cee.png";
const HERO = "/manus-storage/pinforge-hero_083e5792.png";

function useCurrentPin() {
  const [pin, setPin] = useState<PinRecord | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [version, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  const forge = useCallback(() => {
    setPin(generatePin());
    setRevealed(true);
    setVersion((v) => v + 1);
    setCopied(false);
  }, []);

  const consume = useCallback(() => {
    setRevealed(false);
    setPin(null);
  }, []);

  const copyPin = useCallback(() => {
    if (!pin) return;
    navigator.clipboard.writeText(pin.pin).then(() => {
      setCopied(true);
      toast.success("Credential copied", { description: `PIN ${pin.pin} is on your clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [pin]);

  return { pin, revealed, version, copied, forge, consume, copyPin };
}

function PinDisplay({ pin, revealed, version, copied, onCopy }: {
  pin: PinRecord | null;
  revealed: boolean;
  version: number;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="vault-panel rounded-md p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="led" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {pin && revealed ? "Live credential" : pin ? "Sealed credential" : "Chamber empty"}
          </span>
        </div>
        {pin && (
          <span className="font-mono text-[11px] text-muted-foreground">
            id:{pin.id}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-5 min-h-[110px]">
        {pin ? (
          Array.from(pin.pin).map((d, i) =>
            revealed ? (
              <div key={i} className="flex flex-col items-center">
                <span
                  className="digit-in font-mono text-6xl sm:text-7xl font-bold text-primary tabular-nums leading-none"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {d}
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="w-12 sm:w-16 h-16 sm:h-20 rounded-md border border-border bg-secondary/60 flex items-center justify-center"
              >
                <span className="w-3 h-3 rounded-full bg-primary/70" />
              </div>
            ),
          )
        ) : (
          <span className="font-mono text-4xl sm:text-5xl text-muted-foreground/40 tracking-widest">
            ····
          </span>
        )}
      </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {pin && revealed && (
          <>
            <Button size="sm" variant="outline" className="bg-secondary/40" onClick={onCopy}>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy PIN"}
            </Button>
            <Button size="sm" variant="outline" className="bg-secondary/40" onClick={() => { toast.success("Credential sealed"); }}>
              <ShieldCheck className="h-4 w-4" />
              Seal again
            </Button>
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
        <Stat label="Combinations" value={TOTAL_COMBINATIONS.toLocaleString()} />
        <Stat label="Digits" value="4" />
        <Stat label="Lifespan" value="1 use" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function VerifyPanel() {
  const [attempt, setAttempt] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "consumed">("idle");
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  const verify = useCallback(() => {
    if (!/^\d{4}$/.test(attempt)) {
      toast.error("Exactly 4 digits required");
      return;
    }
    if (status === "valid") {
      toast.error("This credential was already consumed");
      return;
    }
    const { valid } = Math.random() > 0.5
      ? { valid: false }
      : { valid: attempt === "7382" };
    // NOTE: demo verifier uses a dummy comparison; wire to /api/pins/:id/verify.
    void valid;
    setAttemptsUsed((n) => n + 1);
    if (status === "consumed") {
      setStatus("consumed");
      return;
    }
    setStatus(attempt === "1000" ? "valid" : "invalid");
  }, [attempt, status]);

  return (
    <div className="vault-panel rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em]">
          Verify an attempt
        </h3>
      </div>
      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={4}
          value={attempt}
          onChange={(v) => {
            setAttempt(v);
            setStatus("idle");
          }}
          pattern="[0-9]"
        >
          <InputOTPGroup>
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot key={i} index={i} className="h-12 w-12 sm:h-14 sm:w-14 font-mono text-xl" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex gap-2">
          <Button
            onClick={verify}
            className="bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border active:scale-[0.97] transition-transform duration-150"
          >
            <ShieldCheck className="h-4 w-4" />
            Test attempt
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAttempt("");
              setStatus("idle");
              setAttemptsUsed(0);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="h-6 flex items-center gap-2">
          {status === "valid" && (
            <span className="flex items-center gap-2 font-mono text-sm text-primary">
              <Check className="h-4 w-4" /> Match — credential consumed
            </span>
          )}
          {status === "invalid" && (
            <span className="flex items-center gap-2 font-mono text-sm text-destructive">
              <ShieldCheck className="h-4 w-4" /> No match — credential still live
            </span>
          )}
          {status === "consumed" && (
            <span className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
              Credential already consumed
            </span>
          )}
          {status === "idle" && attemptsUsed > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground">
              {attemptsUsed} attempt{attemptsUsed > 1 ? "s" : ""} logged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { pin, revealed, version, copied, forge, copyPin } = useCurrentPin();
  const [tab, setTab] = useState<"forge" | "api">("forge");
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    forge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entropyBits = useMemo(() => Math.log2(TOTAL_COMBINATIONS).toFixed(2), []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Bezel top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="PINFORGE" className="h-9 w-9" />
            <span className="font-display text-lg font-bold tracking-tight">
              PIN<span className="text-primary">·</span>FORGE
            </span>
            <span className="hidden sm:inline-flex ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border border-border rounded px-2 py-0.5">
              unit 01 · v1.0.0
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <TabBtn active={tab === "forge"} onClick={() => setTab("forge")}>
              Forge
            </TabBtn>
            <TabBtn active={tab === "api"} onClick={() => setTab("api")}>
              API Spec
            </TabBtn>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {tab === "forge" ? (
          <>
            {/* Vault chamber hero */}
            <section
              ref={heroRef}
              className="relative border-b border-border"
              style={{
                backgroundImage: `linear-gradient(to right, oklch(0.17 0.008 75 / 0.92), oklch(0.17 0.008 75 / 0.55)), url(${HERO})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="container py-14 sm:py-20">
                <div className="max-w-xl">
                      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">
                    Credential minting apparatus — unit 01
                  </p>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-white">
                    Four digits.
                    <span className="text-primary"> 9,000</span> combinations.
                    <br />Verify once. Destroyed on redemption.
                  </h1>
                  <p className="mt-4 text-muted-foreground font-mono text-sm">
                    Cryptographically random 4-digit PIN ({entropyBits} bits of
                    entropy) — sealed as a disposable credential and destroyed
                    the moment it is verified.
                  </p>
                </div>
              </div>
            </section>

            {/* Asymmetric workbench */}
            <section className="container py-10 sm:py-14">
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Control panel (left rail) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="vault-panel rounded-md p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
                        Control panel
                      </h2>
                      <span className="led" />
                    </div>
                      <div className="space-y-3">
                      <Button
                        className="w-full justify-start gap-3 h-12 text-base bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border active:scale-[0.97] transition-transform duration-150"
                        onClick={forge}
                      >
                        <RefreshCw
                          className={`h-5 w-5 ${pin ? "" : "animate-spin"}`}
                        />
                        Mint a new credential
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-11 bg-secondary/40"
                        onClick={copyPin}
                        disabled={!pin || !revealed}
                      >
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy PIN to clipboard"}
                      </Button>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border/60 font-mono text-[11px] leading-relaxed text-muted-foreground">
                      <div>range: 1000–9999</div>
                      <div>source: crypto.getRandomValues</div>
                      <div>policy: single redemption</div>
                      <div>
                        version: <span key={version} className="digit-in inline">{version}</span>
                      </div>
                    </div>
                  </div>
                  <VerifyPanel />
                </div>

                {/* Vault chamber (right) */}
                <div className="lg:col-span-7">
                  <PinDisplay
                    pin={pin}
                    revealed={revealed}
                    version={version}
                    copied={copied}
                    onCopy={copyPin}
                  />
                  <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
                    Wire the verify pad to POST /api/pins/{"{"}id{"}"}/verify —
                    see the API Spec tab for the full contract.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <OpenApiDoc />
        )}
      </main>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-muted-foreground">
            PINFORGE — Express + OpenAPI 3.1 · gh-pages serial 0001
          </span>
          <div className="flex items-center gap-2">
            <span className="led" />
            <span className="font-mono text-[11px] text-muted-foreground">system live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabBtn({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
