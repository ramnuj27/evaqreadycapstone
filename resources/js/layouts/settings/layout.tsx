import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useInterfacePreferences } from '@/hooks/use-interface-preferences';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import resident from '@/routes/resident';
import { edit as editSecurity } from '@/routes/security';
import { systemSettings } from '@/routes';
import type { Auth, NavItem } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { preferences } = useInterfacePreferences();
    const { auth } = usePage<{ auth: Auth }>().props;
    const canAccessSystemSettings = auth.user?.role === 'CDRRMO Admin';
    const isResident = auth.user?.role === 'Resident';
    const settingsNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: isResident ? resident.profile() : edit(),
            icon: null,
        },
        {
            title: 'Security',
            href: editSecurity(),
            icon: null,
        },
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: null,
        },
        {
            title: 'System',
            href: systemSettings(),
            icon: null,
        },
    ].filter(
        (item) => item.title !== 'System' || canAccessSystemSettings,
    );

    return (
        <div className={cn('px-4 py-6', preferences.compactLayout && 'py-4')}>
            <Heading
                title="Settings"
                description={
                    canAccessSystemSettings
                        ? 'Manage account preferences and system configurations'
                        : 'Manage your account preferences and personal settings'
                }
            />

            <div className="space-y-6">
                <nav
                    className="flex flex-wrap gap-2 rounded-[28px] border border-border/70 bg-card/80 p-2 shadow-sm"
                    aria-label="Settings"
                >
                    {settingsNavItems.map((item, index) => (
                        <Button
                            key={`${toUrl(item.href)}-${index}`}
                            size="sm"
                            variant="ghost"
                            asChild
                            className={cn(
                                'rounded-full px-5 py-5 text-sm font-semibold transition',
                                isCurrentOrParentUrl(item.href)
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                        >
                            <Link href={item.href}>{item.title}</Link>
                        </Button>
                    ))}
                </nav>

                <section className="mx-auto w-full max-w-6xl space-y-8">
                    {children}
                </section>
            </div>
        </div>
    );
}
