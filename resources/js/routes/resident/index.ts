import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import profile937a89 from './profile'
import household631ebc from './household'
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
const resident = {
    dashboard: Object.assign(dashboard, dashboard),
profile: Object.assign(profile, profile937a89),
household: Object.assign(household, household631ebc),
qrCode: Object.assign(qrCode, qrCode),
alerts: Object.assign(alerts, alerts),
evacuationCenters: Object.assign(evacuationCenters, evacuationCenters),
map: Object.assign(map, map),
evacuationAr: Object.assign(evacuationAr, evacuationAr),
disasterInfo: Object.assign(disasterInfo, disasterInfo),
}

export default resident