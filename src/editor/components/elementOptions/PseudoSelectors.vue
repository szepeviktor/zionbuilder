<template>
	<div
		class="znpb-element-options__media-class-pseudo-holder"
		@click="selectorIsOpen = !selectorIsOpen, contentOpen = false"
	>
		<span class="znpb-element-options__media-class-pseudo-name">
			{{ activePseudoSelector.name  }}
		</span>

		<Tooltip
			v-if="hasContent"
			:trigger="null"
			:show="showContentTooltip"
			:content="$translate('add_pseudo_content')"
			placement="top"
		>
			<BaseIcon
				icon="edit"
				:size="12"
				class="znpb-pseudo-selector__edit"
				@click.native.stop="contentOpen=!contentOpen, selectorIsOpen=false"
			/>
		</Tooltip>
		<Tooltip
			:show-arrows="false"
			:show="selectorIsOpen"
			:trigger="null"
			append-to="element"
			placement="bottom-end"
			tooltipClass="hg-popper--no-padding znpb-element-options__media-class-pseudo-selector-dropdown"
		>
			<div
				slot="content"
				class="znpb-element-options__media-class-pseudo-selector-list hg-popper-list"
			>
				<PseudoDropdownItem
					v-for="(selectorConfig, index) in pseudoSelectors"
					:selector="selectorConfig"
					:selectors-model="activePseudoSelectors"
					:key="index"
					:clearable="selectorConfig.canBeDeleted"
					@remove-styles="deleteConfigForPseudoSelector"
					@selector-selected="onPseudoSelectorSelected"
					@delete-selector="deleteNewSelector(selectorConfig)"
					class="hg-popper-list__item"
				/>
			</div>

			<div
				class="znpb-element-options__media-class-pseudo-title"
				:class="{'znpb-element-options__media-class-pseudo-title--has-edit' : activePseudoSelector.id===':before' || activePseudoSelector.id===':after' }"
			>
				<BaseIcon
					icon="select"
					:rotate="selectorIsOpen ? 180 : null"
				/>

			</div>
		</Tooltip>
		<div
			class="znpb-element-options__media-class-pseudo-title__before-after-content"
			v-if="contentOpen"
			@click.stop=""
		>
			<BaseInput
				v-model="pseudoContentModel"
				:clearable="true"
				ref="pseudoContentInput"
				@keypress.native.enter="contentOpen = false"
				:placeholder="`Insert text ${activePseudoSelector.id} content`"
			/>
		</div>
		<div
			class="znpb-element-options__media-class-pseudo-title__before-after-content"
			v-if="newPseudoName"
			@click.stop=""
		>
			<BaseInput
				v-model="newPseudoModel"
				:clearable="true"
				ref="newpseudoInput"
				@keypress.native.enter="createNewPseudoSelector"
				:placeholder="$translate('new_pseudo')"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import PseudoDropdownItem from './PseudoDropdownItem.vue'
