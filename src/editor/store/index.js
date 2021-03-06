import Vuex from 'vuex'
import Vue from 'vue'

// Load modules
import main from './modules/main'
import devices from './modules/devices'
import panels from './modules/panels'
import elements from './modules/elements'
import history from './modules/history'
import pageContent from './modules/pageContent'
import dataSets from './modules/dataSets'
import interactions from './modules/interactions'
import classes from './modules/classes'
import errors from './modules/errors'
import help from './modules/help'
import schemas from './modules/schemas'
import templates from './modules/templates'
import Library from './modules/library'

// Load modules from admin
import options from '@/admin/admin-page/store/modules/options'
Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		main,
		devices,
		panels,
		history,
		elements,
		pageContent,
		dataSets,
		interactions,
		options,
		classes,
		errors,
		help,
		schemas,
		templates,
		Library
	},
	strict: debug
})
