import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

type Highlight = {
    detail: string;
    icon: LucideIcon;
    label: string;
    value: string;
};

type FocusItem = {
    description: string;
    title: string;
};

type Props = {
    badge: string;
    children?: ReactNode;
    description: string;
    focusItems: FocusItem[];
    focusTitle: string;
    highlights: Highlight[];
    nextSteps: string[];
    nextTitle: string;
    title: string;
};

export default function ConsoleSectionPage({
    badge,
    children,
    description,
    focusItems,
    focusTitle,
    highlights,
    nextSteps,
    nextTitle,
    title,
}: Props) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_24%),linear-gradient(145deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_24%),linear-gradient(145deg,#111827_0%,#0f172a_45%,#111827_100%)] md:p-8">
                <div className="max-w-4xl">
                    <p className="text-xs font-semibold tracking-[0.24em] text-orange-600 uppercase">
                        {badge}
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        {description}
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {highlights.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-3 text-3xl font-semibold text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-600">
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {item.detail}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                    <p className="text-xs font-semibold tracking-[0.24em] text-orange-600 uppercase">
                        {focusTitle}
                    </p>
                    <div className="mt-5 space-y-4">
                        {focusItems.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70"
                            >
                                <p className="font-semibold text-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.24em] text-orange-600 uppercase">
                            {nextTitle}
                        </p>
                        <div className="mt-5 space-y-3">
                            {nextSteps.map((step) => (
                                <div
                                    key={step}
                                    className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                >
                                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-orange-600" />
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {children}
                </div>
            </section>
        </div>
    );
}
