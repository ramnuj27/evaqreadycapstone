import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    CalendarRange,
    Download,
    FileDown,
    PieChart,
    Printer,
    RefreshCcw,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import type {
    DashboardPageProps,
    EvacuationMonitoringStatus,
} from '@/components/console-panels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { reportsAnalytics as reportsAnalyticsRoute } from '@/routes';

type ReportsAnalyticsData = {
    charts: {
        barangayDistribution: Array<{
            name: string;
            percent: number;
            total: number;
        }>;
        evacuationStatus: Array<{
            key: string;
            label: string;
            percent: number;
            tone: 'amber' | 'emerald' | 'rose';
            total: number;
        }>;
        genderDistribution: Array<{
            key: 'female' | 'male';
            label: string;
            percent: number;
            tone: 'orange' | 'sky';
            total: number;
        }>;
    };
    filters: {
        applied: {
            barangay: string;
            center: string;
            dateFrom: string | null;
            dateTo: string | null;
        };
        options: {
            barangays: string[];
            centers: string[];
        };
    };
    header: {
        barangayLabel: string;
        centerLabel: string;
        dateLabel: string;
        generatedAt: string;
        note: string;
        title: string;
    };
    meta: {
        emptyState: string;
        fileName: string;
        pdfHint: string;
        recordCount: number;
    };
    populationBreakdown: {
        categories: Array<{
            key: 'adult' | 'child' | 'pregnant' | 'pwd' | 'senior';
            label: string;
            percent: number;
            tone: 'amber' | 'emerald' | 'rose' | 'sky' | 'violet';
            total: number;
        }>;
        note: string;
    };
    summary: {
        evacuated: number;
        missing: number;
        notYet: number;
        totalEvacuees: number;
    };
    table: {
        rows: Array<{
            barangay: string;
            evacuationCenter: string | null;
            name: string;
            status: EvacuationMonitoringStatus;
            timeIn: string | null;
        }>;
    };
};

type ReportsAnalyticsPageProps = DashboardPageProps & {
    reportsAnalytics: ReportsAnalyticsData;
};

type DraftFilters = {
    barangay: string;
    center: string;
    dateFrom: string;
    dateTo: string;
};

type ChartTone = 'amber' | 'emerald' | 'orange' | 'rose' | 'sky' | 'violet';

const statusBadgeClassNames: Record<EvacuationMonitoringStatus, string> = {
    Evacuated:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Missing:
        'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    'Not Yet Evacuated':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const toneClassNames: Record<ChartTone, string> = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
};

const tonePanelClassNames: Record<ChartTone, string> = {
    amber: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20',
    emerald:
        'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20',
    orange: 'border-orange-200/80 bg-orange-50/70 dark:border-orange-900/50 dark:bg-orange-950/20',
    rose: 'border-rose-200/80 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20',
    sky: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/20',
    violet: 'border-violet-200/80 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/20',
};

const toneTextClassNames: Record<ChartTone, string> = {
    amber: 'text-amber-700 dark:text-amber-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    orange: 'text-orange-700 dark:text-orange-300',
    rose: 'text-rose-700 dark:text-rose-300',
    sky: 'text-sky-700 dark:text-sky-300',
    violet: 'text-violet-700 dark:text-violet-300',
};

const toneHexValues: Record<ChartTone, string> = {
    amber: '#f59e0b',
    emerald: '#10b981',
    orange: '#f97316',
    rose: '#f43f5e',
    sky: '#0ea5e9',
    violet: '#8b5cf6',
};

function formatNumber(value: number): string {
    return value.toLocaleString();
}

function formatTimeOnly(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function csvCell(value: string | number): string {
    return `"${String(value).replaceAll('"', '""')}"`;
}

function serializeFilterState(filters: DraftFilters): string {
    return JSON.stringify(filters);
}

function donutChartStyle(
    segments: ReadonlyArray<{ color: string; value: number }>,
): { background: string } {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return {
            background: 'conic-gradient(#cbd5e1 0deg 360deg)',
        };
    }

    let start = 0;
    const stops = segments.map((segment) => {
        const degrees = (segment.value / total) * 360;
        const stop = `${segment.color} ${start}deg ${start + degrees}deg`;

        start += degrees;

        return stop;
    });

    return {
        background: `conic-gradient(${stops.join(', ')})`,
    };
}

