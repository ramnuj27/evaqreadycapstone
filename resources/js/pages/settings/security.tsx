import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import SettingsSwitch from '@/components/settings-switch';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

type SecurityPreferences = {
    autoLogoutAfterTenMinutes: boolean;
    enableLoginAttemptLimit: boolean;
    requireStrongPassword: boolean;
};

const securityPreferencesStorageKey = 'evaqready.security-preferences';

const defaultSecurityPreferences: SecurityPreferences = {
    autoLogoutAfterTenMinutes: true,
    enableLoginAttemptLimit: true,
    requireStrongPassword: true,
};

function loadSecurityPreferences(): SecurityPreferences {
    if (typeof window === 'undefined') {
        return defaultSecurityPreferences;
    }

    const storedPreferences = window.localStorage.getItem(
        securityPreferencesStorageKey,
    );

    if (storedPreferences === null) {
        return defaultSecurityPreferences;
    }

    try {
        return {
            ...defaultSecurityPreferences,
            ...(JSON.parse(storedPreferences) as Partial<SecurityPreferences>),
        };
    } catch {
        return defaultSecurityPreferences;
    }
}

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [securityPreferences, setSecurityPreferences] =
        useState<SecurityPreferences>(loadSecurityPreferences);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        window.localStorage.setItem(
            securityPreferencesStorageKey,
            JSON.stringify(securityPreferences),
        );
    }, [securityPreferences]);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Security settings"
                    description="Manage your password, account safety, and sign-in protection."
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Change password</CardTitle>
                            <CardDescription>
                                Update your password to keep your EvaQReady
                                account secure.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Form
                                {...SecurityController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                resetOnError={[
                                    'password',
                                    'password_confirmation',
                                    'current_password',
                                ]}
                                resetOnSuccess
                                onError={(passwordErrors) => {
                                    if (passwordErrors.password) {
                                        passwordInput.current?.focus();
                                    }

                                    if (passwordErrors.current_password) {
                                        currentPasswordInput.current?.focus();
                                    }
                                }}
                                className="space-y-5"
                            >
                                {({
                                    errors: passwordErrors,
                                    processing,
                                    recentlySuccessful,
                                }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_password">
                                                Current password
                                            </Label>

                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                autoComplete="current-password"
                                                placeholder="Current password"
                                            />

                                            <InputError
                                                message={
                                                    passwordErrors.current_password
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                New password
                                            </Label>

                                            {securityPreferences.requireStrongPassword && (
                                                <p className="text-sm text-muted-foreground">
                                                    Use at least 12 characters
                                                    with uppercase letters,
                                                    lowercase letters, numbers,
                                                    and symbols.
                                                </p>
                                            )}

                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="New password"
                                            />

                                            <InputError
                                                message={
                                                    passwordErrors.password
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirm password
                                            </Label>

                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                            />

                                            <InputError
                                                message={
                                                    passwordErrors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-password-button"
                                                className="rounded-full px-6"
                                            >
                                                Update Password
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-muted-foreground">
                                                    Password updated
                                                    successfully.
                                                </p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Security options</CardTitle>
                            <CardDescription>
                                These preferences are stored on this device for
                                your current console experience.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <SettingsSwitch
                                checked={
                                    securityPreferences.requireStrongPassword
                                }
                                label="Require Strong Password"
                                description="Show stronger password guidance during account updates."
                                onCheckedChange={(checked) =>
                                    setSecurityPreferences((current) => ({
                                        ...current,
                                        requireStrongPassword: checked,
                                    }))
                                }
                            />

                            <SettingsSwitch
                                checked={
                                    securityPreferences.autoLogoutAfterTenMinutes
                                }
                                label="Auto Logout after 10 minutes"
                                description="Keep idle sessions shorter on shared devices."
                                onCheckedChange={(checked) =>
                                    setSecurityPreferences((current) => ({
                                        ...current,
                                        autoLogoutAfterTenMinutes: checked,
                                    }))
                                }
                            />

                            <SettingsSwitch
                                checked={
                                    securityPreferences.enableLoginAttemptLimit
                                }
                                label="Enable Login Attempt Limit"
                                description="Keep lockout-focused reminders enabled on this browser."
                                onCheckedChange={(checked) =>
                                    setSecurityPreferences((current) => ({
                                        ...current,
                                        enableLoginAttemptLimit: checked,
                                    }))
                                }
                            />
                        </CardContent>
                    </Card>
                </div>

                {canManageTwoFactor && (
                    <Card className="rounded-[32px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Two-factor authentication</CardTitle>
                            <CardDescription>
                                Add a second layer of protection to your login
                                flow.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {twoFactorEnabled ? (
                                <div className="flex flex-col items-start gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        Two-factor authentication is active.
                                        Recovery codes are available below in
                                        case you lose access to your
                                        authenticator app.
                                    </p>

                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-full px-6"
                                            >
                                                Disable 2FA
                                            </Button>
                                        )}
                                    </Form>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        Enable two-factor authentication to
                                        require a secure time-based code during
                                        sign-in.
                                    </p>

                                    {hasSetupData ? (
                                        <Button
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            className="rounded-full px-6"
                                        >
                                            <ShieldCheck />
                                            Continue setup
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="rounded-full px-6"
                                                >
                                                    Enable 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
