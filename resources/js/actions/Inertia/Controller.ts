import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
const Controller980bb49ee7ae63891f1d891d2fbcf1c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

Controller980bb49ee7ae63891f1d891d2fbcf1c9.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
Controller980bb49ee7ae63891f1d891d2fbcf1c9.url = (options?: RouteQueryOptions) => {
    return Controller980bb49ee7ae63891f1d891d2fbcf1c9.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
Controller980bb49ee7ae63891f1d891d2fbcf1c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
Controller980bb49ee7ae63891f1d891d2fbcf1c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
    const Controller980bb49ee7ae63891f1d891d2fbcf1c9Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        Controller980bb49ee7ae63891f1d891d2fbcf1c9Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        Controller980bb49ee7ae63891f1d891d2fbcf1c9Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controller980bb49ee7ae63891f1d891d2fbcf1c9.form = Controller980bb49ee7ae63891f1d891d2fbcf1c9Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
const Controllere11e990c70acccc8d577821f34aa7efa = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere11e990c70acccc8d577821f34aa7efa.url(options),
    method: 'get',
})

Controllere11e990c70acccc8d577821f34aa7efa.definition = {
    methods: ["get","head"],
    url: '/features',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
Controllere11e990c70acccc8d577821f34aa7efa.url = (options?: RouteQueryOptions) => {
    return Controllere11e990c70acccc8d577821f34aa7efa.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
Controllere11e990c70acccc8d577821f34aa7efa.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere11e990c70acccc8d577821f34aa7efa.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
Controllere11e990c70acccc8d577821f34aa7efa.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllere11e990c70acccc8d577821f34aa7efa.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
    const Controllere11e990c70acccc8d577821f34aa7efaForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllere11e990c70acccc8d577821f34aa7efa.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
        Controllere11e990c70acccc8d577821f34aa7efaForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere11e990c70acccc8d577821f34aa7efa.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/features'
 */
        Controllere11e990c70acccc8d577821f34aa7efaForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere11e990c70acccc8d577821f34aa7efa.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllere11e990c70acccc8d577821f34aa7efa.form = Controllere11e990c70acccc8d577821f34aa7efaForm
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
const Controllere280bd4480a1a407d040b2ba05691060 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})

Controllere280bd4480a1a407d040b2ba05691060.definition = {
    methods: ["get","head"],
    url: '/how-it-works',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
Controllere280bd4480a1a407d040b2ba05691060.url = (options?: RouteQueryOptions) => {
    return Controllere280bd4480a1a407d040b2ba05691060.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
Controllere280bd4480a1a407d040b2ba05691060.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
Controllere280bd4480a1a407d040b2ba05691060.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
    const Controllere280bd4480a1a407d040b2ba05691060Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllere280bd4480a1a407d040b2ba05691060.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
        Controllere280bd4480a1a407d040b2ba05691060Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere280bd4480a1a407d040b2ba05691060.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/how-it-works'
 */
        Controllere280bd4480a1a407d040b2ba05691060Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere280bd4480a1a407d040b2ba05691060.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllere280bd4480a1a407d040b2ba05691060.form = Controllere280bd4480a1a407d040b2ba05691060Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
const Controller36402f3b102b68b92616e946647e00cf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})

Controller36402f3b102b68b92616e946647e00cf.definition = {
    methods: ["get","head"],
    url: '/contact',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
Controller36402f3b102b68b92616e946647e00cf.url = (options?: RouteQueryOptions) => {
    return Controller36402f3b102b68b92616e946647e00cf.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
Controller36402f3b102b68b92616e946647e00cf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
Controller36402f3b102b68b92616e946647e00cf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller36402f3b102b68b92616e946647e00cf.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
    const Controller36402f3b102b68b92616e946647e00cfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controller36402f3b102b68b92616e946647e00cf.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
        Controller36402f3b102b68b92616e946647e00cfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller36402f3b102b68b92616e946647e00cf.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/contact'
 */
        Controller36402f3b102b68b92616e946647e00cfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller36402f3b102b68b92616e946647e00cf.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controller36402f3b102b68b92616e946647e00cf.form = Controller36402f3b102b68b92616e946647e00cfForm
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
const Controllerea2ec7afa827aa3b1463a65a00666dc8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerea2ec7afa827aa3b1463a65a00666dc8.url(options),
    method: 'get',
})

