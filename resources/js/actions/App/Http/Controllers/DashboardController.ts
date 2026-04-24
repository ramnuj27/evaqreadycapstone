import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
const DashboardController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})

DashboardController.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
DashboardController.url = (options?: RouteQueryOptions) => {
    return DashboardController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
DashboardController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
DashboardController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DashboardController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
    const DashboardControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: DashboardController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
        DashboardControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: DashboardController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:34
 * @route '/dashboard'
 */
        DashboardControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: DashboardController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    DashboardController.form = DashboardControllerForm
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
* @see \App\Http\Controllers\DashboardController::updateHousehold
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
export const updateHousehold = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateHousehold.url(args, options),
    method: 'put',
})

updateHousehold.definition = {
    methods: ["put"],
    url: '/household-management/{household}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::updateHousehold
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
updateHousehold.url = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateHousehold.definition.url
            .replace('{household}', parsedArgs.household.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::updateHousehold
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
updateHousehold.put = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateHousehold.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DashboardController::updateHousehold
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
    const updateHouseholdForm = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateHousehold.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::updateHousehold
 * @see app/Http/Controllers/DashboardController.php:74
 * @route '/household-management/{household}'
 */
        updateHouseholdForm.put = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateHousehold.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateHousehold.form = updateHouseholdForm
/**
* @see \App\Http\Controllers\DashboardController::destroyHousehold
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
export const destroyHousehold = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHousehold.url(args, options),
    method: 'delete',
})

destroyHousehold.definition = {
    methods: ["delete"],
    url: '/household-management/{household}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroyHousehold
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
destroyHousehold.url = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyHousehold.definition.url
            .replace('{household}', parsedArgs.household.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroyHousehold
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
destroyHousehold.delete = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHousehold.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DashboardController::destroyHousehold
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
    const destroyHouseholdForm = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyHousehold.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::destroyHousehold
 * @see app/Http/Controllers/DashboardController.php:105
 * @route '/household-management/{household}'
 */
        destroyHouseholdForm.delete = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyHousehold.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyHousehold.form = destroyHouseholdForm
/**
* @see \App\Http\Controllers\DashboardController::storeManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:118
 * @route '/household-management/{household}/members'
 */
export const storeManagedHouseholdMember = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeManagedHouseholdMember.url(args, options),
    method: 'post',
})

storeManagedHouseholdMember.definition = {
    methods: ["post"],
    url: '/household-management/{household}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::storeManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:118
 * @route '/household-management/{household}/members'
 */
storeManagedHouseholdMember.url = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return storeManagedHouseholdMember.definition.url
            .replace('{household}', parsedArgs.household.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::storeManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:118
 * @route '/household-management/{household}/members'
 */
storeManagedHouseholdMember.post = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeManagedHouseholdMember.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DashboardController::storeManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:118
 * @route '/household-management/{household}/members'
 */
    const storeManagedHouseholdMemberForm = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeManagedHouseholdMember.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::storeManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:118
 * @route '/household-management/{household}/members'
 */
        storeManagedHouseholdMemberForm.post = (args: { household: number | { id: number } } | [household: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeManagedHouseholdMember.url(args, options),
            method: 'post',
        })
    
    storeManagedHouseholdMember.form = storeManagedHouseholdMemberForm
/**
* @see \App\Http\Controllers\DashboardController::updateManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:132
 * @route '/household-management/members/{member}'
 */
export const updateManagedHouseholdMember = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateManagedHouseholdMember.url(args, options),
    method: 'put',
})

updateManagedHouseholdMember.definition = {
    methods: ["put"],
    url: '/household-management/members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::updateManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:132
 * @route '/household-management/members/{member}'
 */
updateManagedHouseholdMember.url = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return updateManagedHouseholdMember.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::updateManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:132
 * @route '/household-management/members/{member}'
 */
updateManagedHouseholdMember.put = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateManagedHouseholdMember.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DashboardController::updateManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:132
 * @route '/household-management/members/{member}'
 */
    const updateManagedHouseholdMemberForm = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateManagedHouseholdMember.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::updateManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:132
 * @route '/household-management/members/{member}'
 */
        updateManagedHouseholdMemberForm.put = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateManagedHouseholdMember.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateManagedHouseholdMember.form = updateManagedHouseholdMemberForm
/**
* @see \App\Http\Controllers\DashboardController::destroyManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:141
 * @route '/household-management/members/{member}'
 */
export const destroyManagedHouseholdMember = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyManagedHouseholdMember.url(args, options),
    method: 'delete',
})

