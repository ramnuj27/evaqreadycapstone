import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import members from './members'
/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
export const update = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/household-management/{household}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
update.url = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { household: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { household: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    household: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        household: typeof args.household === 'object'
                ? args.household.id
                : args.household,
                }

    return update.definition.url
            .replace('{household}', parsedArgs.household.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
update.put = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DashboardController::update
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
    const updateForm = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
        updateForm.put = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
export const destroy = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/household-management/{household}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
destroy.url = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { household: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { household: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    household: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        household: typeof args.household === 'object'
                ? args.household.id
                : args.household,
                }

    return destroy.definition.url
            .replace('{household}', parsedArgs.household.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
destroy.delete = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DashboardController::destroy
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
    const destroyForm = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
        destroyForm.delete = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const householdManagement = {
    update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
members: Object.assign(members, members),
}

export default householdManagement