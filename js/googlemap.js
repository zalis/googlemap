require.config({
	paths : {
		overlay: 'overlay/overlay',
		svg_primitives: 'overlay/svg_primitives',
		infobox: 'infobox/infobox'
	}
});

define([
	'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry',
	'json!../config.json',
	'json!../objects.json',
	'overlay',
	'svg_primitives',
	'infobox'
	], function(gm, map_config, map_objects, map_overlay, svg_primitives, map_infobox){
		
		var myMap = {
			init: function(div){
				
				var center = map_config.appearance.mapCenter;
				map_config.appearance.center = new google.maps.LatLng(center.lat, center.lng);
				
				var myLatLng = new google.maps.LatLng(51.55,-0.12);
				var mapOptions = {
					minZoom: 5,
					maxZoom: 8,
					zoom: 7,
					center: myLatLng,
					mapTypeId: google.maps.MapTypeId.TERRAIN
				};
				this.map_ = new google.maps.Map(div, map_config.appearance);
				
				this.addListeners();
			},
			
			getMap: function() {
				return this.map_;
			},
			
			getOverlay: function() {
				return this.objectsOverlay_;
			},
			
			getBounds: function() {
				var bounds = this.map_.getBounds(),
				ne = bounds.getNorthEast(),
				sw = bounds.getSouthWest();
				this.bounds_ = {ne: ne, sw: sw};
			},
	
			getMapParams: function() {
				return {
					map: this.map_,
					ne: { lat: this.bounds_.ne.lat(), lng: this.bounds_.ne.lng() },
					sw: { lat: this.bounds_.sw.lat(), lng: this.bounds_.sw.lng() },
					zoom: this.map_.getZoom()
				};
			},
	
			getCursorPos : function(e) {
				this.cursorPos_ = e.latLng;
			},
	
			addListener: function(evt, callback) {
				google.maps.event.addListener(this.map_, evt, callback);
			},
	
			addListeners: function() {
				var self = this;
				self.addListener('mousemove', function(e){
					self.getCursorPos(e);
				});
				self.addListener('bounds_changed', function(){
					if (!self.boundsChanged_ && !self.zoomChanged_){
						self.boundsChanged_ = true;
//						self.iMap.onMoveStart();
					}
				});
				self.addListener('zoom_changed', function(){
					if (self.iBox_) {
						self.iBox_.hideInfobox();
					}
					if (self.objectsOverlay_) {
						self.objectsOverlay_.setLayout();
					}
					if (!self.zoomChanged_) {
						self.zoomChanged_ = true;
//						self.iMap.onZoomStart(self.getMapParams());
					}
				});
				self.addListener('click', function(){
					if (self.iBox_) {
						self.iBox_.hideInfobox();
					}
				});
				self.addListener('idle', function(){
					self.getBounds();
					if (!self.loaded_){
						
						self.loaded_ = true;
						
						self.objectsOverlay_ = new map_overlay;
						
						self.objectsOverlay_.init({
							map: self.map_,
							primitives: svg_primitives
						});
						
						self.objectsOverlay_.wait.then(function(){
							self.addObjects(map_objects);
						});
						
						
						self.iBox_ = new map_infobox({map: self.map_});
						
//						console.log($('#iBox').length);
						
	
//						var cmpt = create_component('overlay', {map: self.map_});
//						cmpt.wait.then(function(){
//							self.objectsOverlay_ = cmpt.overlay;
//							self.iMap.onLoad(self.getMapParams());
//							self.loaded_ = true;
							
//							self.iMap.addObjects(self.mapObjects);
							//self.wait.resolve();
//						});
						
	/*					
							load_component('overlay', {map: self.map_}).done(function(overlay_) {
								overlay_.wait.then(function(){
									self.objectsOverlay_ = overlay_.getOverlay();
							console.log('overlay', self.objectsOverlay_)
									//self.wait.resolve();
								});
							});
	*/
					}
					if (self.boundsChanged_){
						self.boundsChanged_ = false;
	
//						var mapState = {ne : {lat: 0, lng: 0}, sw: {lat: 0, lng: 0}, zoom: 5}; //self.getMapParams();
//						self.$iModel.onUpdated('viewport', mapState);
//						self.iMap.onMoveEnd(self.getMapParams());
					}
					if (self.zoomChanged_){
						self.zoomChanged_ = false;
						if (self.objectsOverlay_) {
							self.objectsOverlay_.redraw(self.objects_);
						};
						
	
//						self.iMap.onZoomEnd(self.getMapParams());
					}
				});
				self.addListener('obj_mouseover', function(args){
					self.updateParams(args);
					if (args.obj.info){
						self.iBox_.onMouseOver(args);
					}
	//				console.log('obj_mouseover', args)
//					self.iMap.onObjectMouseOver(args);
				});
				self.addListener('obj_mouseout', function(args){
					self.updateParams(args);
					if (args.obj.info){
						self.iBox_.onMouseOut(args);
					}
	//				console.log('obj_mouseout', args)
//					self.iMap.onObjectMouseOut(args);
				});
				self.addListener('obj_mousemove', function(args){
					self.updateParams(args);
					if (args.obj.info){
						self.iBox_.onMouseMove(args);
					}
	//				console.log('obj_mousemove', args)
//					self.iMap.onObjectMouseMove(args);
				});
				self.addListener('obj_click', function(args){
					self.iBox_.onClick(args);
	//				console.log('obj_click', args)
//					self.iMap.onObjectClick(args);
				});
			},
			
			updateParams: function(args){
				if (!args.pos){
					args.cursorPos = this.cursorPos_;
				}
			},
			
			addPolygon: function(obj){
				var self = this;
				var pathArray = obj.encodedPath;
				
				var path = [];
				var myPolygon = new google.maps.Polygon({
					strokeColor: obj.strokeColor,
					strokeOpacity: obj.strokeOpacity,
					strokeWeight: obj.strokeWidth,
					fillColor: obj.fillColor,
					fillOpacity: obj.fillOpacity
				});
				for (var i in pathArray){
					path.push(google.maps.geometry.encoding.decodePath(pathArray[i]));
				}
				myPolygon.setPaths(path);
				myPolygon.setMap(this.map_);
				
				if (obj.hover){
					google.maps.event.addListener(myPolygon, 'mouseover', function(){
						if (obj.hoverEffect){
							if (obj.hoverEffect == 'fade'){
								self.polygonFade(obj, 'mouseover');
							}
						}
						if (obj.eventHandlers['mouseover']) obj.eventHandlers['mouseover']();
					}); 
					google.maps.event.addListener(myPolygon, 'mouseout', function(){
						if (obj.hoverEffect){
							if (obj.hoverEffect == 'fade'){
								self.polygonFade(obj, 'mouseout');
							}
						}
						if (obj.eventHandlers['mouseout']) obj.eventHandlers['mouseout']();
					});
					google.maps.event.addListener(myPolygon, 'mousemove', function(e){
						self.getCursorPos(e);
						if (obj.eventHandlers['mousemove']) obj.eventHandlers['mousemove']();
					});
					google.maps.event.addListener(myPolygon, 'click', function(){
						if (obj.eventHandlers['click']) obj.eventHandlers['click']();
					});
				}
				
				
				return myPolygon;
			},
			
			polygonFade : function(obj, e){
				for (var prop in obj.hover) {
					if (prop.indexOf('Opacity') != -1){
						if (e == 'mouseover') {
							if (obj[prop] < obj.hover[prop])
								this.polygonFadeIn(obj.shape, prop, obj[prop], obj.hover[prop]);
							else
								this.polygonFadeOut(obj.shape, prop, obj[prop], obj.hover[prop]);
						}
						else if (e == 'mouseout') {
							if (obj[prop] < obj.hover[prop])
								this.polygonFadeOut(obj.shape, prop, obj.hover[prop], obj[prop]);
							else
								this.polygonFadeIn(obj.shape, prop, obj.hover[prop], obj[prop]);
						}
					}
				}
				
			},
			
			fadeOut : function(el, obj){
				var props = {};
				
				for (var property in obj.hover) {
					if (property.indexOf('Opacity') != -1){
						props[property] = el[property];
					}
				};
				
				el.set('mouseOver', false);
				
				var
				timer = 0,
				fadein = setInterval(function(){
					if (timer >= 4 || el.mouseOver){
						clearInterval(fadein);
						return;
					}
					$.each(props, function(key, val){
						props[key] -= (obj.hover[key] - obj[key]) / 4;
						
					});
					el.setOptions(props);
					timer += 1;
//					console.log(el.fillOpacity);
				}, 50);
			},
			
			polygonFadeIn : function(polygon, prop, op1, op2){
				polygon.set('mouseOver', true);
				var
				property = {},
				fill = (op2 - op1) / 4,
				fadein = setInterval(function(){
					if(polygon[prop] >= op2 || !polygon.mouseOver){
						clearInterval(fadein);
						return;
					}
					var op = polygon[prop] + fill;
					if (op > op2) op = op2;
					property[prop] = Math.max(0, op);
					polygon.setOptions(property);
				}, 50);
			},
			
			polygonFadeOut : function(polygon, prop, op1, op2){
				polygon.set('mouseOver', false);
				var
				property = {},
				fill = (op1 - op2) / 4,
				fadeout = setInterval(function(){
					if(polygon[prop] <= op2 || polygon.mouseOver){
						clearInterval(fadeout);
						return;
					}
					var op = polygon[prop] - fill;
					if (op < op2) op = op2;
					property[prop] = Math.max(0, op);
					polygon.setOptions(property);
				}, 50);
			},
		
		
			addObjects: function(objects) {
				var self = this;
				if (self.objects_ == undefined) self.objects_ = {};
				$.each(objects, function(key, val){
					if (self.objects_[key] == undefined) self.objects_[key] = {};
					
					$.each(val, function(id, object){
						var obj = _.clone(map_config.graphics[key][object.type]);
						obj.id = id;
						Object.deepExtend(obj, object);
						
						var handledEvents = obj.handledEvents;
						
						if (handledEvents && handledEvents.length > 0){
							obj.eventHandlers = {};
							var params = {
								obj: obj,
								map: self.map_
//								ne: self.bounds_.ne,
//								sw: self.bounds_.sw
							};
							
							if (!_.contains(handledEvents, 'mousemove') && object.pos && !object.pos.from){
								params.pos = new google.maps.LatLng(object.pos.lat, object.pos.lng);
							}
							
							$.each(handledEvents, function(key, value){
								obj.eventHandlers[value] = function(){
									google.maps.event.trigger(self.map_, 'obj_' + value, params);
								}
							});
						};

						switch (obj.primitive) {

							case 'polygon':
							case 'polyline':
								obj.shape = self.addPolygon(obj);
								break;
							
							default:	 
								self.objectsOverlay_.addShape(obj);
								break;
								
						};
				
						self.objects_[key][id] = obj;
						
					});

				});
				
									

				
            }
			
			
			
		};
		
		return myMap;
		
		
	}
);

Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (typeof source[property] === "object" &&
     source[property] !== null ) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};