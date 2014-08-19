define(
	'svg_primitives',
	[
		'js/libs/class-extend.js'
	]
	, function(){
		
			var Primitive = Class.extend({
				init: function(config, context) {
					this.id_ = config.id;
					this.primitive_ = config.primitive;
					this.group_ = config.group;
					this.pos_ = config.pixelPos;
					this.zoom_ = config.zoom;
					this.size_ = config.size;
					this.width_ = config.width;
					this.strokeWidth_ = config.strokeWidth || 1;
					this.fillColor_ = config.fillColor;
					this.strokeColor_ = config.strokeColor;
					this.hoverStrokeColor_ = config.hoverStrokeColor || 'red';
					this.fillOpacity_ = config.fillOpacity || 1;
					this.strokeOpacity_ = config.strokeOpacity || 1;
					this.hoverStrokeOpacity_ = config.hoverStrokeOpacity || 1;
					this.hover_ = config.hover || false;
					this.hoverEffect_ = config.hoverEffect || false;
					this.eventHandlers_ = config.eventHandlers;
					this.label_ = config.label;
					this.paper_ = context.plot;
					this.render();
				},
				render: function() {
					this.setAttrs();
					this.setLabel();
					this.addListeners();
				},
				setAttrs: function() {
					var self = this;
					self.set_.forEach(function(el){
						if (el.data('hoverEngigng')){
							el.attr({
								'stroke-width': self.strokeWidth_,
								'fill': 'none',
								'stroke': self.hoverStrokeColor_,
								'fill-opacity': 'none',
								'stroke-opacity': self.hoverStrokeOpacity_
							})
							.hide();
						}
						else{
							el.attr({
								'stroke-width': self.strokeWidth_,
								'fill': self.fillColor_,
								'stroke': self.strokeColor_,
								'fill-opacity': self.fillOpacity_,
								'stroke-opacity': self.strokeOpacity_
							});
						};
						if (self.hoverEffect_) el.attr('cursor', 'pointer');
						el.data({'pos': self.pos_, 'zoom': self.zoom_})
					});
				},
				setLabel: function() {
					if (this.label_){
						var pos = {
							x: this.pos_.x + (this.label_.pos ? this.label_.pos.x : 0),
							y: this.pos_.y + (this.label_.pos ? this.label_.pos.y : this.size_)
						};
						var attr = (this.label_.attr ? this.label_.attr : '')
						this.set_.push(
							this.paper_
							.text(pos.x, pos.y, this.label_.text)
							.attr(attr)
							.data({'pos': this.pos_, 'zoom': this.zoom_})
						);
					}
				},
				addListeners: function() {
					var self = this;
					self.set_
						.hover(
							function(e){
								if (self.hoverEffect_){
									self.set_.forEach(function(el){
										if (self.hoverEffect_ == 'style'){
											el.attr(self.hover_);
										}
										else if (el.data('hoverEngigng')){
											el.show();
										};
									});
								}
								self.onEvent(e.type);
							},
							function(e){
								if (self.hoverEffect_){
									self.set_.forEach(function(el){
										if (self.hoverEffect_ == 'style'){
											self.setAttrs();
										}
										else if (el.data('hoverEngigng')){
											el.hide();
										};
									});
								}
								self.onEvent(e.type);
							}
						)
						.mousemove(
							function(e){
								self.onEvent(e.type);
							}
						)
						.click(
							function(e){
								self.onEvent(e.type);
							}
						);
				},
				onEvent: function(type){
					if (this.eventHandlers_ && this.eventHandlers_[type]) {
						this.eventHandlers_[type]();
					};
				}
			});
			
			var primitives = {
				
				circle: Primitive.extend({
					init: function(config, context) {
						this._super(config, context);
					},
					render: function() {
						this.set_ = this.paper_.set();
						var hSize = this.size_ / 2;
						this.set_.push(
							this.paper_.circle(this.pos_.x, this.pos_.y, hSize + this.strokeWidth_ * 2).data('hoverEngigng', true),
							this.paper_.circle(this.pos_.x, this.pos_.y, hSize)
						)
						this._super();
					}
				}),
				
				triangle: Primitive.extend({
					init: function(config, context) {
						this._super(config, context);
					},
					render: function() {
						
						this.set_ = this.paper_.set();
						this.set_.push(
							this.paper_.path(this.getPathString(this.pos_.x, this.pos_.y, this.size_ + this.strokeWidth_ * 6)).data('hoverEngigng', true),
							this.paper_.path(this.getPathString(this.pos_.x, this.pos_.y, this.size_))
						)
						this._super();
					},
					getPathString: function(cx, cy, r) {
						r *= 1.1;
						return "M".concat(cx, ",", cy, "m0-", r * .58, "l", r * .5, ",", r * .87, "-", r, ",0z");
					}
				}),
				
				square: Primitive.extend({
					init: function(config, context) {
						this._super(config, context);
					},
					render: function() {
						this.set_ = this.paper_.set();
						var hSize = this.size_ / 2 + .5;
						var sSize = this.size_ + this.strokeWidth_ * 4;
						var shSize = (this.size_ + this.strokeWidth_ * 4) / 2 + .5;
						this.set_.push(
							this.paper_.rect(this.pos_.x - shSize, this.pos_.y - shSize, sSize, sSize).data('hoverEngigng', true),
							this.paper_.rect(this.pos_.x - hSize, this.pos_.y - hSize, this.size_, this.size_)
						)
						this._super();
					}
				}),
				
				rhombus: Primitive.extend({
					init: function(config, context) {
						this._super(config, context);
					},
					render: function() {
						this.set_ = this.paper_.set();
						this.set_.push(
							this.paper_.path(this.getPathString(this.pos_.x, this.pos_.y, this.size_ + this.strokeWidth_ * 4)).data('hoverEngigng', true),
							this.paper_.path(this.getPathString(this.pos_.x, this.pos_.y, this.size_))
						)
						this._super();
					},
					getPathString: function(cx, cy, r) {
						r /= 2;
						return "M".concat(cx - r, ",", cy, "l", r, ",", r, ",", r, ",", -r, ",", -r, ",", -r, "Z");
					}
				}),
				
				arrow: Primitive.extend({
					init: function(config, context) {
						this._super(config, context);
					},
					render: function() {
						this.set_ = this.paper_.cubicCurve({
							pos: this.pos_,
							width: this.width_,
							strokeWidth: this.strokeWidth_ || 1,
							strokeColor: this.strokeColor_ || '#1263a7',
							strokeOpacity: this.strokeOpacity_ || .7,
							fillColor: this.fillColor || '#147bd2',
							fillOpacity: this.fillOpacity || .7
						});
						this._super();
					}
				})				
				
			};
			
			return primitives;
	
});
