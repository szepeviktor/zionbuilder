<template>
	<component :is="tag">
		<transition
			appear
			:name="transition"
			@after-leave="onTransitionLeave"
			@enter="onTransitionEnter"
			v-bind="popperProps"
		>
			<div
				class="hg-popper"
				:class="tooltipClass"
				v-if="visible"
				:style="getStyle"
				ref="popper"
			>
				{{ content }}
				<!-- @slot Content that will populate popper -->
				<slot name="content" />

				<span
					x-arrow
					v-if="showArrows"
					class="hg-popper--with-arrows"
				/>
			</div>
		</transition>

		<slot />
	</component>
</template>

<script>
import { getDefaultOptions } from './options.js'
import { merge } from 'lodash-es'
import Popper from 'popper.js'
import { debounce } from '@/utils/'
let preventOutsideClickPropagation = false

export default {
	inheritAttrs: false,
	name: 'Tooltip',
	props: {
		tag: {
			default: 'div'
		},
		/**
		 * The content that will be placed inside tooltip
		 */
		content: {
			type: String,
			required: false,
			default: null
		},
		/**
		 * If the tooltip will be visible by default
		 */
		show: {
			type: Boolean,
			required: false,
			default: false
		},
		/**
		 * If the tooltip will be visible when you hover the element
		 */
		showOnMouseEnter: {
			type: Boolean,
			required: false,
			default: true
		},
		/**
		 * Time in miliseconds until the tooltip is visible
		 */
		openDelay: {
			type: Number,
			required: false,
			default: 10
		},
		/**
		 * Time in miliseconds until the tooltip is closed after the mouse leaves the tooltip trigger
		 */
		closeDelay: {
			type: Number,
			required: false,
			default: 10
		},
		/**
		 * If the tooltip should remain active if the user enters it's container
		 */
		enterable: {
			type: Boolean,
			required: false,
			default: true
		},
		/**
		 * Time in miliseconds until the tooltip is auto hidden
		 */
		hideAfter: {
			type: Number,
			required: false,
			default: null
		},
		/**
		 * Show tooltip arrows or not
		 */
		showArrows: {
			type: Boolean,
			required: false,
			default: true
		},
		/**
		 * Append to specific element. This uses document.querySelector. By default, the tooltip will be appended to the first child
		 */
		appendTo: {
			type: String,
			required: false
		},
		/**
		 * Popper trigger. Can be click, hover or even null if you want to manually controll the popper visibility
		 */
		trigger: {
			type: String,
			required: false,
			default: 'hover'
		},
		/**
		 * When clicked outside tooltip, it closes
		 */
		closeOnOutsideClick: {
			type: Boolean,
			required: false,
			default: false
		},
		/**
		 * tooltip closes on Esc key
		 */
		closeOnEscape: {
			type: Boolean,
			required: false,
			default: false
		},
		/**
		 * Popper refference
		 */
		popperRef: {
			type: Object,
			required: false,
			default () {
				return null
			}
		},
		/**
		 * Transition name
		 */
		transition: {
			type: String,
			required: false
		},
		/**
		 * Class for animation on enter
		 */
		enterActiveClass: {
			type: String,
			required: false,
			default: ''
		},
		/**
		 * Class for animation on leave
		 */
		leaveActiveClass: {
			type: String,
			required: false,
			default: ''
		},
		/**
		 * Custom Class
		 */
		tooltipClass: {
			type: String,
			required: false
		}
	},
	data () {
		return {
			visible: !!this.show,
			showTimeout: null,
			hideTimeout: null,
			hideAfterTimeout: null,
			zIndex: null
		}
	},
	watch: {
		hideAfter (newValue) {
			if (newValue) {
				this.onHideAfter()
			}
		},
		show (newValue, oldValue) {
			this.visible = !!newValue
		},
		visible (newValue, oldvalue) {
			if (!!newValue !== !!oldvalue) {
				if (newValue) {
					this.zIndex = window.ZionBuilderApi.utils.getZindex()
				} else {
					window.ZionBuilderApi.utils.removeZindex(this.zIndex)
				}
			}
		}
	},
	computed: {
		getStyle () {
			return {
				'z-index': this.zIndex
			}
		},
		popperProps () {
			const props = {}

			if (this.enterActiveClass) {
				props.enterActiveClass = this.enterActiveClass
			}

			if (this.leaveActiveClass) {
				props.enterActiveClass = this.leaveActiveClass
			}

			return props
		},
		popperOptions () {
			const options = JSON.parse(JSON.stringify(getDefaultOptions()))
			return merge(options, this.$attrs)
		},
		appendToOption () {
			const options = JSON.parse(JSON.stringify(getDefaultOptions()))
			return this.appendTo || options.appendTo
		}
	},
	methods: {
		preventOutsideClickPropagation () {
			preventOutsideClickPropagation = true
		},
		onTransitionEnter () {
			this.instantiatePopper()
			this.$emit('show')
			this.$emit('update:show', true)
		},
		onTransitionLeave () {
			this.destroyPopper()
			this.$emit('hide')
			this.$emit('update:show', false)
		},
		getAppendToElement () {
			if (!this.appendToOption || this.appendToOption === 'element') {
				return this.$el
			} else {
				// Get content document
				return this.ownerDocument.querySelector(this.appendToOption)
			}
		},
		showPopper () {
			this.visible = true
		},
		hidePopper () {
			this.visible = false
		},
		addPopperToDom () {
			if (this.popperElement && this.appendToOption !== 'element') {
				// Append to
				const appendElement = this.getAppendToElement()
				if (!appendElement) {
					// eslint-disable-next-line
					console.warn(`No HTMLElement was found matching ${appendElement}`)
					return
				}

				appendElement.appendChild(this.popperElement)
			}
		},
		removePopperFromDom () {
			if (this.popperElement && this.appendToOption !== 'element') {
				const appendToElement = this.getAppendToElement()
				appendToElement.removeChild(this.popperElement)
			}
		},
		destroyPopper (completeRemove) {
			if (this.visible && !completeRemove) {
				return
			}

			this.visible = false

			if (this.popperInstance) {
				this.popperInstance.destroy()
				this.popperInstance = null
			}

			this.removePopperEvents()

			if (completeRemove) {
				this.removePopperFromDom()
			}

			this.popperElement = null
			preventOutsideClickPropagation = false
		},
		instantiatePopper () {
			this.$nextTick(() => {
				this.popperElement = this.$refs.popper

				this.addPopperToDom()

				if (this.popperInstance && this.popperInstance.destroy) {
					this.popperInstance.destroy()
					this.popperInstance = null
				}

				const ref = this.popperRef || this.$el
				if (ref) {
					this.popperInstance = new Popper(ref, this.popperElement, this.popperOptions)
				}

				this.onHideAfter()
				this.addPopperEvents()
			})
		},
		onMouseEnter (event) {
			if (!this.showOnMouseEnter) {
				return
			}

			clearTimeout(this.timeout)
			this.timeout = setTimeout(() => {
				this.showPopper()
			}, this.openDelay)
		},
		onMouseLeave (event) {
			clearTimeout(this.timeout)
			this.timeout = setTimeout(() => {
				this.hidePopper()
			}, this.closeDelay)
		},
		onHideAfter () {
			if (this.hideAfter) {
				clearTimeout(this.timeout)
				this.timeout = setTimeout(() => {
					this.hidePopper()
				}, this.hideAfter)
			}
		},
		/**
		 * Will show the tooltip on click
		 *
		 * We use a debouncer so that multiple repetitive clicks are ignored
		 * It mainly fixes the problems that appear when the tooltip is wrapped
		 * inside a label
		 */
		onClick: debounce(function (event) {
			this.visible = !this.visible
		}, 10),
		onOutsideClick (event) {
			// Allow tooltip creators to prevent all clickoutside handlers
			setTimeout(() => {
				// Hide popper if clicked outside
				if (this.visible && !preventOutsideClickPropagation && !this.$el.contains(event.target) && this.popperElement && !this.popperElement.contains(event.target)) {
					this.hidePopper()
					preventOutsideClickPropagation = false
				}
			}, 0)
		},
		onKeyDown (event) {
			if (event.which === 27) {
				this.hidePopper()
				event.stopPropagation()
			}
		},
		scheduleUpdate () {
			if (this.popperInstance) {
				this.popperInstance.scheduleUpdate()
			}
		},
		addPopperEvents () {
			if (this.closeOnOutsideClick) {
				this.ownerDocument.addEventListener('click', this.onOutsideClick, true)
			}

			if (this.trigger === 'hover' && this.enterable && this.popperElement) {
				this.popperElement.addEventListener('mouseenter', this.onMouseEnter)
				this.popperElement.addEventListener('mouseleave', this.onMouseLeave)
			}

			// Attache close on escape
			if (this.closeOnEscape) {
				this.ownerDocument.addEventListener('keydown', this.onKeyDown)
			}
		},
		removePopperEvents () {
			this.ownerDocument.removeEventListener('click', this.onOutsideClick, true)

			if (this.trigger === 'hover' && this.enterable && this.popperElement) {
				this.popperElement.removeEventListener('mouseenter', this.onMouseEnter)
				this.popperElement.removeEventListener('mouseleave', this.onMouseLeave)
			}

			// Attache close on escape
			if (this.closeOnEscape) {
				this.ownerDocument.removeEventListener('keydown', this.onKeyDown)
			}
		}
	},
	destroyed () {
		// Remove event listeners
		this.$el.removeEventListener('mouseenter', this.onMouseEnter)
		this.$el.removeEventListener('mouseleave', this.onMouseLeave)
		this.$el.removeEventListener('click', this.onClick)
		this.ownerDocument.removeEventListener('click', this.onOutsideClick, true)
		this.ownerDocument.removeEventListener('keydown', this.onKeyDown)

		// Destroy popper instance
		this.destroyPopper(true)
		window.ZionBuilderApi.utils.removeZindex(this.zIndex)
	},
	mounted () {
		this.ownerDocument = this.$el.ownerDocument

		if (this.trigger === 'hover') {
			this.$el.addEventListener('mouseenter', this.onMouseEnter)
			this.$el.addEventListener('mouseleave', this.onMouseLeave)
		} else if (this.trigger === 'click') {
			this.$el.addEventListener('click', this.onClick)
		}

		if (this.show) {
			this.zIndex = window.ZionBuilderApi.utils.getZindex()
		}
	}
}
</script>

