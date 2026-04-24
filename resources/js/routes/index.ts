import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: login.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    login.form = loginForm
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: register.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
        registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
        registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    register.form = registerForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
    const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: home.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    home.form = homeForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
export const features = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})

features.definition = {
    methods: ["get","head"],
    url: '/features',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
features.url = (options?: RouteQueryOptions) => {
    return features.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
features.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
features.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: features.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
    const featuresForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: features.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
        featuresForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: features.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
        featuresForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: features.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    features.form = featuresForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
export const howItWorks = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: howItWorks.url(options),
    method: 'get',
})

howItWorks.definition = {
    methods: ["get","head"],
    url: '/how-it-works',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
howItWorks.url = (options?: RouteQueryOptions) => {
    return howItWorks.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
howItWorks.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: howItWorks.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
howItWorks.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: howItWorks.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
    const howItWorksForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: howItWorks.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
        howItWorksForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: howItWorks.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
        howItWorksForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: howItWorks.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    howItWorks.form = howItWorksForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
export const contact = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(options),
    method: 'get',
})

contact.definition = {
    methods: ["get","head"],
    url: '/contact',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
contact.url = (options?: RouteQueryOptions) => {
    return contact.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
contact.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
contact.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contact.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
    const contactForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contact.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
        contactForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contact.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
        contactForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contact.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contact.form = contactForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
export const disasterInformation = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformation.url(options),
    method: 'get',
})

disasterInformation.definition = {
    methods: ["get","head"],
    url: '/disaster-information',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
disasterInformation.url = (options?: RouteQueryOptions) => {
    return disasterInformation.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
disasterInformation.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformation.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
disasterInformation.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInformation.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
    const disasterInformationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInformation.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
        disasterInformationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformation.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
        disasterInformationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformation.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInformation.form = disasterInformationForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
export const disasterInformationFlood = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationFlood.url(options),
    method: 'get',
})

disasterInformationFlood.definition = {
    methods: ["get","head"],
    url: '/disaster-information/flood',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
disasterInformationFlood.url = (options?: RouteQueryOptions) => {
    return disasterInformationFlood.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
disasterInformationFlood.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationFlood.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
disasterInformationFlood.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInformationFlood.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
    const disasterInformationFloodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInformationFlood.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
        disasterInformationFloodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationFlood.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
        disasterInformationFloodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationFlood.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInformationFlood.form = disasterInformationFloodForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
export const disasterInformationTsunami = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationTsunami.url(options),
    method: 'get',
})

disasterInformationTsunami.definition = {
    methods: ["get","head"],
    url: '/disaster-information/tsunami',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
disasterInformationTsunami.url = (options?: RouteQueryOptions) => {
    return disasterInformationTsunami.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
disasterInformationTsunami.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationTsunami.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
disasterInformationTsunami.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInformationTsunami.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
    const disasterInformationTsunamiForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInformationTsunami.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
        disasterInformationTsunamiForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationTsunami.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
        disasterInformationTsunamiForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationTsunami.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInformationTsunami.form = disasterInformationTsunamiForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
export const disasterInformationEarthquake = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationEarthquake.url(options),
    method: 'get',
})

disasterInformationEarthquake.definition = {
    methods: ["get","head"],
    url: '/disaster-information/earthquake',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
disasterInformationEarthquake.url = (options?: RouteQueryOptions) => {
    return disasterInformationEarthquake.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
disasterInformationEarthquake.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationEarthquake.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
disasterInformationEarthquake.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInformationEarthquake.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
    const disasterInformationEarthquakeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInformationEarthquake.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
        disasterInformationEarthquakeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationEarthquake.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
        disasterInformationEarthquakeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationEarthquake.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInformationEarthquake.form = disasterInformationEarthquakeForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
export const disasterInformationTyphoon = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationTyphoon.url(options),
    method: 'get',
})

disasterInformationTyphoon.definition = {
    methods: ["get","head"],
    url: '/disaster-information/typhoon',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
disasterInformationTyphoon.url = (options?: RouteQueryOptions) => {
    return disasterInformationTyphoon.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
disasterInformationTyphoon.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInformationTyphoon.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
disasterInformationTyphoon.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInformationTyphoon.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
    const disasterInformationTyphoonForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInformationTyphoon.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
        disasterInformationTyphoonForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationTyphoon.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
        disasterInformationTyphoonForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInformationTyphoon.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInformationTyphoon.form = disasterInformationTyphoonForm
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
export const evacuationMonitoring = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationMonitoring.url(options),
    method: 'get',
})

