import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
const RegistrationSuccessController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RegistrationSuccessController.url(options),
    method: 'get',
})

RegistrationSuccessController.definition = {
    methods: ["get","head"],
    url: '/register/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
RegistrationSuccessController.url = (options?: RouteQueryOptions) => {
    return RegistrationSuccessController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
RegistrationSuccessController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RegistrationSuccessController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
RegistrationSuccessController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RegistrationSuccessController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
    const RegistrationSuccessControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: RegistrationSuccessController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
        RegistrationSuccessControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RegistrationSuccessController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\RegistrationSuccessController::__invoke
 * @see app/Http/Controllers/Auth/RegistrationSuccessController.php:15
 * @route '/register/success'
 */
        RegistrationSuccessControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RegistrationSuccessController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    RegistrationSuccessController.form = RegistrationSuccessControllerForm
export default RegistrationSuccessController