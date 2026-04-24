import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useInterfacePreferences } from '@/hooks/use-interface-preferences';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import type { NavGroup } from '@/types';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const cleanup = useMobileNavigation();
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile, state } = useSidebar();
    const { preferences } = useInterfacePreferences();
    const isCollapsed = state === 'collapsed';
    const showSidebarIcons =
        preferences.showSidebarIcons || state === 'collapsed';

    const handleNavigate = (): void => {
        cleanup();

        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup
                    key={group.label}
                    className="px-1.5 py-1.5 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1"
                >
                    <SidebarGroupLabel className="px-4 text-[10px] font-semibold tracking-[0.28em] text-sidebar-foreground/38 uppercase">
                        {group.label}
                    </SidebarGroupLabel>
                    <SidebarGroupContent
                        className={cn(isCollapsed && 'w-full')}
                    >
                        <SidebarMenu className="gap-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3.5">
                            {group.items.map((item) => {
                                const isActive = isCurrentUrl(item.href);

                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className={cn(
                                            isCollapsed &&
                                                'flex w-full justify-center',
                                        )}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={{ children: item.title }}
                                            className={cn(
                                                'console-shell-panel-soft h-14 rounded-[26px] border-white/35 px-3.5 text-sidebar-foreground shadow-[0_14px_32px_rgba(15,23,42,0.05)] hover:bg-white/70 data-[active=true]:bg-white/84 data-[active=true]:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:hover:bg-white/10 dark:data-[active=true]:bg-white/12',
                                                isCollapsed &&
                                                    'mx-auto size-12 rounded-[24px] border-transparent bg-transparent px-0 shadow-none hover:bg-transparent data-[active=true]:border-transparent data-[active=true]:bg-transparent dark:data-[active=true]:bg-transparent',
                                            )}
                                        >
                                            <Link
                                                href={item.href}
                                                prefetch
                                                onClick={handleNavigate}
                                            >
                                                <span
                                                    className={cn(
                                                        showSidebarIcons
                                                            ? 'flex items-center justify-center transition-all duration-300 ease-out group-hover/menu-item:scale-[1.03]'
                                                            : 'hidden',
                                                        isCollapsed
                                                            ? isActive
                                                                ? 'size-12 rounded-[22px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_18px_40px_rgba(234,88,12,0.2)]'
                                                                : 'console-shell-panel-soft size-12 rounded-[22px] text-sidebar-primary shadow-none'
                                                            : isActive
                                                              ? 'size-10 rounded-[18px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_34px_rgba(234,88,12,0.18)]'
                                                              : 'console-shell-panel-soft size-10 rounded-[18px] text-sidebar-primary shadow-none',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="size-[18px]" />
                                                    )}
                                                </span>
                                                <span className="truncate font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
