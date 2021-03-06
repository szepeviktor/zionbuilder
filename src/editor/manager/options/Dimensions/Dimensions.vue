<template>
	<div class="znpb-dimensions-wrapper">
		<div
			v-for="(dimension, i) in computedDimensions"
			:key="i"
			class="znpb-dimension"
			:class="`znpb-dimension--${i}`"
		>
			<div
				class="znpb-dimensions_icon"
				v-if="dimension.name !== 'link'"
			>
				<BaseIcon :icon="dimension.icon"></BaseIcon>
			</div>
			<InputNumberUnit
				v-if="dimension.name !== 'link'"
				:value="valueModel[dimension.id] || null"
				@input="onValueUpdated(dimension.id, $event)"
				:title="dimension.id"
				@linked-value="handleLinkValues"
				:min="min"
				:max="max"
				:units="['px', 'rem', 'pt', 'vh', '%']"
				:step="1"
				default-unit="px"
			/>
			<div
				class="znpb-dimensions__center"
				v-if="dimension.name === 'link'"
			>
				<BaseIcon
					:icon="linked ? 'link' : 'unlink'"
					:title="linked ? 'Unlink' : 'Link'"
					class="znpb-dimensions__link"
					:class="{['znpb-dimensions__link--linked']: linked}"
					@click.native="handleLinkValues"
				></BaseIcon>
			</div>
		</div>

	</div>
</template>
<script>
import InputNumberUnit from '@/common/components/forms/elements/InputNumber/InputNumberUnit'
export default {
	name: 'Dimensions',
	props: {
		/**
		 * v-model/value for border radius
		 */
		value: {
			default () {
				return {}
			},
			type: Object,
			required: false
		},
		dimensions: {
			type: Array,
			required: true
		},
		min: {
			type: Number
		},
		max: {
			type: Number
		}
	},
	components: {
		InputNumberUnit
	},
	data () {
		return {
			linked: false
		}
	},

	computed: {
		valueModel () {
			return this.value || {}
		},
		computedDimensions () {
			return [
				...this.dimensions,
				{
					'name': 'link',
					'id': 'link'
				}
			]
		}
	},
	methods: {
		handleLinkValues () {
			this.linked = !this.linked
		},
		onValueUpdated (position, newValue) {
			/**
			 * emits new object with new value of borders
			 */
			if (this.linked) {
				const valuesToUpdate = this.dimensions.filter(dimension => {
					return dimension.id !== 'link'
				})
				let values = {}
				valuesToUpdate.forEach(value => {
					values[value.id] = newValue
				})
				this.$emit('input', {
					...this.valueModel,
					...values
				})
			} else {
				this.$emit('input', {
					...this.valueModel,
					[position]: newValue
				})
			}
		}
	}
}
</script>
<style lang="scss">
.znpb-dimensions-wrapper {
	display: grid;

	grid-template-areas: "a b c"
	"d b e";
	.znpb-dimensions__link {
		color: $font-color;
		background-color: $surface-variant;
	}
	.znpb-dimensions__link.znpb-dimensions__link--linked {
		color: $surface;
		background-color: $secondary;
	}
}
.znpb-dimensions__center {
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 2;
	.znpb-editor-icon-wrapper {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 40px;
		height: 40px;
		border-radius: 3px;
		cursor: pointer;
	}
}

.znpb-dimensions-wrapper > .znpb-tabs__content {
	padding-top: 15px;
}
.znpb-dimension {
	display: flex;
	align-items: center;
	margin: 0 0 10px;
	&--0 {
		.znpb-dimensions_icon {
			margin-right: 10px;
		}
	}
	&--1 {
		flex-direction: row-reverse;
		.znpb-dimensions_icon {
			margin-left: 10px;
		}
	}
	&--4 {
		margin: 10px;
		grid-area: b;

	}
	&--2 {
		.znpb-dimensions_icon {
			margin-right: 10px;
		}
	}
	&--3 {
		flex-direction: row-reverse;
		.znpb-dimensions_icon {
			margin-left: 10px;
		}
	}
}
</style>
