<template>
	<component
		:is="htmlTag"
		class="znpb-injection-component"
	>
		<component
			v-for="(customComponent, i) in getComponents"
			:key="i"
			:is="customComponent"
		/>
	</component>
</template>

<script>
export default {
	name: 'Injection',
	props: {
		location: {
			type: String,
			required: true
		},
		htmlTag: {
			type: String,
			required: false,
			default: 'div'
		}
	},
	computed: {
		getComponents () {
			return window.ZionBuilderApi.Injections.getComponentsForLocation(this.location)
		}
	},
	methods: {
		/**
		 * Returns the list of components to load for the requested position
		 */
		getComponent () {

		}
	}
}
</script>

<style>
.znpb-injection-component {
	display: flex;
}
</style>
