<template>
	<div class="znpb-input-border-tabs-wrapper">
		<Tabs
			tab-style="group"
			class="znpb-input-border-tabs"
		>
			<Tab
				:name="tab.name"
				v-for="(tab, index) in positions"
				:key='index'
				class="znpb-input-border-tabs__tab"
			>
				<div slot="title">
					<BaseIcon :icon="tab.icon"></BaseIcon>
				</div>

				<InputBorderControl
					:value="valueModel[tab.id] || {}"
					@input="onValueUpdated(tab.id, $event)"
				></InputBorderControl>
			</Tab>
		</Tabs>
	</div>
</template>
<script>
import InputBorderControl from './InputBorderControl'
export default {
	name: 'InputBorderTabs',
	props: {
		/**
		 * v-model/value for borders
		 */
		value: {
			default () {
				return {}
			},
			type: Object,
			required: false
		}
	},
	components: {
		InputBorderControl
	},
	data () {
		return {
			positions: {
				all: {
					name: 'all',
					icon: 'all-sides',
					id: 'all'
				},
				top: {
					name: 'Top',
					icon: 'border-top',
					id: 'top'
				},
				right: {
					name: 'right',
					icon: 'border-right',
					id: 'right'
				},
				bottom: {
					name: 'bottom',
					icon: 'border-bottom',
					id: 'bottom'
				},
				left: {
					name: 'left',
					icon: 'border-left',
					id: 'left'
				}
			}
		}
	},
	computed: {
		valueModel () {
			return this.value || {}
		}
	},
	methods: {
		onValueUpdated (position, newValue) {
			/**
			 * emits new object with new value of borders
			 */
			this.$emit('input', {
				...this.valueModel,
				[position]: newValue
			})
		}
	}
}
</script>
<style lang="scss">
.znpb-input-border-tabs-wrapper {

	.znpb-options-form-wrapper {
		padding: 0;
		margin: 0 -5px;
	}
}

.znpb-input-border-tabs__tab {
	overflow: visible !important;
}
</style>
