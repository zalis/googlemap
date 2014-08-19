define(
	'overlay',
	[
		'jquery',
		'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
	]
	, function(){
		
			var Overlay = function() {
				
			};

			Overlay.prototype = $.extend(new google.maps.OverlayView(), {
				init: function(config){

					this.map_ = config.map;
					this.svgLayer_ = config.svgLayer;
					this.primitives_ = config.primitives;
					this.groups_ = config.groups;
					this.shapes_ = {};
					
					this.wait = $.Deferred();;
				
					this.position_ = {};
					
					this.minLat_ = config.minLat || -85;
					this.maxLat_ = config.maxLat || 85;
					this.minLng_ = config.minLng || -180;
					this.maxLng_ = config.maxLng || 180;
					
					this.dX = 0;
					this.dY = 0;
					
					this.setMap(this.map_);
				},
				
				onAdd: function(){
					this.zoom_ = this.map.getZoom();
					this.div_ = document.createElement('div');
					this.div_.style.position =  'absolute';
					this.div_.style.border = '1px solid red';
					this.paper_ = new Raphael(this.div_, 0, 0);
					this.paper_.canvas.style.position = 'absolute';				
					this.paper_.canvas.style.border = '1px solid yellow';

					this.setLayout();

					var panes = this.getPanes();
					panes.overlayImage.appendChild(this.div_);
					
					this.added = true;
					this.wait.resolve();
				},
				
				draw: function(){
				},
				
				setLayout: function() {
					var bounds = this.map.getBounds(),
					projection = this.getProjection(),
					sw = projection.fromLatLngToDivPixel(bounds.getSouthWest()),
					ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
				
					if (this.sw_ && this.ne_){
						this.dX += this.ne_.x - ne.x + ((this.sw_.x - sw.x) - (this.ne_.x - ne.x));
						this.dY += this.ne_.y - ne.y;
					}
					
					this.sw_ = sw;
					this.ne_ = ne;
					
					this.position_.top = ne.y;
					this.position_.left = sw.x;
					
					var topLeft = this.fromLatLngToPixel(new google.maps.LatLng(this.maxLat_, this.minLng_), bounds);
					var bottomRight = this.fromLatLngToPixel(new google.maps.LatLng(this.minLat_, this.maxLng_), bounds);
					
					this.left_ = this.position_.left + topLeft.x + this.dX;
					this.top_ = this.position_.top + topLeft.y + this.dY;

				
					this.div_.style.left = topLeft.x + 'px';
					this.div_.style.top = topLeft.y + 'px';
					this.div_.style.width = (bottomRight.x - topLeft.x) + 'px';
					this.div_.style.height = (bottomRight.y - topLeft.y) + 'px';
					this.setViewBox();
				},
				
				fromLatLngToPixel: function (position, bounds) {
					var scale = Math.pow(2, this.map.getZoom());
					var projection = this.map.getProjection();
//					var bounds = this.map.getBounds();

					var nw = projection.fromLatLngToPoint(
					new google.maps.LatLng(
						bounds.getNorthEast().lat(),
						bounds.getSouthWest().lng()
					));
					var point = projection.fromLatLngToPoint(position);
  
					return new google.maps.Point(
						Math.floor((point.x - nw.x) * scale) - this.dX,
						Math.floor((point.y - nw.y) * scale) - this.dY
					);
				},

				setViewBox: function() {
					var self = this;
					var zoom = self.map.getZoom();
					var scale = Math.pow(2, zoom - self.zoom_);
					self.paper_.setSize($(self.div_).width(), $(self.div_).height());
					self.paper_.setViewBox(
						0,
						0,
						$(self.div_).width() / scale,
						$(self.div_).height() / scale,
						true
					);
				},
				
				addShape: function(obj) {
					var self = this;
					
					if (obj.pos.from && obj.pos.to) {
						p.from = self.getPixelPos(obj.pos.from, self.left_, self.top_);
						p.to = self.getPixelPos(obj.pos.to, self.left_, self.top_);
					}
					else{
						p = self.getPixelPos(obj.pos, self.left_, self.top_);
					}
					
					obj.pixelPos = p;
					obj.zoom = self.map_.getZoom();
							
					var config = {
						shape: obj,
						context: {
							plot: self.paper_,
							groups: self.groups_
						}
					};
					
					var shape = new self.primitives_[config.shape.primitive](config.shape, config.context);
					obj.shape = shape.set_;
				},
				
				removeShapes: function(args) {
					if (args){
						if (args.shape) args.shape.remove();
					}
					else{
						this.paper_.clear();
					}
				},
				
				getPixelPos: function(pos, dx, dy) {
					var proj = this.getProjection();
					var p = proj.fromLatLngToDivPixel(new google.maps.LatLng(pos.lat, pos.lng));
					p.x -= dx;
					p.y -= dy;
					return p;
				},
				
				redraw: function (objects) {
					var self = this,
					svgNode = $(self.paper_.canvas),
					parent = svgNode.parent(),
					svgCopy = svgNode.clone().prependTo(parent);
					
					svgNode.css('display', 'none');
				
					self.paper_.setViewBox(
						0,
						0,
						$(self.div_).width(),
						$(self.div_).height(),
						false
					);
					self.paper_.setSize($(self.div_).width(), $(self.div_).height());
					self.zoom_ = self.map_.getZoom();
				
					var projection = self.getProjection();
					
					$.each(objects.lanes, function(id, obj){
						var from = projection.fromLatLngToDivPixel(new google.maps.LatLng(obj.pos.from.lat, obj.pos.from.lng));
						var to = projection.fromLatLngToDivPixel(new google.maps.LatLng(obj.pos.to.lat, obj.pos.to.lng));
					
						from.x -= parseInt(self.div_.style.left)
						from.y -= parseInt(self.div_.style.top)
						to.x -= parseInt(self.div_.style.left)
						to.y -= parseInt(self.div_.style.top)
										
						obj.shape.cubicCurvePath({
							from: from, 
							to: to,
							width: obj.width
						});	
					});
								
					$.each(objects.facilities, function(id, obj){
						obj.shape.forEach(function(el){
							var scale = Math.pow(2, self.map_.getZoom() - el.data('zoom')) - 1;
							var pos = el.data('pos');
							el.transform('t' + (pos.x * scale - scale / 1.36) + ',' + (pos.y * scale - scale / 1.36));
						});
					});
					
					svgNode.stop(false, true).fadeIn(400);
					svgCopy.stop(false, true).fadeOut(600, function(){$(this).remove();});
				}


				
			});
				
			return Overlay;
		
	}
);