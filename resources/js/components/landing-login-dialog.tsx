import { Form, Link } from '@inertiajs/react';
import { CircleCheckBig, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type LandingLoginDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canRegister: boolean;
    canResetPassword: boolean;
};

const secureHighlights = [
    'Resident and operator access in one protected portal',
    'Live QR-based monitoring with immediate safe-status updates',
];

export default function LandingLoginDialog({
    open,
    onOpenChange,
    canRegister,
    canResetPassword,
}: LandingLoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="public-dialog-shell max-w-[calc(100%-1.5rem)] overflow-hidden p-0 text-[var(--marketing-text)] backdrop-blur-2xl sm:max-w-md">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_35%)]" />
                    <div className="relative border-b border-[var(--marketing-border)] px-6 py-4 sm:px-8">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--marketing-border)] bg-[var(--marketing-surface-soft)] px-3 py-1 text-xs font-semibold tracking-[0.24em] text-[var(--marketing-muted)] uppercase">
                            <ShieldCheck className="size-3.5 text-orange-300" />
                            Secure Access
                        </div>
                        <DialogHeader className="space-y-1.5 text-left">
                            <DialogTitle className="text-2xl font-semibold text-[var(--marketing-text)] sm:text-[1.75rem]">
                                Log in to EvaQReady
                            </DialogTitle>
                            <DialogDescription className="max-w-md text-sm leading-6 text-[var(--marketing-copy)]">
                                Access resident records, scan QR codes, and
                                monitor evacuation center safety in real time.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-5 sm:px-8 sm:py-6">
                    <div className="grid gap-1.5 rounded-3xl border border-[var(--marketing-border)] bg-[var(--marketing-surface-soft)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        {secureHighlights.map((highlight) => (
                            <div
                                key={highlight}
                                className="flex items-start gap-3 text-sm leading-5 text-[var(--marketing-copy)]"
                            >
                                <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                                <span>{highlight}</span>
                            </div>
                        ))}
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        disableWhileProcessing
                        className="grid gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="landing-email"
                                        className="text-[var(--marketing-text)]"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="landing-email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="name@barangay.gov.ph"
                                        className="h-11 rounded-2xl border-[var(--marketing-border)] bg-[var(--marketing-surface-soft)] text-[var(--marketing-text)] placeholder:text-[var(--marketing-muted)] focus-visible:border-orange-300/60 focus-visible:ring-orange-300/20"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="text-rose-600 dark:text-rose-300"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label
                                            htmlFor="landing-password"
                                            className="text-[var(--marketing-text)]"
                                        >
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="text-sm font-medium text-orange-600 transition-colors duration-300 hover:text-orange-700 dark:text-orange-200 dark:hover:text-orange-100"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="landing-password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-11 rounded-2xl border-[var(--marketing-border)] bg-[var(--marketing-surface-soft)] text-[var(--marketing-text)] placeholder:text-[var(--marketing-muted)] focus-visible:border-orange-300/60 focus-visible:ring-orange-300/20"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="text-rose-600 dark:text-rose-300"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-surface-soft)] px-4 py-2.5">
                                    <label
                                        htmlFor="landing-remember"
                                        className="flex items-center gap-3 text-sm text-[var(--marketing-copy)]"
                                    >
                                        <Checkbox
                                            id="landing-remember"
                                            name="remember"
                                            className="border-[var(--marketing-border-strong)] data-[state=checked]:border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:text-slate-950"
                                        />
                                        Keep me signed in on this device
                                    </label>
                                    <span className="text-xs text-[var(--marketing-muted)]">
                                        Secure session
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    className={cn(
                                        'mt-1 h-11 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:via-orange-300 hover:to-amber-200',
                                        processing && 'cursor-wait',
                                    )}
                                    data-test="landing-login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in securely
                                </Button>
                            </>
                        )}
                    </Form>

                    {canRegister && (
                        <p className="text-center text-sm leading-5 text-[var(--marketing-copy)]">
                            New to the platform?{' '}
                            <Link
                                href={register()}
                                className="font-semibold text-orange-600 transition-colors duration-300 hover:text-orange-700 dark:text-orange-200 dark:hover:text-orange-100"
                            >
                                Create your EvaQReady account
                            </Link>
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
