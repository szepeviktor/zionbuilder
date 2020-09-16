import L10n from './L10n'
import routes from './router'
import store from './store'
import { addFilter, applyFilters } from '@/utils/filters'
import { InjectionComponentsManager } from '@/common/components/injections'
import { Tooltip } from '@/common/components/tooltip'
import { BaseInput } from '@/common/components/forms/elements/input'
import BaseIcon from '@/common/components/BaseIcon.vue'
// Utils
import * as utils from '@/utils'
import { errorInterceptor } from '@/api/ServiceInterceptor'

// Components
import IconPackGrid from '@/common/components/IconPackGrid.vue'
import ModalTemplateSaveButton from './components/ModalTemplateSaveButton'

const ZionBuilderApi = {
	L10n,
	routes,
	store,
	components: {
		ModalTemplateSaveButton,
		IconPackGrid,
		Tooltip,
		BaseInput,
		BaseIcon
	},
	utils,
	interceptors: {
		errorInterceptor
	},

	// Injections Manager
	Injections: new InjectionComponentsManager(),

	// Filters
	addFilter,
	applyFilters
}

window.ZionBuilderApi = ZionBuilderApi
export default ZionBuilderApi
