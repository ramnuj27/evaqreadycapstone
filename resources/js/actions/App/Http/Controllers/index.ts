import Auth from './Auth'
import ResidentController from './ResidentController'
import DashboardController from './DashboardController'
import OperatorScanController from './OperatorScanController'
import AlertBroadcastController from './AlertBroadcastController'
import UserController from './UserController'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
ResidentController: Object.assign(ResidentController, ResidentController),
DashboardController: Object.assign(DashboardController, DashboardController),
OperatorScanController: Object.assign(OperatorScanController, OperatorScanController),
AlertBroadcastController: Object.assign(AlertBroadcastController, AlertBroadcastController),
UserController: Object.assign(UserController, UserController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers