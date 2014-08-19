
Raphael.fn.cubicCurve = function(opts){
	
	var defaultOptions = {
		strokeWidth: 1,
		strokeColor: '#1263a7',
		strokeOpacity: 1,
		fillColor: '#147bd2',
		fillOpacity: .7
	}
	
	opts = $.extend(defaultOptions, opts);
	
	return this.set().push(
		this.path(
			calcCubicCurvePath({
				to: opts.pos.to,
				from: opts.pos.from,
				width: opts.width,
				padding: opts.padding
			})		
		)
		.attr({
			'opacity': 1,
			'stroke-width': opts.strokeWidth, 
			'stroke': opts.strokeColor,
			'stroke-opacity': opts.strokeOpacity,
			'fill': opts.fillColor,
			'fill-opacity': opts.fillOpacity
		})
		.data({'type': 'lane', 'color': opts.fillColor, 'pos': opts.to})
//		.hide()
	);
	
};

Raphael.st.cubicCurvePath = function(opts){
	
	return this.forEach(function(el){
		var path = 
			calcCubicCurvePath({
				to: opts.to,
				from: opts.from,
				width: opts.width,
				padding: opts.padding
			})

		el.attr('path',
			path
		)

	});		
	
};

var calcCubicCurvePath = function(opts){

	var defaultOptions = {
		width: 10,
		padding: 8
	}
	
	opts = $.extend(defaultOptions, opts);
	
	var
	to = opts.to,
	from = opts.from,
	padding = opts.padding,
	width = opts.width,
	w = width / 2,
	size = (width / 3 + 2) * 3.3, // размер стрелки 
	kf1 = .5, // коэф. расстояния до второй точки кривой Безье 
	kf2 = 0.2, // коэф. отклонения второй точки
	kf3 = 0, // коэф. отклонения третьей точки
	kf4 = .35, // коэф. расстояния от третьей точки до четвертой
	ln, m2, m3,	angle, angle1, angle2;
	
	var apprxPoint = function(x1, y1, a1, x2, y2, a2){
		var k1 = Math.tan(Raphael.rad(a1)),
		k2 = Math.tan(Raphael.rad(a2)),
		x, y;
		if (k2 == 0) 
			k2 = 1e-12;
		if (k2 == k1){
			y = y2;
			x = x2;
		}
		else{			 
			y = (k1 * (x2 - x1 - y2 / k2) + y1) / (1 - k1 / k2);
			x = (y - y2) / k2 + x2;
		}
		return {x:x, y:y};
	};
	 
	var p = {};
	
	ln = Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y));
	m2 = to.x >= from.x ? 1 : -1;
	m3 = to.y >= from.y ? -1 : 1;
	
	angle =  Math.atan((to.y - from.y) / (to.x - from.x)) * kf2;

	p[1] = {
		x: from.x + m2 * padding * Math.cos(angle),
		y: from.y + m2 * padding * Math.sin(angle)
	};

	p[2] = {
		x: from.x + m2 * ln * kf1 * Math.cos(angle),
		y: from.y + m2 * ln * kf1 * Math.sin(angle)
	};

	angle =  Math.atan((to.x - p[2].x) / (to.y - p[2].y)) * kf3;

	p[3] = {
		x: to.x + m3 * ln * kf4 * Math.sin(angle),
		y: to.y + m3 * ln * kf4 * Math.cos(angle)
	};
	
	var padX = m3 * padding * Math.sin(angle);
	var padY = m3 * padding * Math.cos(angle);

	p[32] = {
		x: to.x + padX,
		y: to.y + padY
	};

	angle = Raphael.angle(p[3].x, p[3].y, p[32].x, p[32].y);
	padX += size * Math.cos(Raphael.rad(angle));
	padY += size * Math.sin(Raphael.rad(angle));
	
	p[4] = {
		x: to.x + padX,
		y: to.y + padY
	};
	
	p[3].x += padX;
	p[3].y += padY;
	
	var sd = (size + width / 2) / Math.cos(Raphael.rad(30));
	
	p[31] = {
		x: p[32].x + sd * Math.cos(Raphael.rad(angle + 30)),
		y: p[32].y + sd * Math.sin(Raphael.rad(angle + 30))
	};
	
	p[33] = {
		x: p[32].x + sd * Math.cos(Raphael.rad(angle - 30)),
		y: p[32].y + sd * Math.sin(Raphael.rad(angle - 30))
	};
	
	angle1 = Raphael.angle(p[2].x, p[2].y, p[1].x, p[1].y);
	
	p[11] = {
		x: p[1].x + w * Math.cos(Raphael.rad(angle1 - 90)),
		y: p[1].y + w * Math.sin(Raphael.rad(angle1 - 90))
	};
	
	p[21] = {
		x: p[1].x + w * Math.cos(Raphael.rad(angle1 + 90)),
		y: p[1].y + w * Math.sin(Raphael.rad(angle1 + 90))
	};
	
	angle2 = Raphael.angle(p[3].x, p[3].y, p[2].x, p[2].y);
	
	p[12] = apprxPoint(p[11].x, p[11].y, angle1, p[2].x + w * Math.cos(Raphael.rad(angle2 - 90)), p[2].y + w * Math.sin(Raphael.rad(angle2 - 90)), angle2);
	p[22] = apprxPoint(p[21].x, p[21].y, angle1, p[2].x + w * Math.cos(Raphael.rad(angle2 + 90)), p[2].y + w * Math.sin(Raphael.rad(angle2 + 90)), angle2);
	
	angle = Raphael.angle(p[4].x, p[4].y, p[3].x, p[3].y);

	p[13] = apprxPoint(p[12].x, p[12].y, angle2, p[3].x + w * Math.cos(Raphael.rad(angle - 90)), p[3].y + w * Math.sin(Raphael.rad(angle - 90)), angle);
	p[23] = apprxPoint(p[22].x, p[22].y, angle2, p[3].x + w * Math.cos(Raphael.rad(angle + 90)), p[3].y + w * Math.sin(Raphael.rad(angle + 90)), angle);
	
	p[14] = {
		x: p[4].x + w * Math.cos(Raphael.rad(angle - 90)),
		y: p[4].y + w * Math.sin(Raphael.rad(angle - 90))
	};

	p[24] = {
		x: p[4].x + w * Math.cos(Raphael.rad(angle + 90)),
		y: p[4].y + w * Math.sin(Raphael.rad(angle + 90))
	};
	
	var path = 'M' + p[11].x + ',' + p[11].y + 'C' + p[12].x + ',' + p[12].y + ',' + p[13].x + ',' + p[13].y + ',' + p[14].x + ',' + p[14].y +
		'L' + p[31].x + ',' + p[31].y + ',' + p[32].x + ',' + p[32].y + ',' + p[33].x + ',' + p[33].y + ',' + p[24].x + ',' + p[24].y +
		'C' + p[23].x + ',' + p[23].y + ',' + p[22].x + ',' + p[22].y + ',' + p[21].x + ',' + p[21].y + 'Z';

	return path; 
};