Controllerea2ec7afa827aa3b1463a65a00666dc8.definition = {
    methods: ["get","head"],
    url: '/disaster-information',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
Controllerea2ec7afa827aa3b1463a65a00666dc8.url = (options?: RouteQueryOptions) => {
    return Controllerea2ec7afa827aa3b1463a65a00666dc8.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
Controllerea2ec7afa827aa3b1463a65a00666dc8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerea2ec7afa827aa3b1463a65a00666dc8.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
Controllerea2ec7afa827aa3b1463a65a00666dc8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerea2ec7afa827aa3b1463a65a00666dc8.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
    const Controllerea2ec7afa827aa3b1463a65a00666dc8Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllerea2ec7afa827aa3b1463a65a00666dc8.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
        Controllerea2ec7afa827aa3b1463a65a00666dc8Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerea2ec7afa827aa3b1463a65a00666dc8.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information'
 */
        Controllerea2ec7afa827aa3b1463a65a00666dc8Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerea2ec7afa827aa3b1463a65a00666dc8.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllerea2ec7afa827aa3b1463a65a00666dc8.form = Controllerea2ec7afa827aa3b1463a65a00666dc8Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
const Controllerce28005af610f9d889618b408c599007 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerce28005af610f9d889618b408c599007.url(options),
    method: 'get',
})

Controllerce28005af610f9d889618b408c599007.definition = {
    methods: ["get","head"],
    url: '/disaster-information/flood',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
Controllerce28005af610f9d889618b408c599007.url = (options?: RouteQueryOptions) => {
    return Controllerce28005af610f9d889618b408c599007.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
Controllerce28005af610f9d889618b408c599007.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerce28005af610f9d889618b408c599007.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
Controllerce28005af610f9d889618b408c599007.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerce28005af610f9d889618b408c599007.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
    const Controllerce28005af610f9d889618b408c599007Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllerce28005af610f9d889618b408c599007.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
        Controllerce28005af610f9d889618b408c599007Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerce28005af610f9d889618b408c599007.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/flood'
 */
        Controllerce28005af610f9d889618b408c599007Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerce28005af610f9d889618b408c599007.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllerce28005af610f9d889618b408c599007.form = Controllerce28005af610f9d889618b408c599007Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
const Controller5d8f51b53a52c1856b1e9738672b4cdd = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller5d8f51b53a52c1856b1e9738672b4cdd.url(options),
    method: 'get',
})

Controller5d8f51b53a52c1856b1e9738672b4cdd.definition = {
    methods: ["get","head"],
    url: '/disaster-information/tsunami',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
Controller5d8f51b53a52c1856b1e9738672b4cdd.url = (options?: RouteQueryOptions) => {
    return Controller5d8f51b53a52c1856b1e9738672b4cdd.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
Controller5d8f51b53a52c1856b1e9738672b4cdd.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller5d8f51b53a52c1856b1e9738672b4cdd.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
Controller5d8f51b53a52c1856b1e9738672b4cdd.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller5d8f51b53a52c1856b1e9738672b4cdd.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
    const Controller5d8f51b53a52c1856b1e9738672b4cddForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controller5d8f51b53a52c1856b1e9738672b4cdd.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
        Controller5d8f51b53a52c1856b1e9738672b4cddForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller5d8f51b53a52c1856b1e9738672b4cdd.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/tsunami'
 */
        Controller5d8f51b53a52c1856b1e9738672b4cddForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controller5d8f51b53a52c1856b1e9738672b4cdd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controller5d8f51b53a52c1856b1e9738672b4cdd.form = Controller5d8f51b53a52c1856b1e9738672b4cddForm
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
const Controllerff4134603d52c194635736b39870fe49 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerff4134603d52c194635736b39870fe49.url(options),
    method: 'get',
})

