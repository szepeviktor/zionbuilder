import ZionService from './ZionService'

export const getTemplates = function () {
	return ZionService.get('templates')
}

export const addTemplate = function (template) {
	if (!window.ZionBuilderApi.permissions.currentUserCan('save_templates')) {
		// eslint-disable-next-line
		return Promise.reject('You do not have permissions to perform this action')
	}

	return ZionService.post('templates', template)
}

export const exportTemplate = function (template) {
	if (!window.ZionBuilderApi.permissions.currentUserCan('export_templates')) {
		// eslint-disable-next-line
		return Promise.reject('You do not have permissions to perform this action')
	}

	return ZionService.post('templates/export', template, {
		responseType: 'arraybuffer'
	})
}

export const insertTemplate = function (template) {
	return ZionService.post('templates/insert', template)
}
export const deleteTemplate = function (id) {
	return ZionService.delete(`templates/${id}`)
}

export const exportTemplateById = function (id) {
	return ZionService.get(`templates/${id}/export`, {
		responseType: 'arraybuffer'
	})
}

export const importTemplateLibrary = function (templateFile) {
	if (!window.ZionBuilderApi.permissions.currentUserCan('save_templates')) {
		// eslint-disable-next-line
		return Promise.reject('You do not have permissions to perform this action')
	}

	return ZionService.post(
		'templates/import',
		templateFile,
		{
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}
	)
}
