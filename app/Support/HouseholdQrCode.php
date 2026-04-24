<?php

namespace App\Support;

use App\Models\Household;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class HouseholdQrCode
{
    public function payloadFor(Household $household): string
    {
        return sprintf('EVAQREADY-HOUSEHOLD:%s', $household->household_code);
    }

    public function svgFor(Household $household, int $size = 360): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size, 12),
            new SvgImageBackEnd(),
        );

        return (new Writer($renderer))->writeString($this->payloadFor($household));
    }
}
