// Import scripts for managing the Genome object and calculating genetics matches
importScripts( 'shakespare.genome.js', 'shakespeare.genetics.js' );

var Genetics,
	sumOfMaxMinusFitness,
	maxFitness,
	population,
	settings;

onmessage = function ( e ) {
	var data = JSON.parse( e.data );

	if ( undefined === data.job ) {
		postMessage( JSON.stringify( { error: 'Invalid job' } ) );
		return;
	}

	switch( data.job ) {
		case 'createChildren' :
			var twins = createChildren();

			postMessage( JSON.stringify( twins ) );
			break;
		case 'setData' :
			data = data.data;

			sumOfMaxMinusFitness = data.settings.sum;
			maxFitness = data.settings.maxFitness;
			population = data.settings.population;

			data.settings.sum = undefined;
			data.settings.maxFitness = undefined;
			data.settings.population = undefined;

			settings = data.settings;

			Genetics = new window.Genetics( settings.targetText, settings );
			break;
		default :
			postMessage( JSON.stringfy( { error: 'Invalid job' } ) );
	}
};

function createChildren() {
	var twins = Genetics.createChildren(
		Genetics.findRandomHighQualityParent( sumOfMaxMinusFitness, maxFitness, population ),
		Genetics.findRandomHighQualityParent( sumOfMaxMinusFitness, maxFitness, population ),
		settings
	);

	return twins;
}