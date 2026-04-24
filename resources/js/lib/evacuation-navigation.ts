export function normalizeDegrees(value: number): number {
    return ((value % 360) + 360) % 360;
}

export function shortestAngleDelta(
    fromHeading: number,
    toBearing: number,
): number {
    return ((toBearing - fromHeading + 540) % 360) - 180;
}

export function bearingBetween(
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number,
): number {
    const latitudeAInRadians = (latitudeA * Math.PI) / 180;
    const latitudeBInRadians = (latitudeB * Math.PI) / 180;
    const longitudeDeltaInRadians = ((longitudeB - longitudeA) * Math.PI) / 180;
    const y = Math.sin(longitudeDeltaInRadians) * Math.cos(latitudeBInRadians);
    const x =
        Math.cos(latitudeAInRadians) * Math.sin(latitudeBInRadians) -
        Math.sin(latitudeAInRadians) *
            Math.cos(latitudeBInRadians) *
            Math.cos(longitudeDeltaInRadians);

    return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

export function compassDirectionLabel(angle: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

    return directions[
        Math.round(normalizeDegrees(angle) / 45) % directions.length
    ];
}

export function distanceKmBetween(
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number,
): number {
    const earthRadiusKm = 6371;
    const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180;
    const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180;
    const latitudeAInRadians = (latitudeA * Math.PI) / 180;
    const latitudeBInRadians = (latitudeB * Math.PI) / 180;
    const haversineValue =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(latitudeAInRadians) *
            Math.cos(latitudeBInRadians) *
            Math.sin(longitudeDelta / 2) ** 2;

    return (
        2 *
        earthRadiusKm *
        Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue))
    );
}

export function estimateTravelMinutes(distanceKm: number): number {
    return Math.max(Math.round(distanceKm * 3.4 + 4), 4);
}

export function distanceLabel(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }

    return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

export function turnInstruction(angleDelta: number | null): string {
    if (angleDelta === null) {
        return 'Move your phone gently to calibrate the direction arrow.';
    }

    const absoluteDelta = Math.abs(angleDelta);

    if (absoluteDelta <= 12) {
        return 'Walk straight ahead toward the highlighted center.';
    }

    if (absoluteDelta <= 45) {
        return angleDelta > 0 ? 'Turn slightly right.' : 'Turn slightly left.';
    }

    if (absoluteDelta <= 120) {
        return angleDelta > 0 ? 'Turn right.' : 'Turn left.';
    }

    return angleDelta > 0
        ? 'Turn around to the right.'
        : 'Turn around to the left.';
}
