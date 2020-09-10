import ZionService from './ZionService'

export const lockPage = function (id) {
	return ZionService.get(`pages/${id}/lock`)
}

export const savePage = function (pageData) {
	if (!window.ZionBuilderApi.permissions.currentUserCan('save_page')) {
		// eslint-disable-next-line
		return Promise.reject('You do not have permissions to perform this action')
	}

	return ZionService.post('save-page', pageData)
}
