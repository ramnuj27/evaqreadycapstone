import { Head, Link } from '@inertiajs/react';
import { Camera, LogIn, LogOut, RefreshCcw } from 'lucide-react';
import { OperatorModuleShell } from '@/components/operator-module-shell';
import { Button } from '@/components/ui/button';
import { useOperatorModule } from '@/hooks/use-operator-module';
import {
    operatorDashboard as operatorDashboardRoute,
    operatorQrScanner as operatorQrScannerRoute,
} from '@/routes';
import type { OperatorPageProps } from '@/types/operator';

function OperatorMetricCard({
    description,
    label,
    total,
    toneClassName,
}: {
    description: string;
    label: string;
    total: number;
    toneClassName: string;
}) {
    return (
        <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                </p>
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase ${toneClassName}`}
                >
                    {label}
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {total.toLocaleString()}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export default function OperatorDashboard({
    operatorModule,
}: OperatorPageProps) {
    const { pendingCount, summary } = useOperatorModule(operatorModule);

    return (
        <>
            <Head title="Operator Dashboard" />

            <OperatorModuleShell
                operatorModule={operatorModule}
                title="Minimal dashboard for live field scanning"
                description="Track only the essentials: today's scans, time-in totals, time-out totals, and anything still waiting for sync."
                actions={
                    <Button asChild className="rounded-2xl">
                        <Link href={operatorQrScannerRoute()}>
                            <Camera className="size-4" />
                            Start Scanning
                        </Link>
                    </Button>
                }
            >
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <OperatorMetricCard
                        label="Scanned Today"
                        total={summary.scannedToday}
                        description="All successful scans recorded on this device today."
                        toneClassName="bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    />
                    <OperatorMetricCard
                        label="Time-In"
                        total={summary.timeInCount}
                        description="Evacuees confirmed inside the assigned evacuation center."
                        toneClassName="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    />
                    <OperatorMetricCard
                        label="Time-Out"
                        total={summary.timeOutCount}
                        description="Residents formally checked out from the center workflow."
                        toneClassName="bg-orange-500/10 text-orange-700 dark:text-orange-300"
                    />
                    <OperatorMetricCard
                        label="Pending Sync"
                        total={pendingCount}
                        description="Offline records still waiting for an online sync push."
                        toneClassName="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_380px]">
                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700 dark:text-sky-300">
                                <Camera className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    Ready to scan
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    The operator panel is tuned for field use,
                                    so the fastest next step is opening the QR
                                    scanner and recording arrivals or exits.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Tracked Households
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {operatorModule.summary.trackedHouseholds.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Roster Entries
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {operatorModule.summary.rosterTotal.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Active Centers
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {operatorModule.summary.activeCenters.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            {operatorModule.meta.note}
                        </div>
                    </div>

                    <aside className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Quick Field Guide
                        </h2>
                        <div className="mt-5 space-y-3">
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <LogIn className="size-4" />
                                    <p className="font-semibold">Time-In</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Use this when the evacuee has arrived and is
                                    already inside the assigned center.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <LogOut className="size-4" />
                                    <p className="font-semibold">Time-Out</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Use this once the evacuee has already been
                                    timed in and is now leaving the center
                                    workflow.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <RefreshCcw className="size-4" />
                                    <p className="font-semibold">
                                        Offline Sync
                                    </p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Scans stay on the device when the signal is
                                    weak, then sync once the network is back.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>
            </OperatorModuleShell>
        </>
    );
}

OperatorDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Operator Dashboard',
            href: operatorDashboardRoute(),
        },
    ],
};