import { BaseInput } from '@/common/components/forms'
import { Tooltip } from '@/common/components/tooltip'
import { updateOptionValue } from '@/utils/updateOptionValue.js'
export default {
	name: 'PseudoSelectors',
	components: {
		PseudoDropdownItem,
		BaseInput,
		Tooltip
	},
	props: {
		value: {
			type: [Object, Array],
			required: false
		}
	},
	computed: {
		...mapGetters([
			'getActivePseudoSelector',
			'getPseudoSelectors',
			'getActiveDevice',
			'isPro'
		]),

		pseudoSelectors () {
			return this.getPseudoSelectors.map((selectorConfig) => {
				const returnedSelector = {
					...selectorConfig,
					active: true
				}

				if (!['default', ':hover'].includes(selectorConfig.id) && !this.isPro) {
					returnedSelector.active = false
					returnedSelector.label = {
						text: this.$translate('pro'),
						type: 'warning'
					}
				}

				return returnedSelector
			})
		},

		hasContent () {
			return this.activePseudoSelector.id === ':before' || this.activePseudoSelector.id === ':after'
		},

		activePseudoSelector () {
			return this.getActivePseudoSelector
		},

		activePseudoSelectors () {
			return ((this.value || {}) || {})[this.getActiveDevice.id] || {}
		},

		activePseudoSelectorModel () {
			return null
		},

		pseudoStyles () {
			return (this.activePseudoSelectors || {})[this.activePseudoSelector.id] || {}
		},

		pseudoContentModel: {
			get () {
				return this.pseudoStyles.content || ''
			},
			set (newValue) {
				const newValues = updateOptionValue(this.value, `${this.getActiveDevice.id}.${this.activePseudoSelector.id}.content`, newValue)
				this.$emit('input', newValues)
			}
		},
		newPseudoModel: {
			get () {
				return this.customPseudoName
			},
			set (newVal) {
				this.customPseudoName = newVal.split(' ').join('').toLowerCase()
			}
		}
	},
	data () {
		return {
			contentOpen: false,
			selectorIsOpen: false,
			showContentTooltip: false,
			newPseudoName: false,
			customPseudoName: ''
		}
	},
	created () {
		this.setActivePseudoSelector(null)
	},
	watch: {
		hasContent: function (newValue) {
			if (newValue) {
				this.showContentTooltip = true
				setTimeout(() => {
					this.showContentTooltip = false
				}, 2000)
			}
		},
		selectorIsOpen: function (newValue, oldValue) {
			if (newValue) {
				document.addEventListener('click', this.closePanel)
			} else {
				document.removeEventListener('click', this.closePanel)
			}
		},
		contentOpen: function (newValue, oldValue) {
			if (newValue) {
				this.$nextTick(() => this.$refs.pseudoContentInput.focus())
				document.addEventListener('click', this.closePanel)
			} else {
				this.$refs.pseudoContentInput.blur()
				document.removeEventListener('click', this.closePanel)
			}
		},
		newPseudoName: function (newValue, oldValue) {
			if (newValue) {
				this.$nextTick(() => this.$refs.newpseudoInput.focus())
				document.addEventListener('click', this.closePanel)
			} else {
				this.$refs.newpseudoInput.blur()
				document.removeEventListener('click', this.closePanel)
			}
		}
	},

	methods: {
		...mapActions([
			'setActivePseudoSelector',
			'setNewSelector',
			'deleteNewSelector'
		]),
		/**
		 * emit the change of the pseudoselector
		 */
		async onPseudoSelectorSelected (pseudoConfig) {
			this.selectorIsOpen = false

			await this.setActivePseudoSelector(pseudoConfig)
			if (this.activePseudoSelector.id === 'custom') {
				this.newPseudoName = true
			}
			if (this.pseudoContentModel === '' && (this.getActivePseudoSelector.id === 'before' || this.getActivePseudoSelector.id === 'after')) {
				this.showContentTooltip = false
				this.contentOpen = true
			}
		},
		createNewPseudoSelector () {
			this.newPseudoName = false

			let newSel = {
				id: this.customPseudoName,
				name: this.customPseudoName,
				canBeDeleted: true
			}

			this.setNewSelector(newSel)
			this.setActivePseudoSelector(newSel)
		},
		/**
		 * Close input if clicked outside of selector
		 */
		closePanel (event) {
			if (!this.$el.contains(event.target)) {
				this.contentOpen = false
				this.selectorIsOpen = false
				this.newPseudoName = false
			}
		},
		deleteConfigForPseudoSelector (pseudoSelectorId) {
			const newValues = {
				...this.value,
				[this.getActiveDevice.id]: {
					...this.value[this.getActiveDevice.id]
				}
			}
			delete newValues[this.getActiveDevice.id][pseudoSelectorId]

			// Check if there are any remaining styles for this responsive device
			if (Object.keys((newValues[this.getActiveDevice.id]) || {}).length === 0) {
				delete newValues[this.getActiveDevice.id]
			}

			this.$emit('input', newValues)
		}

	},
	beforeDestroy () {
		document.removeEventListener('click', this.closePanel)
	}
}
</script>

<style lang="scss">
.znpb-pseudo-selector {
	&__edit {
		padding: 11px 8px;
	}
}
.znpb-element-options__media-class-pseudo-name {
	padding-left: 10px;
	font-size: 13px;
	font-weight: 500;
}
.znpb-element-options__media-class-pseudo {
	&-holder {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 4;
		color: darken($font-color, 10%);
		border: 2px solid #e5e5e5;
		border-radius: 3px;
		cursor: pointer;
	}

	&-title {
		display: flex;
		color: $font-color;
		border-left: 2px solid #e5e5e5;
		cursor: pointer;

		.znpb-editor-icon-wrapper {
			padding: 11px;
		}
		&--has-edit {
			// margin-right: 5px;
		}

		&__before-after-content {
			position: absolute;
			top: 110%;
			left: 0;
			z-index: 20000;
			width: 100%;
			padding: 15px;
			color: $surface-headings-color;
			background-color: #fff;
			box-shadow: 0 2px 15px 0 rgba(0, 0, 0, .1);
			border: 1px solid #f1f1f1;
			border-radius: 4px;
			input::placeholder {
				color: $surface-headings-color;
			}
		}
	}

	&-selector-dropdown {
		min-width: 130px;
	}

	&-selector-list {
		display: flex;
		flex-direction: column;
	}
}
</style>
