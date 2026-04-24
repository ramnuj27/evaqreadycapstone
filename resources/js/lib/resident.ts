export function residentLabel(value?: string | null): string {
    if (!value) {
        return 'Not provided';
    }

    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function residentDate(value?: string | null): string {
    if (!value) {
        return 'Not provided';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

export function residentDateTime(value?: string | null): string {
    if (!value) {
        return 'Not provided';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

export function residentAge(value?: string | null): number | null {
    if (!value) {
        return null;
    }

    const birthdate = new Date(`${value}T00:00:00`);

    if (Number.isNaN(birthdate.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDelta = today.getMonth() - birthdate.getMonth();

    if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < birthdate.getDate())
    ) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

export function residentRelationLabel(
    category?: string | null,
    isHead = false,
): string {
    if (isHead) {
        return 'Head of Family';
    }

    if (category === 'Child') {
        return 'Child';
    }

    if (category === 'Senior') {
        return 'Senior Family Member';
    }

    return 'Family Member';
}

export function residentFlags({
    category,
    isPregnant,
    isPwd,
}: {
    category?: string | null;
    isPregnant?: boolean;
    isPwd?: boolean;
}): string[] {
    const flags = [];

    if (category === 'Child') {
        flags.push('Child');
    }

    if (category === 'Senior') {
        flags.push('Senior');
    }

    if (isPwd) {
        flags.push('PWD');
    }

    if (isPregnant) {
        flags.push('Pregnant');
    }

    return flags;
}
