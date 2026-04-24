import { useSyncExternalStore } from 'react';

export type AccentColor = 'blue' | 'orange' | 'red';
export type FontSize = 'small' | 'medium' | 'large';
export type SidebarMode = 'default' | 'compact';

export type InterfacePreferences = {
    accentColor: AccentColor;
    fontSize: FontSize;
    sidebarMode: SidebarMode;
    compactLayout: boolean;
    collapsibleSidebar: boolean;
    showSidebarIcons: boolean;
};

const STORAGE_KEY = 'evaqready.interface-preferences';

export const defaultInterfacePreferences: InterfacePreferences = {
    accentColor: 'orange',
    fontSize: 'medium',
    sidebarMode: 'default',
    compactLayout: false,
    collapsibleSidebar: true,
    showSidebarIcons: true,
};

const listeners = new Set<() => void>();

let currentPreferences: InterfacePreferences = defaultInterfacePreferences;

const accentPalette: Record<
    AccentColor,
    { chart: string; primary: string; ring: string }
> = {
    blue: {
        chart: '#60a5fa',
        primary: '#2563eb',
        ring: '#93c5fd',
    },
    orange: {
        chart: '#fb923c',
        primary: '#ea580c',
        ring: '#fdba74',
    },
    red: {
        chart: '#f87171',
        primary: '#dc2626',
        ring: '#fca5a5',
    },
};

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function notify(): void {
    listeners.forEach((listener) => listener());
}

function isAccentColor(value: unknown): value is AccentColor {
    return value === 'blue' || value === 'orange' || value === 'red';
}

function isFontSize(value: unknown): value is FontSize {
    return value === 'small' || value === 'medium' || value === 'large';
}

function isSidebarMode(value: unknown): value is SidebarMode {
    return value === 'default' || value === 'compact';
}

function normalizePreferences(value: unknown): InterfacePreferences {
    if (typeof value !== 'object' || value === null) {
        return defaultInterfacePreferences;
    }

    const candidate = value as Partial<InterfacePreferences>;

    return {
        accentColor: isAccentColor(candidate.accentColor)
            ? candidate.accentColor
            : defaultInterfacePreferences.accentColor,
        fontSize: isFontSize(candidate.fontSize)
            ? candidate.fontSize
            : defaultInterfacePreferences.fontSize,
        sidebarMode: isSidebarMode(candidate.sidebarMode)
            ? candidate.sidebarMode
            : defaultInterfacePreferences.sidebarMode,
        compactLayout:
            typeof candidate.compactLayout === 'boolean'
                ? candidate.compactLayout
                : defaultInterfacePreferences.compactLayout,
        collapsibleSidebar:
            typeof candidate.collapsibleSidebar === 'boolean'
                ? candidate.collapsibleSidebar
                : defaultInterfacePreferences.collapsibleSidebar,
        showSidebarIcons:
            typeof candidate.showSidebarIcons === 'boolean'
                ? candidate.showSidebarIcons
                : defaultInterfacePreferences.showSidebarIcons,
    };
}

function readStoredPreferences(): InterfacePreferences {
    if (!isBrowser()) {
        return defaultInterfacePreferences;
    }

    const storedPreferences = window.localStorage.getItem(STORAGE_KEY);

    if (storedPreferences === null) {
        return defaultInterfacePreferences;
    }

    try {
        return normalizePreferences(JSON.parse(storedPreferences));
    } catch {
        return defaultInterfacePreferences;
    }
}

function applyInterfacePreferences(preferences: InterfacePreferences): void {
    if (!isBrowser()) {
        return;
    }

    const root = document.documentElement;
    const accent = accentPalette[preferences.accentColor];

    root.dataset.fontSize = preferences.fontSize;
    root.dataset.layoutDensity = preferences.compactLayout
        ? 'compact'
        : 'comfortable';
    root.dataset.sidebarIcons = preferences.showSidebarIcons
        ? 'shown'
        : 'hidden';

    root.style.setProperty('--primary', accent.primary);
    root.style.setProperty('--primary-foreground', '#ffffff');
    root.style.setProperty('--ring', accent.ring);
    root.style.setProperty('--sidebar-primary', accent.primary);
    root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
    root.style.setProperty('--chart-1', accent.chart);
}

function persistPreferences(preferences: InterfacePreferences): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function savePreferences(preferences: InterfacePreferences): void {
    currentPreferences = preferences;
    persistPreferences(preferences);
    applyInterfacePreferences(preferences);
    notify();
}

export function initializeInterfacePreferences(): void {
    if (!isBrowser()) {
        return;
    }

    currentPreferences = readStoredPreferences();
    applyInterfacePreferences(currentPreferences);
}

export function useInterfacePreferences() {
    const preferences = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);

            return () => listeners.delete(listener);
        },
        () => currentPreferences,
        () => defaultInterfacePreferences,
    );

    return {
        preferences,
        patchPreferences: (updates: Partial<InterfacePreferences>): void => {
            savePreferences({
                ...currentPreferences,
                ...updates,
            });
        },
        resetPreferences: (): void => {
            savePreferences(defaultInterfacePreferences);
        },
        savePreferences,
    } as const;
}
