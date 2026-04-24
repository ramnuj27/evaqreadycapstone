import { Form, Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Building2,
    Camera,
    ChartColumnBig,
    Home,
    LayoutGrid,
    MapPinned,
    Navigation,
    Palette,
    QrCode,
    RefreshCcw,
    Settings,
    Shield,
    ShieldAlert,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { SidebarAccountPanel } from '@/components/sidebar-account-panel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { useInterfacePreferences } from '@/hooks/use-interface-preferences';
import {
    alertsNotifications,
    barangayManagement,
    dashboard,
    evacuationMonitoring,
    evacuationCenters,
    householdManagement,
    mapMonitoring,
    operatorDashboard,
    operatorOfflineSync,
    operatorQrScanner,
    operatorScanHistory,
    reportsAnalytics,
    systemSettings,
    userManagement,
} from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import resident from '@/routes/resident';
import { edit as editSecurity } from '@/routes/security';
import type { Auth, NavGroup } from '@/types';

function navigationGroupsForRole(role?: string | null): NavGroup[] {
    const isCdrrmoAdmin = role === 'CDRRMO Admin';
    const isBarangayCommittee = role === 'Barangay Committee';
    const isOperator = role === 'Operator';
    const isResident = role === 'Resident';

    if (isResident) {
        return [
            {
                label: 'Resident',
                items: [
                    {
                        title: 'Dashboard',
                        href: resident.dashboard(),
                        icon: LayoutGrid,
                    },
                    {
                        title: 'My Profile',
                        href: resident.profile(),
                        icon: UserRound,
                    },
                    {
                        title: 'My Household',
                        href: resident.household(),
                        icon: Home,
                    },
                    {
                        title: 'My QR Code',
                        href: resident.qrCode(),
                        icon: QrCode,
                    },
                    {
                        title: 'Alerts',
                        href: resident.alerts(),
                        icon: BellRing,
                    },
                    {
                        title: 'Evacuation Centers',
                        href: resident.evacuationCenters(),
                        icon: Building2,
                    },
                    {
                        title: 'Map / Nearest Center',
                        href: resident.map(),
                        icon: MapPinned,
                    },
                    {
                        title: 'AR Guide',
                        href: resident.evacuationAr(),
                        icon: Navigation,
                    },
                    {
                        title: 'Disaster Guide',
                        href: resident.disasterInfo(),
                        icon: ShieldAlert,
                    },
                ],
            },
            {
                label: 'Settings',
                items: [
                    {
                        title: 'Security',
                        href: editSecurity(),
                        icon: Shield,
                    },
                    {
                        title: 'Appearance',
                        href: editAppearance(),
                        icon: Palette,
                    },
                ],
            },
        ];
    }

    if (isOperator) {
        return [
            {
                label: 'Field',
                items: [
                    {
                        title: 'Dashboard',
                        href: operatorDashboard(),
                        icon: LayoutGrid,
                    },
                    {
                        title: 'QR Scanner',
                        href: operatorQrScanner(),
                        icon: Camera,
                    },
                    {
                        title: 'Scan History',
                        href: operatorScanHistory(),
                        icon: QrCode,
                    },
                    {
                        title: 'Offline Sync',
                        href: operatorOfflineSync(),
                        icon: RefreshCcw,
                    },
                ],
            },
            {
                label: 'Settings',
                items: [
                    {
                        title: 'Profile',
                        href: editProfile(),
                        icon: UserRound,
                    },
                    {
                        title: 'Appearance',
                        href: editAppearance(),
                        icon: Palette,
                    },
                ],
            },
        ];
    }

    if (isBarangayCommittee) {
        return [
            {
                label: 'Main',
                items: [
                    {
                        title: 'Dashboard',
                        href: dashboard(),
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Evacuation Monitoring',
                        href: evacuationMonitoring(),
                        icon: ShieldAlert,
                    },
                    {
                        title: 'Map Monitoring',
                        href: mapMonitoring(),
                        icon: MapPinned,
                    },
                ],
            },
            {
                label: 'Management',
                items: [
                    {
                        title: 'Household Management',
                        href: householdManagement(),
                        icon: Home,
                    },
                    {
                        title: 'Evacuation Centers',
                        href: evacuationCenters(),
                        icon: Building2,
                    },
                ],
            },
            {
                label: 'Communication',
                items: [
                    {
                        title: 'Alerts & Announcements',
                        href: alertsNotifications(),
                        icon: BellRing,
                    },
                ],
            },
            {
                label: 'Analytics',
                items: [
                    {
                        title: 'Reports',
                        href: reportsAnalytics(),
                        icon: ChartColumnBig,
                    },
                ],
            },
            {
                label: 'Settings',
                items: [
                    {
                        title: 'Profile',
                        href: editProfile(),
                        icon: UserRound,
                    },
                    {
                        title: 'Security',
                        href: editSecurity(),
                        icon: Shield,
                    },
                    {
                        title: 'Appearance',
                        href: editAppearance(),
                        icon: Palette,
                    },
                ],
            },
        ];
    }

    return [
        {
            label: 'Main',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
                {
                    title: 'Evacuation Monitoring',
                    href: evacuationMonitoring(),
                    icon: ShieldAlert,
                },
                {
                    title: 'Map Monitoring',
                    href: mapMonitoring(),
                    icon: MapPinned,
                },
            ],
        },
        {
            label: 'Management',
            items: [
                {
                    title: 'Household Management',
                    href: householdManagement(),
                    icon: Home,
                },
                {
                    title: isBarangayCommittee ? 'My Barangay' : 'Barangays',
                    href: barangayManagement(),
                    icon: Building2,
                },
                {
                    title: 'Evacuation Centers',
                    href: evacuationCenters(),
                    icon: Building2,
                },
            ],
        },
        {
            label: 'Communication',
            items: [
                {
                    title: 'Alerts & Announcements',
                    href: alertsNotifications(),
                    icon: BellRing,
                },
            ],
        },
        {
            label: 'Analytics',
            items: [
                {
                    title: 'Reports & Analytics',
                    href: reportsAnalytics(),
                    icon: ChartColumnBig,
                },
            ],
        },
        {
            label: 'Administration',
            items: isCdrrmoAdmin
                ? [
                      {
                          title: 'User Management',
                          href: userManagement(),
                          icon: UsersRound,
                      },
                      {
                          title: 'System Settings',
                          href: systemSettings(),
                          icon: Settings,
                      },
                  ]
                : [],
        },
    ].filter((group) => group.items.length > 0);
}

