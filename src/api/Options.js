import ZionService from './ZionService'

export const saveOptions = function (options) {
	if (window.ZionBuilderApi && window.ZionBuilderApi.permissions && !window.ZionBuilderApi.permissions.currentUserCan('save_options')) {
		// eslint-disable-next-line
		return Promise.resolve()
	}

	return ZionService.post('options', options)
}

export const getSavedOptions = function (options) {
	return ZionService.get('options')
}
