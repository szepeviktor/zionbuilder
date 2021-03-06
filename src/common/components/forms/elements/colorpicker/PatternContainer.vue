<template>
	<LibraryElement :has-input="showPresetInput">
		<div v-if="!showPresetInput">
			<Tabs
				tab-style="minimal"
				:active-tab="activeTab"
			>
				<Tab name="Local">
					<GridColor @add-new-color="addLocalColor(model)">
						<span
							v-for="(color,i) in localColorPatterns"
							v-bind:key="i"
							class="znpb-colorpicker-circle znpb-colorpicker-circle-color"
							:style="{ 'background-color': color }"
							@click="$emit('color-updated', color)"
						>
						</span>
					</GridColor>
				</Tab>

				<Tab name="Global">
					<div
						class="znpb-colorpicker-global-wrapper--pro"
						v-if="!isPro"
					>
						Global colors are available in
						<Label
							text="PRO"
							type="pro"
						/>
					</div>
					<GridColor
						@add-new-color="showPresetInput=!showPresetInput"
						v-else
					>
						<span
							v-for="(colorConfig,i) in globalColorPatterns"
							v-bind:key="i"
							class="znpb-colorpicker-circle znpb-colorpicker-circle-color"
							:style="{backgroundColor: colorConfig.id===selectedGlobalColor ? null : colorConfig.color}"
							@click="onGlobalColorSelected(colorConfig)"
							:class="{'znpb-colorpicker-circle--active': colorConfig.id===selectedGlobalColor}"
						>
							<span
								v-if="colorConfig.id===selectedGlobalColor"
								class="znpb-colorpicker-circle__active-bg"
							>
								<span :style="{ 'background-color': colorConfig.color }">
								</span>
							</span>

						</span>
					</GridColor>
				</Tab>
			</Tabs>
		</div>
		<PresetInput
			v-if="showPresetInput"
			@save-preset="addGlobal($event)"
			@cancel="showPresetInput=false"
		/>
	</LibraryElement>
</template>
<script>
/**
 * it emits:
 *  - the new color chosen
 */
import { mapGetters, mapActions } from 'vuex'
import GridColor from '@/common/components/colorpicker/GridColor.vue'
import LibraryElement from '@/common/components/gradient/LibraryElement.vue'
import PresetInput from './PresetInput.vue'
import Label from '@/editor/common/Label'

export default {
	name: 'PatternContainer',
	components: {
		GridColor,
		LibraryElement,
		PresetInput,
		Label
	},
	inject: ['inputWrapper', 'optionsForm'],
	props: {
		model: {
			type: [String, Object],
			required: false,
			default () {
				return '#000'
			}
		}
	},
	data () {
		return {
			showPresetInput: false,
			presetName: this.$translate('add_preset_title'),
			onstart: true,
			expand: false
		}
	},
	computed: {
		...mapGetters([
			'getOptionValue',
			'isPro'
		]),
		selectedGlobalColor () {
			const { id } = this.inputWrapper.schema
			const { options = {} } = this.optionsForm.getValueByPath(`__dynamic_content__.${id}`, {})

			return options.color_id
		},

		activeTab () {
			return this.selectedGlobalColor ? 'global' : 'local'
		},
		localColorPatterns () {
			return [...this.getOptionValue('local_colors')].reverse()
		},
		globalColorPatterns () {
			return [...this.getOptionValue('global_colors')].reverse()
		}

	},
	methods: {
		...mapActions([
			'addLocalColor',
			'addGlobalColor'
		]),

		addGlobal (name) {
			let globalColor = {
				id: name.split(' ').join('_'),
				color: this.model,
				name: name
			}
			this.showPresetInput = false
			this.addGlobalColor(globalColor)
		},
		onGlobalColorSelected (colorConfig) {
			const { id } = this.inputWrapper.schema

			this.optionsForm.updateValueByPath(`__dynamic_content__.${id}`, {
				type: 'global-color',
				options: {
					color_id: colorConfig.id
				}
			})
		}

	}

}
</script>
<style lang="scss">
.znpb-colorpicker-circle {
	&__active-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 18px;
		height: 18px;
		background-color: rgba(50, 193, 121, 0);
		border-color: rgb(0, 0, 0, .1);
		border-style: solid;
		border-width: 1px;
		border-radius: 2px;
		& > span {
			position: absolute;
			top: 2px;
			left: 2px;
			width: 24px;
			height: 24px;
			border-radius: 50%;
		}
	}
	&.znpb-colorpicker-circle--active {
		position: relative;
	}
}

.znpb-colorpicker-global-wrapper--pro {
	padding: 10px;
	text-align: center;
}
</style>
