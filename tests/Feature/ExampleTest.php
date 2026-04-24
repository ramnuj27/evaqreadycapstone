<?php

use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('landing page can be rendered', function () {
    $response = $this->get(route('home'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords()))
        ->where('heroImageUrl', asset('mati-evacuation-cover.png')),
    );
});

test('landing page can be rendered with the login modal query flag', function () {
    $response = $this->get(route('home', ['login' => 1]));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords()))
        ->where('heroImageUrl', asset('mati-evacuation-cover.png')),
    );
});

test('features page can be rendered', function () {
    $response = $this->get(route('features'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('features')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords())),
    );
});

test('how it works page can be rendered', function () {
    $response = $this->get(route('how-it-works'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('how-it-works')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords())),
    );
});

test('contact page can be rendered', function () {
    $response = $this->get(route('contact'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('contact')
        ->where('canRegister', Features::enabled(Features::registration()))
        ->where('canResetPassword', Features::enabled(Features::resetPasswords())),
    );
});

test('landing hero cover photo asset exists', function () {
    expect(public_path('mati-evacuation-cover.png'))->toBeFile();
});

test('public landing-related pages stay outside the dashboard layout resolver', function () {
    $appBootstrapFile = file_get_contents(resource_path('js/app.tsx'));

    expect($appBootstrapFile)
        ->not->toBeFalse()
        ->and($appBootstrapFile)
        ->toContain("'welcome'", "'features'", "'how-it-works'", "'contact'", "'disaster-information'");
});

test('features page stays focused on features and links to dedicated public pages', function () {
    $featuresPageFile = file_get_contents(resource_path('js/pages/features.tsx'));

    expect($featuresPageFile)
        ->not->toBeFalse()
        ->and($featuresPageFile)
        ->toContain('howItWorksRoute.url()', 'contactRoute.url()')
        ->not->toContain('id="how-it-works"', 'workflowSteps', '#contact');
});

test('landing page no longer embeds the how it works or contact sections', function () {
    $welcomePageFile = file_get_contents(resource_path('js/pages/welcome.tsx'));

    expect($welcomePageFile)
        ->not->toBeFalse()
        ->and($welcomePageFile)
        ->toContain('howItWorksRoute.url()', 'contactRoute.url()')
        ->not->toContain('id="how-it-works"', 'id="contact"');
});

test('public pages use dedicated disaster routes for disaster info navigation', function () {
    $disasterLinkHelperFile = file_get_contents(
        resource_path('js/lib/disaster-links.ts'),
    );
    $featuresPageFile = file_get_contents(resource_path('js/pages/features.tsx'));
    $howItWorksPageFile = file_get_contents(
        resource_path('js/pages/how-it-works.tsx'),
    );
    $contactPageFile = file_get_contents(resource_path('js/pages/contact.tsx'));
    $disasterInformationPageFile = file_get_contents(
        resource_path('js/pages/disaster-information.tsx'),
    );

    expect($disasterLinkHelperFile)
        ->not->toBeFalse()
        ->and($disasterLinkHelperFile)
        ->toContain(
            'disasterInformationFlood',
            'disasterInformationTsunami',
            'disasterInformationEarthquake',
            'disasterInformationTyphoon',
        );

    expect($featuresPageFile)
        ->not->toBeFalse()
        ->and($featuresPageFile)
        ->toContain("from '@/lib/disaster-links'")
        ->not->toContain('#flood', '#tsunami', '#earthquake', '#typhoon');

    expect($howItWorksPageFile)
        ->not->toBeFalse()
        ->and($howItWorksPageFile)
        ->toContain("from '@/lib/disaster-links'")
        ->not->toContain('#flood', '#tsunami', '#earthquake', '#typhoon');

    expect($contactPageFile)
        ->not->toBeFalse()
        ->and($contactPageFile)
        ->toContain("from '@/lib/disaster-links'")
        ->not->toContain('#flood', '#tsunami', '#earthquake', '#typhoon');

    expect($disasterInformationPageFile)
        ->not->toBeFalse()
        ->and($disasterInformationPageFile)
        ->toContain(
            'initialDisasterId',
            "pageMode = 'hub'",
            'getDisasterHref',
        );
});

test('public marketing screens use shared appearance-aware theme utilities', function () {
    $publicPageFiles = [
        resource_path('js/pages/welcome.tsx'),
        resource_path('js/pages/features.tsx'),
        resource_path('js/pages/how-it-works.tsx'),
        resource_path('js/pages/contact.tsx'),
        resource_path('js/pages/disaster-information.tsx'),
    ];

    foreach ($publicPageFiles as $publicPageFile) {
        $contents = file_get_contents($publicPageFile);

        expect($contents)
            ->not->toBeFalse()
            ->and($contents)
            ->toContain(
                'public-page',
                'public-header-shell',
                'public-dropdown-shell',
                'public-mobile-sheet',
                'public-footer-shell',
                'public-adaptive-glass',
            );
    }

    $welcomePageFile = file_get_contents(resource_path('js/pages/welcome.tsx'));
    $disasterInformationPageFile = file_get_contents(
        resource_path('js/pages/disaster-information.tsx'),
    );
    $landingLoginDialogFile = file_get_contents(
        resource_path('js/components/landing-login-dialog.tsx'),
    );
    $appLogoFile = file_get_contents(resource_path('js/components/app-logo.tsx'));
    $appBladeFile = file_get_contents(resource_path('views/app.blade.php'));
    $appCssFile = file_get_contents(resource_path('css/app.css'));

    expect($welcomePageFile)
        ->not->toBeFalse()
        ->and($welcomePageFile)
        ->toContain(
            'public-hero-dark',
            'public-light-section',
            'public-light-section-alt',
        );

    expect($disasterInformationPageFile)
        ->not->toBeFalse()
        ->and($disasterInformationPageFile)
        ->toContain(
            'public-hero-dark',
            'public-media-card',
            'public-media-shell',
        );

    expect($landingLoginDialogFile)
        ->not->toBeFalse()
        ->and($landingLoginDialogFile)
        ->toContain(
            'public-dialog-shell',
            'text-[var(--marketing-text)]',
            'placeholder:text-[var(--marketing-muted)]',
        )
        ->not->toContain('text-white placeholder:text-slate-400');

    expect($appLogoFile)
        ->not->toBeFalse()
        ->and($appLogoFile)
        ->toContain('text-sidebar-primary-foreground')
        ->not->toContain('text-white dark:text-black');

    expect($appBladeFile)
        ->not->toBeFalse()
        ->and($appBladeFile)
        ->toContain(
            'const storedAppearance = window.localStorage.getItem',
            'document.documentElement.style.colorScheme',
        );

    expect($appCssFile)
        ->not->toBeFalse()
        ->and($appCssFile)
        ->toContain(
            '--marketing-bg',
            '.public-light-section',
            '.public-dialog-shell',
            '--destructive-foreground: oklch(0.985 0 0);',
            '--sidebar-primary-foreground: oklch(0.205 0 0);',
            '@layer utilities',
            '.public-page.text-white',
            '.text-slate-200\\/90',
        );
});
