import { Elements, ElementCategories } from '@zb/models/Elements'

export const initElements = () => {
	return new Elements(window.ZnPbInitalData.elements_data)
}

export const initElementCategories = () => {
	return new ElementCategories(window.ZnPbInitalData.elements_categories)
}