<?php

namespace ZionBuilder\Elements\Tabs;

use ZionBuilder\Plugin;
use ZionBuilder\Elements\Element;
use ZionBuilder\Utils;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class Text
 *
 * @package ZionBuilder\Elements
 */
class Tabs extends Element {
	/**
	 * Get type
	 *
	 * Returns the unique id for the element
	 *
	 * @return string The element id/type
	 */
	public function get_type() {
		return 'tabs';
	}

	/**
	 * Get name
	 *
	 * Returns the name for the element
	 *
	 * @return string The element name
	 */
	public function get_name() {
		return __( 'Tabs', 'zionbuilder' );
	}

	/**
	 * Get keywords
	 *
	 * Returns the keywords for this element
	 *
	 * @return array<string> The list of element keywords
	 */
	public function get_keywords() {
		return [ 'tab', 'folder', 'navigation', 'tabbar', 'steps' ];
	}

	/**
	 * Get Element Icon
	 *
	 * Returns the icon used in add elements panel for this element
	 *
	 * @return string The element icon
	 */
	public function get_element_icon() {
		return 'element-tabs';
	}

	/**
	 * Registers the element options
	 *
	 * @param \ZionBuilder\Options\Options $options The Options instance
	 *
	 * @return void
	 */
	public function options( $options ) {
		$options->add_option(
			'tabs',
			[
				'type'       => 'child_adder',
				'title'      => __( 'Tabs', 'zionbuilder' ),
				'child_type' => 'tabs_item',
				'item_name'  => 'title',
			]
		);

		$options->add_option(
			'layout',
			[
				'type'             => 'select',
				'default'          => '',
				'title'            => __( 'Layout', 'zionbuilder' ),
				'options'          => [
					[
						'name' => __( 'Horizontal', 'zionbuilder' ),
						'id'   => '',
					],
					[
						'name' => __( 'Vertical', 'zionbuilder' ),
						'id'   => 'vertical',
					],
					[
						'name' => __( 'Stacked', 'zionbuilder' ),
						'id'   => 'stacked',
					],
				],
				'render_attribute' => [
					[
						'attribute' => 'class',
						'value'     => 'zb-el-tabs--{{VALUE}}',
					],
				],
			]
		);
	}

	/**
	 * Get style elements
	 *
	 * Returns a list of elements/tags that for which you
	 * want to show style options
	 *
	 * @return void
	 */
	public function on_register_styles() {
		$this->register_style_options_element(
			'inner_content_styles_title',
			[
				'title'    => esc_html__( 'Tab styles', 'zionbuilder' ),
				'selector' => '{{ELEMENT}} .zb-el-tabs-nav-title',
			]
		);
		$this->register_style_options_element(
			'inner_content_styles_content',
			[
				'title'    => esc_html__( 'Content styles', 'zionbuilder' ),
				'selector' => '{{ELEMENT}} .zb-el-tabs-content ',
			]
		);
	}

	/**
	 * Enqueue element scripts for both frontend and editor
	 *
	 * If you want to use the ZionBuilder cache system you must use
	 * the enqueue_editor_script(), enqueue_element_script() functions
	 *
	 * @return void
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'jquery' );

		// Using helper methods will go through caching policy
		$this->enqueue_editor_script( Utils::get_file_url( 'dist/js/elements/Tabs/editor.js' ) );
		$this->enqueue_element_script( Utils::get_file_url( 'dist/js/elements/Tabs/frontend.js' ) );
	}

	/**
	 * Enqueue element styles for both frontend and editor
	 *
	 * If you want to use the ZionBuilder cache system you must use
	 * the enqueue_editor_style(), enqueue_element_style() functions
	 *
	 * @return void
	 */
	public function enqueue_styles() {
		// Using helper methods will go through caching policy
		$this->enqueue_element_style( Utils::get_file_url( 'dist/css/elements/Tabs/frontend.css' ) );
	}

	/**
	 * Renders the element based on options
	 *
	 * @param \ZionBuilder\Options\Options $options
	 *
	 * @return void
	 */
	public function render( $options ) {
		$tabs      = $this->get_children();
		$tab_links = [];

		foreach ( $tabs as $key => $tab_data ) {
			$title  = isset( $tab_data['options']['title'] ) ? $tab_data['options']['title'] : '';
			$active = $key === 0 ? 'zb-el-tabs-nav--active' : '';

			$tab_links[] = sprintf( '<li class="zb-el-tabs-nav-title %s">%s</li>', esc_attr( $active ), wp_kses_post( $title ) );
		} ?>
		<ul class="zb-el-tabs-nav">
			<?php
				// All output is already escaped
				echo implode( '', $tab_links ); // phpcs:ignore WordPress.Security.EscapeOutput
			?>
		</ul>
		<div class="zb-el-tabs-content">
			<?php
			foreach ( $tabs as $index => $element_data ) {
				Plugin::$instance->renderer->render_element(
					$element_data,
					[
						'active' => $index === 0,
					]
				);
			}
			?>
		</div>
		<?php
	}
}
