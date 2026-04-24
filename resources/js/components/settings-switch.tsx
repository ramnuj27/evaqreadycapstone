import { cn } from '@/lib/utils';

type Props = {
    checked: boolean;
    description?: string;
    disabled?: boolean;
    label: string;
    onCheckedChange: (checked: boolean) => void;
};

export default function SettingsSwitch({
    checked,
    description,
    disabled = false,
    label,
    onCheckedChange,
}: Props) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'flex w-full items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-60',
                checked && 'border-primary/50 bg-primary/[0.05]',
            )}
        >
            <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <span
                className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full border border-transparent transition',
                    checked ? 'bg-primary' : 'bg-muted',
                )}
            >
                <span
                    className={cn(
                        'absolute top-1/2 left-1 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition',
                        checked && 'translate-x-5',
                    )}
                />
            </span>
        </button>
    );
}
