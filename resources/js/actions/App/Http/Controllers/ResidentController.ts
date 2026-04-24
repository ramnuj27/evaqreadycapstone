import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/resident/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::dashboard
 * @see app/Http/Controllers/ResidentController.php:28
 * @route '/resident/dashboard'
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
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/resident/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
    const profileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: profile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
        profileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::profile
 * @see app/Http/Controllers/ResidentController.php:52
 * @route '/resident/profile'
 */
        profileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    profile.form = profileForm
/**
* @see \App\Http\Controllers\ResidentController::updateProfile
 * @see app/Http/Controllers/ResidentController.php:152
 * @route '/resident/profile'
 */
export const updateProfile = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfile.url(options),
    method: 'put',
})

updateProfile.definition = {
    methods: ["put"],
    url: '/resident/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ResidentController::updateProfile
 * @see app/Http/Controllers/ResidentController.php:152
 * @route '/resident/profile'
 */
updateProfile.url = (options?: RouteQueryOptions) => {
    return updateProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::updateProfile
 * @see app/Http/Controllers/ResidentController.php:152
 * @route '/resident/profile'
 */
updateProfile.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfile.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ResidentController::updateProfile
 * @see app/Http/Controllers/ResidentController.php:152
 * @route '/resident/profile'
 */
    const updateProfileForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateProfile.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ResidentController::updateProfile
 * @see app/Http/Controllers/ResidentController.php:152
 * @route '/resident/profile'
 */
        updateProfileForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateProfile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateProfile.form = updateProfileForm
/**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
export const household = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: household.url(options),
    method: 'get',
})

household.definition = {
    methods: ["get","head"],
    url: '/resident/household',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
household.url = (options?: RouteQueryOptions) => {
    return household.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
household.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: household.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
household.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: household.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
    const householdForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: household.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
        householdForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: household.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::household
 * @see app/Http/Controllers/ResidentController.php:63
 * @route '/resident/household'
 */
        householdForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: household.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    household.form = householdForm
/**
* @see \App\Http\Controllers\ResidentController::storeHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:195
 * @route '/resident/household/members'
 */
export const storeHouseholdMember = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeHouseholdMember.url(options),
    method: 'post',
})

storeHouseholdMember.definition = {
    methods: ["post"],
    url: '/resident/household/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ResidentController::storeHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:195
 * @route '/resident/household/members'
 */
storeHouseholdMember.url = (options?: RouteQueryOptions) => {
    return storeHouseholdMember.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::storeHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:195
 * @route '/resident/household/members'
 */
storeHouseholdMember.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeHouseholdMember.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ResidentController::storeHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:195
 * @route '/resident/household/members'
 */
    const storeHouseholdMemberForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeHouseholdMember.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ResidentController::storeHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:195
 * @route '/resident/household/members'
 */
        storeHouseholdMemberForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeHouseholdMember.url(options),
            method: 'post',
        })
    
    storeHouseholdMember.form = storeHouseholdMemberForm
/**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
export const qrCode = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(options),
    method: 'get',
})

qrCode.definition = {
    methods: ["get","head"],
    url: '/resident/qr-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
qrCode.url = (options?: RouteQueryOptions) => {
    return qrCode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
qrCode.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
qrCode.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: qrCode.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
    const qrCodeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: qrCode.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
        qrCodeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qrCode.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::qrCode
 * @see app/Http/Controllers/ResidentController.php:73
 * @route '/resident/qr-code'
 */
        qrCodeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qrCode.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    qrCode.form = qrCodeForm
/**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
export const alerts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})

alerts.definition = {
    methods: ["get","head"],
    url: '/resident/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
alerts.url = (options?: RouteQueryOptions) => {
    return alerts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
alerts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
alerts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: alerts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
    const alertsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: alerts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
        alertsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alerts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::alerts
 * @see app/Http/Controllers/ResidentController.php:94
 * @route '/resident/alerts'
 */
        alertsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alerts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    alerts.form = alertsForm
/**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
export const evacuationCenters = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationCenters.url(options),
    method: 'get',
})

evacuationCenters.definition = {
    methods: ["get","head"],
    url: '/resident/evacuation-centers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
evacuationCenters.url = (options?: RouteQueryOptions) => {
    return evacuationCenters.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
evacuationCenters.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationCenters.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
evacuationCenters.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evacuationCenters.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
    const evacuationCentersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: evacuationCenters.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
 */
        evacuationCentersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationCenters.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::evacuationCenters
 * @see app/Http/Controllers/ResidentController.php:103
 * @route '/resident/evacuation-centers'
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
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
export const map = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: map.url(options),
    method: 'get',
})