evacuationMonitoring.definition = {
    methods: ["get","head"],
    url: '/evacuation-monitoring',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
evacuationMonitoring.url = (options?: RouteQueryOptions) => {
    return evacuationMonitoring.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
evacuationMonitoring.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationMonitoring.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
evacuationMonitoring.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evacuationMonitoring.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
    const evacuationMonitoringForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: evacuationMonitoring.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
        evacuationMonitoringForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationMonitoring.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::evacuationMonitoring
 * @see app/Http/Controllers/DashboardController.php:39
 * @route '/evacuation-monitoring'
 */
        evacuationMonitoringForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationMonitoring.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    evacuationMonitoring.form = evacuationMonitoringForm
/**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
export const mapMonitoring = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapMonitoring.url(options),
    method: 'get',
})

mapMonitoring.definition = {
    methods: ["get","head"],
    url: '/map-monitoring',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
mapMonitoring.url = (options?: RouteQueryOptions) => {
    return mapMonitoring.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
mapMonitoring.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapMonitoring.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
mapMonitoring.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mapMonitoring.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
    const mapMonitoringForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: mapMonitoring.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
        mapMonitoringForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mapMonitoring.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::mapMonitoring
 * @see app/Http/Controllers/DashboardController.php:44
 * @route '/map-monitoring'
 */
        mapMonitoringForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mapMonitoring.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    mapMonitoring.form = mapMonitoringForm
/**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
export const householdManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: householdManagement.url(options),
    method: 'get',
})

householdManagement.definition = {
    methods: ["get","head"],
    url: '/household-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
householdManagement.url = (options?: RouteQueryOptions) => {
    return householdManagement.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
householdManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: householdManagement.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
householdManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: householdManagement.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
    const householdManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: householdManagement.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
        householdManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: householdManagement.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::householdManagement
 * @see app/Http/Controllers/DashboardController.php:69
 * @route '/household-management'
 */
        householdManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: householdManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    householdManagement.form = householdManagementForm
/**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
export const barangayManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barangayManagement.url(options),
    method: 'get',
})

barangayManagement.definition = {
    methods: ["get","head"],
    url: '/barangay-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
barangayManagement.url = (options?: RouteQueryOptions) => {
    return barangayManagement.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
barangayManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barangayManagement.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
barangayManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: barangayManagement.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
    const barangayManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: barangayManagement.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
        barangayManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: barangayManagement.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::barangayManagement
 * @see app/Http/Controllers/DashboardController.php:156
 * @route '/barangay-management'
 */
        barangayManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: barangayManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    barangayManagement.form = barangayManagementForm
/**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
export const evacuationCenters = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationCenters.url(options),
    method: 'get',
})

evacuationCenters.definition = {
    methods: ["get","head"],
    url: '/evacuation-centers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
evacuationCenters.url = (options?: RouteQueryOptions) => {
    return evacuationCenters.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
evacuationCenters.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationCenters.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
evacuationCenters.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evacuationCenters.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
    const evacuationCentersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: evacuationCenters.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
        evacuationCentersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationCenters.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::evacuationCenters
 * @see app/Http/Controllers/DashboardController.php:203
 * @route '/evacuation-centers'
 */
        evacuationCentersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationCenters.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    evacuationCenters.form = evacuationCentersForm
/**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
export const reportsAnalytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsAnalytics.url(options),
    method: 'get',
})

reportsAnalytics.definition = {
    methods: ["get","head"],
    url: '/reports-analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
reportsAnalytics.url = (options?: RouteQueryOptions) => {
    return reportsAnalytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
reportsAnalytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsAnalytics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
reportsAnalytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reportsAnalytics.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
    const reportsAnalyticsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reportsAnalytics.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
        reportsAnalyticsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsAnalytics.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::reportsAnalytics
 * @see app/Http/Controllers/DashboardController.php:233
 * @route '/reports-analytics'
 */
        reportsAnalyticsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsAnalytics.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reportsAnalytics.form = reportsAnalyticsForm
/**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
export const alertsNotifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alertsNotifications.url(options),
    method: 'get',
})

alertsNotifications.definition = {
    methods: ["get","head"],
    url: '/alerts-notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
alertsNotifications.url = (options?: RouteQueryOptions) => {
    return alertsNotifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
alertsNotifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alertsNotifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
alertsNotifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: alertsNotifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
    const alertsNotificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: alertsNotifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
        alertsNotificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alertsNotifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::alertsNotifications
 * @see app/Http/Controllers/DashboardController.php:238
 * @route '/alerts-notifications'
 */
        alertsNotificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alertsNotifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    alertsNotifications.form = alertsNotificationsForm
/**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
export const operatorDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorDashboard.url(options),
    method: 'get',
})

operatorDashboard.definition = {
    methods: ["get","head"],
    url: '/operator-dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
operatorDashboard.url = (options?: RouteQueryOptions) => {
    return operatorDashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
operatorDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorDashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
operatorDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: operatorDashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
    const operatorDashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: operatorDashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
        operatorDashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorDashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::operatorDashboard
 * @see app/Http/Controllers/DashboardController.php:49
 * @route '/operator-dashboard'
 */
        operatorDashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorDashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    operatorDashboard.form = operatorDashboardForm
/**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
export const operatorQrScanner = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorQrScanner.url(options),
    method: 'get',
})

operatorQrScanner.definition = {
    methods: ["get","head"],
    url: '/operator-qr-scanner',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
operatorQrScanner.url = (options?: RouteQueryOptions) => {
    return operatorQrScanner.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
operatorQrScanner.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorQrScanner.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
operatorQrScanner.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: operatorQrScanner.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
    const operatorQrScannerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: operatorQrScanner.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
        operatorQrScannerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorQrScanner.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::operatorQrScanner
 * @see app/Http/Controllers/DashboardController.php:54
 * @route '/operator-qr-scanner'
 */
        operatorQrScannerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorQrScanner.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    operatorQrScanner.form = operatorQrScannerForm
/**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
export const operatorScanHistory = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorScanHistory.url(options),
    method: 'get',
})

operatorScanHistory.definition = {
    methods: ["get","head"],
    url: '/operator-scan-history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
operatorScanHistory.url = (options?: RouteQueryOptions) => {
    return operatorScanHistory.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
operatorScanHistory.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorScanHistory.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
operatorScanHistory.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: operatorScanHistory.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
    const operatorScanHistoryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: operatorScanHistory.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
        operatorScanHistoryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorScanHistory.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::operatorScanHistory
 * @see app/Http/Controllers/DashboardController.php:59
 * @route '/operator-scan-history'
 */
        operatorScanHistoryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorScanHistory.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    operatorScanHistory.form = operatorScanHistoryForm
/**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
export const operatorOfflineSync = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorOfflineSync.url(options),
    method: 'get',
})

operatorOfflineSync.definition = {
    methods: ["get","head"],
    url: '/operator-offline-sync',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
operatorOfflineSync.url = (options?: RouteQueryOptions) => {
    return operatorOfflineSync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
operatorOfflineSync.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operatorOfflineSync.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
operatorOfflineSync.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: operatorOfflineSync.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
    const operatorOfflineSyncForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: operatorOfflineSync.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
        operatorOfflineSyncForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorOfflineSync.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::operatorOfflineSync
 * @see app/Http/Controllers/DashboardController.php:64
 * @route '/operator-offline-sync'
 */
        operatorOfflineSyncForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operatorOfflineSync.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    operatorOfflineSync.form = operatorOfflineSyncForm
/**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
export const userManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userManagement.url(options),
    method: 'get',
})

userManagement.definition = {
    methods: ["get","head"],
    url: '/user-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
userManagement.url = (options?: RouteQueryOptions) => {
    return userManagement.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
userManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userManagement.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
userManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userManagement.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
    const userManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userManagement.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
        userManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userManagement.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::userManagement
 * @see app/Http/Controllers/DashboardController.php:161
 * @route '/user-management'
 */
        userManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userManagement.form = userManagementForm
/**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
export const systemSettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemSettings.url(options),
    method: 'get',
})

systemSettings.definition = {
    methods: ["get","head"],
    url: '/system-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
systemSettings.url = (options?: RouteQueryOptions) => {
    return systemSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
systemSettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemSettings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
systemSettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: systemSettings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
    const systemSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: systemSettings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
        systemSettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: systemSettings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::systemSettings
 * @see app/Http/Controllers/DashboardController.php:246
 * @route '/system-settings'
 */
        systemSettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: systemSettings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    systemSettings.form = systemSettingsForm