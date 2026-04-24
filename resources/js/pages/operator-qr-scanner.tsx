import { Head } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    CircleAlert,
    LogIn,
    LogOut,
    MapPinned,
    QrCode,
    RefreshCcw,
    ScanLine,
    type LucideIcon,
    UserCheck,
    UserX,
    Users,
    WifiOff,
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OperatorModuleShell } from '@/components/operator-module-shell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOperatorModule } from '@/hooks/use-operator-module';
import { residentLabel } from '@/lib/resident';
import { cn } from '@/lib/utils';
import { operatorQrScanner as operatorQrScannerRoute } from '@/routes';
import type {
    OperatorHouseholdMember,
    OperatorPageProps,
    OperatorScanRecord,
    OperatorScanType,
} from '@/types/operator';

type AudioWindow = Window & {
    webkitAudioContext?: typeof AudioContext;
};

type ScanFeedback =
    | {
          message: string;
          tone: 'error' | 'info';
      }
    | null;

type HouseholdStatus = 'Complete' | 'Critical' | 'Incomplete';

const duplicateCooldownMs = 5000;

function formatScanDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

function playFeedbackTone(tone: 'error' | 'success'): void {
    const audioWindow = window as AudioWindow;
    const AudioContextConstructor =
        window.AudioContext ?? audioWindow.webkitAudioContext;

    if (!AudioContextConstructor) {
        return;
    }

    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = tone === 'success' ? 'sine' : 'square';
    oscillator.frequency.setValueAtTime(tone === 'success' ? 880 : 220, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);

    window.setTimeout(() => {
        void audioContext.close().catch(() => {});
    }, 260);
}

function defaultTaggingReferences(record: OperatorScanRecord): string[] {
    return (
        record.attendeeRefs ??
        record.householdMembers.map((member) => member.qrReference)
    );
}

function scanFingerprint(
    payload: string,
    type: OperatorScanType,
    evacuationCenter: string,
): string {
    return `${type}:${evacuationCenter.trim().toUpperCase()}:${payload.trim().toUpperCase()}`;
}

function householdCodeFromPayload(
    payload: string,
    qrPayloadPrefix: string,
): string {
    const normalizedPayload = payload.trim().toUpperCase();
    const normalizedPrefix = qrPayloadPrefix.trim().toUpperCase();
    const payloadWithoutPrefix = normalizedPayload.startsWith(normalizedPrefix)
        ? normalizedPayload.slice(normalizedPrefix.length)
        : normalizedPayload;
    const householdMatch = /^(.*?)-(HEAD|M\d{2})$/.exec(payloadWithoutPrefix);

    return householdMatch?.[1] ?? payloadWithoutPrefix;
}

function householdStatus(
    totalMembers: number,
    presentMembers: number,
): HouseholdStatus {
    const missingMembers = Math.max(totalMembers - presentMembers, 0);

    if (missingMembers === 0) {
        return 'Complete';
    }

    if (missingMembers >= Math.ceil(totalMembers / 2)) {
        return 'Critical';
    }

    return 'Incomplete';
}

function statusClassName(status: HouseholdStatus): string {
    if (status === 'Complete') {
        return 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100';
    }

    if (status === 'Critical') {
        return 'border-rose-400/30 bg-rose-500/12 text-rose-100';
    }

    return 'border-amber-400/30 bg-amber-500/12 text-amber-100';
}

function memberSummary(member: OperatorHouseholdMember): string {
    const parts = [
        member.age === null ? 'Age unavailable' : `${member.age} yrs old`,
        member.gender === null
            ? 'Gender unavailable'
            : residentLabel(member.gender),
        member.role,
    ];

    return parts.join(' • ');
}

function feedbackClassName(feedback: NonNullable<ScanFeedback>): string {
    return feedback.tone === 'error'
        ? 'border-rose-400/25 bg-rose-500/10 text-rose-100'
        : 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100';
}

function feedbackIcon(feedback: NonNullable<ScanFeedback>): LucideIcon {
    return feedback.tone === 'error' ? CircleAlert : CheckCircle2;
}

function MetricTile({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                    {label}
                </p>
                <Icon className="size-4 text-slate-300" />
            </div>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
        </div>
    );
}

