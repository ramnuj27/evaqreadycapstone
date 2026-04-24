import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { Auth } from '@/types';

export default function AppLogo() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roleLabel = auth.user?.role ?? 'EvaQReady';
    const secondaryLabel =
        auth.user?.role === 'Barangay Committee' && auth.user.barangay
            ? auth.user.barangay
            : (auth.user?.name ?? 'Preparedness Platform');

    return (
        <>
            <div className="flex aspect-square size-11 items-center justify-center rounded-[22px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_18px_40px_rgba(234,88,12,0.18)] transition-all duration-300 ease-out group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:rounded-[24px]">
                <AppLogoIcon className="size-5 fill-current text-sidebar-primary-foreground" />
            </div>
            <div className="ml-1.5 grid min-w-0 flex-1 overflow-hidden text-left transition-[opacity,transform,width] duration-200 ease-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:translate-x-2 group-data-[collapsible=icon]:opacity-0">
                <span className="mb-0.5 truncate text-[15px] leading-tight font-semibold">
                    {roleLabel}
                </span>
                <span className="truncate text-sm text-muted-foreground/80">
                    {secondaryLabel}
                </span>
            </div>
        </>
    );
}
