<template>
	<Tooltip
		v-if="data.message"
		append-to="element"
		placement="top"
		class="znpb-admin-system-notice-wrapper"
	>
		<div
			slot="content"
			v-html="data.message"
		></div>
		<BaseIcon
			:icon="icontype"
			class="znpb-admin-system-notice"
			:class="`znpb-admin-system-notice--${this.data.icon}`"
		/>

	</Tooltip>
	<BaseIcon
		v-else
		:icon="icontype"
		class="znpb-admin-system-notice znpb-admin-system-notice--no-tooltip"
		:class="`znpb-admin-system-notice--${this.data.icon}`"
	/>

</template>

<script>
export default {
	name: 'SmallNotice',
	props: {
		data: {
			type: Object,
			required: true
		}
	},
	computed: {
		icontype () {
			if (this.data.icon === 'warning' || this.data.icon === 'not_ok') {
				return 'warning'
			} else return 'info'
		}
	}
}
</script>

<style lang="scss">
.znpb-admin-system-notice {
	color: $secondary-color--accent;
	font-size: 16px;

	&--no-tooltip {
		width: 18px;
		height: 18px;
		margin-left: 7px;
	}

	&-wrapper {
		display: block;
		width: 18px;
		height: 18px;
		margin-left: 7px;
	}

	&--not_ok {
		color: $warning;
		cursor: pointer;
	}
	&--ok {
		color: $green;
	}
	&--warning {
		color: $error;
		cursor: pointer;
	}
}
</style>
