import { Transition } from '@headlessui/react';
import { Form, Head, Link } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

type Props = {
    mustVerifyEmail: boolean;
    profile: {
        assignedBarangay: string | null;
        avatar: string | null;
        contactNumber: string | null;
        email: string;
        name: string;
        roleLabel: string;
    };
    status?: string;
};

export default function Profile({ mustVerifyEmail, profile, status }: Props) {
    const getInitials = useInitials();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
        null,
    );

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl !== null) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
        };
    }, [avatarPreviewUrl]);

    const currentAvatarUrl = avatarPreviewUrl ?? profile.avatar;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile settings"
                    description="Update your photo and personal account details."
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                                <Card className="rounded-[32px] border-border/70 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Profile picture</CardTitle>
                                        <CardDescription>
                                            Upload a clear account photo for
                                            your dashboard identity.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col items-center gap-5">
                                        <Avatar className="size-28 rounded-[28px] border border-border/70 shadow-sm">
                                            <AvatarImage
                                                src={
                                                    currentAvatarUrl ??
                                                    undefined
                                                }
                                                alt={profile.name}
                                            />
                                            <AvatarFallback className="rounded-[28px] bg-primary/10 text-2xl font-semibold text-primary">
                                                {getInitials(profile.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            name="avatar"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file =
                                                    event.currentTarget
                                                        .files?.[0];

                                                if (avatarPreviewUrl !== null) {
                                                    URL.revokeObjectURL(
                                                        avatarPreviewUrl,
                                                    );
                                                }

                                                setAvatarPreviewUrl(
                                                    file
                                                        ? URL.createObjectURL(
                                                              file,
                                                          )
                                                        : null,
                                                );
                                            }}
                                        />

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full rounded-full"
                                            onClick={() =>
                                                avatarInputRef.current?.click()
                                            }
                                        >
                                            <Camera />
                                            Upload
                                        </Button>

                                        <InputError
                                            className="w-full text-center"
                                            message={errors.avatar}
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[32px] border-border/70 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>
                                            Profile information
                                        </CardTitle>
                                        <CardDescription>
                                            Keep your personal details accurate
                                            for account management and
                                            coordination.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-5">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="name">
                                                    Full name
                                                </Label>

                                                <Input
                                                    id="name"
                                                    name="name"
                                                    required
                                                    autoComplete="name"
                                                    defaultValue={profile.name}
                                                    placeholder="Full name"
                                                />

                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email address
                                                </Label>

                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoComplete="username"
                                                    defaultValue={profile.email}
                                                    placeholder="Email address"
                                                />

                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="contact_number">
                                                    Contact number
                                                </Label>

                                                <Input
                                                    id="contact_number"
                                                    name="contact_number"
                                                    defaultValue={
                                                        profile.contactNumber ??
                                                        ''
                                                    }
                                                    placeholder="09123456789"
                                                />

                                                <InputError
                                                    message={
                                                        errors.contact_number
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="role">
                                                    Role
                                                </Label>

                                                <Input
                                                    id="role"
                                                    readOnly
                                                    value={profile.roleLabel}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="assigned_barangay">
                                                    Assigned barangay
                                                </Label>

                                                <Input
                                                    id="assigned_barangay"
                                                    readOnly
                                                    value={
                                                        profile.assignedBarangay ??
                                                        'None'
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {mustVerifyEmail && (
                                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="ml-1 font-medium text-foreground underline decoration-border underline-offset-4 transition hover:decoration-current"
                                                >
                                                    Resend verification email.
                                                </Link>
                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="mt-2 font-medium text-emerald-600">
                                                        A fresh verification
                                                        link has been sent.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="rounded-full px-6"
                                >
                                    Save Changes
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        Profile updated successfully.
                                    </p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
