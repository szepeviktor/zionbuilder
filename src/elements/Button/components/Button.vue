<template>
	<div :class="{
			[`zb-el-zionButton--${options.button_position}`]: options.button_position
		}">
		<slot name="start" />

		<RenderTag
			tag-id="button"
		>
			<component
				:is="getTag"
				v-bind="getButtonAttributes"
				ref="button"
				class="zb-el-button"
				:class="api.getStyleClasses('button_styles', {
					['zb-el-button--has-icon']: options.icon
				})"
			>
				<ElementIcon
					v-if="options.icon"
					class="zb-el-button__icon"
					:class="api.getStyleClasses('icon_styles')"
					:iconConfig="iconConfig"
				/>

				<span
					v-if="options.button_text"
					class="zb-el-button__text"
				>
					{{options.button_text}}
				</span>
			</component>
		</RenderTag>
		<slot name="end" />
	</div>
</template>

<script>
export default {
	name: 'zion_button',
	props: ['options', 'data', 'api'],
	computed: {
		iconConfig () {
			return this.options.icon
		},
		getTag () {
			// Check if has link else span
			return this.options.link && this.options.link.link ? 'a' : 'div'
		},
		getButtonAttributes () {
			const attrs = {}
			// Link
			if (this.options.link && this.options.link.link) {
				attrs.href = this.options.link.link
				attrs.target = this.options.link.target
				attrs.title = this.options.link.title
			}
			return attrs
		}
	}
}
</script>