map.definition = {
    methods: ["get","head"],
    url: '/resident/map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
map.url = (options?: RouteQueryOptions) => {
    return map.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
map.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: map.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
map.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: map.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
    const mapForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: map.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
        mapForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: map.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::map
 * @see app/Http/Controllers/ResidentController.php:112
 * @route '/resident/map'
 */
        mapForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: map.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    map.form = mapForm
/**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
export const evacuationAr = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationAr.url(options),
    method: 'get',
})

evacuationAr.definition = {
    methods: ["get","head"],
    url: '/resident/evacuation-ar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
evacuationAr.url = (options?: RouteQueryOptions) => {
    return evacuationAr.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
evacuationAr.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evacuationAr.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
evacuationAr.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evacuationAr.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
    const evacuationArForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: evacuationAr.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
        evacuationArForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationAr.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::evacuationAr
 * @see app/Http/Controllers/ResidentController.php:130
 * @route '/resident/evacuation-ar'
 */
        evacuationArForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evacuationAr.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    evacuationAr.form = evacuationArForm
/**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
export const disasterInfo = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInfo.url(options),
    method: 'get',
})

disasterInfo.definition = {
    methods: ["get","head"],
    url: '/resident/disaster-info',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
disasterInfo.url = (options?: RouteQueryOptions) => {
    return disasterInfo.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
disasterInfo.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: disasterInfo.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
disasterInfo.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: disasterInfo.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
    const disasterInfoForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: disasterInfo.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
        disasterInfoForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInfo.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ResidentController::disasterInfo
 * @see app/Http/Controllers/ResidentController.php:147
 * @route '/resident/disaster-info'
 */
        disasterInfoForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: disasterInfo.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    disasterInfo.form = disasterInfoForm
/**
* @see \App\Http\Controllers\ResidentController::updateHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:223
 * @route '/resident/household/members/{member}'
 */
export const updateHouseholdMember = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateHouseholdMember.url(args, options),
    method: 'put',
})

updateHouseholdMember.definition = {
    methods: ["put"],
    url: '/resident/household/members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ResidentController::updateHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:223
 * @route '/resident/household/members/{member}'
 */
updateHouseholdMember.url = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateHouseholdMember.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::updateHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:223
 * @route '/resident/household/members/{member}'
 */
updateHouseholdMember.put = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateHouseholdMember.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ResidentController::updateHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:223
 * @route '/resident/household/members/{member}'
 */
    const updateHouseholdMemberForm = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateHouseholdMember.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ResidentController::updateHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:223
 * @route '/resident/household/members/{member}'
 */
        updateHouseholdMemberForm.put = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateHouseholdMember.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateHouseholdMember.form = updateHouseholdMemberForm
/**
* @see \App\Http\Controllers\ResidentController::destroyHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:250
 * @route '/resident/household/members/{member}'
 */
export const destroyHouseholdMember = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHouseholdMember.url(args, options),
    method: 'delete',
})

destroyHouseholdMember.definition = {
    methods: ["delete"],
    url: '/resident/household/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ResidentController::destroyHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:250
 * @route '/resident/household/members/{member}'
 */
destroyHouseholdMember.url = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyHouseholdMember.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResidentController::destroyHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:250
 * @route '/resident/household/members/{member}'
 */
destroyHouseholdMember.delete = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHouseholdMember.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ResidentController::destroyHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:250
 * @route '/resident/household/members/{member}'
 */
    const destroyHouseholdMemberForm = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyHouseholdMember.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ResidentController::destroyHouseholdMember
 * @see app/Http/Controllers/ResidentController.php:250
 * @route '/resident/household/members/{member}'
 */
        destroyHouseholdMemberForm.delete = (args: { member: number | { id: number } } | [member: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyHouseholdMember.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyHouseholdMember.form = destroyHouseholdMemberForm
const ResidentController = { dashboard, profile, updateProfile, household, storeHouseholdMember, qrCode, alerts, evacuationCenters, map, evacuationAr, disasterInfo, updateHouseholdMember, destroyHouseholdMember }

export default ResidentController