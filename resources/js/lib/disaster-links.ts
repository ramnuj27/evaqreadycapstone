import {
    disasterInformationEarthquake,
    disasterInformationFlood,
    disasterInformationTsunami,
    disasterInformationTyphoon,
} from '@/routes';

export type DisasterGuideId =
    | 'flood'
    | 'tsunami'
    | 'earthquake'
    | 'typhoon';

export type DisasterLink = {
    id: DisasterGuideId;
    label: string;
    href: string;
};

const disasterHrefMap: Record<DisasterGuideId, string> = {
    flood: disasterInformationFlood.url(),
    tsunami: disasterInformationTsunami.url(),
    earthquake: disasterInformationEarthquake.url(),
    typhoon: disasterInformationTyphoon.url(),
};

export const disasterLinks: DisasterLink[] = [
    { id: 'flood', label: 'Flood', href: disasterHrefMap.flood },
    { id: 'tsunami', label: 'Tsunami', href: disasterHrefMap.tsunami },
    { id: 'earthquake', label: 'Earthquake', href: disasterHrefMap.earthquake },
    { id: 'typhoon', label: 'Typhoon', href: disasterHrefMap.typhoon },
];

export function getDisasterHref(id: DisasterGuideId): string {
    return disasterHrefMap[id];
}
