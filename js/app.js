require.config({
	paths: {
		'async': 'libs/require/async',
		'text': 'libs/require/text',
		'json': 'libs/require/json',
		'css': 'libs/require/css',
		'jquery': 'libs/jquery/jquery.min',
		'easing': 'libs/jquery/jquery.easing.1.3',
		'underscore': 'libs/underscore/lodash',
		'raphael': 'libs/raphael/raphael.min',
		'cubicCurve': 'overlay/cubicCurve',
		'googlemap': 'googlemap'
	},
    'shim': {
        'jquery': {
            exports: 'jQuery'
        },
		
        'easing': {
            deps: ['jquery']
        },

        'raphael': {
            exports: 'Raphael'
        },
        
        'cubicCurve': {
            deps: ['raphael'],
            exports: 'cubicCurve'
        }
    }
});

requirejs(['googlemap', 'jquery', 'easing', 'underscore', 'raphael', 'cubicCurve'], function( googlemap, $ ) {
	
	var mapDiv = document.createElement('div');
	mapDiv.style.width = '800px';
	mapDiv.style.height = '500px';
	mapDiv.style.border = '1px solid #ccc';
	document.body.appendChild(mapDiv);

	googlemap.init(mapDiv);
	
});