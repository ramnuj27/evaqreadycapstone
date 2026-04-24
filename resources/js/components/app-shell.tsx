import { usePage } from '@inertiajs/react';
import type { CSSProperties, ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useInterfacePreferences } from '@/hooks/use-interface-preferences';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    const { preferences } = useInterfacePreferences();

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <SidebarProvider
            className={cn('console-shell relative overflow-hidden')}
            defaultOpen={isOpen}
            style={
                {
                    '--sidebar-width':
                        preferences.sidebarMode === 'compact'
                            ? '15rem'
                            : '17rem',
                    '--sidebar-width-icon':
                        preferences.sidebarMode === 'compact'
                            ? '4.25rem'
                            : '4.5rem',
                } as CSSProperties
            }
        >
            {children}
        </SidebarProvider>
    );
}
