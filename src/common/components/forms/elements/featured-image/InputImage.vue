<template>
	<div class="znpb-input-image__wrapper"
	>
		<div
			class="znpb-input-image-holder"
			:style="wrapperStyles"
			ref="imageHolder"
			@click="openMediaModal"
		>
			<ActionsOverlay
				:show-overlay="!isDragging"
			>
				<img
					:src="imageSrc"
					class="znpb-input-image-holder__image"
					ref="image"
				/>
				<div slot="actions">
					<BaseIcon
						:rounded="true"
						icon="delete"
						:bg-size="30"
						bg-color="#fff"
						@click.native.stop="deleteImage"
					/>
				</div>

			</ActionsOverlay>
			<div class="znpb-drag-icon-wrapper"
				v-if="imageSrc && shouldDragImage && ( previewExpanded || !shouldDisplayExpander )"
				@mousedown.stop="startDrag"
				ref="dragButton"
				:style="positionCircleStyle"
			>
				<span class="znpb-input-image-holder__drag-button"></span>
			</div>
			<div
				v-if="!isDragging && shouldDragImage && shouldDisplayExpander && imageSrc"
				class="znpb-actions-overlay__expander"
				:class="{'znpb-actions-overlay__expander--icon-rotated': previewExpanded}"
				@click.stop="toggleExpand"
			>
				<strong
					class="znpb-actions-overlay__expander-text"
				>
					{{ previewExpanded ? 'CONTRACT' : 'EXPAND' }}
				</strong>
				<!-- <span>{{mouseOverExpander}}</span> -->
				<BaseIcon
					icon="select"
					:bg-size="12"
				/>
			</div>
			<EmptyList
				class="znpb-input-image-holder__empty"
				v-if="!imageSrc"
				:no-margin="true"
			>
				{{emptyText}}
			</EmptyList>
		</div>

		<!-- Image size -->
		<div
			v-if="show_size && imageSrc && !loading"
			class="znpb-input-image__custom-size-wrapper"
		>

			<InputWrapper
				title="Image size"
			>
				<InputSelect
					:options="imageSizes"
					v-model="sizeValue"
				/>
			</InputWrapper>

			<InputWrapper
				v-if="sizeValue === 'custom'"
			>
				<CustomSize
					v-model="customSizeValue"
				/>
			</InputWrapper>

		</div>
	</div>
</template>

<script>
import ActionsOverlay from '../actions-overlay/ActionsOverlay'
import EmptyList from '../empty-list/EmptyList'
import { InputWrapper } from '../inputWrapper'
import { InputSelect } from '../select'
import CustomSize from './CustomSize'

