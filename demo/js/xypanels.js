/*
 * xyPanels v1.0
 *
 * Copyright 2015 Carlos Ruiz / carlosruiz.me
 */

function panels() {
	
	// Get the height and width of the browser window
	var browserHeight = $(window).height();
	var browserWidth = $(window).width();
	
	// Center content
	$('.panel-content').each(function(index) { centerpanelContent(this, browserHeight, 1); });
		
	// Set up horizontal rows of panels
	$('.panel-row').each(function() { rowHeight = getRowHeight(this); createRow(this, rowHeight, browserWidth); });
	
	// Assign a current panel
	$('.panel-wrapper').first().addClass('current-panel');
	
	// Activate controls
	showControls();
	
	// When a user scrolls
	$(window).scroll(function() { getCurrentpanel('.panel-wrapper'); });
	
	// When a user uses the navigational controls
	$('.panel-controls').click(function() { scrollTopanel(this, '.panel-wrapper'); });
	
	/*
	 * When a user resizes the browser or changes the orientation of their device
	 * https://css-tricks.com/snippets/jquery/done-resizing-event/
	 */
	var resizeTimer;
	$(window).on('resize', function(e) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			var browserHeight = $(window).height();
			var browserWidth = $(window).width();
			$('.panel-content').each(function(index) { centerpanelContent(this, browserHeight, 0); });
			$('.panel-row').removeAttr('style');
			$('.panel-row > .panel-wrapper').removeAttr('style');
			$('.panel-row').each(function() { rowHeight = getRowHeight(this); createRow(this, rowHeight, browserWidth); });
		}, 400);
	});	

	/**
	 ****
	 ******
	 ******** Supporting functions
	 ******
	 ****
	 **/
	
	function centerpanelContent(panelContentContainer, browserHeight, initialLoad) {	
		if ( ($(panelContentContainer).find("img").length > 0) && initialLoad == 1 ) {
			$(panelContentContainer).find("img").load(function() {
				applyContentMargins(panelContentContainer, browserHeight);
			});
		} else {
			applyContentMargins(panelContentContainer, browserHeight);
		}
	}
	
	function applyContentMargins(panelContentContainer, browserHeight) {
		var panelContentHeight = $(panelContentContainer).outerHeight();
		if (browserHeight > panelContentHeight) {
			panelContentMargin = (browserHeight - panelContentHeight) / 2;
		} else {
			panelContentMargin = 0;
		}
		$(panelContentContainer).css({
			"margin-top": panelContentMargin,
			"margin-bottom": panelContentMargin
		});
	}
	
	function getRowHeight(panelRowContainer) {
		var panelWrapperContainer = $(panelRowContainer).children('.panel-wrapper');
		var highest = 0;
		$(panelWrapperContainer).each(function() {
			var wrapperHeight = $(this).outerHeight();
			if (wrapperHeight > highest) {
				highest = wrapperHeight;
			}
		});
		return highest;
	}
	
	function createRow(panelRowContainer, panelRowHeight, browserWidth) {
		$(panelRowContainer).css({
			"height": panelRowHeight + "px"
		})
		var panelWrapperContainer = $(panelRowContainer).children('.panel-wrapper');
		var column = 0;
		var offsetTop = 0;
		$(panelWrapperContainer).each(function() {
			$(this).css({
				"left": (column * browserWidth),
				"height": panelRowHeight + "px"
			})
			column++;
			offsetTop = panelRowHeight;
		});
	}
	
	$.fn.inViewport = function() {
		var win = $(window);
		// Viewport boundries
		var viewport = {
			top: win.scrollTop(),
			left: win.scrollLeft()
		}
		viewport.right = viewport.left + win.width();
		viewport.bottom = viewport.top + win.height();
		viewport.x = (viewport.top + viewport.bottom)/2;
		viewport.y = (viewport.left + viewport.right)/2;
		// panel boundries
		var panel = this.offset();
		panel.right = panel.left + this.outerWidth();
		panel.bottom = panel.top + this.outerHeight();
		return (!(viewport.y < panel.left || viewport.y > panel.right || viewport.x < panel.top || viewport.x > panel.bottom));
	}
	
	function getCurrentpanel(panelWrapperContainer) {
		$(panelWrapperContainer).each(function(index) {
			if ($(this).inViewport()) {
				$(this).addClass('current-panel');
			} else {
				if ($(this).hasClass('current-panel')) {
					$(this).removeClass('current-panel')
				}
			}
		});
		showControls();
	}
	
	function scrollTopanel(control, panelWrapperClass) {
		// UP and DOWN works on scrolling
		if ($(control).hasClass('up') || $(control).hasClass('down')) {
			if ($(control).hasClass('up')) {
				var panel = $('.current-panel.y-axis').prev('.y-axis').offset();
			} else if ($(control).hasClass('down')) {
				var panel = $('.current-panel.y-axis').next('.y-axis').offset();
			}
			$('html,body').animate({scrollTop: panel.top});
		}
		// LEFT and RIGHT works on positioning
		if ($(control).hasClass('left') || $(control).hasClass('right')) {
			if ($(control).hasClass('left')) {
				var panel = $('.current-panel').prev('.x-axis').position();
			} else if ($(control).hasClass('right')) {
				var panel = $('.current-panel').next('.x-axis').position();
			}		
			$('.current-panel').parent('.panel-row').animate({"left": -panel.left}, function() {
				getCurrentpanel('.panel-wrapper');
			});			
		}
		// TARGETING
		if ($(control).hasClass('targeting')) {
			var targetID = $(control).data('target');
			var targetPanel = $('#' + targetID);
			// Y to Y
			if ($('.current-panel').hasClass('y-axis') && $(targetPanel).hasClass('y-axis')) {
				var panel = $(targetPanel).offset();
				$('html,body').animate({scrollTop: panel.top});
			// X to LOCAL X
			} else if ($('.current-panel').hasClass('x-axis') && $(targetPanel).hasClass('x-axis') && ($('.current-panel').parent().is($(targetPanel).parent()))) {
				var panel = $(targetPanel).position();
				$('.current-panel').parent('.panel-row').animate({"left": -panel.left}, function() {
					getCurrentpanel('.panel-wrapper');
				});
			// X to FOREIGN X
			} else if ($('.current-panel').hasClass('x-axis') && $(targetPanel).hasClass('x-axis') && ($('.current-panel').parent().not($(targetPanel).parent()))) {
				// Step A
				var panelA = $(targetPanel).offset();
				$('html,body').animate({scrollTop: panelA.top}, function() {
					// Step B
					var panelB = $(targetPanel).position();
					$('.current-panel').parent('.panel-row').animate({"left": -panelB.left}, function() {
						getCurrentpanel('.panel-wrapper');
					});
				});
			// X to Y
			} else if ($('.current-panel').hasClass('x-axis') && $(targetPanel).hasClass('y-axis')) {
				var panel = $(targetPanel).offset();
				$('html,body').animate({scrollTop: panel.top});
			// Y to X
			} else if ($('.current-panel').hasClass('y-axis') && $(targetPanel).hasClass('x-axis')) {
				// Step A
				var panelA = $(targetPanel).parent().offset();
				$('html,body').animate({scrollTop: panelA.top}, function() {
					// Step B
					var panelB = $(targetPanel).position();
					$('.current-panel').parent('.panel-row').animate({"left": -panelB.left}, function() {
						getCurrentpanel('.panel-wrapper');
					});												 
				});
			}
		}
	}
	
	function showControls() {
		if ($('.current-panel').hasClass('y-axis') && $('.current-panel').next().hasClass('y-axis')) {
			$('.panel-controls.down').fadeIn(); } else { $('.panel-controls.down').fadeOut(200);
		}
		if ($('.current-panel').hasClass('y-axis') && $('.current-panel').prev().hasClass('y-axis')) {
			$('.panel-controls.up').fadeIn(); } else { $('.panel-controls.up').fadeOut(200);
		}
		if ($('.current-panel').hasClass('x-axis') && $('.current-panel').next().hasClass('x-axis')) {
			$('.panel-controls.right').fadeIn(); } else { $('.panel-controls.right').fadeOut(200);
		}
		if ($('.current-panel').hasClass('x-axis') && $('.current-panel').prev().hasClass('x-axis')) {
			$('.panel-controls.left').fadeIn(); } else { $('.panel-controls.left').fadeOut(200);
		}
	}
	
}