import { Head } from '@inertiajs/react';
import { CheckCircle2, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { OperatorModuleShell } from '@/components/operator-module-shell';
import SettingsSwitch from '@/components/settings-switch';
import { Button } from '@/components/ui/button';
import { useOperatorModule } from '@/hooks/use-operator-module';
import { operatorOfflineSync as operatorOfflineSyncRoute } from '@/routes';
import type { OperatorPageProps, OperatorSyncStatus } from '@/types/operator';

const syncClassNames: Record<OperatorSyncStatus, string> = {
    'Pending Sync':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Synced: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300',
};

function formatSyncMoment(value: string | null): string {
    if (!value) {
        return 'No sync recorded yet';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

export default function OperatorOfflineSync({
    operatorModule,
}: OperatorPageProps) {
    const { autoSync, isOnline, lastSyncAt, records, setAutoSync, syncNow } =
        useOperatorModule(operatorModule);
    const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const pendingRecords = records.filter(
        (record) => record.syncStatus === 'Pending Sync',
    );

    return (
        <>
            <Head title="Offline Sync" />

            <OperatorModuleShell
                operatorModule={operatorModule}
                title="Offline sync and pending scan control"
                description="Keep offline records safe on the device, then push them once connectivity is restored."
                actions={
                    <Button
                        type="button"
                        className="rounded-2xl"
                        onClick={async () => {
                            setSyncing(true);
                            const result = await syncNow();
                            setSyncFeedback(result.message);
                            setSyncing(false);
                        }}
                        disabled={syncing}
                    >
                        <RefreshCcw className="size-4" />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                }
            >
                <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Pending Records
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                            {pendingRecords.length.toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Records waiting to be pushed to the online workflow.
                        </p>
                    </div>
                    <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Connection
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                            {isOnline ? (
                                <Wifi className="size-4 text-emerald-600 dark:text-emerald-300" />
                            ) : (
                                <WifiOff className="size-4 text-amber-600 dark:text-amber-300" />
                            )}
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Auto sync works only when the device is online.
                        </p>
                    </div>
                    <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Last Sync
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                            {formatSyncMoment(lastSyncAt)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Most recent successful device-level sync timestamp.
                        </p>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Pending sync queue
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Review unsynced records before pushing them to the
                            server-side workflow.
                        </p>

                        {syncFeedback ? (
                            <div className="mt-4 rounded-[22px] border border-emerald-300/60 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                                {syncFeedback}
                            </div>
                        ) : null}

                        {pendingRecords.length === 0 ? (
                            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                No pending records. This device is ready for the
                                next field scan.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {pendingRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {record.name}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {record.center}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full bg-slate-900/6 px-3 py-1 text-xs font-semibold text-foreground dark:bg-white/8">
                                                    {record.type}
                                                </span>
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${syncClassNames[record.syncStatus]}`}
                                                >
                                                    {record.syncStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            QR Ref: {record.qrReference}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Sync controls
                        </h2>

                        <div className="mt-5 space-y-3">
                            <SettingsSwitch
                                checked={autoSync}
                                label="Auto Sync"
                                description="When enabled, pending records sync automatically as soon as the device is back online."
                                onCheckedChange={setAutoSync}
                            />
                        </div>

                        <div className="mt-5 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="flex items-center gap-2 text-foreground">
                                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" />
                                <p className="font-semibold">Field Note</p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {operatorModule.meta.note}
                            </p>
                        </div>
                    </aside>
                </section>
            </OperatorModuleShell>
        </>
    );
}

OperatorOfflineSync.layout = {
    breadcrumbs: [
        {
            title: 'Offline Sync',
            href: operatorOfflineSyncRoute(),
        },
    ],
};
