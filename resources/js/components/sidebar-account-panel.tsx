import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

export function SidebarAccountPanel() {
    const cleanup = useMobileNavigation();
    const { auth } = usePage<{ auth: Auth }>().props;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (!auth.user) {
        return null;
    }

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <SidebarGroup
            className={cn(
                'p-0 transition-all duration-300 ease-out',
                isCollapsed && 'shadow-none',
            )}
        >
            <SidebarGroupContent>
                <SidebarMenu
                    className={cn(isCollapsed && 'w-full items-center')}
                >
                    <SidebarMenuItem
                        className={cn(
                            isCollapsed && 'flex w-full justify-center',
                        )}
                    >
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'Logout' }}
                            className={cn(
                                'console-shell-panel-soft h-14 rounded-[28px] border-white/35 px-3.5 text-rose-500 transition-all duration-300 ease-out hover:bg-white/70 hover:text-rose-600 dark:hover:bg-white/10 dark:hover:text-rose-200',
                                isCollapsed &&
                                    'mx-auto size-12 rounded-[24px] border-transparent bg-transparent p-0 text-rose-500 shadow-none hover:bg-transparent',
                            )}
                        >
                            <Link
                                href={logout()}
                                as="button"
                                onClick={handleLogout}
                                data-test="sidebar-logout-button"
                            >
                                <span
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-[18px] bg-rose-500/10 text-rose-500 shadow-[0_10px_24px_rgba(244,63,94,0.12)]',
                                        isCollapsed &&
                                            'size-12 rounded-[22px] shadow-[0_16px_36px_rgba(244,63,94,0.16)]',
                                    )}
                                >
                                    <LogOut className="size-[18px]" />
                                </span>
                                <span className="group-data-[collapsible=icon]:hidden">
                                    Logout
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