function SummaryCard({
    description,
    label,
    surfaceClassName,
    total,
}: {
    description: string;
    label: string;
    surfaceClassName: string;
    total: number;
}) {
    return (
        <div
            className={cn(
                'report-print-surface rounded-[26px] border border-slate-200/80 p-5 shadow-sm dark:border-slate-800',
                surfaceClassName,
            )}
        >
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {formatNumber(total)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function DonutChart({
    centerLabel,
    helperText,
    segments,
    total,
}: {
    centerLabel: string;
    helperText: string;
    segments: ReadonlyArray<{ color: string; value: number }>;
    total: number;
}) {
    return (
        <div className="flex flex-col items-center gap-4 rounded-[26px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.96)_0%,rgba(17,24,39,0.9)_100%)]">
            <div
                className="relative flex size-44 items-center justify-center rounded-full shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]"
                style={donutChartStyle(segments)}
            >
                <div className="flex size-28 flex-col items-center justify-center rounded-full bg-card text-center shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 dark:ring-slate-800">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        {centerLabel}
                    </span>
                    <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                        {formatNumber(total)}
                    </span>
                </div>
            </div>
            <p className="max-w-[16rem] text-center text-xs leading-5 text-muted-foreground">
                {helperText}
            </p>
        </div>
    );
}

function DistributionLegendCard({
    helperText,
    label,
    percent,
    tone,
    total,
}: {
    helperText: string;
    label: string;
    percent: number;
    tone: ChartTone;
    total: number;
}) {
    return (
        <div
            className={cn(
                'rounded-[22px] border p-4 shadow-sm',
                tonePanelClassNames[tone],
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span
                        className={cn(
                            'size-2.5 rounded-full',
                            toneClassNames[tone],
                        )}
                    />
                    <p className="text-sm font-semibold text-foreground">
                        {label}
                    </p>
                </div>
                <span
                    className={cn(
                        'text-xs font-semibold',
                        toneTextClassNames[tone],
                    )}
                >
                    {percent}%
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {formatNumber(total)}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {helperText}
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-white/80 dark:bg-slate-950/70">
                <div
                    className={cn('h-1.5 rounded-full', toneClassNames[tone])}
                    style={{
                        width: `${Math.max(percent, total > 0 ? 10 : 0)}%`,
                    }}
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: EvacuationMonitoringStatus }) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                statusBadgeClassNames[status],
            )}
        >
            {status}
        </span>
    );
}

export default function ReportsAnalytics({
    reportsAnalytics,
}: ReportsAnalyticsPageProps) {
    const appliedFilters = reportsAnalytics.filters.applied;
    const [dateFrom, setDateFrom] = useState(appliedFilters.dateFrom ?? '');
    const [dateTo, setDateTo] = useState(appliedFilters.dateTo ?? '');
    const [barangayFilter, setBarangayFilter] = useState(
        appliedFilters.barangay,
    );
    const [centerFilter, setCenterFilter] = useState(appliedFilters.center);

    const draftFilters = {
        barangay: barangayFilter,
        center: centerFilter,
        dateFrom,
        dateTo,
    };
    const activeFilterState = serializeFilterState({
        barangay: appliedFilters.barangay,
        center: appliedFilters.center,
        dateFrom: appliedFilters.dateFrom ?? '',
        dateTo: appliedFilters.dateTo ?? '',
    });
    const hasPendingChanges =
        serializeFilterState(draftFilters) !== activeFilterState;

    const maxBarangayTotal = Math.max(
        ...reportsAnalytics.charts.barangayDistribution.map(
            (item) => item.total,
        ),
        1,
    );
    const maxPopulationTotal = Math.max(
        ...reportsAnalytics.populationBreakdown.categories.map(
            (item) => item.total,
        ),
        1,
    );
    const totalRecordedGender =
        reportsAnalytics.charts.genderDistribution.reduce(
            (total, item) => total + item.total,
            0,
        );
    const categoryByKey = Object.fromEntries(
        reportsAnalytics.populationBreakdown.categories.map((item) => [
            item.key,
            item,
        ]),
    ) as Record<
        ReportsAnalyticsData['populationBreakdown']['categories'][number]['key'],
        ReportsAnalyticsData['populationBreakdown']['categories'][number]
    >;
    const topPopulationCategory =
        reportsAnalytics.populationBreakdown.categories.reduce(
            (topCategory, item) =>
                item.total > topCategory.total ? item : topCategory,
        );
    const overlappingSupportTagsTotal =
        categoryByKey.pwd.total + categoryByKey.pregnant.total;
    const agePriorityTotal =
        categoryByKey.child.total + categoryByKey.senior.total;
    const activePopulationTags = reportsAnalytics.populationBreakdown.categories
        .filter((item) => item.total > 0)
        .map((item) => item.label);
    const genderChartSegments = reportsAnalytics.charts.genderDistribution.map(
        (item) => ({
            color: toneHexValues[item.tone],
            value: item.total,
        }),
    );
    const statusChartSegments = reportsAnalytics.charts.evacuationStatus.map(
        (item) => ({
            color: toneHexValues[item.tone],
            value: item.total,
        }),
    );
    const topBarangay = reportsAnalytics.charts.barangayDistribution[0] ?? null;

    function applyFilters(nextFilters: DraftFilters): void {
        router.get(
            reportsAnalyticsRoute.url({
                query: {
                    barangay:
                        nextFilters.barangay === 'all'
                            ? undefined
                            : nextFilters.barangay,
                    center:
                        nextFilters.center === 'all'
                            ? undefined
                            : nextFilters.center,
                    date_from:
                        nextFilters.dateFrom === ''
                            ? undefined
                            : nextFilters.dateFrom,
                    date_to:
                        nextFilters.dateTo === ''
                            ? undefined
                            : nextFilters.dateTo,
                },
            }),
            {},
            {
                only: ['reportsAnalytics'],
                preserveScroll: true,
                preserveState: false,
                replace: true,
            },
        );
    }

    function handleGenerateReport(): void {
        applyFilters(draftFilters);
    }

    function resetFilters(): void {
        const resetState = {
            barangay: 'all',
            center: 'all',
            dateFrom: '',
            dateTo: '',
        };

        setDateFrom('');
        setDateTo('');
        setBarangayFilter('all');
        setCenterFilter('all');
        applyFilters(resetState);
    }

    function printReport(): void {
        const previousTitle = document.title;

        document.title = reportsAnalytics.meta.fileName;
        window.print();
        window.setTimeout(() => {
            document.title = previousTitle;
        }, 0);
    }

    function downloadCsv(): void {
        const csvRows = [
            [reportsAnalytics.header.title],
            [`Date: ${reportsAnalytics.header.dateLabel}`],
            [`Barangay: ${reportsAnalytics.header.barangayLabel}`],
            [`Evacuation Center: ${reportsAnalytics.header.centerLabel}`],
            [`Generated At: ${reportsAnalytics.header.generatedAt}`],
            [],
            ['Name', 'Barangay', 'Evacuation Center', 'Status', 'Time In'],
            ...reportsAnalytics.table.rows.map((row) => [
                row.name,
                row.barangay,
                row.evacuationCenter ?? '-',
                row.status,
                formatTimeOnly(row.timeIn),
            ]),
        ];
        const csv = csvRows
            .map((row) => row.map((cell) => csvCell(cell)).join(','))
            .join('\r\n');
        const blob = new Blob([csv], {
            type: 'text/csv;charset=utf-8;',
        });
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = objectUrl;
        anchor.download = `${reportsAnalytics.meta.fileName}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
    }

    return (
        <>
            <Head title="Reports & Analytics" />

            <style>{`
                @media print {
                    @page {
                        margin: 12mm;
                    }

                    .report-screen-only {
                        display: none !important;
                    }

                    .report-page {
                        padding: 0 !important;
                        gap: 16px !important;
                    }

                    .report-print-surface {
                        box-shadow: none !important;
                        break-inside: avoid;
                    }

                    .report-table-scroll {
                        overflow: visible !important;
                    }

                    body {
                        background: white !important;
                    }
                }
            `}</style>

            <div className="report-page flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="report-screen-only overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_48%,rgba(255,247,237,0.96)_100%)] p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%),linear-gradient(145deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_48%,rgba(124,45,18,0.34)_100%)]">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-orange-700 uppercase dark:text-orange-300">
                                Final Reports Module
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Reports & Analytics
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                Summarize evacuation accountability, inspect
                                trends across barangays, and produce
                                documentation-ready reports that can be printed
                                or exported.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <BarChart3 className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Decision View
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Use the charts for quick trend reading
                                    before reviewing the detailed table.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <FileDown className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Documentation Ready
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    The page prints with a formal report header
                                    for capstone documentation.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="report-screen-only report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                    <div className="grid gap-3 xl:grid-cols-[repeat(2,minmax(0,0.9fr))_minmax(0,0.95fr)_minmax(0,1fr)_auto]">
                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Date From
                            </p>
                            <Input
                                type="date"
                                className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(event.currentTarget.value)
                                }
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Date To
                            </p>
                            <Input
                                type="date"
                                className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(event.currentTarget.value)
                                }
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Barangay
                            </p>
                            <Select
                                value={barangayFilter}
                                onValueChange={setBarangayFilter}
                            >
                                <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                    <SelectValue placeholder="Barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All barangays
                                    </SelectItem>
                                    {reportsAnalytics.filters.options.barangays.map(
                                        (barangay) => (
                                            <SelectItem
                                                key={barangay}
                                                value={barangay}
                                            >
                                                {barangay}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Evacuation Center
                            </p>
                            <Select
                                value={centerFilter}
                                onValueChange={setCenterFilter}
                            >
                                <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                    <SelectValue placeholder="Center" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All centers
                                    </SelectItem>
                                    {reportsAnalytics.filters.options.centers.map(
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

                        <div className="flex flex-wrap items-end gap-2">
                            <Button
                                className="h-12 rounded-2xl"
                                onClick={handleGenerateReport}
                                disabled={!hasPendingChanges}
                            >
                                Generate Report
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 rounded-2xl"
                                onClick={resetFilters}
                            >
                                <RefreshCcw className="size-4" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        {reportsAnalytics.header.note}
                    </p>
                </section>

                <section className="report-print-surface rounded-[30px] border border-slate-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_54%,rgba(239,246,255,0.96)_100%)] p-6 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_54%,rgba(12,74,110,0.24)_100%)]">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase dark:text-sky-300">
                                Formal Report Header
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                                {reportsAnalytics.header.title}
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                                Documentation and decision-support page for the
                                current evacuation accountability dataset.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                Generated
                            </p>
                            <p className="mt-2 font-semibold text-foreground">
                                {reportsAnalytics.header.generatedAt}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                        <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <CalendarRange className="size-4 text-sky-600" />
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Date
                                </p>
                            </div>
                            <p className="mt-3 font-semibold text-foreground">
                                {reportsAnalytics.header.dateLabel}
                            </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <UsersRound className="size-4 text-orange-600" />
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Barangay
                                </p>
                            </div>
                            <p className="mt-3 font-semibold text-foreground">
                                {reportsAnalytics.header.barangayLabel}
                            </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-emerald-600" />
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Center
                                </p>
                            </div>
                            <p className="mt-3 font-semibold text-foreground">
                                {reportsAnalytics.header.centerLabel}
                            </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <Download className="size-4 text-rose-600" />
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Records
                                </p>
                            </div>
                            <p className="mt-3 font-semibold text-foreground">
                                {formatNumber(
                                    reportsAnalytics.meta.recordCount,
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Total Evacuees"
                        total={reportsAnalytics.summary.totalEvacuees}
                        description="All filtered resident records included in the current report."
                        surfaceClassName="bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.96)_100%)] dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(12,74,110,0.34)_100%)]"
                    />
                    <SummaryCard
                        label="Evacuated"
                        total={reportsAnalytics.summary.evacuated}
                        description="Safe arrivals confirmed by the report dataset."
                        surfaceClassName="bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(236,253,245,0.96)_100%)] dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(6,78,59,0.34)_100%)]"
                    />
                    <SummaryCard
                        label="Not Yet"
                        total={reportsAnalytics.summary.notYet}
                        description="Residents still waiting for safe-arrival confirmation."
                        surfaceClassName="bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,251,235,0.96)_100%)] dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(120,53,15,0.34)_100%)]"
                    />
                    <SummaryCard
                        label="Missing"
                        total={reportsAnalytics.summary.missing}
                        description="High-priority accountability cases with no safe scan yet."
                        surfaceClassName="bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,241,242,0.96)_100%)] dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(127,29,29,0.34)_100%)]"
                    />
                </section>

                <section className="report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-violet-700 uppercase dark:text-violet-300">
                                Population Breakdown
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                Resident Category Graph
                            </h3>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Comparative graph for child, adult, senior, PWD,
                                and pregnant residents inside the current
                                filtered report.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                Logic Note
                            </p>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                {reportsAnalytics.populationBreakdown.note}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                        <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Comparative Graph
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Relative bar lengths keep overlapping
                                        category tags readable in one view.
                                    </p>
                                </div>
                                <BarChart3 className="size-5 text-violet-600 dark:text-violet-300" />
                            </div>

                            <div className="mt-5 space-y-3">
                                {reportsAnalytics.populationBreakdown.categories.map(
                                    (item) => (
                                        <div
                                            key={item.key}
                                            className="rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={cn(
                                                            'size-3 rounded-full',
                                                            toneClassNames[
                                                                item.tone
                                                            ],
                                                        )}
                                                    />
                                                    <p className="font-semibold text-foreground">
                                                        {item.label}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            toneTextClassNames[
                                                                item.tone
                                                            ],
                                                        )}
                                                    >
                                                        {item.percent}%
                                                    </span>
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {formatNumber(
                                                            item.total,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className={cn(
                                                        'h-2.5 rounded-full',
                                                        toneClassNames[
                                                            item.tone
                                                        ],
                                                    )}
                                                    style={{
                                                        width: `${Math.max(
                                                            Math.round(
                                                                (item.total /
                                                                    maxPopulationTotal) *
                                                                    100,
                                                            ),
                                                            item.total > 0
                                                                ? 8
                                                                : 0,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {item.percent}% of filtered
                                                records carry this tag.
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.96)_0%,rgba(17,24,39,0.9)_100%)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Category Snapshot
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {topPopulationCategory.label} is the
                                            strongest signal
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-sm font-semibold',
                                            tonePanelClassNames[
                                                topPopulationCategory.tone
                                            ],
                                            toneTextClassNames[
                                                topPopulationCategory.tone
                                            ],
                                        )}
                                    >
                                        {topPopulationCategory.percent}%
                                    </div>
                                </div>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                                    {formatNumber(topPopulationCategory.total)}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    This graph already carries the per-category
                                    counts, so this panel only highlights the
                                    main takeaway instead of repeating every
                                    category again.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Age Priority
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {formatNumber(agePriorityTotal)}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Combined child and senior tags inside
                                        this filtered report.
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Support Flags
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {formatNumber(
                                            overlappingSupportTagsTotal,
                                        )}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        PWD and pregnant indicators may overlap
                                        with age-based categories.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Active Tags
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {activePopulationTags.length === 0
                                        ? 'No population tags are active in the current filter set.'
                                        : `${activePopulationTags.join(', ')} are present in this report scope.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase dark:text-sky-300">
                                Gender Breakdown
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                Gender Split
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Pie-style view for the current report so the
                                male and female split reads faster.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                Recorded Entries
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {formatNumber(totalRecordedGender)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <DonutChart
                            centerLabel="Records"
                            helperText="Pie-style chart based on the sex field recorded in the filtered report."
                            segments={genderChartSegments}
                            total={totalRecordedGender}
                        />

                        <div className="space-y-3">
                            <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                {reportsAnalytics.charts.genderDistribution.map(
                                    (item) => (
                                        <div
                                            key={`${item.key}-strip`}
                                            className={cn(
                                                'h-full',
                                                toneClassNames[item.tone],
                                            )}
                                            style={{
                                                width: `${item.percent}%`,
                                            }}
                                        />
                                    ),
                                )}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {reportsAnalytics.charts.genderDistribution.map(
                                    (item) => (
                                        <DistributionLegendCard
                                            key={item.key}
                                            helperText="of the recorded gender entries in this report."
                                            label={item.label}
                                            percent={item.percent}
                                            tone={item.tone}
                                            total={item.total}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-300">
                                    Core Visual
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                    Status Share
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Pie-style breakdown of evacuated, not yet,
                                    and missing residents inside the selected
                                    scope.
                                </p>
                            </div>
                            <PieChart className="size-5 text-emerald-600" />
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                            <DonutChart
                                centerLabel="In Scope"
                                helperText="This chart reads directly from the filtered accountability dataset."
                                segments={statusChartSegments}
                                total={reportsAnalytics.summary.totalEvacuees}
                            />

                            <div className="space-y-3">
                                <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    {reportsAnalytics.charts.evacuationStatus.map(
                                        (item) => (
                                            <div
                                                key={`${item.key}-strip`}
                                                className={cn(
                                                    'h-full',
                                                    toneClassNames[item.tone],
                                                )}
                                                style={{
                                                    width: `${item.percent}%`,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {reportsAnalytics.charts.evacuationStatus.map(
                                        (item) => (
                                            <DistributionLegendCard
                                                key={item.key}
                                                helperText="of filtered resident records."
                                                label={item.label}
                                                percent={item.percent}
                                                tone={item.tone}
                                                total={item.total}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-orange-700 uppercase dark:text-orange-300">
                                    Core Visual
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                    Barangay Load Ranking
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Ranked bar graph of the filtered report so
                                    the busiest barangay is obvious at a glance.
                                </p>
                            </div>
                            <UsersRound className="size-5 text-orange-600" />
                        </div>

                        {reportsAnalytics.charts.barangayDistribution.length ===
                        0 ? (
                            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                {reportsAnalytics.meta.emptyState}
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                                <div className="rounded-[26px] border border-orange-200/80 bg-orange-50/70 p-5 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/20">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-300">
                                        Leading Barangay
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-foreground">
                                        {topBarangay?.name ?? '-'}
                                    </p>
                                    <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                                        {formatNumber(topBarangay?.total ?? 0)}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {topBarangay
                                            ? `${topBarangay.percent}% of the filtered report belongs to this barangay.`
                                            : 'No barangay data is available for this filter set.'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {reportsAnalytics.charts.barangayDistribution.map(
                                        (item, index) => (
                                            <div
                                                key={item.name}
                                                className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-700 dark:text-orange-300">
                                                        {index + 1}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate font-semibold text-foreground">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                {formatNumber(
                                                                    item.total,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="mt-3 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                                                            <div
                                                                className="h-2.5 rounded-full bg-orange-500"
                                                                style={{
                                                                    width: `${Math.max(
                                                                        Math.round(
                                                                            (item.total /
                                                                                maxBarangayTotal) *
                                                                                100,
                                                                        ),
                                                                        item.total >
                                                                            0
                                                                            ? 8
                                                                            : 0,
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            {item.percent}% of
                                                            the current report
                                                            set
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-rose-700 uppercase dark:text-rose-300">
                                Detailed Report
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                Filtered Evacuation Records
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Time in remains blank until the live QR operator
                                workflow starts feeding the report.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                Rows in Report
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {formatNumber(
                                    reportsAnalytics.meta.recordCount,
                                )}
                            </p>
                        </div>
                    </div>

                    {reportsAnalytics.table.rows.length === 0 ? (
                        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            {reportsAnalytics.meta.emptyState}
                        </div>
                    ) : (
                        <div className="report-table-scroll mt-6 overflow-x-auto rounded-[26px] border border-slate-200/80 dark:border-slate-800">
                            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-900">
                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Barangay</th>
                                        <th className="px-4 py-3">Center</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Time In</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {reportsAnalytics.table.rows.map(
                                        (row, index) => (
                                            <tr
                                                key={`${row.barangay}-${row.name}-${index}`}
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-foreground">
                                                        {row.name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {row.barangay}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {row.evacuationCenter ??
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={row.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {formatTimeOnly(row.timeIn)}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="report-screen-only report-print-surface rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                Export Options
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                Share or export this report
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {reportsAnalytics.meta.pdfHint}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                className="rounded-2xl"
                                onClick={printReport}
                            >
                                <FileDown className="size-4" />
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-2xl"
                                onClick={printReport}
                            >
                                <Printer className="size-4" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-2xl"
                                onClick={downloadCsv}
                                disabled={
                                    reportsAnalytics.table.rows.length === 0
                                }
                            >
                                <Download className="size-4" />
                                Download CSV
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="report-screen-only rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                    Current report data is derived from the existing resident
                    registry and prototype evacuation-monitoring logic. Live
                    QR-based safe arrivals will enrich time-in, time-out, and
                    PDF-ready accountability details in the next module.
                </section>
            </div>
        </>
    );
}

ReportsAnalytics.layout = {
    breadcrumbs: [
        {
            title: 'Reports & Analytics',
            href: reportsAnalyticsRoute(),
        },
    ],
};
