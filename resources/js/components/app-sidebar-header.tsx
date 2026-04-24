import { usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInterfacePreferences } from '@/hooks/use-interface-preferences';
import { cn } from '@/lib/utils';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { preferences } = useInterfacePreferences();
    const { auth } = usePage<{ auth: Auth }>().props;
    const todayLabel = new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());
    const headerStatus =
        auth.user?.role === 'Barangay Committee' && auth.user.barangay
            ? `${auth.user.barangay} barangay committee coordination panel is active`
            : auth.user?.role === 'CDRRMO Admin'
              ? 'CDRRMO admin command monitoring is active'
              : auth.user?.role === 'Operator'
                ? 'Operator console is ready for scans and center coordination'
                : 'Resident account access is active';

    return (
        <header
            className={cn(
                'sticky top-0 z-20',
                preferences.compactLayout
                    ? 'px-3 pt-3 md:px-4'
                    : 'px-4 pt-4 md:px-5',
            )}
        >
            <div
                className={cn(
                    'console-shell-panel-soft flex items-center rounded-[30px] transition-[width,height] duration-300 ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-14',
                    preferences.compactLayout
                        ? 'min-h-14 gap-2 px-3 py-2.5'
                        : 'min-h-16 gap-3 px-4 py-3.5',
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="hidden min-w-0 flex-1 lg:flex">
                    <div className="console-shell-panel-soft mx-auto flex h-11 w-full max-w-xl items-center gap-3 rounded-full px-4 text-sm text-muted-foreground shadow-none">
                        <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                        <span className="truncate">{headerStatus}</span>
                    </div>
                </div>

                <div className="hidden shrink-0 md:flex">
                    <div className="console-shell-panel-soft inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground shadow-none">
                        <CalendarDays className="size-4 text-orange-600" />
                        {todayLabel}
                    </div>
                </div>
            </div>
        </header>
    );
}
