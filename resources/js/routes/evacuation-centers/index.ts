import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::store
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/evacuation-centers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::store
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::store
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DashboardController::store
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::store
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
export const update = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/evacuation-centers/{evacuationCenter}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
update.url = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evacuationCenter: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evacuationCenter: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evacuationCenter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evacuationCenter: typeof args.evacuationCenter === 'object'
                ? args.evacuationCenter.id
                : args.evacuationCenter,
                }

    return update.definition.url
            .replace('{evacuationCenter}', parsedArgs.evacuationCenter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
update.put = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
    const updateForm = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
        updateForm.put = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
export const destroy = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/evacuation-centers/{evacuationCenter}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
destroy.url = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evacuationCenter: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evacuationCenter: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evacuationCenter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evacuationCenter: typeof args.evacuationCenter === 'object'
                ? args.evacuationCenter.id
                : args.evacuationCenter,
                }

    return destroy.definition.url
            .replace('{evacuationCenter}', parsedArgs.evacuationCenter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
destroy.delete = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
    const destroyForm = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
        destroyForm.delete = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const evacuationCenters = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default evacuationCenters