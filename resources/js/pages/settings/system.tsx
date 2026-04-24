import { Transition } from '@headlessui/react';
import { Head } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { systemSettings } from '@/routes';

type SystemSettingsData = {
    alerts: {
        alertVolume: number;
        enableAudioAlerts: boolean;
        enableEmergencyBroadcast: boolean;
        enableVisualAlerts: boolean;
    };
    backup: {
        lastBackupDate: string | null;
    };
    general: {
        defaultLanguage: string;
        defaultLocation: string;
        systemName: string;
        timeFormat: string;
    };
    map: {
        defaultMapView: string;
        enableHazardOverlay: boolean;
        enableMapMonitoring: boolean;
        showNearestEvacuationCenter: boolean;
    };
    offline: {
        autoSyncWhenOnline: boolean;
        enableManualSyncButton: boolean;
        enableOfflineMode: boolean;
        showSyncStatusIndicator: boolean;
    };
    qr: {
        autoTimeInOnScan: boolean;
        duplicateScanProtection: boolean;
        enableQrCodeGeneration: boolean;
        enableTimeOutScan: boolean;
    };
    reports: {
        enablePdfExport: boolean;
        enablePrintReports: boolean;
        includeBarangayBreakdown: boolean;
        includeChartsInReports: boolean;
    };
};

type Props = {
    settings: SystemSettingsData;
};

const storageKey = 'evaqready.system-settings';
const backupStorageKey = 'evaqready.system-settings.backup';

function loadSystemSettings(
    defaultSettings: SystemSettingsData,
): SystemSettingsData {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }

    const storedSettings = window.localStorage.getItem(storageKey);

    if (storedSettings === null) {
        return defaultSettings;
    }

    try {
        return JSON.parse(storedSettings) as SystemSettingsData;
    } catch {
        return defaultSettings;
    }
}

function loadBackupSnapshot(): SystemSettingsData | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedSnapshot = window.localStorage.getItem(backupStorageKey);

    if (storedSnapshot === null) {
        return null;
    }

    try {
        return JSON.parse(storedSnapshot) as SystemSettingsData;
    } catch {
        return null;
    }
}

function formatBackupTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export default function SystemSettings({ settings }: Props) {
    const [formData, setFormData] = useState<SystemSettingsData>(() =>
        loadSystemSettings(settings),
    );
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [hasBackupSnapshot, setHasBackupSnapshot] = useState<boolean>(
        () => loadBackupSnapshot() !== null,
    );

    useEffect(() => {
        if (statusMessage === null) {
            return;
        }

        const timer = window.setTimeout(() => setStatusMessage(null), 2200);

        return () => window.clearTimeout(timer);
    }, [statusMessage]);

    const saveChanges = (): void => {
        window.localStorage.setItem(storageKey, JSON.stringify(formData));
        setStatusMessage('System settings saved.');
    };

    const resetChanges = (): void => {
        setFormData(settings);
        window.localStorage.removeItem(storageKey);
        setStatusMessage('System settings reset to defaults.');
    };

    const backupNow = (): void => {
        const backupDate = formatBackupTimestamp(new Date());
        const snapshot = {
            ...formData,
            backup: {
                lastBackupDate: backupDate,
            },
        };

        setFormData(snapshot);
        window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        window.localStorage.setItem(backupStorageKey, JSON.stringify(snapshot));
        setHasBackupSnapshot(true);
        setStatusMessage('Local backup snapshot created.');
    };

    const restoreBackup = (): void => {
        const snapshot = loadBackupSnapshot();

        if (snapshot === null) {
            setStatusMessage('No local backup snapshot is available.');

            return;
        }

        setFormData(snapshot);
        window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        setStatusMessage('Backup snapshot restored.');
    };

    return (
        <>
            <Head title="System settings" />

            <h1 className="sr-only">System settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="System settings"
                    description="Configure EvaQReady's core system behavior, monitoring, and reporting defaults."
                />

                <Card className="rounded-[32px] border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle>General system</CardTitle>
                        <CardDescription>
                            Define the default identity and localization values
                            for the platform.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="system_name">System name</Label>
                            <Input
                                id="system_name"
                                value={formData.general.systemName}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        general: {
                                            ...current.general,
                                            systemName: event.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="default_location">
                                Default location
                            </Label>
                            <Input
                                id="default_location"
                                value={formData.general.defaultLocation}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        general: {
                                            ...current.general,
                                            defaultLocation: event.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="default_language">
                                Default language
                            </Label>
                            <select
                                id="default_language"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={formData.general.defaultLanguage}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        general: {
                                            ...current.general,
                                            defaultLanguage: event.target.value,
                                        },
                                    }))
                                }
                            >
                                <option value="English">English</option>
                                <option value="Bisaya">Bisaya</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="time_format">Time format</Label>
                            <select
                                id="time_format"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={formData.general.timeFormat}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        general: {
                                            ...current.general,
                                            timeFormat: event.target.value,
                                        },
                                    }))
                                }
                            >
                                <option value="12-hour">12-hour</option>
                                <option value="24-hour">24-hour</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle>QR &amp; scanning settings</CardTitle>
                        <CardDescription>
                            Control the behavior of QR-based resident check-in
                            workflows.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <SettingsSwitch
                            checked={formData.qr.enableQrCodeGeneration}
                            label="Enable QR Code Generation"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    qr: {
                                        ...current.qr,
                                        enableQrCodeGeneration: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.qr.autoTimeInOnScan}
                            label="Auto Time-In on Scan"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    qr: {
                                        ...current.qr,
                                        autoTimeInOnScan: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.qr.enableTimeOutScan}
                            label="Enable Time-Out Scan"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    qr: {
                                        ...current.qr,
                                        enableTimeOutScan: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.qr.duplicateScanProtection}
                            label="Duplicate Scan Protection"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    qr: {
                                        ...current.qr,
                                        duplicateScanProtection: checked,
                                    },
                                }))
                            }
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle>Offline settings</CardTitle>
                        <CardDescription>
                            Choose how the system behaves when connectivity is
                            unstable or unavailable.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <SettingsSwitch
                            checked={formData.offline.enableOfflineMode}
                            label="Enable Offline Mode"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    offline: {
                                        ...current.offline,
                                        enableOfflineMode: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.offline.autoSyncWhenOnline}
                            label="Auto Sync when Online"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    offline: {
                                        ...current.offline,
                                        autoSyncWhenOnline: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.offline.showSyncStatusIndicator}
                            label="Show Sync Status Indicator"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    offline: {
                                        ...current.offline,
                                        showSyncStatusIndicator: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.offline.enableManualSyncButton}
                            label="Enable Manual Sync Button"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    offline: {
                                        ...current.offline,
                                        enableManualSyncButton: checked,
                                    },
                                }))
                            }
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Alerts &amp; notifications</CardTitle>
                            <CardDescription>
                                Tune alert visibility, sound, and emergency
                                broadcast behavior.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <SettingsSwitch
                                checked={formData.alerts.enableAudioAlerts}
                                label="Enable Audio Alerts"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        alerts: {
                                            ...current.alerts,
                                            enableAudioAlerts: checked,
                                        },
                                    }))
                                }
                            />
                            <SettingsSwitch
                                checked={formData.alerts.enableVisualAlerts}
                                label="Enable Visual Alerts"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        alerts: {
                                            ...current.alerts,
                                            enableVisualAlerts: checked,
                                        },
                                    }))
                                }
                            />
                            <SettingsSwitch
                                checked={
                                    formData.alerts.enableEmergencyBroadcast
                                }
                                label="Enable Emergency Broadcast"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        alerts: {
                                            ...current.alerts,
                                            enableEmergencyBroadcast: checked,
                                        },
                                    }))
                                }
                            />

                            <div className="grid gap-3 rounded-3xl border border-border/70 bg-card/80 px-4 py-4 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="alert_volume">
                                        Alert volume
                                    </Label>
                                    <span className="text-sm font-semibold text-muted-foreground">
                                        {formData.alerts.alertVolume}%
                                    </span>
                                </div>

                                <input
                                    id="alert_volume"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.alerts.alertVolume}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            alerts: {
                                                ...current.alerts,
                                                alertVolume: Number(
                                                    event.target.value,
                                                ),
                                            },
                                        }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Map settings</CardTitle>
                            <CardDescription>
                                Configure what operators see during map-based
                                monitoring.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <SettingsSwitch
                                checked={formData.map.enableMapMonitoring}
                                label="Enable Map Monitoring"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        map: {
                                            ...current.map,
                                            enableMapMonitoring: checked,
                                        },
                                    }))
                                }
                            />
                            <SettingsSwitch
                                checked={
                                    formData.map.showNearestEvacuationCenter
                                }
                                label="Show Nearest Evacuation Center"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        map: {
                                            ...current.map,
                                            showNearestEvacuationCenter:
                                                checked,
                                        },
                                    }))
                                }
                            />
                            <SettingsSwitch
                                checked={formData.map.enableHazardOverlay}
                                label="Enable Hazard Overlay"
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        map: {
                                            ...current.map,
                                            enableHazardOverlay: checked,
                                        },
                                    }))
                                }
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="default_map_view">
                                    Default map view
                                </Label>
                                <select
                                    id="default_map_view"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    value={formData.map.defaultMapView}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            map: {
                                                ...current.map,
                                                defaultMapView:
                                                    event.target.value,
                                            },
                                        }))
                                    }
                                >
                                    <option value="standard">Standard</option>
                                    <option value="satellite">Satellite</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[32px] border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle>Reports settings</CardTitle>
                        <CardDescription>
                            Define the default content included in generated
                            reports.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <SettingsSwitch
                            checked={formData.reports.enablePdfExport}
                            label="Enable PDF Export"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    reports: {
                                        ...current.reports,
                                        enablePdfExport: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.reports.enablePrintReports}
                            label="Enable Print Reports"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    reports: {
                                        ...current.reports,
                                        enablePrintReports: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.reports.includeChartsInReports}
                            label="Include Charts in Reports"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    reports: {
                                        ...current.reports,
                                        includeChartsInReports: checked,
                                    },
                                }))
                            }
                        />
                        <SettingsSwitch
                            checked={formData.reports.includeBarangayBreakdown}
                            label="Include Barangay Breakdown"
                            onCheckedChange={(checked) =>
                                setFormData((current) => ({
                                    ...current,
                                    reports: {
                                        ...current.reports,
                                        includeBarangayBreakdown: checked,
                                    },
                                }))
                            }
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle>Backup &amp; maintenance</CardTitle>
                        <CardDescription>
                            Manage the local prototype snapshot for system
                            settings until the full database backup workflow is
                            connected.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="rounded-3xl border border-border/70 bg-muted/20 px-4 py-4">
                            <p className="text-sm font-semibold text-foreground">
                                Last backup
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {formData.backup.lastBackupDate ??
                                    'No backup yet'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="button"
                                className="rounded-full px-6"
                                onClick={backupNow}
                            >
                                Backup Database Now
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full px-6"
                                disabled={!hasBackupSnapshot}
                                onClick={restoreBackup}
                            >
                                Restore Backup
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        type="button"
                        className="rounded-full px-6"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={resetChanges}
                    >
                        Reset
                    </Button>

                    <Transition
                        show={statusMessage !== null}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">
                            {statusMessage}
                        </p>
                    </Transition>
                </div>
            </div>
        </>
    );
}

SystemSettings.layout = {
    breadcrumbs: [
        {
            title: 'System settings',
            href: systemSettings(),
        },
    ],
};
