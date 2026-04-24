import { Transition } from '@headlessui/react';
import { Head } from '@inertiajs/react';
import { Monitor, Moon, Palette, PanelLeft, Sun, Type } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import SettingsSwitch from '@/components/settings-switch';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import {
    AccentColor,
    FontSize,
    InterfacePreferences,
    SidebarMode,
    useInterfacePreferences,
} from '@/hooks/use-interface-preferences';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

const accentOptions: {
    description: string;
    value: AccentColor;
}[] = [
    {
        description: 'Bright and calm for dashboard navigation.',
        value: 'blue',
    },
    {
        description: 'Warm and energetic for action-heavy screens.',
        value: 'orange',
    },
    {
        description: 'Bold and urgent for high-visibility actions.',
        value: 'red',
    },
];

const fontSizeOptions: FontSize[] = ['small', 'medium', 'large'];
const sidebarModeOptions: SidebarMode[] = ['default', 'compact'];
const themeModeOptions: {
    icon: typeof Sun;
    value: Appearance;
}[] = [
    { icon: Sun, value: 'light' },
    { icon: Moon, value: 'dark' },
    { icon: Monitor, value: 'system' },
];

export default function AppearanceSettings() {
    const { appearance, updateAppearance } = useAppearance();
    const { preferences, savePreferences } = useInterfacePreferences();
    const [draftThemeMode, setDraftThemeMode] =
        useState<Appearance>(appearance);
    const [draftPreferences, setDraftPreferences] =
        useState<InterfacePreferences>(preferences);
    const [recentlySaved, setRecentlySaved] = useState(false);

    useEffect(() => {
        setDraftThemeMode(appearance);
    }, [appearance]);

    useEffect(() => {
        setDraftPreferences(preferences);
    }, [preferences]);

    useEffect(() => {
        if (!recentlySaved) {
            return;
        }

        const timer = window.setTimeout(() => setRecentlySaved(false), 1800);

        return () => window.clearTimeout(timer);
    }, [recentlySaved]);

    const saveAppearance = (): void => {
        updateAppearance(draftThemeMode);
        savePreferences(draftPreferences);
        setRecentlySaved(true);
    };

    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Choose the visual style and layout density for your console."
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Theme mode</CardTitle>
                            <CardDescription>
                                Pick how EvaQReady follows light and dark
                                surfaces.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-3">
                                {themeModeOptions.map(
                                    ({ icon: Icon, value }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setDraftThemeMode(value)
                                            }
                                            className={cn(
                                                'rounded-3xl border px-4 py-4 text-left shadow-sm transition',
                                                draftThemeMode === value
                                                    ? 'border-primary bg-primary/[0.06] text-foreground'
                                                    : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30',
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                    <Icon className="size-5" />
                                                </span>
                                                <div>
                                                    <p className="font-semibold capitalize">
                                                        {value}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {value === 'system'
                                                            ? 'Match your device preference.'
                                                            : `Use ${value} mode by default.`}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Palette className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        Accent color
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {accentOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setDraftPreferences(
                                                    (current) => ({
                                                        ...current,
                                                        accentColor:
                                                            option.value,
                                                    }),
                                                )
                                            }
                                            className={cn(
                                                'rounded-3xl border px-4 py-4 text-left shadow-sm transition',
                                                draftPreferences.accentColor ===
                                                    option.value
                                                    ? 'border-primary bg-primary/[0.06]'
                                                    : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30',
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'size-5 rounded-full',
                                                        option.value ===
                                                            'blue' &&
                                                            'bg-blue-600',
                                                        option.value ===
                                                            'orange' &&
                                                            'bg-orange-600',
                                                        option.value ===
                                                            'red' &&
                                                            'bg-red-600',
                                                    )}
                                                />
                                                <div>
                                                    <p className="font-semibold capitalize">
                                                        {option.value}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Interface controls</CardTitle>
                            <CardDescription>
                                Fine-tune typography, sidebar width, and layout
                                behavior.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Type className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        Font size
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {fontSizeOptions.map((fontSize) => (
                                        <button
                                            key={fontSize}
                                            type="button"
                                            onClick={() =>
                                                setDraftPreferences(
                                                    (current) => ({
                                                        ...current,
                                                        fontSize,
                                                    }),
                                                )
                                            }
                                            className={cn(
                                                'rounded-3xl border px-4 py-4 text-left shadow-sm transition',
                                                draftPreferences.fontSize ===
                                                    fontSize
                                                    ? 'border-primary bg-primary/[0.06]'
                                                    : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30',
                                            )}
                                        >
                                            <p className="font-semibold capitalize">
                                                {fontSize}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {fontSize === 'small' &&
                                                    'More compact content density.'}
                                                {fontSize === 'medium' &&
                                                    'Balanced readability for daily work.'}
                                                {fontSize === 'large' &&
                                                    'Extra breathing room for text-heavy views.'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <PanelLeft className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        Sidebar mode
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {sidebarModeOptions.map((sidebarMode) => (
                                        <button
                                            key={sidebarMode}
                                            type="button"
                                            onClick={() =>
                                                setDraftPreferences(
                                                    (current) => ({
                                                        ...current,
                                                        sidebarMode,
                                                    }),
                                                )
                                            }
                                            className={cn(
                                                'rounded-3xl border px-4 py-4 text-left shadow-sm transition',
                                                draftPreferences.sidebarMode ===
                                                    sidebarMode
                                                    ? 'border-primary bg-primary/[0.06]'
                                                    : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30',
                                            )}
                                        >
                                            <p className="font-semibold capitalize">
                                                {sidebarMode}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {sidebarMode === 'compact'
                                                    ? 'Reduce sidebar width for more workspace.'
                                                    : 'Keep the standard navigation width.'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <SettingsSwitch
                                    checked={draftPreferences.compactLayout}
                                    label="Compact Layout"
                                    description="Tighten shared dashboard spacing for denser screens."
                                    onCheckedChange={(checked) =>
                                        setDraftPreferences((current) => ({
                                            ...current,
                                            compactLayout: checked,
                                        }))
                                    }
                                />

                                <SettingsSwitch
                                    checked={
                                        draftPreferences.collapsibleSidebar
                                    }
                                    label="Collapsible Sidebar"
                                    description="Allow the sidebar to collapse into its compact icon state."
                                    onCheckedChange={(checked) =>
                                        setDraftPreferences((current) => ({
                                            ...current,
                                            collapsibleSidebar: checked,
                                        }))
                                    }
                                />

                                <SettingsSwitch
                                    checked={draftPreferences.showSidebarIcons}
                                    label="Show Icons in Sidebar"
                                    description="Keep navigation icons visible while the sidebar is expanded."
                                    onCheckedChange={(checked) =>
                                        setDraftPreferences((current) => ({
                                            ...current,
                                            showSidebarIcons: checked,
                                        }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        className="rounded-full px-6"
                        onClick={saveAppearance}
                    >
                        Save Appearance
                    </Button>

                    <Transition
                        show={recentlySaved}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">
                            Appearance settings saved.
                        </p>
                    </Transition>
                </div>
            </div>
        </>
    );
}

AppearanceSettings.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
