<template>
	<div class="znpb-element-form__wp_widget">
		<div
			v-if="loading"
			class="znpb-element-form__wp_widget-loading"
		>
			<!-- {{$translate('loading')}} -->
		</div>

		<form
			v-else
			v-html="optionsFormContent"
			ref="form"
		>

		</form>
	</div>
</template>

<script>
import { getOptionsForm } from '@/api/Elements'
import { mapGetters } from 'vuex'
import { serialize } from 'dom-form-serializer'

export default {
	name: 'WPWidget',
	inject: {
		elementInfo: {
			default: null
		}
	},
	props: {
		value: {
			default () {
				return {}
			}
		},
		element_type: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			loading: true,
			optionsFormContent: ''
		}
	},
	computed: {
		...mapGetters([
			'getElementData'
		])
	},
	methods: {
		onInputChange (event) {
			const widgetId = `widget-${this.element_type}`
			const formData = serialize(this.$refs.form)

			this.$emit('input', formData[widgetId]['ZION_BUILDER_PLACEHOLDER_ID'])
		}
	},
	created () {
		// Get the options form from server
		const elementData = this.getElementData(this.elementInfo.data.uid)
		getOptionsForm(elementData).then((response) => {
			this.optionsFormContent = response.data.form
			this.loading = false

			const wp = window.wp
			const jQuery = window.jQuery

			this.$nextTick(() => {
				if (wp.textWidgets) {
					let widgetContainer = jQuery(this.$refs.form)
					const event = new jQuery.Event('widget-added')

					widgetContainer.addClass('open')
					wp.textWidgets.handleWidgetAdded(event, widgetContainer)
					wp.mediaWidgets.handleWidgetAdded(event, widgetContainer)

					// // WP >= 4.9
					if (wp.customHtmlWidgets) {
						wp.customHtmlWidgets.handleWidgetAdded(event, widgetContainer)
					}

					// Setup event listeners
					jQuery(':input', jQuery(this.$refs.form)).on('input', this.onInputChange)
					jQuery(':input', jQuery(this.$refs.form)).on('change', this.onInputChange)
				}
			})
		})
	}
}
</script>

<style lang="scss">
.znpb-element-form__wp_widget-loading {
	position: relative;
	width: 24px;
	height: 24px;
	margin: 0 auto;
	text-align: center;
	transition: none;
	&:before, &:after {
		@extend %loading;
		border: 2px solid $surface-variant;
	}
	&:after {
		border-right-color: lighten($surface-headings-color, 5%);
		animation: Rotate .6s linear infinite;
	}
}
.znpb-element-form__wp_widget {
	.widget-content {
		p {
			margin-bottom: 15px;
		}
	}
}
.widget-content {
	input[type=text], input[type=number], select {
		width: 100%;
		height: auto;
		height: 42px;
		padding: 13px;
		margin: 0;
		color: $font-color;
		font-family: $font-stack;
		font-size: 13px;
		line-height: 1;
		background-color: #f1f1f1;
		background-image: none;
		box-shadow: none;
		border: 0;
		border-radius: 3px;

		-webkit-appearance: none;
	}
	label {
		padding: 15px 15px 15px 0;
		color: $surface-headings-color;
		font-family: $font-stack;
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
	}
}
.text-widget-fields {
	input[type=text], input[type=number], select {
		width: 100%;
		height: auto;
		height: 42px;
		padding: 13px;
		margin: 0;
		color: $font-color;
		font-family: $font-stack;
		font-size: 13px;
		line-height: 1;
		background-color: #f1f1f1;
		background-image: none;
		box-shadow: none;
		border: 0;
		border-radius: 3px;

		-webkit-appearance: none;
	}
	label {
		padding: 15px 15px 15px 0;
		color: $surface-headings-color;
		font-family: $font-stack;
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
	}
	.button {
		margin: 0;
		margin-bottom: 15px;
		font-family: $font-stack;
		font-size: 13px;
		text-decoration: none;
		text-transform: uppercase;
		border: none;

		-webkit-appearance: none;
		-moz-appearance: none;
	}
}
.media-widget-control {
	font-family: $font-stack;

	.button-add-media {
		font-family: $font-stack;
	}

	input[type=text], input[type=number], select {
		width: 100%;
		height: auto;
		height: 42px;
		padding: 13px;
		margin: 0;
		margin-bottom: 15px;
		color: $font-color;
		font-family: $font-stack;
		font-size: 13px;
		line-height: 1;
		background-color: #f1f1f1;
		background-image: none;
		box-shadow: none;
		border: 0;
		border-radius: 3px;

		-webkit-appearance: none;
	}
}
</style>