const wp = window.wp
export default {
	name: 'InputImage',
	components: {
		ActionsOverlay,
		EmptyList,
		InputSelect,
		InputWrapper,
		CustomSize
	},
	props: {
		/**
		 * the string value: location of the image
		 */
		value: {
			type: [String, Number, Boolean, Object],
			required: false
		},
		/**
		 * the text that will appear if no image is set
		 */
		emptyText: {
			type: String,
			required: false,
			default: 'No Image Selected'
		},
		shouldDragImage: {
			type: Boolean,
			required: false,
			default: false
		},
		positionLeft: {
			type: [ Number, String ],
			required: false,
			default: '50%'
		},
		positionTop: {
			type: [ Number, String ],
			required: false,
			default: '50%'
		},
		show_size: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	data () {
		return {
			mediaModal: null,
			attachmentId: null,
			isDragging: false,
			imageContainerPosition: {
				left: null,
				top: null
			},
			imageHolderWidth: null,
			imageHolderHeight: null,
			previewExpanded: false,
			minHeight: 200,
			imageHeight: null,
			initialX: null,
			initialY: null,
			attachmentModel: null,
			loading: true
		}
	},
	computed: {
		imageSizes () {
			const options = []
			const imageSizes = ((this.attachmentModel || {}).attributes || {}).sizes
			const customSizes = ((this.attachmentModel || {}).attributes || {}).zion_custom_sizes
			const allSizes = {
				...imageSizes,
				...customSizes
			}

			// Loop through all sizes and create the option
			Object.keys(allSizes).forEach((sizeKey) => {
				const name = this.capitalize(sizeKey.replace('_', ''))
				const width = allSizes[sizeKey].width
				const height = allSizes[sizeKey].height
				const optionName = `${name} ( ${width} x ${height} )`
				options.push({
					name: optionName,
					id: sizeKey
				})
			})

			// Add default values
			options.push({
				name: 'Custom',
				id: 'custom'
			})

			return options
		},
		sizeValue: {
			get () {
				return (this.value || {}).image_size || 'full'
			},
			set (newValue) {
				const valueToSend = {
					image_size: newValue
				}

				this.$emit('input', {
					...this.value,
					...valueToSend
				})
			}
		},
		customSizeValue: {
			get () {
				return (this.value || {}).custom_size || {}
			},
			set (newValue) {
				this.$emit('input', {
					...this.value,
					custom_size: newValue
				})
			}
		},
		positionCircleStyle () {
			return {
				left: this.positionLeft && this.positionLeft.indexOf('%') !== -1 ? this.positionLeft : null,
				top: this.positionTop && this.positionTop.indexOf('%') !== -1 ? this.positionTop : null
			}
		},
		wrapperStyles () {
			if (this.imageSrc && this.imageHolderHeight) {
				return {
					height: this.imageHolderHeight + 'px'
				}
			}

			return {}
		},
		imageValue: {
			get () {
				if (this.show_size) {
					return this.value || {}
				} else {
					return this.value || null
				}
			},

			set (newValue) {
				if (this.show_size) {
					this.$emit('input',	{
						...this.value,
						...newValue
					})
				} else {
					this.$emit('input',	newValue)
				}
			}
		},
		imageSrc () {
			if (this.show_size) {
				return (this.value || {}).image || null
			} else {
				return this.value || null
			}
		},
		shouldDisplayExpander () {
			return this.imageHolderHeight >= this.minHeight
		}
	},
	watch: {
		value (newValue, oldValue) {
			if (newValue !== oldValue) {
				this.$nextTick(() => {
					this.getImageHeight()
					if (this.previewExpanded) {
						this.toggleExpand()
					}
				})
			}
		}
	},
	mounted () {
		this.getImageHeight()
	},
	created () {
		if (this.show_size) {
			this.getAttachmentModel()
		} else {
			this.loading = false
		}
	},
	methods: {
		capitalize (string) 		{
			return string.charAt(0).toUpperCase() + string.slice(1)
		},
		// onCustomSizeSelected () {
		// 	// Make the server call
		// 	const attachment = wp.media.model.Attachment.get(this.imageSrc)

		// 	attachment.fetch({
		// 		data: {
		// 			is_media_image: true,
		// 			custom_size: this.customSizeValue,
		// 			image_url: this.imageSrc
		// 		}
		// 	}).done((event) => {
		// 		if (event && event.id) {
		// 			const { width: width = 'auto', height: height = 'auto' } = this.customSizeValue
		// 			const imageName = `custom_${width}x${height}`

		// 			console.log(event)

		// 			this.attachmentId = event.id
		// 			if (event.sizes[imageName]) {
		// 				this.$emit('input',	{
		// 					...this.value,
		// 					image: event.sizes[imageName].url
		// 				})
		// 			}
		// 		}
		// 	})
		// },
		getImageHeight () {
			// Wait for the image to load before getting it's dimensions
			this.$refs.image.addEventListener('load', () => {
				let imageHeight = this.$refs.image.getBoundingClientRect().height
				this.imageHeight = imageHeight
				if (imageHeight < this.minHeight) {
					this.imageHolderHeight = imageHeight
				} else {
					this.imageHolderHeight = this.minHeight
				}
			})
		},
		toggleExpand () {
			this.previewExpanded = !this.previewExpanded
			if (this.previewExpanded) {
				this.imageHolderHeight = this.imageHeight
			} else {
				this.imageHolderHeight = this.minHeight
			}
		},
		startDrag (event) {
			if (this.shouldDragImage) {
				window.addEventListener('mousemove', this.doDrag)
				window.addEventListener('mouseup', this.stopDrag)
				this.isDragging = true
				const { height, width, left, top } = this.$refs.imageHolder.getBoundingClientRect()
				this.imageHolderWidth = width
				this.imageHolderHeight = height
				this.imageContainerPosition.left = left
				this.imageContainerPosition.top = top
				this.initialX = event.pageX
				this.initialY = event.pageY
			}
		},
		doDrag (event) {
			window.document.body.style.userSelect = 'none'

			const movedX = event.clientX - this.imageContainerPosition.left
			const movedY = event.clientY - this.imageContainerPosition.top

			let xToSend = parseInt((movedX / this.imageHolderWidth) * 100)
			let yToSend = parseInt((movedY / this.imageHolderHeight) * 100)

			if (xToSend < 1) {
				xToSend = 0
			}
			if (yToSend < 1) {
				yToSend = 0
			}
			if (xToSend >= 100) {
				xToSend = 100
			}
			if (yToSend >= 100) {
				yToSend = 100
			}
			if (event.shiftKey) {
				xToSend = Math.round(xToSend / 5) * 5
				yToSend = Math.round(yToSend / 5) * 5
			}
			this.$emit('background-position-change', { x: xToSend, y: yToSend })
		},
		stopDrag (event) {
			this.initialX = event.pageX
			this.initialY = event.pageY
			window.removeEventListener('mousemove', this.doDrag)
			window.removeEventListener('mouseup', this.stopDrag)
			window.document.body.style.userSelect = null
			setTimeout(() => {
				this.isDragging = false
			}, 100)
		},
		openMediaModal () {
			if (this.isDragging) {
				return
			}
			if (this.mediaModal === null) {
				const args = {
					frame: 'select',
					state: 'zion-media',
					library: {
						type: 'image'
					},
					button: {
						text: 'Add Image'
					}
				}

				// Create the frame
				this.mediaModal = new window.wp.media.view.MediaFrame.ZionBuilderFrame(args)
				this.mediaModal.on('select update insert', this.selectMedia)
				this.mediaModal.on('open', this.setMediaModalSelection)
			}

			// Open the media modal
			this.mediaModal.open()
		},
		selectMedia (e) {
			let selection = this.mediaModal.state().get('selection').first()
			// In case we have multiple items
			if (typeof e !== 'undefined') { selection = e }

			if (this.show_size) {
				// Reset all other values when selecting a new image
				this.$emit('input',	{
					image: selection.get('url')
				})
			} else {
				this.imageValue = selection.get('url')
			}

			this.attachmentId = selection.get('id')
			// Save the selection so we can use the sizes
			this.attachmentModel = selection

			// Show the custom size selector again if needed
			this.loading = false
		},
		setMediaModalSelection (e) {
			const selection = this.mediaModal.state().get('selection')
			if (this.imageSrc && !this.attachmentId) {
				const attachment = wp.media.model.Attachment.get(this.imageSrc)
				attachment.fetch({
					data: {
						is_media_image: true,
						image_url: this.imageSrc
					}
				}).done((event) => {
					if (event && event.id) {
						this.attachmentId = event.id
						const attachment = wp.media.model.Attachment.get(this.attachmentId)
						selection.reset(attachment ? [attachment] : [])
					}
				})
			} else if (this.imageSrc && this.attachmentId) {
				const attachment = wp.media.model.Attachment.get(this.attachmentId)
				selection.reset(attachment ? [attachment] : [])
			}
		},
		deleteImage () {
			this.$emit('input', null)
			this.attachmentId = null

			// Reset the selection
			if (this.mediaModal) {
				let selection = this.mediaModal.state().get('selection')
				selection.reset([])
			}
		},
		getAttachmentModel () {
			if (this.imageSrc && !this.attachmentModel) {
				const attachment = wp.media.model.Attachment.get(this.imageSrc)

				attachment.fetch({
					data: {
						is_media_image: true,
						image_url: this.imageSrc
					}
				}).done((event) => {
					if (event && event.id) {
						this.attachmentId = event.id
						this.attachmentModel = wp.media.model.Attachment.get(this.attachmentId)
					}
					this.loading = false
				})
			}
		}
	},
	beforeDestroy () {
		window.removeEventListener('mousemove', this.doDrag)
		window.removeEventListener('mouseup', this.stopDrag)
		window.document.body.style.userSelect = null

		if (this.mediaModal) {
			this.mediaModal.detach()
		}
	}
}
</script>

<style lang="scss">
.znpb-input-background-image .znpb-options-form-wrapper {
	padding: 0;
	margin-right: -5px;
	margin-left: -5px;
}

.znpb-input-image-holder__drag-button {
	display: block;
	width: 12px;
	height: 12px;
	background-color: #fff;
	border-radius: 50%;
}
.znpb-actions-overlay {
	&__expander {
		position: absolute;
		bottom: 10px;
		left: 50%;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: $surface;
		transform: translateX(-50%);
		&-text {
			font-size: 10px;
		}
		&--icon-rotated {
			display: flex;
			flex-direction: column-reverse;
			.znpb-editor-icon-wrapper {
				transform: rotate(180deg);
			}
		}
	}
}
.znpb-input-image {
	&__wrapper {
		height: 100%;
	}

	&__custom-size-wrapper {
		.znpb-input-wrapper {
			padding: 0;
		}

		& > .znpb-input-wrapper {
			padding-bottom: 20px;

			&:last-child {
				padding-bottom: 0;
			}
		}
	}
}

.znpb-input-image-holder {
	position: relative;
	overflow: hidden;
	margin-bottom: 20px;
	transition: all .5s ease;
	cursor: pointer;
	&__image {
		display: block;
		margin: 0 auto;
	}
	&__empty {
		.znpb-empty-list__content {
			padding: 50px 30px;
		}
	}
}
.znpb-drag-icon-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	padding: 10px;
	font-size: 10px;
	border-radius: 50%;
	transform: translateX(-50%) translateY(-50%);
	cursor: move;
}
</style>
