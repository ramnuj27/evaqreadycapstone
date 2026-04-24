import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AlertBroadcastController::store
 * @see app/Http/Controllers/AlertBroadcastController.php:13
 * @route '/alert-broadcasts'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/alert-broadcasts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AlertBroadcastController::store
 * @see app/Http/Controllers/AlertBroadcastController.php:13
 * @route '/alert-broadcasts'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertBroadcastController::store
 * @see app/Http/Controllers/AlertBroadcastController.php:13
 * @route '/alert-broadcasts'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AlertBroadcastController::store
 * @see app/Http/Controllers/AlertBroadcastController.php:13
 * @route '/alert-broadcasts'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertBroadcastController::store
 * @see app/Http/Controllers/AlertBroadcastController.php:13
 * @route '/alert-broadcasts'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\AlertBroadcastController::update
 * @see app/Http/Controllers/AlertBroadcastController.php:25
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
export const update = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/alert-broadcasts/{alertBroadcast}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AlertBroadcastController::update
 * @see app/Http/Controllers/AlertBroadcastController.php:25
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
update.url = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alertBroadcast: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { alertBroadcast: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    alertBroadcast: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alertBroadcast: typeof args.alertBroadcast === 'object'
                ? args.alertBroadcast.id
                : args.alertBroadcast,
                }

    return update.definition.url
            .replace('{alertBroadcast}', parsedArgs.alertBroadcast.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertBroadcastController::update
 * @see app/Http/Controllers/AlertBroadcastController.php:25
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
update.put = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\AlertBroadcastController::update
 * @see app/Http/Controllers/AlertBroadcastController.php:25
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
    const updateForm = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertBroadcastController::update
 * @see app/Http/Controllers/AlertBroadcastController.php:25
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
        updateForm.put = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\AlertBroadcastController::destroy
 * @see app/Http/Controllers/AlertBroadcastController.php:37
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
export const destroy = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/alert-broadcasts/{alertBroadcast}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AlertBroadcastController::destroy
 * @see app/Http/Controllers/AlertBroadcastController.php:37
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
destroy.url = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alertBroadcast: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { alertBroadcast: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    alertBroadcast: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alertBroadcast: typeof args.alertBroadcast === 'object'
                ? args.alertBroadcast.id
                : args.alertBroadcast,
                }

    return destroy.definition.url
            .replace('{alertBroadcast}', parsedArgs.alertBroadcast.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertBroadcastController::destroy
 * @see app/Http/Controllers/AlertBroadcastController.php:37
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
destroy.delete = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AlertBroadcastController::destroy
 * @see app/Http/Controllers/AlertBroadcastController.php:37
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
    const destroyForm = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertBroadcastController::destroy
 * @see app/Http/Controllers/AlertBroadcastController.php:37
 * @route '/alert-broadcasts/{alertBroadcast}'
 */
        destroyForm.delete = (args: { alertBroadcast: number | { id: number } } | [alertBroadcast: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const alertBroadcasts = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default alertBroadcasts