Controllerff4134603d52c194635736b39870fe49.definition = {
    methods: ["get","head"],
    url: '/disaster-information/earthquake',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
Controllerff4134603d52c194635736b39870fe49.url = (options?: RouteQueryOptions) => {
    return Controllerff4134603d52c194635736b39870fe49.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
Controllerff4134603d52c194635736b39870fe49.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerff4134603d52c194635736b39870fe49.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
Controllerff4134603d52c194635736b39870fe49.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerff4134603d52c194635736b39870fe49.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
    const Controllerff4134603d52c194635736b39870fe49Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllerff4134603d52c194635736b39870fe49.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
        Controllerff4134603d52c194635736b39870fe49Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerff4134603d52c194635736b39870fe49.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/earthquake'
 */
        Controllerff4134603d52c194635736b39870fe49Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerff4134603d52c194635736b39870fe49.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllerff4134603d52c194635736b39870fe49.form = Controllerff4134603d52c194635736b39870fe49Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
const Controllerdee826cf5a9564490acfa1fc73b2bfc5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url(options),
    method: 'get',
})

Controllerdee826cf5a9564490acfa1fc73b2bfc5.definition = {
    methods: ["get","head"],
    url: '/disaster-information/typhoon',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
Controllerdee826cf5a9564490acfa1fc73b2bfc5.url = (options?: RouteQueryOptions) => {
    return Controllerdee826cf5a9564490acfa1fc73b2bfc5.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
Controllerdee826cf5a9564490acfa1fc73b2bfc5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
Controllerdee826cf5a9564490acfa1fc73b2bfc5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
    const Controllerdee826cf5a9564490acfa1fc73b2bfc5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
        Controllerdee826cf5a9564490acfa1fc73b2bfc5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/disaster-information/typhoon'
 */
        Controllerdee826cf5a9564490acfa1fc73b2bfc5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllerdee826cf5a9564490acfa1fc73b2bfc5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllerdee826cf5a9564490acfa1fc73b2bfc5.form = Controllerdee826cf5a9564490acfa1fc73b2bfc5Form
    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
const Controllere19ee86e9cf603ce1a59a1ec5d21dec5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})

Controllere19ee86e9cf603ce1a59a1ec5d21dec5.definition = {
    methods: ["get","head"],
    url: '/settings/appearance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url = (options?: RouteQueryOptions) => {
    return Controllere19ee86e9cf603ce1a59a1ec5d21dec5.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
    const Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
        Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/settings/appearance'
 */
        Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    Controllere19ee86e9cf603ce1a59a1ec5d21dec5.form = Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form

const Controller = {
    '/': Controller980bb49ee7ae63891f1d891d2fbcf1c9,
    '/features': Controllere11e990c70acccc8d577821f34aa7efa,
    '/how-it-works': Controllere280bd4480a1a407d040b2ba05691060,
    '/contact': Controller36402f3b102b68b92616e946647e00cf,
    '/disaster-information': Controllerea2ec7afa827aa3b1463a65a00666dc8,
    '/disaster-information/flood': Controllerce28005af610f9d889618b408c599007,
    '/disaster-information/tsunami': Controller5d8f51b53a52c1856b1e9738672b4cdd,
    '/disaster-information/earthquake': Controllerff4134603d52c194635736b39870fe49,
    '/disaster-information/typhoon': Controllerdee826cf5a9564490acfa1fc73b2bfc5,
    '/settings/appearance': Controllere19ee86e9cf603ce1a59a1ec5d21dec5,
}

export default Controller