import { Link } from '@inertiajs/react';
import { Camera, LayoutGrid, QrCode, RefreshCcw, ScanLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import {
    operatorDashboard as operatorDashboardRoute,
    operatorOfflineSync as operatorOfflineSyncRoute,
    operatorQrScanner as operatorQrScannerRoute,
    operatorScanHistory as operatorScanHistoryRoute,
} from '@/routes';
import type { OperatorModuleData } from '@/types/operator';

const sectionItems = [
    {
        description: "Field totals and today's scan counts",
        href: operatorDashboardRoute(),
        icon: LayoutGrid,
        title: 'Dashboard',
    },
    {
        description: 'Camera-based QR scanning with time-in and time-out',
        href: operatorQrScannerRoute(),
        icon: Camera,
        title: 'QR Scanner',
    },
    {
        description: 'Recent scan activity and sync status',
        href: operatorScanHistoryRoute(),
        icon: QrCode,
        title: 'Scan History',
    },
    {
        description: 'Pending records and offline synchronization controls',
        href: operatorOfflineSyncRoute(),
        icon: RefreshCcw,
        title: 'Offline Sync',
    },
] as const;

type OperatorModuleShellProps = {
    actions?: ReactNode;
    children: ReactNode;
    description: string;
    operatorModule: OperatorModuleData;
    title: string;
};

export function OperatorModuleShell({
    actions,
    children,
    description,
    operatorModule,
    title,
}: OperatorModuleShellProps) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_22%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_100%)]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                            Operator Module
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {actions ? (
                        <div className="flex flex-wrap gap-2">{actions}</div>
                    ) : null}
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))]">
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Field Status
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {operatorModule.command.status}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {operatorModule.command.assignmentLabel}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Operator
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                            {operatorModule.command.operatorName}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Tracked Roster
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                            {operatorModule.summary.rosterTotal.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Active Centers
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                            {operatorModule.summary.activeCenters.toLocaleString()}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/70 bg-card p-4 shadow-sm dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                        <ScanLine className="size-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">
                            Field Navigation
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Keep the operator workflow minimal so scanning stays
                            fast during live evacuations.
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-4">
                    {sectionItems.map((item) => {
                        const isActive = isCurrentUrl(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'rounded-[24px] border px-4 py-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm',
                                    isActive
                                        ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/20'
                                        : 'border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60',
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="rounded-2xl bg-white/90 p-3 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                                        <Icon className="size-4" />
                                    </div>
                                    {isActive ? (
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-300">
                                            Active
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-4 font-semibold text-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {item.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {children}
        </div>
    );
}