function homeRouteForRole(role?: string | null) {
    if (role === 'Resident') {
        return resident.dashboard();
    }

    if (role === 'Operator') {
        return operatorDashboard();
    }

    return dashboard();
}

function SidebarProfileCard() {
    const getInitials = useInitials();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { auth } = usePage<{ auth: Auth }>().props;
    const profileHref =
        auth.user?.role === 'Resident' ? resident.profile() : editProfile();

    if (!auth.user) {
        return null;
    }

    return (
        <Form
            {...ProfileController.update.form()}
            options={{
                preserveScroll: true,
            }}
            resetOnSuccess={['avatar']}
            className="flex justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-full"
        >
            {({ processing }) => (
                <>
                    <input type="hidden" name="name" value={auth.user.name} />
                    <input type="hidden" name="email" value={auth.user.email} />
                    <input
                        ref={inputRef}
                        type="file"
                        name="avatar"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            if (event.currentTarget.files?.length) {
                                event.currentTarget.form?.requestSubmit();
                            }
                        }}
                    />

                    <div className="console-shell-panel-soft relative shrink-0 rounded-[30px] p-4 transition-all duration-300 ease-out group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
                        <Link
                            href={profileHref}
                            prefetch
                            className="block rounded-full transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                            title="Edit profile"
                        >
                            <Avatar className="size-20 overflow-hidden rounded-full border-2 border-white/70 bg-white/70 shadow-[0_18px_42px_rgba(15,23,42,0.14)] transition-all duration-300 ease-out group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:border-sidebar-primary/15 group-data-[collapsible=icon]:shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
                                <AvatarImage
                                    src={auth.user.avatar ?? undefined}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-sidebar-primary/15 text-sidebar-foreground">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute -right-1 -bottom-1 size-8 rounded-full border border-white/80 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] group-data-[collapsible=icon]:hidden"
                            onClick={() => inputRef.current?.click()}
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner className="size-3.5" />
                            ) : (
                                <Camera className="size-3.5" />
                            )}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

export function AppSidebar() {
    const { preferences } = useInterfacePreferences();
    const { auth } = usePage<{ auth: Auth }>().props;
    const homeRoute = homeRouteForRole(
        auth.user?.role as string | null | undefined,
    );
    const homeTooltip =
        auth.user?.role === 'Resident'
            ? 'EvaQReady Account'
            : 'EvaQReady Console';

    return (
        <Sidebar
            collapsible={preferences.collapsibleSidebar ? 'icon' : 'none'}
            variant="inset"
        >
            <SidebarHeader className="gap-5 p-4 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-5">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip={{ children: homeTooltip }}
                            className="console-shell-panel-soft h-auto rounded-[32px] border-white/45 px-4 py-4 transition-all duration-300 ease-out group-data-[collapsible=icon]:size-16 group-data-[collapsible=icon]:rounded-[26px] group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none"
                        >
                            <Link href={homeRoute} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarProfileCard />
            </SidebarHeader>

            <SidebarSeparator className="mx-4 opacity-70 transition-[margin,opacity] duration-300 ease-out group-data-[collapsible=icon]:mx-2.5" />

            <SidebarContent className="px-2 pb-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                <NavMain
                    groups={navigationGroupsForRole(
                        auth.user?.role as string | null | undefined,
                    )}
                />
            </SidebarContent>

            <SidebarSeparator className="mx-4 opacity-70 transition-[margin,opacity] duration-300 ease-out group-data-[collapsible=icon]:mx-2.5" />

            <SidebarFooter className="p-4 pt-0 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-4">
                <SidebarAccountPanel />
            </SidebarFooter>
        </Sidebar>
    );
}
