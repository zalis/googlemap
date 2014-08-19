define(
    'infobox',
	[
		'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry',
		'text!../js/infobox/tooltip.tmpl',
		'text!../js/infobox/tooltip_content.tmpl',
		'text!../js/infobox/infobox.tmpl',
		'text!../js/infobox/infobox_content.tmpl',
		'text!../js/infobox/templates/plant_tt.html',
		'text!../js/infobox/templates/plant_ib.html',
		'text!../js/infobox/templates/warehouse_tt.html',
		'text!../js/infobox/templates/warehouse_ib.html',
		'text!../js/infobox/templates/customer_tt.html',
		'text!../js/infobox/templates/customer_ib.html',
		'text!../js/infobox/templates/primary_tt.html',
		'text!../js/infobox/templates/primary_ib.html',
		'text!../js/infobox/templates/secondary_tt.html',
		'text!../js/infobox/templates/secondary_ib.html',
		'css!infobox.css'
	],
	function(
			gm, 
			tt_tmpl, 
			tt_cont_tmpl, 
			ib_tmpl, 
			ib_cont_tmpl, 
			plant_tt_tmpl, 
			plant_ib_tmpl, 
			warehouse_tt_tmpl, 
			warehouse_ib_tmpl,
			customer_tt_tmpl, 
			customer_ib_tmpl,
			primary_tt_tmpl, 
			primary_ib_tmpl,
			secondary_tt_tmpl, 
			secondary_ib_tmpl
		){
		
		var Infobox = function(config) {
			this.init(config);
		};
		
		Infobox.prototype = {

			init: function(config){
				var self = this;
				
				self.alignRight_ = false;
				self.alignBottom_ = false;
				self.staticPosition_ = false;
				self.position_ = {};
				
				self.padding_ = {x:25, y:4};
				self.spacing_ = {x:0, y:0};

				self.tooltip_ = {
					div: $(_.template(tt_tmpl)({}))
				};

				self.infobox_ = {
					div: $(_.template(ib_tmpl)({}))
				};
				
				self.infobox_.header = self.infobox_.div.find('.header'),
				self.infobox_.body = self.infobox_.div.find('.body'),
				self.infobox_.close = self.infobox_.div.find('.ib_close')
				
				self.setOverlay(config.map);

				this.addStems(self.tooltip_.div, ['left top', 'right top', 'right bottom', 'left bottom']);
				this.addStems(self.infobox_.div, ['left top', 'right top', 'right bottom', 'left bottom']);
				
			},
			
			setOverlay: function(map){
				var self = this;

				var ov = new google.maps.OverlayView(); 
				ov.onAdd = function(){}; 
				ov.draw = function(){
					var pane = this.getPanes().floatPane;
  					pane.appendChild(self.tooltip_.div[0]);
  					pane.appendChild(self.infobox_.div[0]);
					self.container_ = $(pane);
					self.window_ = $(map.getDiv());
					self.mode_ = 'googleMap';
					self.overlay_ = this;
				}; 
				ov.onRemove = function(){}; 
				ov.setMap(map);

				return ov;
			},

			setContent: function(container, template, content){
				container.find('.content').html(_.template(template)(content));
			},
			
			setSize: function(){
				this.infobox_.width = this.infobox_.div.width();
				this.infobox_.height = this.infobox_.div.height();
				this.tooltip_.div.css({'width': this.infobox_.width});
				this.tooltip_.width = this.tooltip_.div.width();
				this.tooltip_.height = this.tooltip_.div.height();
			},
			
			onMouseOver: function(args){
				var self = this;
				self.tooltip_.id = args.id;

				var e = args.e;
				
				if (!e) var e = window.event;
				self.target_ = e.srcElement ? e.srcElement : e.target;
				
				if (!$(self.target_).data('infobox')){
					self.setContent(self.infobox_.div, eval(args.obj.type + '_ib_tmpl'), args.obj.info);
					self.setSize();				
					self.setContent(self.tooltip_.div, eval(args.obj.type + '_tt_tmpl'), args.obj.info);				
					self.setPos(args);
					self.tooltip_.timeout = window.setTimeout(function(){self.showTooltip();}, 500);
				}
			},

			onMouseMove: function(args){
				this.setPos(args);
			},

			onMouseOut: function(args){
//				var self = this,
//				e = args.e;
//				if (!e) var e = window.event;
//                if (!e) return;
//				var relTarget = (e.relatedTarget) ? e.relatedTarget : e.toElement;
				
//				console.log('onMouseOut', $(relTarget).parents('.stem').length, self.target_, relTarget)
				
//				while (relTarget && relTarget != self.tooltip_.div[0] && 'BODY' != relTarget.nodeName){
//					relTarget = relTarget.parentNode
//				}
//				if (relTarget != null && relTarget != self.tooltip_.div[0]) self.hideTooltip();
//				if ($(relTarget).parents('.stem').length == 0) self.hideTooltip();
				
				this.hideTooltip();
			},

			onClick: function(args){
				this.hideInfobox();
				if (this.tooltip_.shown)
					this.showInfobox();
			},

			showTooltip: function(e, args){
				var self = this;
				window.clearTimeout(self.tooltip_.timeout);
				self.tooltip_.shown = true;
				self.tooltip_.div.stop(true, true).fadeIn(600, function(){
				});
	
				self.tooltip_.div
					.on('click', function(evt){
						evt.stopImmediatePropagation();
						if (self.target_.parentNode.nodeName == 'svg'){
//							var eObj = document.createEvent('MouseEvents'); 
//							eObj.initEvent('click', true, false); 
//							self.target_.dispatchEvent(eObj); 
						}
						else{
//							$(self.target_).trigger('click')
						}
					});
			},

			hideTooltip: function(){
				window.clearTimeout(this.tooltip_.timeout);
				if (this.tooltip_.shown){
					var self = this;
					self.tooltip_.shown = false;
//					if (!self.infobox_.id || self.infobox_.id != self.tooltip_.id)
//						self.iInfoBox.onTooltipHide({id: self.tooltip_.id});
					var div = self.tooltip_.div.clone().appendTo(self.container_).stop(true, false).fadeOut(300, function(){
						$(this).remove();
					});
					self.tooltip_.div.css('display', 'none');
				}
			},

			hideInfobox: function(){
				//debugger;
	//			var ib = $('.ib_visible');
				if (this.infobox_.id){
					this.iInfoBox.onInfoBoxHide({id: this.infobox_.id});
					this.infobox_.id = null;
				}
				this.infobox_.div.parent().find('.ib_visible').stop(true, false).fadeOut(100, function(){
					var target = $(this).data('target');
					$(target).data('infobox', null);
					$(this).remove();
				});
			},

			showInfobox: function() {
				var self = this,
				div = self.infobox_.div,
				alignBottom = self.alignBottom_,
				x1 = self.infobox_.width + 25,
				x2 = -25,
				y1 = -10,
				y2 = self.infobox_.height + 20,
				params,
				clip;
				self.infobox_.id = self.tooltip_.id;
				
				var closeBox = self.infobox_.close;
				if (alignBottom){
					closeBox.removeClass('ib_close_w').addClass('ib_close_b');
				}
				else{
					closeBox.removeClass('ib_close_b').addClass('ib_close_w');
				};
	
				var ttp = self.tooltip_.div;
				div.css({'display':'block', 'left':ttp.css('left'), 'top':ttp.css('top'), 'right':ttp.css('right'), 'bottom':ttp.css('bottom')});
				
				if (alignBottom){
					self.infobox_.header.css({'border-bottom':'', 'border-top':'1px solid ' + self.borderColor_}).insertAfter(self.infobox_.body);
					clip = 'rect(' + y1 + 'px ' + x1 + 'px ' + y1 + 'px ' + x2 + 'px)';
					params = {bottom: div.css('bottom')};
					div.css({'top': 'auto', 'bottom': parseInt(ttp.css('bottom'), 10) - self.infobox_.height, 'clip':clip});
				}
				else{
					self.infobox_.header.css({'border-bottom':'1px solid ' + self.borderColor_, 'border-top':''}).insertBefore(self.infobox_.body);
					clip = 'rect(' + y2 + 'px ' + x1 + 'px ' + y2 + 'px ' + x2 + 'px)';
					params = {top: div.css('top')};
					div.css({'top': parseInt(ttp.css('top'), 10) - self.infobox_.height, 'bottom': 'auto', 'clip':clip});
				};
				
				div.fadeTo(0, 0).stop().animate(
					params,
					{
						duration: 200, 
						easing: 'easeOutQuad',
						step: function( now, fx ){
							if (alignBottom){
								clip = 'rect(' + y1 + 'px ' + x1 + 'px ' + (y1 + (fx.now - fx.start)) + 'px ' + x2 + 'px)';
							}
							else{
								clip = 'rect(' + (y2 - (fx.now - fx.start) - 10) + 'px ' + x1 + 'px ' + y2 + 'px ' + x2 + 'px)';
							};
							$(this).css({'clip': clip, opacity: fx.pos/2.5});
						},
						complete: function(){
							var clip = 'rect(' + y1 + 'px ' + x1 + 'px ' + y2 + 'px ' + x2 + 'px)';
							var temp = $(this).clone()
								.addClass('ib_visible')
								.appendTo(self.container_)
								.data('target', self.target_);
							$(self.target_).data('infobox', temp);
							$(this).css({'display':'none', 'clip':'auto'});
							self.showStem(temp, self.stemClass_);
							temp.css('clip', clip).fadeTo('fast', 1, function(){
								$('.swl', this).unbind('click');
								$('.swl', this).click(function(event){
								});
	
								$('.nwl', this).unbind('click');
								$('.nwl', this).click(function(event){
								});
	
								$(this).on('click', function(e){
//									e.cancelBubble = true;
//									if (e.stopPropagation) e.stopPropagation();
	
//									if (!e) var e = window.event;
//									var target = e.srcElement ? e.srcElement : e.target;
									
//									if (target.className.indexOf('ib_close') != -1){
//										self.hideInfobox();
//										return;
//									}
									
//									self.iInfoBox.onInfoBoxClick({srcElement: target});
									
								});
							});
							self.hideTooltip();
							if (self.mode_ == "googleMap") self.panBox();						
						}
					}
				);
			},			

			getBounds : function(map) {
				var bounds = map.getBounds(),
				ne = bounds.getNorthEast(),
				sw = bounds.getSouthWest();
				return {ne: ne, sw: sw};
	//			return {ne: {lat: ne.lat(), lng: ne.lng()}, sw: {lat: sw.lat(), lng: sw.lng()}};
			},

			setPos: function(args){
				var left, right, top, bottom, stemClass = '.stem';
	
				var projection = this.overlay_.getProjection();
				
				var bounds = this.getBounds(args.map);
				
				var ne = projection.fromLatLngToDivPixel(bounds.ne);
				var sw = projection.fromLatLngToDivPixel(bounds.sw);
				
				if (args.pos){
					this.position_ = args.pos;
					this.staticPosition_ = true;
					this.spacing_.x = 0;
				}
				else{
					if (!args.cursorPos) return;
					this.staticPosition_ = false;
					this.position_ = args.cursorPos;
					this.spacing_.x = 4;
				}
				
				var position = projection.fromLatLngToDivPixel(this.position_);
				var x = position.x;
				var y = position.y;

				if (x + this.tooltip_.width + this.padding_.x >= ne.x){
//					left = 'auto';
//					right = 600 - x + this.padding_.x + this.spacing_.x;
					left = x - this.tooltip_.width - this.padding_.x + this.spacing_.x;
					right = 'auto';
					stemClass += '.right';
					this.alignRight_ = true;
				}
				else{
					left = x + this.padding_.x + this.spacing_.x;
					right = 'auto';
					stemClass += '.left';
					this.alignRight_ = false;
				}
				if (y + this.tooltip_.height + this.padding_.y >= sw.y){
					top = 'auto';
					bottom = - y - this.padding_.y;
					stemClass += '.bottom';
					this.alignBottom_ = true;
				}
				else{
					top = y - this.padding_.y;
					bottom = 'auto'
					stemClass += '.top';
					this.alignBottom_ = false;
				}
				
				if (this.stemClass_ != stemClass && stemClass != '.stem'){
					this.showStem(this.tooltip_.div, stemClass);
					this.stemClass_ = stemClass;
				}

				this.tooltip_.div.css({'left':left, 'top':top, 'right':right, 'bottom':bottom});

			},
			
			panBox: function(){
				var xOffset = 0, yOffset = 0;
				
				var map = this.overlay_.map;
				var mapDiv = map.getDiv();
				var mapWidth = mapDiv.offsetWidth;
				var mapHeight = mapDiv.offsetHeight;
				var ibWidth = this.infobox_.width;
				var ibHeight = this.infobox_.height;
				var padding = this.padding_;
				var spacing = this.spacing_;
				var position = this.overlay_.getProjection().fromLatLngToContainerPixel(this.position_);
	
				if (this.alignRight_) {
					if (position.x < ibWidth + 2 * (padding.x - spacing.x)) {
						xOffset = position.x - 2 * (padding.x - spacing.x) - ibWidth;
					} 
				}
				else{ 
					if ((position.x + ibWidth + 2 * (padding.x - spacing.x)) > mapWidth) {
						xOffset = position.x + ibWidth + 2 * (padding.x - spacing.x) - mapWidth;
					}
				}
				
				if (this.alignBottom_) {
					if (position.y < ibHeight + 2 * (padding.y - spacing.y)) {
						yOffset = position.y - 2 * (padding.y - spacing.y) - ibHeight;
					} 
				} 
				else {
					if ((position.y + ibHeight + 2 * (padding.y - spacing.y)) > mapHeight) {
						yOffset = position.y + ibHeight + 2 * (padding.y - spacing.y) - mapHeight;
					}
				}
		
				if (!(xOffset === 0 && yOffset === 0)) {
					map.panBy(xOffset, yOffset);
				}
	
			},

			showStem: function(div, stemClass) {
				var stem = div.find(stemClass);
				if (stem.css('display') == 'none'){
					div.find(this.stemClass_).hide();
					stem.show();
					this.stemClass_ = stemClass;
				};
			},
			
			addStems : function(div, stems, strokeColor, fillColor) {
				var self = this,
				container = div.find('.frame');
				strokeColor = strokeColor || '#ffffff',
				fillColor = fillColor || '#5C6278';
		
				$.each(stems, function(index, key){
					var div = $('<div class="stem"></div>')
						.addClass(key)
						.css({
							'position': 'absolute',
							'z-index': 10,
							'width': 29,
							'height': 19,
							'display': 'none'
						})
						.appendTo(container)
						.hover(
							function(){
								$(this).css({'cursor': 'pointer'});
							},
							function(){
								$(this).css({'cursor': 'default'});
							}
						);
						
					var p1, p2, p3, p4, top, bottom, left, right;
					if (div.hasClass('top')) {
						top = 5;
						bottom = 'auto';
						if (div.hasClass('left')) {
							left = -25;
							right = 'auto';
							p1 = "M 31, 2, L 1, 2, 26, 15, 31, 15";
							p2 = "M 26, 3, L 4, 3";
							p3 = "M 1, 3, L 24, 15";
							p4 = "M 26, 0 L 26, 2, 1, 2, 26, 15, 26, 19";
						}
						else if (div.hasClass('right')) {
							left = 'auto';
							right = -25;
							p1 = "M -1, 2, L 29, 2, 4, 15, -1, 15";
							p2 = "M 4, 3, L 26, 3";
							p3 = "M 29, 3, L 6, 15";
							p4 = "M 4, 0 L 4, 2, 29, 2, 4, 15, 4, 19"
						}
					}
					else if (div.hasClass('bottom')) {
						top = 'auto';
						bottom = 5;
						if (div.hasClass('left')) {
							left = -25;
							right = 'auto';
							p1 = "M 26, 4, L 1, 17, 31, 17, 31, 4";
							p2 = "M 26, 5, L 5, 16";
							p3 = "M 1, 18, L 24, 18";
							p4 = "M 26, 0 L 26, 4, 1, 17, 26, 17, 26, 19";
						}
						else if (div.hasClass('right')) {
							left = 'auto';
							right = -25;
							p1 = "M 4, 4, L 29, 17, -1, 17, -1, 4";
							p2 = "M 4, 5, L 25, 16";
							p3 = "M 29, 18, L 6, 18";
							p4 = "M 4, 0 L 4, 4, 29, 17, 4, 17, 4, 19";
						}
					}
			
					div.css({
						'left': left,
						'top': top,
						'right': right,
						'bottom': bottom
					});
			
					var paper = new Raphael(div[0], 35, 25);
					var set = paper.set();
					set.push(
						paper.path(p1)
						.attr({
							'fill': fillColor, 
							'stroke': 'none'
						}),
						paper.path(p2)
						.attr({
							'stroke-width': 1, 
							'stroke': '#000',
							'stroke-opacity': .6
						})
						.blur(1.2),
						paper.path(p3)
						.attr({
							'stroke-width': 1, 
							'stroke': '#000',
							'stroke-opacity': .3
						})
						.blur(1.2),
						paper.path(p4)
						.attr({
							'stroke-width': 1, 
							'stroke': strokeColor
						})
					)
					.transform('t-.5,-.5');
					set.forEach(function (el) {
						el.hover(
							function(){
								el.attr({'cursor': 'pointer'});
							},
							function(e){
								el.attr({'cursor': 'default'});
							}
						);
					});
				});
			}
			
			
		};
		
		return Infobox;
		
    }
);