export default function OperatorQrScanner({
    operatorModule,
}: OperatorPageProps) {
    const {
        isOnline,
        pendingCount,
        recordScan,
        records,
        saveScanAttendance,
        summary,
    } = useOperatorModule(operatorModule);
    const defaultCenter =
        operatorModule.meta.defaultEvacuationCenter ??
        operatorModule.scanCenters[0] ??
        '';
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const processScanPayloadRef =
        useRef<((payload: string, source: 'camera' | 'manual') => Promise<void>) | null>(
            null,
        );
    const inFlightScanKeysRef = useRef<Set<string>>(new Set());
    const recentScanKeysRef = useRef<Map<string, number>>(new Map());
    const lastDetectedRef = useRef<{ time: number; value: string } | null>(
        null,
    );
    const [cameraState, setCameraState] = useState<
        'error' | 'idle' | 'ready' | 'starting'
    >('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<ScanFeedback>(null);
    const [flashTone, setFlashTone] = useState<'error' | 'success' | null>(
        null,
    );
    const [isProcessingScan, setIsProcessingScan] = useState(false);
    const [isSavingTagging, setIsSavingTagging] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanMode, setScanMode] = useState<OperatorScanType>('IN');
    const [selectedCenter, setSelectedCenter] = useState(defaultCenter);
    const [taggingError, setTaggingError] = useState<string | null>(null);
    const [taggingMessage, setTaggingMessage] = useState<string | null>(null);
    const [taggingRecordId, setTaggingRecordId] = useState<string | null>(null);
    const [taggingRefs, setTaggingRefs] = useState<string[]>([]);
    const [recordSnapshot, setRecordSnapshot] = useState<OperatorScanRecord | null>(
        null,
    );
    const activeCenter =
        selectedCenter.trim() === '' ? defaultCenter : selectedCenter;
    const requiresSecureContext =
        typeof window !== 'undefined' ? !window.isSecureContext : false;
    const activeTaggingRecord =
        (taggingRecordId === null
            ? null
            : records.find((record) => record.id === taggingRecordId)) ??
        (recordSnapshot?.id === taggingRecordId ? recordSnapshot : null);
    const activeTaggingRefSet = useMemo(
        () => new Set(taggingRefs.map((reference) => reference.toUpperCase())),
        [taggingRefs],
    );
    const verification = useMemo(() => {
        if (activeTaggingRecord === null) {
            return null;
        }

        const totalMembers = activeTaggingRecord.householdMembers.length;
        const presentMembers = taggingRefs.length;
        const missingMembers = Math.max(totalMembers - presentMembers, 0);

        return {
            missingMembers,
            presentMembers,
            status: householdStatus(totalMembers, presentMembers),
            totalMembers,
        };
    }, [activeTaggingRecord, taggingRefs]);

    const pruneRecentScanKeys = useCallback((now: number): void => {
        recentScanKeysRef.current.forEach((processedAt, key) => {
            if (now - processedAt >= duplicateCooldownMs) {
                recentScanKeysRef.current.delete(key);
            }
        });
    }, []);

    const findExistingRecord = useCallback(
        (payload: string): OperatorScanRecord | null => {
            const householdCode = householdCodeFromPayload(
                payload,
                operatorModule.meta.qrPayloadPrefix,
            );

            return (
                records.find(
                    (record) =>
                        record.householdCode.toUpperCase() === householdCode,
                ) ?? null
            );
        },
        [operatorModule.meta.qrPayloadPrefix, records],
    );

    const processScanPayload = useCallback(
        async (payload: string, source: 'camera' | 'manual'): Promise<void> => {
            const trimmedPayload = payload.trim();

            if (trimmedPayload === '') {
                return;
            }

            const currentFingerprint = scanFingerprint(
                trimmedPayload,
                scanMode,
                activeCenter,
            );
            const now = Date.now();

            pruneRecentScanKeys(now);

            if (inFlightScanKeysRef.current.has(currentFingerprint)) {
                return;
            }

            const lastProcessedAt =
                recentScanKeysRef.current.get(currentFingerprint) ?? null;

            if (
                lastProcessedAt !== null &&
                now - lastProcessedAt < duplicateCooldownMs
            ) {
                if (source === 'manual') {
                    setFeedback({
                        message:
                            'Bag-o pa ni na-scan. Tan-awa lang ang active household card sa tuo.',
                        tone: 'info',
                    });
                }

                return;
            }

            inFlightScanKeysRef.current.add(currentFingerprint);
            setIsProcessingScan(true);
            setTaggingError(null);
            setTaggingMessage(null);

            try {
                const result = await recordScan(
                    trimmedPayload,
                    scanMode,
                    activeCenter,
                );

                recentScanKeysRef.current.set(currentFingerprint, Date.now());

                if (!result.ok) {
                    if (result.code === 'duplicate') {
                        const existingRecord = findExistingRecord(trimmedPayload);

                        if (existingRecord !== null) {
                            setRecordSnapshot(existingRecord);
                            setTaggingRecordId(existingRecord.id);
                            setTaggingRefs(
                                defaultTaggingReferences(existingRecord),
                            );
                            setFeedback({
                                message:
                                    'Duplicate QR gi-ignore. Existing household record lang ang gi-open.',
                                tone: 'info',
                            });

                            return;
                        }
                    }

                    setFeedback({
                        message: result.message,
                        tone: 'error',
                    });
                    setFlashTone('error');
                    playFeedbackTone('error');

                    return;
                }

                setFeedback(
                    result.message
                        ? {
                              message: result.message,
                              tone: 'info',
                          }
                        : null,
                );
                setFlashTone('success');
                setManualCode('');
                setRecordSnapshot(result.record);
                setTaggingRecordId(result.record.id);
                setTaggingRefs(defaultTaggingReferences(result.record));
                playFeedbackTone('success');
            } finally {
                inFlightScanKeysRef.current.delete(currentFingerprint);
                setIsProcessingScan(false);
            }
        },
        [
            activeCenter,
            findExistingRecord,
            pruneRecentScanKeys,
            recordScan,
            scanMode,
        ],
    );

    useEffect(() => {
        processScanPayloadRef.current = processScanPayload;
    }, [processScanPayload]);

    useEffect(() => {
        if (feedback?.tone !== 'info') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFeedback((currentFeedback) =>
                currentFeedback?.tone === 'info' ? null : currentFeedback,
            );
        }, 3200);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [feedback]);

    useEffect(() => {
        if (flashTone === null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFlashTone(null);
        }, 240);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [flashTone]);

    useEffect(() => {
        return () => {
            qrScannerRef.current?.destroy();
            qrScannerRef.current = null;
        };
    }, []);

    const ensureScanner = useCallback((): QrScanner => {
        const video = videoRef.current;

        if (video === null) {
            throw new Error('Scanner video element is not ready yet.');
        }

        if (qrScannerRef.current !== null) {
            return qrScannerRef.current;
        }

        qrScannerRef.current = new QrScanner(
            video,
            (result) => {
                const payload = result.data.trim();

                if (payload === '') {
                    return;
                }

                const detectedAt = Date.now();
                const lastDetected = lastDetectedRef.current;

                if (
                    lastDetected !== null &&
                    lastDetected.value === payload &&
                    detectedAt - lastDetected.time < 1800
                ) {
                    return;
                }

                lastDetectedRef.current = {
                    time: detectedAt,
                    value: payload,
                };

                void processScanPayloadRef.current?.(payload, 'camera');
            },
            {
                maxScansPerSecond: 8,
                onDecodeError: (error) => {
                    if (
                        error === QrScanner.NO_QR_CODE_FOUND ||
                        (error instanceof Error &&
                            error.message === QrScanner.NO_QR_CODE_FOUND)
                    ) {
                        return;
                    }

                    setCameraError(
                        'The camera is running, but QR detection is unavailable right now.',
                    );
                },
                preferredCamera: 'environment',
                returnDetailedScanResult: true,
            },
        );

        return qrScannerRef.current;
    }, []);

    function stopCamera(): void {
        qrScannerRef.current?.stop();
        lastDetectedRef.current = null;
        setCameraError(null);
        setCameraState('idle');
    }

    async function startCamera(): Promise<void> {
        if (requiresSecureContext) {
            setCameraError(
                'Camera access requires HTTPS or localhost in this browser.',
            );
            setCameraState('error');

            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('This browser does not support camera access.');
            setCameraState('error');

            return;
        }

        setCameraError(null);
        setCameraState('starting');
        lastDetectedRef.current = null;

        try {
            const hasCamera = await QrScanner.hasCamera();

            if (!hasCamera) {
                setCameraError('No camera was detected on this device.');
                setCameraState('error');

                return;
            }

            stopCamera();
            const scanner = ensureScanner();
            await scanner.start();
            setCameraState('ready');
        } catch (error) {
            setCameraError(
                error instanceof Error && error.message.trim() !== ''
                    ? error.message
                    : 'Unable to start the rear camera. Allow permission and try again.',
            );
            setCameraState('error');
        }
    }

    const toggleTaggingReference = useCallback((reference: string) => {
        setTaggingRefs((currentRefs) =>
            currentRefs.includes(reference)
                ? currentRefs.filter(
                      (currentReference) => currentReference !== reference,
                  )
                : [...currentRefs, reference],
        );
    }, []);

    const handleSaveTagging = useCallback(async (): Promise<void> => {
        if (activeTaggingRecord === null) {
            return;
        }

        setIsSavingTagging(true);
        setTaggingError(null);
        setTaggingMessage(null);

        const result = await saveScanAttendance(
            activeTaggingRecord.id,
            taggingRefs,
        );

        setIsSavingTagging(false);

        if (!result.ok) {
            setTaggingError(result.message);

            return;
        }

        setTaggingMessage(result.message);
        setRecordSnapshot(result.record);
        setTaggingRefs(defaultTaggingReferences(result.record));
    }, [activeTaggingRecord, saveScanAttendance, taggingRefs]);

    const handleCancelTagging = useCallback(() => {
        if (activeTaggingRecord === null) {
            return;
        }

        setTaggingError(null);
        setTaggingMessage(null);
        setTaggingRefs(defaultTaggingReferences(activeTaggingRecord));
    }, [activeTaggingRecord]);

    return (
        <>
            <Head title="QR Scanner" />

            <OperatorModuleShell
                operatorModule={operatorModule}
                title="Minimal household QR scanner"
                description="Scan one household QR, confirm the members who are present, and ignore duplicate reads automatically."
                actions={
                    <>
                        <Button
                            type="button"
                            className="rounded-2xl"
                            onClick={() => {
                                void startCamera();
                            }}
                            disabled={
                                cameraState === 'starting' || isProcessingScan
                            }
                        >
                            <Camera className="size-4" />
                            {cameraState === 'ready'
                                ? 'Restart Camera'
                                : cameraState === 'starting'
                                  ? 'Starting...'
                                  : 'Open Camera'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={stopCamera}
                            disabled={cameraState === 'idle'}
                        >
                            <RefreshCcw className="size-4" />
                            Stop
                        </Button>
                    </>
                }
            >
                <section className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200">
                        Scanned Today: {summary.scannedToday.toLocaleString()}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200">
                        Pending Sync: {pendingCount.toLocaleString()}
                    </span>
                    <span
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs font-semibold',
                            isOnline
                                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                                : 'border-amber-400/25 bg-amber-500/10 text-amber-200',
                        )}
                    >
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200">
                        Mode: {scanMode === 'IN' ? 'Time-In' : 'Time-Out'}
                    </span>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="rounded-[30px] border border-slate-800 bg-[linear-gradient(145deg,#020617_0%,#0f172a_100%)] p-5 shadow-[0_26px_80px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                                        Scanner
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold text-white">
                                        Household QR verification
                                    </h2>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={
                                            scanMode === 'IN'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'rounded-2xl',
                                            scanMode === 'IN'
                                                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                                : 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white',
                                        )}
                                        onClick={() => setScanMode('IN')}
                                    >
                                        <LogIn className="size-4" />
                                        Time-In
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            scanMode === 'OUT'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'rounded-2xl',
                                            scanMode === 'OUT'
                                                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                                                : 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white',
                                        )}
                                        onClick={() => setScanMode('OUT')}
                                    >
                                        <LogOut className="size-4" />
                                        Time-Out
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                        Tagged Evacuation Center
                                    </p>
                                    <div className="mt-3">
                                        <Select
                                            value={activeCenter}
                                            onValueChange={setSelectedCenter}
                                        >
                                            <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-slate-950 text-slate-100 shadow-none">
                                                <SelectValue placeholder="Select evacuation center" />
                                            </SelectTrigger>
                                            <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
                                                {operatorModule.scanCenters.map(
                                                    (center) => (
                                                        <SelectItem
                                                            key={center}
                                                            value={center}
                                                        >
                                                            {center}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        {isOnline ? (
                                            <CheckCircle2 className="size-4 text-emerald-300" />
                                        ) : (
                                            <WifiOff className="size-4 text-amber-300" />
                                        )}
                                        <p className="font-semibold">
                                            {isOnline
                                                ? 'Live Sync Ready'
                                                : 'Saved Offline'}
                                        </p>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Duplicate QR reads are ignored for a few
                                        seconds so the scanner stays clean.
                                    </p>
                                </div>
                            </div>

                            {feedback ? (
                                <div
                                    className={cn(
                                        'rounded-2xl border px-4 py-3 text-sm leading-6',
                                        feedbackClassName(feedback),
                                    )}
                                >
                                    <div className="flex items-start gap-2">
                                        {(() => {
                                            const Icon = feedbackIcon(feedback);

                                            return <Icon className="mt-0.5 size-4" />;
                                        })()}
                                        <p>{feedback.message}</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="h-[420px] w-full object-cover"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.02)_30%,rgba(2,6,23,0.45)_100%)]" />
                                <div
                                    className={cn(
                                        'pointer-events-none absolute inset-0 transition-opacity duration-200',
                                        flashTone === 'success'
                                            ? 'bg-emerald-400/18 opacity-100'
                                            : flashTone === 'error'
                                              ? 'bg-rose-400/18 opacity-100'
                                              : 'opacity-0',
                                    )}
                                />

                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
                                    <div className="relative h-[240px] w-full max-w-sm rounded-[28px] border-2 border-emerald-300/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.48)]">
                                        <div className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-300/85 shadow-[0_0_20px_rgba(110,231,183,0.75)]" />
                                    </div>
                                </div>

                                {cameraState !== 'ready' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                        <div className="rounded-full border border-white/10 bg-white/6 p-6 text-white backdrop-blur-md">
                                            <QrCode className="size-12" />
                                        </div>
                                        <p className="mt-5 text-lg font-semibold text-white">
                                            Camera standby
                                        </p>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                                            Open the camera and place the
                                            household QR inside the frame.
                                        </p>
                                    </div>
                                ) : null}

                                {(isProcessingScan ||
                                    cameraState === 'starting') && (
                                    <div className="absolute inset-x-4 top-4 rounded-full border border-cyan-400/20 bg-slate-950/80 px-4 py-2 text-center text-xs font-semibold tracking-[0.16em] text-cyan-100 uppercase backdrop-blur-md">
                                        {isProcessingScan
                                            ? 'Processing scan'
                                            : 'Starting camera'}
                                    </div>
                                )}
                            </div>

                            {cameraError ? (
                                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100">
                                    {cameraError}
                                </div>
                            ) : null}

                            {requiresSecureContext ? (
                                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
                                    Browser camera access is blocked outside a
                                    secure context. Switch to `https://` or
                                    `localhost`.
                                </div>
                            ) : null}

                            <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                                <p className="font-semibold text-white">
                                    Manual QR fallback
                                </p>
                                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <Input
                                        value={manualCode}
                                        onChange={(event) =>
                                            setManualCode(
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="EVAQREADY-HOUSEHOLD:EVQ-..."
                                        className="h-12 rounded-2xl border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                    />
                                    <Button
                                        type="button"
                                        className="h-12 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                                        onClick={() => {
                                            void processScanPayload(
                                                manualCode,
                                                'manual',
                                            );
                                        }}
                                        disabled={
                                            manualCode.trim() === '' ||
                                            activeCenter.trim() === '' ||
                                            isProcessingScan
                                        }
                                    >
                                        <ScanLine className="size-4" />
                                        Scan QR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-[30px] border border-slate-800 bg-[linear-gradient(145deg,#020617_0%,#111827_100%)] p-5 shadow-[0_26px_80px_rgba(2,6,23,0.35)]">
                        {activeTaggingRecord === null || verification === null ? (
                            <div className="flex min-h-[760px] flex-col items-center justify-center px-6 text-center">
                                <div className="rounded-full border border-white/10 bg-white/5 p-6 text-white">
                                    <ScanLine className="size-12" />
                                </div>
                                <h2 className="mt-5 text-xl font-semibold text-white">
                                    No active household yet
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    After scanning, the household details and
                                    member checklist will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-xl font-semibold text-white">
                                                {activeTaggingRecord.name}
                                            </p>
                                            <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-200 uppercase">
                                                {
                                                    activeTaggingRecord.householdCode
                                                }
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-400">
                                            {formatScanDateTime(
                                                activeTaggingRecord.scannedAt,
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase',
                                            statusClassName(
                                                verification.status,
                                            ),
                                        )}
                                    >
                                        {verification.status}
                                    </span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            Barangay
                                        </p>
                                        <p className="mt-2 font-medium text-white">
                                            {activeTaggingRecord.barangay}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            Center
                                        </p>
                                        <p className="mt-2 font-medium text-white">
                                            {activeTaggingRecord.center}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 sm:col-span-2">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            Address
                                        </p>
                                        <p className="mt-2 font-medium text-white">
                                            {activeTaggingRecord.address ??
                                                'Address not available'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-4">
                                    <MetricTile
                                        icon={Users}
                                        label="Total"
                                        value={String(
                                            verification.totalMembers,
                                        )}
                                    />
                                    <MetricTile
                                        icon={UserCheck}
                                        label="Present"
                                        value={String(
                                            verification.presentMembers,
                                        )}
                                    />
                                    <MetricTile
                                        icon={UserX}
                                        label="Missing"
                                        value={String(
                                            verification.missingMembers,
                                        )}
                                    />
                                    <MetricTile
                                        icon={MapPinned}
                                        label="Mode"
                                        value={
                                            activeTaggingRecord.type === 'IN'
                                                ? 'Arrival'
                                                : 'Time-Out'
                                        }
                                    />
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-white">
                                                Household members
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                Check only the members who are
                                                physically present.
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-200 uppercase">
                                            {verification.presentMembers}/
                                            {verification.totalMembers}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {activeTaggingRecord.householdMembers.map(
                                            (member) => {
                                                const isSelected =
                                                    activeTaggingRefSet.has(
                                                        member.qrReference.toUpperCase(),
                                                    );

                                                return (
                                                    <label
                                                        key={
                                                            member.qrReference
                                                        }
                                                        className={cn(
                                                            'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
                                                            isSelected
                                                                ? 'border-emerald-400/20 bg-emerald-500/10'
                                                                : 'border-white/10 bg-slate-950/55',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() =>
                                                                toggleTaggingReference(
                                                                    member.qrReference,
                                                                )
                                                            }
                                                            className="mt-1 border-white/20 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-400 data-[state=checked]:text-slate-950"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <p className="font-semibold text-white">
                                                                    {member.name}
                                                                </p>
                                                                <span
                                                                    className={cn(
                                                                        'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase',
                                                                        isSelected
                                                                            ? 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100'
                                                                            : 'border-rose-400/20 bg-rose-500/12 text-rose-100',
                                                                    )}
                                                                >
                                                                    {isSelected
                                                                        ? 'Present'
                                                                        : 'Missing'}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                                {memberSummary(
                                                                    member,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            },
                                        )}
                                    </div>

                                    {taggingError ? (
                                        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
                                            {taggingError}
                                        </p>
                                    ) : null}

                                    {taggingMessage ? (
                                        <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                                            {taggingMessage}
                                        </p>
                                    ) : null}

                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
                                            onClick={handleCancelTagging}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
                                            onClick={() =>
                                                setTaggingRefs(
                                                    activeTaggingRecord.householdMembers.map(
                                                        (member) =>
                                                            member.qrReference,
                                                    ),
                                                )
                                            }
                                        >
                                            All Present
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
                                            onClick={() => setTaggingRefs([])}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            type="button"
                                            className="rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                            onClick={() => {
                                                void handleSaveTagging();
                                            }}
                                            disabled={isSavingTagging}
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {isSavingTagging
                                                ? 'Saving...'
                                                : activeTaggingRecord.type ===
                                                    'IN'
                                                  ? 'Confirm Arrival'
                                                  : 'Confirm Time-Out'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </section>
            </OperatorModuleShell>
        </>
    );
}

OperatorQrScanner.layout = {
    breadcrumbs: [
        {
            title: 'QR Scanner',
            href: operatorQrScannerRoute(),
        },
    ],
};