<style lang="scss">
.hg-popper {
	z-index: 9999;
	box-sizing: border-box;
	padding: 10px;
	color: #959596;
	font-family: $font-stack;
	font-size: 13px;
	font-weight: normal;
	background-color: #fff;
	box-shadow: 0 2px 15px 0 rgba(0, 0, 0, .1);
	border: 1px solid #f1f1f1;
	border-radius: 4px;

	& * {
		box-sizing: border-box;
	}

	&-list {
		padding: 6px 0;
		margin: 0;
		list-style-type: none;
		background: $surface;

		&__item {
			padding: 8px 16px;
			color: $font-color;
			font-weight: 500;
			text-align: left;
			cursor: pointer;

			&:hover {
				background-color: lighten($surface-variant, 2%);
			}
		}
	}

	&--with-arrows {
		position: absolute;
		z-index: -1;
		width: 8px;
		height: 8px;
		background: #fff;
		transform: rotate(45deg);
	}

	&[x-placement^="top"] {
		margin-bottom: 5px;
	}
	&[x-placement^="top"] &--with-arrows {
		bottom: -4px;
		left: 50%;
	}
	&[x-placement^="bottom"] {
		margin-top: 5px;
	}
	&[x-placement^="bottom"] &--with-arrows {
		top: -4px;
		left: 50%;
	}

	&[x-placement^="left"] {
		margin-right: 5px;
	}
	&[x-placement^="left"] &--with-arrows {
		top: 50%;
		right: -4px;
		margin-top: -5px;
	}

	&[x-placement^="right"] {
		margin-left: 5px;
	}
	&[x-placement^="right"] &--with-arrows {
		top: 50%;
		left: -4px;
		margin-top: -5px;
	}

	&.hg-popper--big-arrows .hg-popper--with-arrows {
		border-width: 12px;
	}

	&.hg-popper--no-padding {
		padding: 0;
		border: 0;
	}
	&.hg-popper--no-bg {
		background: transparent;
		box-shadow: none;
	}
	&.znpb-class-selector__popper {
		padding: 15px;
	}
	ul {
		list-style-type: none;
	}
}
</style>
