export default class {
	constructor (permissions) {
		this.permissions = permissions
	}

	currentUserCan (permission) {
		return this.permissions.includes(permission)
	}

	addPermission (permission) {
		if (!this.permissions.includes(permission)) {
			this.permissions.push(permission)
		}
	}
}
