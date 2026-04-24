import { Head, Link } from '@inertiajs/react';
import { Download, Printer, QrCode, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import resident from '@/routes/resident';

type ResidentQrCodeProps = {
    qrCode: {
        barangay: string;
        householdCode: string;
        householdName: string;
        payload: string;
        residentName?: string | null;
        status: string;
        svg: string;
    } | null;
};

export default function ResidentQrCode({ qrCode }: ResidentQrCodeProps) {
    const handleDownload = () => {
        if (!qrCode) {
            return;
        }

        const blob = new Blob([qrCode.svg], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qrCode.householdCode}-qr.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        if (!qrCode) {
            return;
        }

        const printWindow = window.open('', '_blank', 'noopener,noreferrer');

        if (!printWindow) {
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>${qrCode.householdCode} QR Code</title>
                    <style>
                        body {
                            align-items: center;
                            display: flex;
                            flex-direction: column;
                            font-family: Arial, sans-serif;
                            gap: 16px;
                            justify-content: center;
                            min-height: 100vh;
                        }
                    </style>
                </head>
                <body>
                    ${qrCode.svg}
                    <h1>${qrCode.residentName ?? qrCode.householdName}</h1>
                    <p>${qrCode.householdCode}</p>
                    <p>${qrCode.barangay}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <Head title="My QR Code" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#082f49_100%)] md:p-6">
                    <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                        Household QR
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        My QR Code
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Keep this household QR ready for check-in and identity
                        verification during evacuation or response operations.
                    </p>
                </section>

                {!qrCode ? (
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-sm leading-6 text-muted-foreground">
                                No QR code is available for this account yet.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 rounded-full"
                            >
                                <Link href={resident.household()}>
                                    Review Household Record
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <QrCode className="size-5 text-sky-600" />
                                    Household QR Code
                                </CardTitle>
                                <CardDescription>
                                    Present this code during check-in for faster
                                    household verification.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex justify-center rounded-[28px] border border-border/70 bg-white p-6 shadow-sm dark:bg-slate-950">
                                    <div
                                        className="max-w-[320px]"
                                        dangerouslySetInnerHTML={{
                                            __html: qrCode.svg,
                                        }}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Resident Name
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {qrCode.residentName ?? qrCode.householdName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Household ID
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {qrCode.householdCode}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Barangay
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {qrCode.barangay}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            QR Status
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {qrCode.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleDownload}
                                        className="rounded-full px-6"
                                    >
                                        <Download className="size-4" />
                                        Download QR
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrint}
                                        className="rounded-full px-6"
                                    >
                                        <Printer className="size-4" />
                                        Print QR
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <ShieldCheck className="size-5 text-emerald-600" />
                                        QR Reminder
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                                    <p>
                                        This QR belongs to a single household
                                        record. Keep it accessible on your phone
                                        or in print during emergency response.
                                    </p>
                                    <p>
                                        Payload reference: <br />
                                        <span className="font-mono text-xs text-foreground">
                                            {qrCode.payload}
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        Quick Access
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full rounded-full"
                                    >
                                        <Link href={resident.map()}>Open Map</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full rounded-full"
                                    >
                                        <Link href={resident.alerts()}>
                                            Read Alerts
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ResidentQrCode.layout = {
    breadcrumbs: [
        {
            title: 'My QR Code',
            href: resident.qrCode(),
        },
    ],
};
