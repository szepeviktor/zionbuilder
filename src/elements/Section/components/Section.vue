<template>
	<component
		class="zb-section"
		:is="htmlTag"
	>
		<slot name="start" />

		<SvgMask
			v-if="topMask!==undefined && topMask.shape"
			:shapePath="topMask['shape']"
			:color="topMask['color']"
			:height="topMask['height']"
			:flip="topMask['flip']"
			position="top"
		/>

		<SvgMask
			v-if="bottomMask!==undefined && bottomMask.shape"
			:shapePath="bottomMask['shape']"
			:color="bottomMask['color']"
			:height="bottomMask['height']"
			:flip="bottomMask['flip']"
			position="bottom"
		/>

		<RenderTag tag-id="inner_content">
			<SortableContent
				:content="data.content"
				:data="data"
				class="zb-section__innerWrapper"
			></SortableContent>
		</RenderTag>

		<slot name="end" />
	</component>
</template>

<script>
import SvgMask from '@/common/components/forms/elements/shape-dividers/SvgMask.vue'
export default {
	name: 'zion_section',
	props: ['options', 'data', 'api'],
	components: {
		SvgMask
	},
	computed: {
		topMask () {
			return this.shapes['top']
		},
		bottomMask () {
			return this.shapes['bottom']
		},
		htmlTag () {
			return this.options.tag || 'section'
		},
		shapes () {
			return this.options.shapes || {}
		}
	}
}

</script>
<style lang="scss">
</style>
