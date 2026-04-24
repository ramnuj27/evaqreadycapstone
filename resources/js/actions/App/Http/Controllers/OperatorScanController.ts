import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OperatorScanController::store
 * @see app/Http/Controllers/OperatorScanController.php:17
 * @route '/operator-scans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/operator-scans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperatorScanController::store
 * @see app/Http/Controllers/OperatorScanController.php:17
 * @route '/operator-scans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperatorScanController::store
 * @see app/Http/Controllers/OperatorScanController.php:17
 * @route '/operator-scans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\OperatorScanController::store
 * @see app/Http/Controllers/OperatorScanController.php:17
 * @route '/operator-scans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OperatorScanController::store
 * @see app/Http/Controllers/OperatorScanController.php:17
 * @route '/operator-scans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\OperatorScanController::sync
 * @see app/Http/Controllers/OperatorScanController.php:51
 * @route '/operator-scans/sync'
 */
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/operator-scans/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperatorScanController::sync
 * @see app/Http/Controllers/OperatorScanController.php:51
 * @route '/operator-scans/sync'
 */
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperatorScanController::sync
 * @see app/Http/Controllers/OperatorScanController.php:51
 * @route '/operator-scans/sync'
 */
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\OperatorScanController::sync
 * @see app/Http/Controllers/OperatorScanController.php:51
 * @route '/operator-scans/sync'
 */
    const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sync.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OperatorScanController::sync
 * @see app/Http/Controllers/OperatorScanController.php:51
 * @route '/operator-scans/sync'
 */
        syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sync.url(options),
            method: 'post',
        })
    
    sync.form = syncForm
/**
* @see \App\Http\Controllers\OperatorScanController::update
 * @see app/Http/Controllers/OperatorScanController.php:96
 * @route '/operator-scans/{evacuationScan}'
 */
export const update = (args: { evacuationScan: number | { id: number } } | [evacuationScan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/operator-scans/{evacuationScan}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\OperatorScanController::update
 * @see app/Http/Controllers/OperatorScanController.php:96
 * @route '/operator-scans/{evacuationScan}'
 */
update.url = (args: { evacuationScan: number | { id: number } } | [evacuationScan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evacuationScan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evacuationScan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evacuationScan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evacuationScan: typeof args.evacuationScan === 'object'
                ? args.evacuationScan.id
                : args.evacuationScan,
                }

    return update.definition.url
            .replace('{evacuationScan}', parsedArgs.evacuationScan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperatorScanController::update
 * @see app/Http/Controllers/OperatorScanController.php:96
 * @route '/operator-scans/{evacuationScan}'
 */
update.patch = (args: { evacuationScan: number | { id: number } } | [evacuationScan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\OperatorScanController::update
 * @see app/Http/Controllers/OperatorScanController.php:96
 * @route '/operator-scans/{evacuationScan}'
 */
    const updateForm = (args: { evacuationScan: number | { id: number } } | [evacuationScan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OperatorScanController::update
 * @see app/Http/Controllers/OperatorScanController.php:96
 * @route '/operator-scans/{evacuationScan}'
 */
        updateForm.patch = (args: { evacuationScan: number | { id: number } } | [evacuationScan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const OperatorScanController = { store, sync, update }

export default OperatorScanController