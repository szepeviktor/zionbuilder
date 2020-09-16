
import { InjectionComponentsManager } from '@/common/components/injections'
import { Tooltip } from '@/common/components/tooltip'
import { BaseInput } from '@/common/components/forms/elements/input'
import BaseIcon from '@/common/components/BaseIcon.vue'
// Components
import IconPackGrid from '@/common/components/IconPackGrid.vue'
import ModalTemplateSaveButton from './components/ModalTemplateSaveButton'

const ZionBuilderApiComponents = {
	components: {
		ModalTemplateSaveButton,
		IconPackGrid,
		Tooltip,
		BaseInput,
		BaseIcon
	},
	// Injections Manager
	Injections: new InjectionComponentsManager()
}

window.ZionBuilderApiComponents = ZionBuilderApiComponents
export default ZionBuilderApiComponents