destroyManagedHouseholdMember.definition = {
    methods: ["delete"],
    url: '/household-management/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroyManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:141
 * @route '/household-management/members/{member}'
 */
destroyManagedHouseholdMember.url = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return destroyManagedHouseholdMember.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroyManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:141
 * @route '/household-management/members/{member}'
 */
destroyManagedHouseholdMember.delete = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyManagedHouseholdMember.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DashboardController::destroyManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:141
 * @route '/household-management/members/{member}'
 */
    const destroyManagedHouseholdMemberForm = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyManagedHouseholdMember.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::destroyManagedHouseholdMember
 * @see app/Http/Controllers/DashboardController.php:141
 * @route '/household-management/members/{member}'
 */
        destroyManagedHouseholdMemberForm.delete = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyManagedHouseholdMember.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyManagedHouseholdMember.form = destroyManagedHouseholdMemberForm
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
* @see \App\Http\Controllers\DashboardController::storeEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
export const storeEvacuationCenter = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEvacuationCenter.url(options),
    method: 'post',
})

storeEvacuationCenter.definition = {
    methods: ["post"],
    url: '/evacuation-centers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::storeEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
storeEvacuationCenter.url = (options?: RouteQueryOptions) => {
    return storeEvacuationCenter.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::storeEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
storeEvacuationCenter.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEvacuationCenter.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DashboardController::storeEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
    const storeEvacuationCenterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeEvacuationCenter.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::storeEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:208
 * @route '/evacuation-centers'
 */
        storeEvacuationCenterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeEvacuationCenter.url(options),
            method: 'post',
        })
    
    storeEvacuationCenter.form = storeEvacuationCenterForm
/**
* @see \App\Http\Controllers\DashboardController::updateEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
export const updateEvacuationCenter = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEvacuationCenter.url(args, options),
    method: 'put',
})

updateEvacuationCenter.definition = {
    methods: ["put"],
    url: '/evacuation-centers/{evacuationCenter}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DashboardController::updateEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
updateEvacuationCenter.url = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateEvacuationCenter.definition.url
            .replace('{evacuationCenter}', parsedArgs.evacuationCenter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::updateEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
updateEvacuationCenter.put = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEvacuationCenter.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DashboardController::updateEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
    const updateEvacuationCenterForm = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateEvacuationCenter.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::updateEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:215
 * @route '/evacuation-centers/{evacuationCenter}'
 */
        updateEvacuationCenterForm.put = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateEvacuationCenter.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateEvacuationCenter.form = updateEvacuationCenterForm
/**
* @see \App\Http\Controllers\DashboardController::destroyEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
export const destroyEvacuationCenter = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyEvacuationCenter.url(args, options),
    method: 'delete',
})

destroyEvacuationCenter.definition = {
    methods: ["delete"],
    url: '/evacuation-centers/{evacuationCenter}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroyEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
destroyEvacuationCenter.url = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyEvacuationCenter.definition.url
            .replace('{evacuationCenter}', parsedArgs.evacuationCenter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroyEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
destroyEvacuationCenter.delete = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyEvacuationCenter.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DashboardController::destroyEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
    const destroyEvacuationCenterForm = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyEvacuationCenter.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DashboardController::destroyEvacuationCenter
 * @see app/Http/Controllers/DashboardController.php:224
 * @route '/evacuation-centers/{evacuationCenter}'
 */
        destroyEvacuationCenterForm.delete = (args: { evacuationCenter: number | { id: number } } | [evacuationCenter: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyEvacuationCenter.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyEvacuationCenter.form = destroyEvacuationCenterForm
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
DashboardController.evacuationMonitoring = evacuationMonitoring
DashboardController.mapMonitoring = mapMonitoring
DashboardController.householdManagement = householdManagement
DashboardController.updateHousehold = updateHousehold
DashboardController.destroyHousehold = destroyHousehold
DashboardController.storeManagedHouseholdMember = storeManagedHouseholdMember
DashboardController.updateManagedHouseholdMember = updateManagedHouseholdMember
DashboardController.destroyManagedHouseholdMember = destroyManagedHouseholdMember
DashboardController.barangayManagement = barangayManagement
DashboardController.evacuationCenters = evacuationCenters
DashboardController.storeEvacuationCenter = storeEvacuationCenter
DashboardController.updateEvacuationCenter = updateEvacuationCenter
DashboardController.destroyEvacuationCenter = destroyEvacuationCenter
DashboardController.reportsAnalytics = reportsAnalytics
DashboardController.alertsNotifications = alertsNotifications
DashboardController.operatorDashboard = operatorDashboard
DashboardController.operatorQrScanner = operatorQrScanner
DashboardController.operatorScanHistory = operatorScanHistory
DashboardController.operatorOfflineSync = operatorOfflineSync
DashboardController.userManagement = userManagement
DashboardController.systemSettings = systemSettings

export default DashboardController