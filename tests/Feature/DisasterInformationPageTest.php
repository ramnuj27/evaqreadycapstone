<?php

use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

dataset('dedicated disaster pages', [
    ['disaster-information-flood', 'flood'],
    ['disaster-information-tsunami', 'tsunami'],
    ['disaster-information-earthquake', 'earthquake'],
    ['disaster-information-typhoon', 'typhoon'],
]);

test('disaster information hub page can be rendered', function () {
    $response = $this->get(route('disaster-information'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('disaster-information')
        ->where('pageMode', 'hub')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords())),
    );
});

test('dedicated disaster information pages can be rendered', function (string $routeName, string $disasterId) {
    $response = $this->get(route($routeName));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('disaster-information')
        ->where('initialDisasterId', $disasterId)
        ->where('pageMode', 'detail')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords())),
    );
})->with('dedicated disaster pages');
