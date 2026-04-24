import { Head } from '@inertiajs/react';
import { Clock3, History, Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { OperatorModuleShell } from '@/components/operator-module-shell';
import { Input } from '@/components/ui/input';
import { useOperatorModule } from '@/hooks/use-operator-module';
import { operatorScanHistory as operatorScanHistoryRoute } from '@/routes';
import type {
    OperatorPageProps,
    OperatorScanRecord,
    OperatorSyncStatus,
} from '@/types/operator';

const syncClassNames: Record<OperatorSyncStatus, string> = {
    'Pending Sync':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Synced: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300',
};

const typeClassNames: Record<OperatorScanRecord['type'], string> = {
    IN: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    OUT: 'bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 dark:text-orange-300',
};

function formatScanMoment(value: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

export default function OperatorScanHistory({
    operatorModule,
}: OperatorPageProps) {
    const { records } = useOperatorModule(operatorModule);
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const filteredRecords = useMemo(() => {
        const normalizedSearch = deferredSearch.trim().toLowerCase();

        if (normalizedSearch === '') {
            return records;
        }

        return records.filter(
            (record) =>
                record.name.toLowerCase().includes(normalizedSearch) ||
                record.center.toLowerCase().includes(normalizedSearch) ||
                record.qrReference.toLowerCase().includes(normalizedSearch),
        );
    }, [deferredSearch, records]);

    return (
        <>
            <Head title="Scan History" />

            <OperatorModuleShell
                operatorModule={operatorModule}
                title="Scan history for the current device"
                description="Review the full operator log with the evacuee name, assigned center, scan type, timestamp, and sync status."
            >
                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700 dark:text-sky-300">
                                <History className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    Scan history
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Every successful Time-In and Time-Out stays
                                    on the device until it is synced.
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full xl:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name, center, or QR ref"
                                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                            />
                        </div>
                    </div>

                    {filteredRecords.length === 0 ? (
                        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            No scan records yet on this device. Start scanning
                            QR codes to populate the field history.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                    <thead className="bg-slate-50/90 dark:bg-slate-900/90">
                                        <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">
                                                Center
                                            </th>
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Sync</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                        {filteredRecords.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-4 align-top">
                                                    <p className="font-semibold text-foreground">
                                                        {record.name}
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {record.qrReference}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4 align-top text-sm text-foreground">
                                                    {record.center}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                                        <Clock3 className="size-4 text-muted-foreground" />
                                                        {formatScanMoment(
                                                            record.scannedAt,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeClassNames[record.type]}`}
                                                    >
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${syncClassNames[record.syncStatus]}`}
                                                    >
                                                        {record.syncStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </OperatorModuleShell>
        </>
    );
}

OperatorScanHistory.layout = {
    breadcrumbs: [
        {
            title: 'Scan History',
            href: operatorScanHistoryRoute(),
        },
    ],
};
